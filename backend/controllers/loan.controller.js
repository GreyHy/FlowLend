const Loan = require('../models/Loan');
const Liquidity = require('../models/Liquidity');
const Market = require('../models/Market');

// 借款
exports.createLoan = async (req, res) => {
  try {
    const { user, asset, amount, targetApr, collateral } = req.body;

    // 验证输入
    if (!user || !asset || !amount || targetApr === undefined || !collateral) {
      return res.status(400).json({ message: '缺少必要参数' });
    }

    // 检查市场中该APR是否有足够的流动性
    const market = await Market.findOne({ asset });
    if (!market) {
      return res.status(404).json({ message: '未找到该资产的市场数据' });
    }

    const availableLiquidity = market.getAvailableLiquidityForApr(targetApr);
    if (availableLiquidity < amount) {
      return res.status(400).json({
        message: '流动性不足',
        available: availableLiquidity,
        requested: amount
      });
    }

    // 寻找匹配的流动性
    const matchingLiquidities = await Liquidity.find({
      asset,
      minApr: { $lte: targetApr },
      maxApr: { $gte: targetApr },
      availableAmount: { $gt: 0 }
    }).sort({ minApr: 1 }); // 先使用最低APR的流动性

    if (matchingLiquidities.length === 0) {
      return res.status(400).json({ message: '无法找到匹配的流动性' });
    }

    // 创建借款记录
    const newLoan = new Loan({
      user,
      asset,
      amount,
      apr: targetApr,
      collateral,
      healthFactor: 0, // 将通过抵押物价格计算
      liquidityMatches: []
    });

    // 计算健康因子（这里简化处理，假设抵押物与借款资产比例为1.5:1）
    const collateralPrice = 1; // 实际应从预言机获取
    const assetPrice = 1; // 实际应从预言机获取
    newLoan.calculateHealthFactor(collateralPrice, assetPrice);

    // 分配借款到匹配的流动性
    let remainingAmount = amount;
    for (const liquidity of matchingLiquidities) {
      if (remainingAmount <= 0) break;

      const availableInLiquidity = liquidity.getAvailableLiquidity();
      const amountToUse = Math.min(availableInLiquidity, remainingAmount);

      // 更新流动性记录
      liquidity.utilization = ((liquidity.amount - liquidity.availableAmount + amountToUse) / liquidity.amount) * 100;
      liquidity.availableAmount -= amountToUse;
      liquidity.currentApr = targetApr;
      await liquidity.save();

      // 添加匹配记录
      newLoan.liquidityMatches.push({
        liquidityId: liquidity._id,
        amount: amountToUse,
        apr: targetApr
      });

      remainingAmount -= amountToUse;

      // 更新市场数据
      await market.updateAprRange(liquidity.minApr, liquidity.maxApr, 0, amountToUse);
    }

    if (remainingAmount > 0) {
      return res.status(400).json({
        message: '流动性不足以满足借款需求',
        shortfall: remainingAmount
      });
    }

    // 保存借款记录
    await newLoan.save();
    await market.save();

    res.status(201).json({
      message: '借款成功',
      loan: newLoan
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取用户借款列表
exports.getLoansByUser = async (req, res) => {
  try {
    const { user } = req.params;

    if (!user) {
      return res.status(400).json({ message: '缺少用户地址' });
    }

    const loans = await Loan.find({ user, status: 'active' });

    res.status(200).json({
      count: loans.length,
      loans
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取单个借款详情
exports.getLoanById = async (req, res) => {
  try {
    const { id } = req.params;

    const loan = await Loan.findById(id).populate({
      path: 'liquidityMatches.liquidityId',
      select: 'user minApr maxApr'
    });

    if (!loan) {
      return res.status(404).json({ message: '未找到该借款记录' });
    }

    res.status(200).json({ loan });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 还款
exports.repayLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: '缺少还款金额' });
    }

    const loan = await Loan.findById(id);

    if (!loan) {
      return res.status(404).json({ message: '未找到该借款记录' });
    }

    if (loan.status !== 'active') {
      return res.status(400).json({ message: '该借款已结清或已清算' });
    }

    // 执行还款
    const actualRepayment = loan.partialRepayment(amount);

    // 更新相关流动性记录和市场数据
    const market = await Market.findOne({ asset: loan.asset });

    // 按比例还款给各个流动性提供者
    for (const match of loan.liquidityMatches) {
      const repaymentRatio = match.amount / loan.amount;
      const matchRepayment = actualRepayment * repaymentRatio;

      const liquidity = await Liquidity.findById(match.liquidityId);
      if (liquidity) {
        liquidity.availableAmount += matchRepayment;
        liquidity.utilization = Math.max(0, ((liquidity.amount - liquidity.availableAmount) / liquidity.amount) * 100);
        await liquidity.save();

        // 更新市场数据
        if (market) {
          market.updateAprRange(liquidity.minApr, liquidity.maxApr, 0, -matchRepayment);
        }
      }

      // 更新匹配记录中的金额
      match.amount -= matchRepayment;
    }

    // 保存更新
    await loan.save();
    if (market) await market.save();

    // 如果已全部还清，释放抵押物
    if (loan.status === 'repaid') {
      res.status(200).json({
        message: '借款已全部还清，抵押物已释放',
        collateralReleased: loan.collateral
      });
    } else {
      res.status(200).json({
        message: '部分还款成功',
        amountRepaid: actualRepayment,
        remainingDebt: loan.amount
      });
    }
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 增加抵押物
exports.addCollateral = async (req, res) => {
  try {
    const { id } = req.params;
    const { asset, amount } = req.body;

    if (!asset || !amount) {
      return res.status(400).json({ message: '缺少必要参数' });
    }

    const loan = await Loan.findById(id);

    if (!loan) {
      return res.status(404).json({ message: '未找到该借款记录' });
    }

    // 检查抵押物资产类型
    if (loan.collateral.asset !== asset) {
      return res.status(400).json({ message: '抵押物资产类型不匹配' });
    }

    // 增加抵押物
    loan.collateral.amount += amount;

    // 重新计算健康因子
    const collateralPrice = 1; // 实际应从预言机获取
    const assetPrice = 1; // 实际应从预言机获取
    loan.calculateHealthFactor(collateralPrice, assetPrice);

    await loan.save();

    res.status(200).json({
      message: '抵押物增加成功',
      newCollateralAmount: loan.collateral.amount,
      newHealthFactor: loan.healthFactor
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
}; 
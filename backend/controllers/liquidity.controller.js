const Liquidity = require('../models/Liquidity');
const Market = require('../models/Market');

// 添加流动性
exports.addLiquidity = async (req, res) => {
  try {
    const { user, asset, amount, minApr, maxApr } = req.body;

    // 验证输入
    if (!user || !asset || !amount || minApr === undefined || maxApr === undefined) {
      return res.status(400).json({ message: '缺少必要参数' });
    }

    // 创建新的流动性记录
    const newLiquidity = new Liquidity({
      user,
      asset,
      amount,
      minApr,
      maxApr,
      currentApr: (minApr + maxApr) / 2, // 初始APR设为区间中点
      utilization: 0,
      earnings: 0
    });

    // 保存记录
    await newLiquidity.save();

    // 更新市场数据
    let market = await Market.findOne({ asset });
    if (!market) {
      market = new Market({ asset });
    }
    
    market.updateAprRange(minApr, maxApr, amount, 0);
    await market.save();

    res.status(201).json({
      message: '流动性添加成功',
      liquidity: newLiquidity
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取用户流动性列表
exports.getLiquidityByUser = async (req, res) => {
  try {
    const { user } = req.params;
    
    if (!user) {
      return res.status(400).json({ message: '缺少用户地址' });
    }
    
    const liquidityList = await Liquidity.find({ user });
    
    res.status(200).json({
      count: liquidityList.length,
      liquidityPositions: liquidityList
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取单个流动性详情
exports.getLiquidityById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const liquidity = await Liquidity.findById(id);
    
    if (!liquidity) {
      return res.status(404).json({ message: '未找到该流动性记录' });
    }
    
    res.status(200).json({ liquidity });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 提取流动性
exports.withdrawLiquidity = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    
    const liquidity = await Liquidity.findById(id);
    
    if (!liquidity) {
      return res.status(404).json({ message: '未找到该流动性记录' });
    }
    
    // 检查可提取金额
    const availableAmount = liquidity.getAvailableLiquidity();
    if (amount > availableAmount) {
      return res.status(400).json({ message: '提取金额超过可用金额', available: availableAmount });
    }
    
    // 更新流动性记录
    liquidity.amount -= amount;
    
    // 如果全部提取，则删除记录
    if (liquidity.amount <= 0) {
      await Liquidity.findByIdAndDelete(id);
      
      // 更新市场数据
      const market = await Market.findOne({ asset: liquidity.asset });
      if (market) {
        market.updateAprRange(liquidity.minApr, liquidity.maxApr, -liquidity.amount, 0);
        await market.save();
      }
      
      return res.status(200).json({ message: '流动性已全部提取' });
    } else {
      await liquidity.save();
      
      // 更新市场数据
      const market = await Market.findOne({ asset: liquidity.asset });
      if (market) {
        market.updateAprRange(liquidity.minApr, liquidity.maxApr, -amount, 0);
        await market.save();
      }
      
      res.status(200).json({
        message: '流动性部分提取成功',
        liquidity
      });
    }
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 修改APR范围
exports.updateAprRange = async (req, res) => {
  try {
    const { id } = req.params;
    const { minApr, maxApr } = req.body;
    
    if (minApr === undefined || maxApr === undefined) {
      return res.status(400).json({ message: '缺少必要参数' });
    }
    
    const liquidity = await Liquidity.findById(id);
    
    if (!liquidity) {
      return res.status(404).json({ message: '未找到该流动性记录' });
    }
    
    // 更新市场数据 - 先移除旧区间
    const market = await Market.findOne({ asset: liquidity.asset });
    if (market) {
      market.updateAprRange(liquidity.minApr, liquidity.maxApr, -liquidity.amount, 0);
    }
    
    // 更新流动性APR范围
    liquidity.minApr = minApr;
    liquidity.maxApr = maxApr;
    await liquidity.save();
    
    // 更新市场数据 - 添加新区间
    if (market) {
      market.updateAprRange(minApr, maxApr, liquidity.amount, 0);
      await market.save();
    }
    
    res.status(200).json({
      message: 'APR范围更新成功',
      liquidity
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
}; 
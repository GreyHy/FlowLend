const Market = require('../models/Market');

// 获取所有市场数据
exports.getAllMarkets = async (req, res) => {
  try {
    const markets = await Market.find({});
    
    res.status(200).json({
      count: markets.length,
      markets
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取特定资产的市场数据
exports.getMarketByAsset = async (req, res) => {
  try {
    const { asset } = req.params;
    
    if (!asset) {
      return res.status(400).json({ message: '缺少资产参数' });
    }
    
    const market = await Market.findOne({ asset });
    
    if (!market) {
      return res.status(404).json({ message: '未找到该资产的市场数据' });
    }
    
    res.status(200).json({ market });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取所有资产的总体统计数据
exports.getMarketStats = async (req, res) => {
  try {
    const markets = await Market.find({});
    
    let totalLiquidity = 0;
    let totalBorrowed = 0;
    let weightedApr = 0;
    let totalBorrowWeight = 0;
    
    markets.forEach(market => {
      totalLiquidity += market.totalLiquidity;
      totalBorrowed += market.totalBorrowed;
      
      if (market.totalBorrowed > 0) {
        weightedApr += market.averageApr * market.totalBorrowed;
        totalBorrowWeight += market.totalBorrowed;
      }
    });
    
    const averageApr = totalBorrowWeight > 0 ? weightedApr / totalBorrowWeight : 0;
    const overallUtilization = totalLiquidity > 0 ? (totalBorrowed / totalLiquidity) * 100 : 0;
    
    res.status(200).json({
      totalLiquidity,
      totalBorrowed,
      averageApr,
      utilizationRate: overallUtilization,
      assetCount: markets.length
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取特定APR区间的流动性数据
exports.getLiquidityByAprRange = async (req, res) => {
  try {
    const { asset, minApr, maxApr } = req.query;
    
    if (!asset || minApr === undefined || maxApr === undefined) {
      return res.status(400).json({ message: '缺少必要参数' });
    }
    
    const market = await Market.findOne({ asset });
    
    if (!market) {
      return res.status(404).json({ message: '未找到该资产的市场数据' });
    }
    
    // 找出与请求区间重叠的所有区间
    const overlappingRanges = market.aprRanges.filter(range => 
      !(range.max < minApr || range.min > maxApr)
    );
    
    let totalLiquidity = 0;
    let availableLiquidity = 0;
    
    overlappingRanges.forEach(range => {
      totalLiquidity += range.liquidity;
      availableLiquidity += Math.max(0, range.liquidity - range.borrowed);
    });
    
    res.status(200).json({
      asset,
      aprRange: {
        min: minApr,
        max: maxApr
      },
      totalLiquidity,
      availableLiquidity,
      overlappingRanges
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取最佳借款APR建议
exports.getBestBorrowingRates = async (req, res) => {
  try {
    const { asset, amount } = req.query;
    
    if (!asset || !amount) {
      return res.status(400).json({ message: '缺少必要参数' });
    }
    
    const market = await Market.findOne({ asset });
    
    if (!market) {
      return res.status(404).json({ message: '未找到该资产的市场数据' });
    }
    
    // 按APR排序
    const sortedRanges = [...market.aprRanges].sort((a, b) => a.min - b.min);
    
    let recommendedRanges = [];
    let remainingAmount = parseFloat(amount);
    
    // 尝试从低到高APR匹配
    for (const range of sortedRanges) {
      const availableInRange = Math.max(0, range.liquidity - range.borrowed);
      
      if (availableInRange > 0) {
        const amountFromRange = Math.min(availableInRange, remainingAmount);
        const coverage = (amountFromRange / parseFloat(amount)) * 100;
        
        recommendedRanges.push({
          range: {
            min: range.min,
            max: range.max
          },
          availableLiquidity: availableInRange,
          recommendedAmount: amountFromRange,
          coverage: coverage.toFixed(2) + '%',
          suggestedApr: range.min // 建议使用区间的最低APR
        });
        
        remainingAmount -= amountFromRange;
        
        if (remainingAmount <= 0) {
          break;
        }
      }
    }
    
    // 如果无法完全满足借款需求
    const totalCoverage = recommendedRanges.reduce((sum, r) => sum + parseFloat(r.coverage), 0);
    
    res.status(200).json({
      asset,
      requestedAmount: amount,
      possibleCoverage: totalCoverage.toFixed(2) + '%',
      shortfall: remainingAmount > 0 ? remainingAmount : 0,
      recommendations: recommendedRanges
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
}; 
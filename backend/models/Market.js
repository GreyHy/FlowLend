const mongoose = require('mongoose');

const MarketSchema = new mongoose.Schema({
  asset: {
    type: String,
    required: true,
    enum: ['USDC', 'USDT', 'DAI', 'ETH'],
    index: true
  },
  totalLiquidity: {
    type: Number,
    default: 0
  },
  totalBorrowed: {
    type: Number,
    default: 0
  },
  utilizationRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  averageApr: {
    type: Number,
    default: 0
  },
  aprRanges: [{
    min: Number,
    max: Number,
    liquidity: Number,
    borrowed: Number
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// 计算利用率
MarketSchema.methods.calculateUtilizationRate = function() {
  if (this.totalLiquidity === 0) {
    this.utilizationRate = 0;
  } else {
    this.utilizationRate = (this.totalBorrowed / this.totalLiquidity) * 100;
  }
  return this.utilizationRate;
};

// 计算平均APR
MarketSchema.methods.calculateAverageApr = function() {
  if (this.totalBorrowed === 0) {
    return 0;
  }
  
  let weightedSum = 0;
  for (const range of this.aprRanges) {
    if (range.borrowed > 0) {
      const avgApr = (range.min + range.max) / 2;
      weightedSum += avgApr * (range.borrowed / this.totalBorrowed);
    }
  }
  
  this.averageApr = weightedSum;
  return this.averageApr;
};

// 更新APR区间数据
MarketSchema.methods.updateAprRange = function(min, max, liquidityDelta, borrowedDelta) {
  let range = this.aprRanges.find(r => r.min === min && r.max === max);
  
  if (!range) {
    range = { min, max, liquidity: 0, borrowed: 0 };
    this.aprRanges.push(range);
  }
  
  range.liquidity += liquidityDelta;
  range.borrowed += borrowedDelta;
  
  // 确保不为负值
  range.liquidity = Math.max(0, range.liquidity);
  range.borrowed = Math.max(0, range.borrowed);
  
  // 更新总值
  this.totalLiquidity += liquidityDelta;
  this.totalBorrowed += borrowedDelta;
  
  // 重新计算利用率和平均APR
  this.calculateUtilizationRate();
  this.calculateAverageApr();
  
  this.lastUpdated = Date.now();
};

// 获取特定APR区间的可用流动性
MarketSchema.methods.getAvailableLiquidityForApr = function(targetApr) {
  let availableLiquidity = 0;
  
  for (const range of this.aprRanges) {
    if (targetApr >= range.min && targetApr <= range.max) {
      const availableInRange = Math.max(0, range.liquidity - range.borrowed);
      availableLiquidity += availableInRange;
    }
  }
  
  return availableLiquidity;
};

const Market = mongoose.model('Market', MarketSchema);

module.exports = Market; 
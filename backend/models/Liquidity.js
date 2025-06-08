const mongoose = require('mongoose');

const LiquiditySchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    index: true
  },
  asset: {
    type: String,
    required: true,
    enum: ['USDC', 'USDT', 'DAI', 'ETH']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  minApr: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  maxApr: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  currentApr: {
    type: Number,
    default: 0
  },
  utilization: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  earnings: {
    type: Number,
    default: 0
  },
  availableAmount: {
    type: Number,
    default: function() {
      return this.amount;
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// 确保minApr小于maxApr
LiquiditySchema.pre('save', function(next) {
  if (this.minApr > this.maxApr) {
    next(new Error('最小APR不能大于最大APR'));
  } else {
    next();
  }
});

// 计算有效流动性（可以出借的金额）
LiquiditySchema.methods.getAvailableLiquidity = function() {
  return this.amount - (this.amount * this.utilization / 100);
};

// 计算收益
LiquiditySchema.methods.calculateEarnings = function(days) {
  const annualRate = this.currentApr / 100;
  const dailyRate = annualRate / 365;
  return this.amount * dailyRate * days * (this.utilization / 100);
};

// 更新当前APR
LiquiditySchema.methods.updateCurrentApr = function(newApr) {
  if (newApr >= this.minApr && newApr <= this.maxApr) {
    this.currentApr = newApr;
    return true;
  }
  return false;
};

const Liquidity = mongoose.model('Liquidity', LiquiditySchema);

module.exports = Liquidity; 
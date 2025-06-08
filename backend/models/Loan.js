const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
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
  apr: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  collateral: {
    asset: {
      type: String,
      required: true,
      enum: ['USDC', 'USDT', 'DAI', 'ETH']
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  interestAccrued: {
    type: Number,
    default: 0
  },
  healthFactor: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'repaid', 'liquidated'],
    default: 'active'
  },
  liquidityMatches: [{
    liquidityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Liquidity'
    },
    amount: Number,
    apr: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// 计算健康因子
LoanSchema.methods.calculateHealthFactor = function(collateralPrice, assetPrice) {
  const collateralValue = this.collateral.amount * collateralPrice;
  const loanValue = this.amount * assetPrice;
  this.healthFactor = collateralValue / loanValue;
  return this.healthFactor;
};

// 计算累计利息
LoanSchema.methods.calculateInterest = function(days) {
  const annualRate = this.apr / 100;
  const dailyRate = annualRate / 365;
  return this.amount * dailyRate * days;
};

// 检查是否需要清算
LoanSchema.methods.needsLiquidation = function() {
  return this.healthFactor < 1.0;
};

// 部分还款
LoanSchema.methods.partialRepayment = function(amount) {
  if (amount > this.amount) {
    amount = this.amount;
  }
  this.amount -= amount;
  if (this.amount === 0) {
    this.status = 'repaid';
  }
  return amount;
};

const Loan = mongoose.model('Loan', LoanSchema);

module.exports = Loan; 
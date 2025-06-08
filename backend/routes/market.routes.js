const express = require('express');
const router = express.Router();
const marketController = require('../controllers/market.controller');

// 获取所有市场数据
router.get('/', marketController.getAllMarkets);

// 获取特定资产的市场数据
router.get('/:asset', marketController.getMarketByAsset);

// 获取市场统计数据
router.get('/stats/overview', marketController.getMarketStats);

// 获取特定APR区间的流动性数据
router.get('/liquidity/range', marketController.getLiquidityByAprRange);

// 获取最佳借款APR建议
router.get('/recommend/borrow', marketController.getBestBorrowingRates);

module.exports = router; 
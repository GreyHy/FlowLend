const express = require('express');
const router = express.Router();
const liquidityController = require('../controllers/liquidity.controller');

// 添加流动性
router.post('/', liquidityController.addLiquidity);

// 获取用户流动性列表
router.get('/user/:user', liquidityController.getLiquidityByUser);

// 获取单个流动性详情
router.get('/:id', liquidityController.getLiquidityById);

// 提取流动性
router.post('/:id/withdraw', liquidityController.withdrawLiquidity);

// 修改APR范围
router.put('/:id/apr', liquidityController.updateAprRange);

module.exports = router; 
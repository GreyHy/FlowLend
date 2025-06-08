const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loan.controller');

// 创建借款
router.post('/', loanController.createLoan);

// 获取用户借款列表
router.get('/user/:user', loanController.getLoansByUser);

// 获取单个借款详情
router.get('/:id', loanController.getLoanById);

// 还款
router.post('/:id/repay', loanController.repayLoan);

// 增加抵押物
router.post('/:id/collateral', loanController.addCollateral);

module.exports = router; 
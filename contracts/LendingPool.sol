// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./LiquidityPool.sol";

/**
 * @title LendingPool
 * @dev 管理借贷操作，包括借款和还款
 */
contract LendingPool is ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // 常量
    uint16 public constant BASIS_POINTS = 10000; // 100% = 10000 基点
    
    // 状态变量
    address public asset;                // 资产地址
    LiquidityPool public liquidityPool;  // 流动性池
    
    // 借款结构
    struct Loan {
        uint256 id;             // 借款ID
        address borrower;       // 借款人
        uint256 amount;         // 借款金额
        uint16 apr;             // 借款年化利率（基点）
        uint256 startTime;      // 开始时间
        uint256 lastUpdateTime; // 上次更新时间
        uint256 accruedInterest; // 累积利息
        bool active;            // 是否活跃
    }
    
    // 借款ID => 借款信息
    mapping(uint256 => Loan) public loans;
    // 用户地址 => 借款ID数组
    mapping(address => uint256[]) public userLoans;
    // 下一个借款ID
    uint256 public nextLoanId = 1;
    
    // 事件
    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 amount, uint16 apr);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 interest, bool fullRepayment);
    event InterestAccrued(uint256 indexed loanId, address indexed borrower, uint256 interest);
    
    /**
     * @dev 构造函数
     * @param _asset 资产地址
     * @param _liquidityPool 流动性池地址
     */
    constructor(address _asset, address _liquidityPool) {
        require(_asset != address(0), "Invalid asset address");
        require(_liquidityPool != address(0), "Invalid liquidity pool address");
        asset = _asset;
        liquidityPool = LiquidityPool(_liquidityPool);
        require(liquidityPool.asset() == _asset, "Asset mismatch");
    }
    
    /**
     * @dev 借款
     * @param amount 借款金额
     * @param targetAPR 目标年化利率（基点）
     */
    function borrow(uint256 amount, uint16 targetAPR) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(targetAPR <= BASIS_POINTS, "APR cannot exceed 100%");
        
        // 检查流动性池中是否有足够的流动性
        uint256 availableLiquidity = liquidityPool.getAvailableLiquidityAtAPR(targetAPR);
        require(availableLiquidity >= amount, "Insufficient liquidity at target APR");
        
        // 创建借款记录
        uint256 loanId = nextLoanId++;
        loans[loanId] = Loan({
            id: loanId,
            borrower: msg.sender,
            amount: amount,
            apr: targetAPR,
            startTime: block.timestamp,
            lastUpdateTime: block.timestamp,
            accruedInterest: 0,
            active: true
        });
        
        userLoans[msg.sender].push(loanId);
        
        // 转移资产给借款人
        IERC20(asset).safeTransfer(msg.sender, amount);
        
        emit LoanCreated(loanId, msg.sender, amount, targetAPR);
    }
    
    /**
     * @dev 还款
     * @param loanId 借款ID
     * @param amount 还款金额
     */
    function repay(uint256 loanId, uint256 amount) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.active, "Loan not active");
        require(loan.borrower == msg.sender, "Not your loan");
        require(amount > 0, "Amount must be greater than 0");
        
        // 计算累积利息
        uint256 interest = _calculateLoanInterest(loan);
        loan.accruedInterest += interest;
        
        // 计算总欠款
        uint256 totalDue = loan.amount + loan.accruedInterest;
        require(amount <= totalDue, "Amount exceeds total due");
        
        // 转移资产到合约
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        
        bool fullRepayment = (amount == totalDue);
        
        // 更新借款记录
        if (fullRepayment) {
            // 完全还款，关闭借款
            loan.active = false;
            loan.amount = 0;
            loan.accruedInterest = 0;
        } else {
            // 部分还款，先还利息，再还本金
            if (amount <= loan.accruedInterest) {
                // 只还利息
                loan.accruedInterest -= amount;
            } else {
                // 还利息和部分本金
                uint256 remainingAmount = amount - loan.accruedInterest;
                loan.accruedInterest = 0;
                loan.amount -= remainingAmount;
            }
            loan.lastUpdateTime = block.timestamp;
        }
        
        // 将资金返回到流动性池
        IERC20(asset).safeTransfer(address(liquidityPool), amount);
        
        emit LoanRepaid(loanId, msg.sender, amount, interest, fullRepayment);
    }
    
    /**
     * @dev 计算并更新利息（不还款）
     * @param loanId 借款ID
     */
    function updateInterest(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        require(loan.active, "Loan not active");
        
        uint256 interest = _calculateLoanInterest(loan);
        loan.accruedInterest += interest;
        loan.lastUpdateTime = block.timestamp;
        
        emit InterestAccrued(loanId, loan.borrower, interest);
    }
    
    /**
     * @dev 获取借款详情
     * @param loanId 借款ID
     * @return 借款详情
     */
    function getLoanDetails(uint256 loanId) external view returns (
        address borrower,
        uint256 amount,
        uint16 apr,
        uint256 startTime,
        uint256 accruedInterest,
        bool active
    ) {
        Loan storage loan = loans[loanId];
        borrower = loan.borrower;
        amount = loan.amount;
        apr = loan.apr;
        startTime = loan.startTime;
        accruedInterest = loan.accruedInterest + _calculateLoanInterest(loan);
        active = loan.active;
    }
    
    /**
     * @dev 获取用户所有借款
     * @param user 用户地址
     * @return loanIds 借款ID数组
     */
    function getUserLoans(address user) external view returns (uint256[] memory loanIds) {
        return userLoans[user];
    }
    
    /**
     * @dev 计算借款利息
     * @param loan 借款记录
     * @return 利息金额
     */
    function _calculateLoanInterest(Loan storage loan) internal view returns (uint256) {
        if (!loan.active || loan.amount == 0 || loan.lastUpdateTime == block.timestamp) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - loan.lastUpdateTime;
        
        // 年化利率转换为每秒利率: APR / (BASIS_POINTS * 365 * 24 * 60 * 60)
        uint256 interestPerSecond = loan.amount * loan.apr / (BASIS_POINTS * 365 * 24 * 60 * 60);
        return interestPerSecond * timeElapsed;
    }
}
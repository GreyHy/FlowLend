// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RangeLend
 * @dev 区间流动性借贷协议的核心合约
 * 允许贷方在特定APR范围内提供流动性，借方可以在期望的利率下借款
 */
contract RangeLend {
    // 资产地址 => 流动性池
    mapping(address => LiquidityPool) public liquidityPools;
    
    // 流动性池结构
    struct LiquidityPool {
        uint256 totalLiquidity;        // 总流动性
        mapping(uint16 => mapping(uint16 => uint256)) rangeToLiquidity;  // minAPR => maxAPR => 流动性
        mapping(address => mapping(uint16 => mapping(uint16 => uint256))) userLiquidity; // 用户 => minAPR => maxAPR => 流动性
    }
    
    // 借款结构
    struct Loan {
        address borrower;      // 借款人
        address asset;         // 借款资产
        uint256 amount;        // 借款金额
        uint16 apr;            // 借款年化利率
        uint256 timestamp;     // 借款时间戳
    }
    
    // 用户借款记录
    mapping(address => Loan[]) public userLoans;
    
    // 事件
    event LiquidityAdded(address indexed provider, address indexed asset, uint256 amount, uint16 minAPR, uint16 maxAPR);
    event LiquidityRemoved(address indexed provider, address indexed asset, uint256 amount, uint16 minAPR, uint16 maxAPR);
    event LoanCreated(address indexed borrower, address indexed asset, uint256 amount, uint16 apr);
    event LoanRepaid(address indexed borrower, address indexed asset, uint256 amount, uint256 interest);
    
    /**
     * @dev 添加流动性到特定APR范围
     * @param asset 资产地址
     * @param amount 金额
     * @param minAPR 最小年化收益率（基点，1% = 100）
     * @param maxAPR 最大年化收益率（基点，1% = 100）
     */
    function addLiquidity(address asset, uint256 amount, uint16 minAPR, uint16 maxAPR) external {
        require(amount > 0, "Amount must be greater than 0");
        require(minAPR < maxAPR, "Min APR must be less than Max APR");
        
        // 转移资产到合约
        // 实际实现需要使用ERC20接口
        // IERC20(asset).transferFrom(msg.sender, address(this), amount);
        
        // 更新流动性池
        liquidityPools[asset].totalLiquidity += amount;
        liquidityPools[asset].rangeToLiquidity[minAPR][maxAPR] += amount;
        liquidityPools[asset].userLiquidity[msg.sender][minAPR][maxAPR] += amount;
        
        emit LiquidityAdded(msg.sender, asset, amount, minAPR, maxAPR);
    }
    
    /**
     * @dev 从特定APR范围移除流动性
     * @param asset 资产地址
     * @param amount 金额
     * @param minAPR 最小年化收益率（基点）
     * @param maxAPR 最大年化收益率（基点）
     */
    function removeLiquidity(address asset, uint256 amount, uint16 minAPR, uint16 maxAPR) external {
        require(amount > 0, "Amount must be greater than 0");
        require(liquidityPools[asset].userLiquidity[msg.sender][minAPR][maxAPR] >= amount, "Insufficient liquidity");
        
        // 更新流动性池
        liquidityPools[asset].totalLiquidity -= amount;
        liquidityPools[asset].rangeToLiquidity[minAPR][maxAPR] -= amount;
        liquidityPools[asset].userLiquidity[msg.sender][minAPR][maxAPR] -= amount;
        
        // 转移资产回用户
        // 实际实现需要使用ERC20接口
        // IERC20(asset).transfer(msg.sender, amount);
        
        emit LiquidityRemoved(msg.sender, asset, amount, minAPR, maxAPR);
    }
    
    /**
     * @dev 借款
     * @param asset 资产地址
     * @param amount 金额
     * @param targetAPR 目标年化利率（基点）
     */
    function borrow(address asset, uint256 amount, uint16 targetAPR) external {
        require(amount > 0, "Amount must be greater than 0");
        require(_hasAvailableLiquidity(asset, amount, targetAPR), "No available liquidity at target APR");
        
        // 创建借款记录
        Loan memory loan = Loan({
            borrower: msg.sender,
            asset: asset,
            amount: amount,
            apr: targetAPR,
            timestamp: block.timestamp
        });
        
        userLoans[msg.sender].push(loan);
        
        // 转移资产给借款人
        // 实际实现需要使用ERC20接口
        // IERC20(asset).transfer(msg.sender, amount);
        
        emit LoanCreated(msg.sender, asset, amount, targetAPR);
    }
    
    /**
     * @dev 还款
     * @param loanIndex 借款索引
     * @param amount 还款金额
     */
    function repay(uint256 loanIndex, uint256 amount) external {
        require(loanIndex < userLoans[msg.sender].length, "Invalid loan index");
        Loan storage loan = userLoans[msg.sender][loanIndex];
        require(loan.borrower == msg.sender, "Not your loan");
        
        // 计算利息
        uint256 interest = _calculateInterest(loan);
        uint256 totalDue = loan.amount + interest;
        require(amount <= totalDue, "Amount exceeds total due");
        
        // 转移资产到合约
        // 实际实现需要使用ERC20接口
        // IERC20(loan.asset).transferFrom(msg.sender, address(this), amount);
        
        // 更新借款记录
        if (amount == totalDue) {
            // 完全还款，移除借款记录
            _removeLoan(msg.sender, loanIndex);
        } else {
            // 部分还款，更新借款金额
            loan.amount = totalDue - amount;
            loan.timestamp = block.timestamp; // 重置时间戳
        }
        
        emit LoanRepaid(msg.sender, loan.asset, amount, interest);
    }
    
    /**
     * @dev 检查特定APR是否有足够的流动性
     * @param asset 资产地址
     * @param amount 金额
     * @param targetAPR 目标年化利率
     * @return 是否有足够流动性
     */
    function _hasAvailableLiquidity(address asset, uint256 amount, uint16 targetAPR) internal view returns (bool) {
        // 简化实现，实际需要考虑所有包含targetAPR的区间
        uint256 availableLiquidity = 0;
        
        // 遍历所有流动性区间，找到包含targetAPR的区间
        // 这里简化处理，实际实现需要更高效的数据结构
        
        return availableLiquidity >= amount;
    }
    
    /**
     * @dev 计算借款利息
     * @param loan 借款记录
     * @return 利息金额
     */
    function _calculateInterest(Loan memory loan) internal view returns (uint256) {
        uint256 timeElapsed = block.timestamp - loan.timestamp;
        // 年化利率转换为每秒利率: APR / (100 * 365 * 24 * 60 * 60)
        uint256 interestPerSecond = loan.amount * loan.apr / (100 * 365 * 24 * 60 * 60);
        return interestPerSecond * timeElapsed;
    }
    
    /**
     * @dev 移除借款记录
     * @param borrower 借款人
     * @param index 借款索引
     */
    function _removeLoan(address borrower, uint256 index) internal {
        require(index < userLoans[borrower].length, "Invalid loan index");
        
        // 将最后一个元素移到要删除的位置，然后删除最后一个元素
        userLoans[borrower][index] = userLoans[borrower][userLoans[borrower].length - 1];
        userLoans[borrower].pop();
    }
}
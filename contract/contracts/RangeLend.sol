// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title RangeLend
 * @dev 基于自定义年化收益率（APR）区间的创新借贷协议
 * 贷方可以将其资产投入特定的APR范围，从而获得更可预测的回报，类似于Uniswap V3的集中流动性
 */
contract RangeLend is Ownable {
    using SafeERC20 for IERC20;

    // 流动性头寸结构
    struct LiquidityPosition {
        address provider;        // 流动性提供者
        uint256 amount;          // 存入金额
        uint256 minApr;          // 最小APR (基点，1% = 100)
        uint256 maxApr;          // 最大APR (基点，1% = 100)
        uint256 utilizedAmount;  // 已使用金额
        uint256 accruedInterest; // 累计利息
        uint256 timestamp;       // 上次更新时间
    }

    // 借款结构
    struct Loan {
        address borrower;       // 借款人
        uint256 amount;         // 借款金额
        uint256 apr;            // 借款APR (基点，1% = 100)
        uint256 collateralAmount; // 抵押品金额
        uint256 accruedInterest; // 累计利息
        uint256 timestamp;      // 上次更新时间
        bool active;            // 是否活跃
    }

    // 资产信息结构
    struct Asset {
        address token;           // 代币地址
        uint256 totalLiquidity;  // 总流动性
        uint256 totalBorrowed;   // 总借款
        uint256 collateralFactor; // 抵押系数 (基点，例如7500表示75%)
        bool supported;          // 是否支持
    }

    // 映射资产符号到资产信息
    mapping(string => Asset) public assets;
    // 支持的资产符号列表
    string[] public supportedAssets;
    
    // 流动性头寸ID到头寸的映射
    mapping(uint256 => LiquidityPosition) public liquidityPositions;
    // 用户地址到其流动性头寸ID列表的映射
    mapping(address => uint256[]) public userLiquidityPositions;
    // 当前流动性头寸计数
    uint256 public nextLiquidityPositionId;
    
    // 借款ID到借款的映射
    mapping(uint256 => Loan) public loans;
    // 用户地址到其借款ID列表的映射
    mapping(address => uint256[]) public userLoans;
    // 当前借款计数
    uint256 public nextLoanId;
    
    // APR区间到可用流动性的映射 (资产 => 最小APR => 最大APR => 流动性头寸ID列表)
    mapping(string => mapping(uint256 => mapping(uint256 => uint256[]))) public aprRangeLiquidity;
    
    // 协议费率 (基点，例如500表示5%)
    uint256 public protocolFeeRate = 1000;
    // 协议费收入
    mapping(string => uint256) public protocolFees;
    
    // 事件
    event AssetAdded(string symbol, address token, uint256 collateralFactor);
    event LiquidityAdded(uint256 indexed positionId, address indexed provider, string asset, uint256 amount, uint256 minApr, uint256 maxApr);
    event LiquidityRemoved(uint256 indexed positionId, address indexed provider, string asset, uint256 amount);
    event LoanCreated(uint256 indexed loanId, address indexed borrower, string asset, uint256 amount, uint256 apr);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, string asset, uint256 amount);
    event InterestAccrued(uint256 indexed positionId, uint256 interest);
    event CollateralAdded(uint256 indexed loanId, address indexed borrower, string asset, uint256 amount);
    event LoanLiquidated(uint256 indexed loanId, address indexed borrower, address liquidator, string asset, uint256 amount);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev 添加支持的资产
     * @param symbol 资产符号
     * @param token 代币地址
     * @param collateralFactor 抵押系数
     */
    function addAsset(string memory symbol, address token, uint256 collateralFactor) external onlyOwner {
        require(!assets[symbol].supported, "Asset already supported");
        require(collateralFactor <= 8000, "Collateral factor too high");
        
        assets[symbol] = Asset({
            token: token,
            totalLiquidity: 0,
            totalBorrowed: 0,
            collateralFactor: collateralFactor,
            supported: true
        });
        
        supportedAssets.push(symbol);
        
        emit AssetAdded(symbol, token, collateralFactor);
    }
    
    /**
     * @dev 添加流动性
     * @param asset 资产符号
     * @param amount 金额
     * @param minApr 最小APR (基点)
     * @param maxApr 最大APR (基点)
     */
    function addLiquidity(string memory asset, uint256 amount, uint256 minApr, uint256 maxApr) external {
        require(assets[asset].supported, "Asset not supported");
        require(amount > 0, "Amount must be greater than 0");
        require(minApr <= maxApr, "Min APR must be <= Max APR");
        
        IERC20 token = IERC20(assets[asset].token);
        token.safeTransferFrom(msg.sender, address(this), amount);
        
        uint256 positionId = nextLiquidityPositionId++;
        
        liquidityPositions[positionId] = LiquidityPosition({
            provider: msg.sender,
            amount: amount,
            minApr: minApr,
            maxApr: maxApr,
            utilizedAmount: 0,
            accruedInterest: 0,
            timestamp: block.timestamp
        });
        
        userLiquidityPositions[msg.sender].push(positionId);
        aprRangeLiquidity[asset][minApr][maxApr].push(positionId);
        
        assets[asset].totalLiquidity += amount;
        
        emit LiquidityAdded(positionId, msg.sender, asset, amount, minApr, maxApr);
    }
    
    /**
     * @dev 移除流动性
     * @param positionId 流动性头寸ID
     * @param amount 金额
     */
    function removeLiquidity(uint256 positionId, uint256 amount) external {
        LiquidityPosition storage position = liquidityPositions[positionId];
        require(position.provider == msg.sender, "Not position owner");
        require(amount > 0 && amount <= position.amount - position.utilizedAmount, "Invalid amount");
        
        // 寻找此头寸对应的资产
        string memory asset;
        for (uint i = 0; i < supportedAssets.length; i++) {
            string memory assetSymbol = supportedAssets[i];
            uint256[] storage positions = aprRangeLiquidity[assetSymbol][position.minApr][position.maxApr];
            for (uint j = 0; j < positions.length; j++) {
                if (positions[j] == positionId) {
                    asset = assetSymbol;
                    break;
                }
            }
            if (bytes(asset).length > 0) break;
        }
        require(bytes(asset).length > 0, "Position asset not found");
        
        IERC20 token = IERC20(assets[asset].token);
        
        // 计算待提取的利息
        uint256 interest = position.accruedInterest;
        position.accruedInterest = 0;
        
        // 更新头寸
        position.amount -= amount;
        position.timestamp = block.timestamp;
        
        // 更新资产总流动性
        assets[asset].totalLiquidity -= amount;
        
        // 转移代币
        token.safeTransfer(msg.sender, amount + interest);
        
        emit LiquidityRemoved(positionId, msg.sender, asset, amount);
    }
    
    /**
     * @dev 借款
     * @param asset 借款资产
     * @param amount 借款金额
     * @param targetApr 目标APR (基点)
     * @param collateralAsset 抵押资产
     * @param collateralAmount 抵押金额
     */
    function borrow(
        string memory asset,
        uint256 amount,
        uint256 targetApr,
        string memory collateralAsset,
        uint256 collateralAmount
    ) external {
        require(assets[asset].supported, "Borrow asset not supported");
        require(assets[collateralAsset].supported, "Collateral asset not supported");
        require(amount > 0, "Amount must be greater than 0");
        
        IERC20 collateralToken = IERC20(assets[collateralAsset].token);
        collateralToken.safeTransferFrom(msg.sender, address(this), collateralAmount);
        
        // 验证抵押价值是否足够
        uint256 requiredCollateral = calculateRequiredCollateral(asset, amount, collateralAsset);
        require(collateralAmount >= requiredCollateral, "Insufficient collateral");
        
        // 找到合适的流动性头寸
        uint256 remainingAmount = amount;
        
        // 遍历所有APR区间找到匹配的流动性
        for (uint256 i = 0; i < supportedAssets.length && remainingAmount > 0; i++) {
            if (keccak256(abi.encodePacked(supportedAssets[i])) != keccak256(abi.encodePacked(asset))) continue;
            
            for (uint256 minApr = 0; minApr <= 10000 && remainingAmount > 0; minApr += 100) {
                for (uint256 maxApr = minApr; maxApr <= 10000 && remainingAmount > 0; maxApr += 100) {
                    if (targetApr >= minApr && targetApr <= maxApr) {
                        uint256[] storage positions = aprRangeLiquidity[asset][minApr][maxApr];
                        
                        for (uint256 j = 0; j < positions.length && remainingAmount > 0; j++) {
                            LiquidityPosition storage position = liquidityPositions[positions[j]];
                            
                            uint256 availableLiquidity = position.amount - position.utilizedAmount;
                            if (availableLiquidity > 0) {
                                uint256 borrowAmount = Math.min(availableLiquidity, remainingAmount);
                                
                                // 更新流动性头寸
                                position.utilizedAmount += borrowAmount;
                                
                                // 减少剩余需求
                                remainingAmount -= borrowAmount;
                            }
                        }
                    }
                }
            }
        }
        
        require(remainingAmount == 0, "Insufficient liquidity for the requested APR");
        
        // 创建借款记录
        uint256 loanId = nextLoanId++;
        loans[loanId] = Loan({
            borrower: msg.sender,
            amount: amount,
            apr: targetApr,
            collateralAmount: collateralAmount,
            accruedInterest: 0,
            timestamp: block.timestamp,
            active: true
        });
        
        userLoans[msg.sender].push(loanId);
        
        // 更新资产总借款
        assets[asset].totalBorrowed += amount;
        
        // 转移借款资产给借款人
        IERC20 borrowToken = IERC20(assets[asset].token);
        borrowToken.safeTransfer(msg.sender, amount);
        
        emit LoanCreated(loanId, msg.sender, asset, amount, targetApr);
    }
    
    /**
     * @dev 计算所需抵押品金额
     * @param borrowAsset 借款资产
     * @param borrowAmount 借款金额
     * @param collateralAsset 抵押资产
     * @return 所需抵押品金额
     */
    function calculateRequiredCollateral(
        string memory borrowAsset,
        uint256 borrowAmount,
        string memory collateralAsset
    ) public view returns (uint256) {
        // 这里应该使用预言机来获取真实价格
        // 为简化，我们假设所有资产价格相等，并使用抵押因子
        
        uint256 collateralFactor = assets[collateralAsset].collateralFactor;
        return (borrowAmount * 10000) / collateralFactor;
    }
    
    /**
     * @dev 还款
     * @param loanId 借款ID
     * @param amount 还款金额
     */
    function repay(uint256 loanId, uint256 amount) external {
        Loan storage loan = loans[loanId];
        require(loan.active, "Loan not active");
        
        // 找到此借款对应的资产
        string memory asset;
        for (uint i = 0; i < supportedAssets.length; i++) {
            // 这里需要更好的方式来追踪借款资产
            // 为简化，我们假设第一个资产是借款资产
            asset = supportedAssets[0];
            break;
        }
        require(bytes(asset).length > 0, "Loan asset not found");
        
        IERC20 token = IERC20(assets[asset].token);
        
        // 计算利息
        uint256 interest = calculateInterest(loan.amount, loan.apr, block.timestamp - loan.timestamp);
        uint256 totalDue = loan.amount + interest;
        
        // 确保还款金额有效
        uint256 actualPayment = Math.min(amount, totalDue);
        
        // 收取代币
        token.safeTransferFrom(msg.sender, address(this), actualPayment);
        
        // 分配还款 - 先还利息，再还本金
        if (actualPayment <= interest) {
            // 全部用于支付利息
            loan.accruedInterest += actualPayment;
        } else {
            // 部分用于支付利息，部分用于支付本金
            loan.accruedInterest += interest;
            
            uint256 principalPayment = actualPayment - interest;
            loan.amount -= principalPayment;
            
            // 更新资产总借款
            assets[asset].totalBorrowed -= principalPayment;
            
            // 如果全部还清，归还抵押品
            if (loan.amount == 0) {
                loan.active = false;
                
                // 找到抵押资产
                string memory collateralAsset;
                // 为简化，我们假设第二个资产是抵押资产
                if (supportedAssets.length > 1) {
                    collateralAsset = supportedAssets[1];
                } else {
                    collateralAsset = supportedAssets[0];
                }
                
                IERC20 collateralToken = IERC20(assets[collateralAsset].token);
                collateralToken.safeTransfer(loan.borrower, loan.collateralAmount);
            }
        }
        
        loan.timestamp = block.timestamp;
        
        emit LoanRepaid(loanId, msg.sender, asset, actualPayment);
    }
    
    /**
     * @dev 计算利息
     * @param principal 本金
     * @param apr APR (基点)
     * @param timeElapsed 经过时间(秒)
     * @return 利息金额
     */
    function calculateInterest(
        uint256 principal,
        uint256 apr,
        uint256 timeElapsed
    ) public pure returns (uint256) {
        // APR基点转换为年利率（除以10000）
        // 然后计算时间段内的利息：principal * (apr/10000) * (timeElapsed/secondsPerYear)
        uint256 secondsPerYear = 365 * 24 * 60 * 60;
        return (principal * apr * timeElapsed) / (10000 * secondsPerYear);
    }
    
    /**
     * @dev 获取用户的流动性头寸
     * @param user 用户地址
     * @return 流动性头寸ID数组
     */
    function getUserLiquidityPositions(address user) external view returns (uint256[] memory) {
        return userLiquidityPositions[user];
    }
    
    /**
     * @dev 获取用户的借款
     * @param user 用户地址
     * @return 借款ID数组
     */
    function getUserLoans(address user) external view returns (uint256[] memory) {
        return userLoans[user];
    }
    
    /**
     * @dev 获取特定APR区间的流动性
     * @param asset 资产符号
     * @param minApr 最小APR
     * @param maxApr 最大APR
     * @return 流动性头寸ID数组
     */
    function getLiquidityInRange(string memory asset, uint256 minApr, uint256 maxApr) 
        external view returns (uint256[] memory) 
    {
        return aprRangeLiquidity[asset][minApr][maxApr];
    }
    
    /**
     * @dev 提取协议费用（仅限所有者）
     * @param asset 资产符号
     */
    function withdrawProtocolFees(string memory asset) external onlyOwner {
        require(assets[asset].supported, "Asset not supported");
        
        uint256 feeAmount = protocolFees[asset];
        require(feeAmount > 0, "No fees to withdraw");
        
        protocolFees[asset] = 0;
        
        IERC20 token = IERC20(assets[asset].token);
        token.safeTransfer(owner(), feeAmount);
    }
    
    /**
     * @dev 设置协议费率（仅限所有者）
     * @param newFeeRate 新费率（基点）
     */
    function setProtocolFeeRate(uint256 newFeeRate) external onlyOwner {
        require(newFeeRate <= 2000, "Fee rate too high");
        protocolFeeRate = newFeeRate;
    }
} 
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title LiquidityPool
 * @dev 管理特定资产的流动性池，支持不同APR区间的流动性提供
 */
contract LiquidityPool is ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // 常量
    uint16 public constant BASIS_POINTS = 10000; // 100% = 10000 基点
    
    // 状态变量
    address public asset;                // 资产地址
    uint256 public totalLiquidity;       // 总流动性
    
    // APR区间结构
    struct APRRange {
        uint16 minAPR;  // 最小年化收益率（基点）
        uint16 maxAPR;  // 最大年化收益率（基点）
    }
    
    // 流动性头寸结构
    struct LiquidityPosition {
        uint256 amount;          // 流动性金额
        uint256 lastUpdateTime;  // 上次更新时间
        uint256 accruedInterest; // 累积利息
    }
    
    // 区间ID => 区间信息
    mapping(bytes32 => APRRange) public aprRanges;
    // 区间ID => 总流动性
    mapping(bytes32 => uint256) public rangeLiquidity;
    // 用户地址 => 区间ID => 用户流动性头寸
    mapping(address => mapping(bytes32 => LiquidityPosition)) public userPositions;
    // 所有区间ID
    bytes32[] public allRangeIds;
    
    // 事件
    event LiquidityAdded(address indexed provider, bytes32 indexed rangeId, uint256 amount, uint16 minAPR, uint16 maxAPR);
    event LiquidityRemoved(address indexed provider, bytes32 indexed rangeId, uint256 amount, uint256 interest);
    event InterestAccrued(address indexed provider, bytes32 indexed rangeId, uint256 interest);
    
    /**
     * @dev 构造函数
     * @param _asset 资产地址
     */
    constructor(address _asset) {
        require(_asset != address(0), "Invalid asset address");
        asset = _asset;
    }
    
    /**
     * @dev 添加流动性到特定APR范围
     * @param amount 金额
     * @param minAPR 最小年化收益率（基点）
     * @param maxAPR 最大年化收益率（基点）
     */
    function addLiquidity(uint256 amount, uint16 minAPR, uint16 maxAPR) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(minAPR < maxAPR, "Min APR must be less than Max APR");
        require(maxAPR <= BASIS_POINTS, "Max APR cannot exceed 100%");
        
        // 计算区间ID
        bytes32 rangeId = _getRangeId(minAPR, maxAPR);
        
        // 如果是新区间，添加到区间列表
        if (aprRanges[rangeId].minAPR == 0 && aprRanges[rangeId].maxAPR == 0) {
            aprRanges[rangeId] = APRRange(minAPR, maxAPR);
            allRangeIds.push(rangeId);
        }
        
        // 更新用户头寸
        LiquidityPosition storage position = userPositions[msg.sender][rangeId];
        
        // 如果已有头寸，先计算累积利息
        if (position.amount > 0) {
            position.accruedInterest += _calculatePositionInterest(position);
        }
        
        // 更新头寸
        position.amount += amount;
        position.lastUpdateTime = block.timestamp;
        
        // 更新总流动性
        totalLiquidity += amount;
        rangeLiquidity[rangeId] += amount;
        
        // 转移资产到合约
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        
        emit LiquidityAdded(msg.sender, rangeId, amount, minAPR, maxAPR);
    }
    
    /**
     * @dev 从特定APR范围移除流动性
     * @param rangeId 区间ID
     * @param amount 金额
     */
    function removeLiquidity(bytes32 rangeId, uint256 amount) external nonReentrant {
        LiquidityPosition storage position = userPositions[msg.sender][rangeId];
        require(position.amount >= amount, "Insufficient liquidity");
        
        // 计算累积利息
        uint256 interest = _calculatePositionInterest(position);
        position.accruedInterest += interest;
        
        // 计算总收益
        uint256 totalInterest = position.accruedInterest;
        uint256 totalWithdraw = amount + totalInterest;
        
        // 更新头寸
        position.amount -= amount;
        position.accruedInterest = 0;
        position.lastUpdateTime = block.timestamp;
        
        // 更新总流动性
        totalLiquidity -= amount;
        rangeLiquidity[rangeId] -= amount;
        
        // 转移资产回用户
        IERC20(asset).safeTransfer(msg.sender, totalWithdraw);
        
        emit LiquidityRemoved(msg.sender, rangeId, amount, totalInterest);
    }
    
    /**
     * @dev 计算并更新利息（不提取）
     * @param rangeId 区间ID
     */
    function updateInterest(bytes32 rangeId) external {
        LiquidityPosition storage position = userPositions[msg.sender][rangeId];
        require(position.amount > 0, "No liquidity position");
        
        uint256 interest = _calculatePositionInterest(position);
        position.accruedInterest += interest;
        position.lastUpdateTime = block.timestamp;
        
        emit InterestAccrued(msg.sender, rangeId, interest);
    }
    
    /**
     * @dev 获取用户在特定区间的流动性和累积利息
     * @param user 用户地址
     * @param rangeId 区间ID
     * @return amount 流动性金额
     * @return interest 累积利息
     */
    function getUserPosition(address user, bytes32 rangeId) external view returns (uint256 amount, uint256 interest) {
        LiquidityPosition storage position = userPositions[user][rangeId];
        amount = position.amount;
        interest = position.accruedInterest + _calculatePositionInterest(position);
    }
    
    /**
     * @dev 获取所有APR区间
     * @return ranges 所有APR区间
     */
    function getAllRanges() external view returns (APRRange[] memory ranges) {
        ranges = new APRRange[](allRangeIds.length);
        for (uint256 i = 0; i < allRangeIds.length; i++) {
            ranges[i] = aprRanges[allRangeIds[i]];
        }
    }
    
    /**
     * @dev 查找特定APR的可用流动性
     * @param targetAPR 目标年化利率
     * @return availableLiquidity 可用流动性
     */
    function getAvailableLiquidityAtAPR(uint16 targetAPR) external view returns (uint256 availableLiquidity) {
        for (uint256 i = 0; i < allRangeIds.length; i++) {
            bytes32 rangeId = allRangeIds[i];
            APRRange memory range = aprRanges[rangeId];
            
            // 检查targetAPR是否在区间内
            if (targetAPR >= range.minAPR && targetAPR <= range.maxAPR) {
                availableLiquidity += rangeLiquidity[rangeId];
            }
        }
    }
    
    /**
     * @dev 计算区间ID
     * @param minAPR 最小年化收益率
     * @param maxAPR 最大年化收益率
     * @return 区间ID
     */
    function _getRangeId(uint16 minAPR, uint16 maxAPR) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(minAPR, maxAPR));
    }
    
    /**
     * @dev 计算头寸利息
     * @param position 流动性头寸
     * @return 利息金额
     */
    function _calculatePositionInterest(LiquidityPosition storage position) internal view returns (uint256) {
        if (position.amount == 0 || position.lastUpdateTime == block.timestamp) {
            return 0;
        }
        
        // 简化的利息计算，实际实现需要考虑更复杂的利率模型
        // 这里假设一个固定的年化利率5%
        uint256 timeElapsed = block.timestamp - position.lastUpdateTime;
        uint256 annualRate = 500; // 5% = 500 基点
        
        // 年化利率转换为每秒利率: APR / (BASIS_POINTS * 365 * 24 * 60 * 60)
        uint256 interestPerSecond = position.amount * annualRate / (BASIS_POINTS * 365 * 24 * 60 * 60);
        return interestPerSecond * timeElapsed;
    }
}
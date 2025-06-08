// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./LiquidityPool.sol";
import "./LendingPool.sol";

/**
 * @title RangeLendFactory
 * @dev 用于创建和管理流动性池和借贷池的工厂合约
 */
contract RangeLendFactory is Ownable {
    // 支持的资产列表
    address[] public supportedAssets;
    // 资产地址 => 流动性池地址
    mapping(address => address) public assetToLiquidityPool;
    // 资产地址 => 借贷池地址
    mapping(address => address) public assetToLendingPool;
    
    // 事件
    event PoolsCreated(address indexed asset, address liquidityPool, address lendingPool);
    event AssetAdded(address indexed asset);
    event AssetRemoved(address indexed asset);
    
    /**
     * @dev 构造函数
     */
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev 添加支持的资产并创建相应的池
     * @param asset 资产地址
     */
    function addAsset(address asset) external onlyOwner {
        require(asset != address(0), "Invalid asset address");
        require(assetToLiquidityPool[asset] == address(0), "Asset already supported");
        
        // 创建流动性池
        LiquidityPool liquidityPool = new LiquidityPool(asset);
        
        // 创建借贷池
        LendingPool lendingPool = new LendingPool(asset, address(liquidityPool));
        
        // 更新映射
        assetToLiquidityPool[asset] = address(liquidityPool);
        assetToLendingPool[asset] = address(lendingPool);
        supportedAssets.push(asset);
        
        emit PoolsCreated(asset, address(liquidityPool), address(lendingPool));
        emit AssetAdded(asset);
    }
    
    /**
     * @dev 移除支持的资产
     * @param asset 资产地址
     */
    function removeAsset(address asset) external onlyOwner {
        require(assetToLiquidityPool[asset] != address(0), "Asset not supported");
        
        // 从支持的资产列表中移除
        for (uint256 i = 0; i < supportedAssets.length; i++) {
            if (supportedAssets[i] == asset) {
                supportedAssets[i] = supportedAssets[supportedAssets.length - 1];
                supportedAssets.pop();
                break;
            }
        }
        
        // 清除映射
        delete assetToLiquidityPool[asset];
        delete assetToLendingPool[asset];
        
        emit AssetRemoved(asset);
    }
    
    /**
     * @dev 获取所有支持的资产
     * @return 资产地址数组
     */
    function getAllSupportedAssets() external view returns (address[] memory) {
        return supportedAssets;
    }
    
    /**
     * @dev 获取资产的流动性池和借贷池
     * @param asset 资产地址
     * @return liquidityPool 流动性池地址
     * @return lendingPool 借贷池地址
     */
    function getAssetPools(address asset) external view returns (address liquidityPool, address lendingPool) {
        liquidityPool = assetToLiquidityPool[asset];
        lendingPool = assetToLendingPool[asset];
    }
}
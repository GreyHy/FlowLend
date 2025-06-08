'use client'

import { ethers } from 'ethers'

// ERC20标准ABI
const erc20ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
]

// RangeLend合约地址
export const RANGE_LEND_ADDRESS = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'

// 测试代币地址
export const TOKEN_ADDRESSES = {
  USDC: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  USDT: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  DAI: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  WETH: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  MONAD: '0x71C95911E9a5D330f4D621842EC243EE1343292e' // Monad测试网代币地址
}

// RangeLend ABI
export const RANGE_LEND_ABI = [
  "function addLiquidity(string memory asset, uint256 amount, uint256 minApr, uint256 maxApr) external",
  "function borrow(string memory asset, uint256 amount, uint256 targetApr, string memory collateralAsset, uint256 collateralAmount) external",
  "function removeLiquidity(uint256 positionId, uint256 amount) external",
  "function repay(uint256 loanId, uint256 amount) external",
  "function getUserLiquidityPositions(address user) external view returns (uint256[] memory)",
  "function getUserLoans(address user) external view returns (uint256[] memory)",
  "function getLiquidityInRange(string memory asset, uint256 minApr, uint256 maxApr) external view returns (uint256[] memory)"
]

// 连接到RangeLend合约
export async function getRangeLendContract(signer: ethers.Signer) {
  return new ethers.Contract(RANGE_LEND_ADDRESS, RANGE_LEND_ABI, signer)
}

// 连接到ERC20代币合约
export async function getTokenContract(tokenAddress: string, signer: ethers.Signer) {
  return new ethers.Contract(tokenAddress, erc20ABI, signer)
}

// 获取代币余额
export async function getTokenBalance(tokenAddress: string, account: string, provider: ethers.providers.Provider) {
  const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, provider)
  const balance = await tokenContract.balanceOf(account)
  const decimals = await tokenContract.decimals()
  return ethers.utils.formatUnits(balance, decimals)
}

// 批准代币
export async function approveToken(tokenAddress: string, spender: string, amount: string, signer: ethers.Signer) {
  const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, signer)
  const decimals = await tokenContract.decimals()
  const amountInWei = ethers.utils.parseUnits(amount, decimals)
  const tx = await tokenContract.approve(spender, amountInWei)
  return tx.wait()
}

// 提供流动性
export async function provideLiquidity(
  asset: string, 
  amount: string, 
  minApr: number, 
  maxApr: number, 
  signer: ethers.Signer
) {
  const rangeLend = await getRangeLendContract(signer)
  const tokenAddress = getTokenAddressBySymbol(asset)
  
  // 先批准代币
  const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, signer)
  const decimals = await tokenContract.decimals()
  const amountInWei = ethers.utils.parseUnits(amount, decimals)
  
  await approveToken(tokenAddress, RANGE_LEND_ADDRESS, amount, signer)
  
  // 转换APR为基点 (1% = 100 基点)
  const minAprBps = Math.floor(minApr * 100)
  const maxAprBps = Math.floor(maxApr * 100)
  
  // 调用智能合约
  const tx = await rangeLend.addLiquidity(asset.toUpperCase(), amountInWei, minAprBps, maxAprBps)
  return tx.wait()
}

// 借款
export async function borrowAsset(
  asset: string,
  amount: string,
  targetApr: number,
  collateralAsset: string,
  collateralAmount: string,
  signer: ethers.Signer
) {
  const rangeLend = await getRangeLendContract(signer)
  const collateralTokenAddress = getTokenAddressBySymbol(collateralAsset)
  
  // 先批准抵押代币
  const tokenContract = new ethers.Contract(collateralTokenAddress, erc20ABI, signer)
  const decimals = await tokenContract.decimals()
  const collateralAmountInWei = ethers.utils.parseUnits(collateralAmount, decimals)
  
  await approveToken(collateralTokenAddress, RANGE_LEND_ADDRESS, collateralAmount, signer)
  
  // 转换借款金额
  const borrowTokenAddress = getTokenAddressBySymbol(asset)
  const borrowTokenContract = new ethers.Contract(borrowTokenAddress, erc20ABI, signer)
  const borrowDecimals = await borrowTokenContract.decimals()
  const amountInWei = ethers.utils.parseUnits(amount, borrowDecimals)
  
  // 转换APR为基点
  const targetAprBps = Math.floor(targetApr * 100)
  
  // 调用智能合约
  const tx = await rangeLend.borrow(
    asset.toUpperCase(), 
    amountInWei, 
    targetAprBps, 
    collateralAsset.toUpperCase(), 
    collateralAmountInWei
  )
  return tx.wait()
}

// 根据代币符号获取地址
function getTokenAddressBySymbol(symbol: string): string {
  const upperSymbol = symbol.toUpperCase()
  if (upperSymbol === 'USDC') return TOKEN_ADDRESSES.USDC
  if (upperSymbol === 'USDT') return TOKEN_ADDRESSES.USDT
  if (upperSymbol === 'DAI') return TOKEN_ADDRESSES.DAI
  if (upperSymbol === 'ETH' || upperSymbol === 'WETH') return TOKEN_ADDRESSES.WETH
  if (upperSymbol === 'MONAD') return TOKEN_ADDRESSES.MONAD
  throw new Error(`不支持的代币: ${symbol}`)
} 
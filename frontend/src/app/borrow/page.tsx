'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ethers } from 'ethers'
import { useAccount } from 'wagmi'
import { toast } from 'react-hot-toast'
import { borrowAsset } from '../utils/contracts'

const supportedAssets = [
  { id: 'usdc', name: 'USDC', icon: '/assets/usdc.svg', availableLiquidity: '8.2M' },
  { id: 'usdt', name: 'USDT', icon: '/assets/usdt.svg', availableLiquidity: '4.6M' },
  { id: 'dai', name: 'DAI', icon: '/assets/dai.svg', availableLiquidity: '2.1M' },
  { id: 'eth', name: 'WETH', icon: '/assets/eth.svg', availableLiquidity: '1,200' },
  { id: 'monad', name: 'MONAD', icon: '/assets/monad.svg', availableLiquidity: '3.5M' },
]

const liquidityRanges = [
  { min: 0, max: 3, liquidity: '1.2M', color: 'bg-green-500' },
  { min: 3, max: 5, liquidity: '2.8M', color: 'bg-blue-500' },
  { min: 5, max: 7, liquidity: '5.4M', color: 'bg-yellow-500' },
  { min: 7, max: 10, liquidity: '2.5M', color: 'bg-orange-500' },
  { min: 10, max: 15, liquidity: '0.6M', color: 'bg-red-500' },
]

// 抵押品资产
const collateralAssets = [
  { id: 'usdc', name: 'USDC', balance: '15,000.00' },
  { id: 'usdt', name: 'USDT', balance: '7,500.00' },
  { id: 'dai', name: 'DAI', balance: '3,750.00' },
  { id: 'eth', name: 'WETH', balance: '8.75' },
  { id: 'monad', name: 'MONAD', balance: '100.00' },
]

export default function BorrowPage() {
  const { address, isConnected } = useAccount()
  const [selectedAsset, setSelectedAsset] = useState(supportedAssets[0])
  const [selectedCollateral, setSelectedCollateral] = useState(collateralAssets[0])
  const [amount, setAmount] = useState('')
  const [collateralAmount, setCollateralAmount] = useState('')
  const [targetApr, setTargetApr] = useState('6')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected || !address) {
      toast.error('请先连接钱包')
      return
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('请输入有效借款金额')
      return
    }
    
    if (!collateralAmount || parseFloat(collateralAmount) <= 0) {
      toast.error('请输入有效抵押品金额')
      return
    }
    
    const targetAprValue = parseFloat(targetApr)
    
    try {
      setIsLoading(true)
      toast.loading('交易处理中...')
      
      // 获取provider和signer
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      
      // 调用合约
      const tx = await borrowAsset(
        selectedAsset.id,
        amount,
        targetAprValue,
        selectedCollateral.id,
        collateralAmount,
        signer
      )
      
      toast.dismiss()
      toast.success('借款成功！交易哈希: ' + tx.transactionHash)
      
      // 清空表单
      setAmount('')
      setCollateralAmount('')
    } catch (error: unknown) {
      console.error('借款失败:', error)
      toast.dismiss()
      
      let errorMessage = '未知错误'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      toast.error('借款失败: ' + errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">借入资产</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">设置借款参数</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">选择借款资产</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {supportedAssets.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                        selectedAsset.id === asset.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => setSelectedAsset(asset)}
                    >
                      <div className="w-10 h-10 mb-2 relative">
                        <Image
                          src={asset.icon}
                          alt={asset.name}
                          fill
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                      <span className="font-medium">{asset.name}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  可用流动性: ${selectedAsset.availableLiquidity}
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="amount" className="block text-gray-700 dark:text-gray-300 mb-2">
                  借款金额
                </label>
                <div className="relative">
                  <input
                    id="amount"
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                    placeholder="输入金额"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 font-medium"
                    onClick={() => setAmount(selectedAsset.availableLiquidity.replace(/,/g, ''))}
                  >
                    最大
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="targetApr" className="block text-gray-700 dark:text-gray-300 mb-2">
                  目标 APR (%)
                </label>
                <input
                  id="targetApr"
                  type="range"
                  min="0"
                  max="15"
                  step="0.1"
                  value={targetApr}
                  onChange={(e) => setTargetApr(e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>0%</span>
                  <span>5%</span>
                  <span>10%</span>
                  <span>15%</span>
                </div>
                <div className="text-center mt-2">
                  <span className="text-2xl font-bold">{targetApr}%</span>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">选择抵押品</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {collateralAssets.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                        selectedCollateral.id === asset.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => setSelectedCollateral(asset)}
                    >
                      <div className="w-10 h-10 mb-2 relative">
                        <Image
                          src={`/assets/${asset.id}.svg`}
                          alt={asset.name}
                          fill
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                      <span className="font-medium">{asset.name}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  余额: {selectedCollateral.balance} {selectedCollateral.name}
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="collateralAmount" className="block text-gray-700 dark:text-gray-300 mb-2">
                  抵押品金额
                </label>
                <div className="relative">
                  <input
                    id="collateralAmount"
                    type="text"
                    value={collateralAmount}
                    onChange={(e) => setCollateralAmount(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                    placeholder="输入抵押品金额"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 font-medium"
                    onClick={() => setCollateralAmount(selectedCollateral.balance.replace(/,/g, ''))}
                  >
                    最大
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-3">流动性分布</h3>
                <div className="space-y-4">
                  {liquidityRanges.map((range) => (
                    <div key={`${range.min}-${range.max}`}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{range.min}-{range.max}%</span>
                        <span className="text-sm">${range.liquidity}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div 
                          className={`h-2 ${range.color} rounded-full`} 
                          style={{ 
                            width: `${parseFloat(range.liquidity) / 12.5 * 100}%`,
                            opacity: parseFloat(targetApr) >= range.min && parseFloat(targetApr) <= range.max ? 1 : 0.4
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">借款详情</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">年化利率</p>
                    <p className="text-lg font-semibold">{targetApr}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">抵押品</p>
                    <p className="text-lg font-semibold">
                      {collateralAmount ? `${collateralAmount} ${selectedCollateral.name}` : '-'}
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                aria-disabled={!isConnected || isLoading}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  !isConnected 
                    ? 'bg-gray-400 text-white pointer-events-none' 
                    : isLoading 
                      ? 'bg-blue-400 text-white pointer-events-none'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                onClick={(e) => {
                  if (!isConnected || isLoading) {
                    e.preventDefault();
                  }
                }}
              >
                {!isConnected 
                  ? '请先连接钱包' 
                  : isLoading 
                    ? '处理中...' 
                    : '确认借款'}
              </button>
            </form>
          </div>
        </div>
        
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">市场借款情况</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">平均借款 APR</p>
                <p className="text-2xl font-bold">6.75%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">总借款量</p>
                <p className="text-2xl font-bold">$8.2M</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">可用流动性</p>
                <p className="text-2xl font-bold">$12.5M</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">最佳利率区间</h2>
            <div className="space-y-4">
              <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900/20 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <h3 className="font-medium">低风险区间</h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">3-5% APR</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">适合长期稳定借款</p>
              </div>
              
              <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900/20 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <h3 className="font-medium">最佳流动性区间</h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">5-7% APR</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">流动性最高的区间</p>
              </div>
              
              <div className="p-4 border border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-900/20 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                  <h3 className="font-medium">高收益区间</h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">7-10% APR</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">适合短期紧急借款</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
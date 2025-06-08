'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ethers } from 'ethers'
import { useAccount } from 'wagmi'
import { toast } from 'react-hot-toast'
import { provideLiquidity } from '../utils/contracts'

const supportedAssets = [
  { id: 'usdc', name: 'USDC', icon: '/assets/usdc.svg', balance: '10,000.00' },
  { id: 'usdt', name: 'USDT', icon: '/assets/usdt.svg', balance: '5,000.00' },
  { id: 'dai', name: 'DAI', icon: '/assets/dai.svg', balance: '2,500.00' },
  { id: 'eth', name: 'WETH', icon: '/assets/eth.svg', balance: '5.25' },
  { id: 'monad', name: 'MONAD', icon: '/assets/monad.svg', balance: '500.00' },
]

export default function LendPage() {
  const { address, isConnected } = useAccount()
  const [selectedAsset, setSelectedAsset] = useState(supportedAssets[0])
  const [amount, setAmount] = useState('')
  const [minApr, setMinApr] = useState('5')
  const [maxApr, setMaxApr] = useState('7')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected || !address) {
      toast.error('请先连接钱包')
      return
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('请输入有效金额')
      return
    }
    
    const minAprValue = parseFloat(minApr)
    const maxAprValue = parseFloat(maxApr)
    
    if (minAprValue >= maxAprValue) {
      toast.error('最小APR必须小于最大APR')
      return
    }
    
    try {
      setIsLoading(true)
      toast.loading('交易处理中...')
      
      // 获取provider和signer
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      
      // 调用合约
      const tx = await provideLiquidity(
        selectedAsset.id,
        amount,
        minAprValue,
        maxAprValue,
        signer
      )
      
      toast.dismiss()
      toast.success('出借成功！交易哈希: ' + tx.transactionHash)
      
      // 清空表单
      setAmount('')
    } catch (error: unknown) {
      console.error('出借失败:', error)
      toast.dismiss()
      
      let errorMessage = '未知错误'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      toast.error('出借失败: ' + errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">出借资产</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">定义你的出借条件</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">选择资产</label>
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
                  余额: {selectedAsset.balance} {selectedAsset.name}
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="amount" className="block text-gray-700 dark:text-gray-300 mb-2">
                  出借金额
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
                    onClick={() => setAmount(selectedAsset.balance.replace(/,/g, ''))}
                  >
                    最大
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  APR 范围
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="minApr" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      最小 APR (%)
                    </label>
                    <input
                      id="minApr"
                      type="number"
                      value={minApr}
                      onChange={(e) => setMinApr(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                      step="0.1"
                      min="0"
                      max={maxApr}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="maxApr" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      最大 APR (%)
                    </label>
                    <input
                      id="maxApr"
                      type="number"
                      value={maxApr}
                      onChange={(e) => setMaxApr(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                      step="0.1"
                      min={minApr}
                      required
                    />
                  </div>
                </div>
                <div className="mt-4 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded-full">
                    <div 
                      className="h-4 bg-blue-500 rounded-full"
                      style={{ 
                        width: `${Math.min(100, (parseFloat(maxApr) - parseFloat(minApr)) / 20 * 100)}%`,
                        marginLeft: `${Math.min(100, parseFloat(minApr) / 20 * 100)}%`
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>0%</span>
                    <span>5%</span>
                    <span>10%</span>
                    <span>15%</span>
                    <span>20%</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">预期收益</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">最低年化收益</p>
                    <p className="text-lg font-semibold">{minApr}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">最高年化收益</p>
                    <p className="text-lg font-semibold">{maxApr}%</p>
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
                    return;
                  }
                }}
              >
                {!isConnected 
                  ? '请先连接钱包' 
                  : isLoading 
                    ? '处理中...' 
                    : '确认出借'}
              </button>
            </form>
          </div>
        </div>
        
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">市场概况</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">当前平均 APR</p>
                <p className="text-2xl font-bold">6.25%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">总出借量</p>
                <p className="text-2xl font-bold">$12.5M</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">总借款量</p>
                <p className="text-2xl font-bold">$8.2M</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">APR 区间分布</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">0-3%</span>
                  <span className="text-sm">$1.2M</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">3-5%</span>
                  <span className="text-sm">$2.8M</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: '22%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">5-7%</span>
                  <span className="text-sm">$5.4M</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: '43%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">7-10%</span>
                  <span className="text-sm">$2.5M</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">10%+</span>
                  <span className="text-sm">$0.6M</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: '5%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// 模拟数据
const lendingPositions = [
  { 
    id: 1, 
    asset: 'USDC', 
    icon: '/assets/usdc.svg',
    amount: '5,000.00', 
    minApr: 5, 
    maxApr: 7, 
    currentApr: 6.2, 
    earnings: '72.33',
    utilization: 85,
    created: '2023-11-15'
  },
  { 
    id: 2, 
    asset: 'ETH', 
    icon: '/assets/eth.svg',
    amount: '2.5', 
    minApr: 3, 
    maxApr: 5, 
    currentApr: 4.1, 
    earnings: '0.024',
    utilization: 62,
    created: '2023-12-03'
  },
]

const borrowings = [
  { 
    id: 1, 
    asset: 'USDT', 
    icon: '/assets/usdt.svg',
    amount: '2,500.00', 
    apr: 6.5, 
    interest: '37.92',
    collateral: '3,500.00 USDC',
    healthFactor: 1.8,
    created: '2023-11-20'
  },
]

const marketStats = {
  totalDeposited: '$8,340.00',
  totalBorrowed: '$2,500.00',
  averageApr: '5.4%',
  totalEarnings: '$75.82'
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('lending')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">仪表盘</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">总存款</p>
          <p className="text-2xl font-bold">{marketStats.totalDeposited}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">总借款</p>
          <p className="text-2xl font-bold">{marketStats.totalBorrowed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">平均 APR</p>
          <p className="text-2xl font-bold">{marketStats.averageApr}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">总收益</p>
          <p className="text-2xl font-bold">{marketStats.totalEarnings}</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'lending'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('lending')}
            >
              我的出借
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'borrowing'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('borrowing')}
            >
              我的借款
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'history'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('history')}
            >
              交易历史
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'lending' && (
            <div>
              {lendingPositions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">资产</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">数量</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">APR 区间</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">当前 APR</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">已赚取</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">利用率</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {lendingPositions.map((position) => (
                        <tr key={position.id}>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 relative">
                                <Image
                                  src={position.icon}
                                  alt={position.asset}
                                  fill
                                  style={{ objectFit: 'contain' }}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{position.asset}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{position.created}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">{position.amount}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">{position.minApr}% - {position.maxApr}%</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              position.currentApr >= position.minApr && position.currentApr <= position.maxApr
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {position.currentApr}%
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">{position.earnings} {position.asset}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${position.utilization}%` }}
                              ></div>
                            </div>
                            <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">{position.utilization}%</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <button className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 mr-3">
                              编辑
                            </button>
                            <button className="text-red-600 hover:text-red-800 dark:hover:text-red-400">
                              提取
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">没有出借头寸</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">开始出借来赚取收益</p>
                  <div className="mt-6">
                    <Link href="/lend" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                      出借资产
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'borrowing' && (
            <div>
              {borrowings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">资产</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">数量</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">APR</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">已产生利息</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">抵押物</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">健康因子</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {borrowings.map((borrowing) => (
                        <tr key={borrowing.id}>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 relative">
                                <Image
                                  src={borrowing.icon}
                                  alt={borrowing.asset}
                                  fill
                                  style={{ objectFit: 'contain' }}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{borrowing.asset}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{borrowing.created}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">{borrowing.amount}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">{borrowing.apr}%</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">{borrowing.interest} {borrowing.asset}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">{borrowing.collateral}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              borrowing.healthFactor > 1.5
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : borrowing.healthFactor > 1.2
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {borrowing.healthFactor.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <button className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 mr-3">
                              调整
                            </button>
                            <button className="text-green-600 hover:text-green-800 dark:hover:text-green-400">
                              还款
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">没有借款记录</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">您可以立即开始借款</p>
                  <div className="mt-6">
                    <Link href="/borrow" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                      借入资产
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'history' && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">暂无交易历史</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">您的交易记录将在此显示</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">出借建议</h2>
          <div className="space-y-4">
            <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900/20 rounded-lg">
              <h3 className="font-medium mb-2">热门 APR 区间</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">5-7% APR 区间当前有最高的流动性需求</p>
              <Link href="/lend" className="text-blue-600 text-sm font-medium mt-2 inline-block">
                开始出借 &rarr;
              </Link>
            </div>
            <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900/20 rounded-lg">
              <h3 className="font-medium mb-2">多元化出借</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">考虑将资产分散到不同的 APR 区间以优化收益</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">借款建议</h2>
          <div className="space-y-4">
            <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/20 rounded-lg">
              <h3 className="font-medium mb-2">理想借款利率</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">当前 5-6% APR 区间有最佳流动性和借款成本</p>
              <Link href="/borrow" className="text-blue-600 text-sm font-medium mt-2 inline-block">
                开始借款 &rarr;
              </Link>
            </div>
            <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/20 rounded-lg">
              <h3 className="font-medium mb-2">健康因子提示</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">确保您的健康因子保持在 1.5 以上以避免清算风险</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
'use client';

import { useState, useEffect } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface LiquidityPosition {
  id: string;
  asset: string;
  amount: number;
  minAPR: number;
  maxAPR: number;
  accruedInterest: number;
  timestamp: number;
}

interface LoanPosition {
  id: string;
  asset: string;
  amount: number;
  apr: number;
  startTime: number;
  accruedInterest: number;
  remainingPayments: number;
}

const PositionsPanel = () => {
  const [activeTab, setActiveTab] = useState('liquidity');
  const [liquidityPositions, setLiquidityPositions] = useState<LiquidityPosition[]>([]);
  const [loanPositions, setLoanPositions] = useState<LoanPosition[]>([]);
  const [loading, setLoading] = useState(false);

  // 模拟获取用户头寸数据
  useEffect(() => {
    const fetchPositions = async () => {
      setLoading(true);
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟流动性头寸数据
      const mockLiquidityPositions: LiquidityPosition[] = [
        {
          id: '0x1234...5678',
          asset: 'USDC',
          amount: 10000,
          minAPR: 5,
          maxAPR: 7,
          accruedInterest: 123.45,
          timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30天前
        },
        {
          id: '0x8765...4321',
          asset: 'ETH',
          amount: 5,
          minAPR: 3,
          maxAPR: 6,
          accruedInterest: 0.05,
          timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15天前
        },
      ];
      
      // 模拟借款头寸数据
      const mockLoanPositions: LoanPosition[] = [
        {
          id: '0xabcd...efgh',
          asset: 'USDC',
          amount: 5000,
          apr: 6.5,
          startTime: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60天前
          accruedInterest: 54.79,
          remainingPayments: 10,
        },
      ];
      
      setLiquidityPositions(mockLiquidityPositions);
      setLoanPositions(mockLoanPositions);
      setLoading(false);
    };
    
    fetchPositions();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const calculateAPY = (position: LiquidityPosition) => {
    // 简化的APY计算
    const daysElapsed = (Date.now() - position.timestamp) / (24 * 60 * 60 * 1000);
    if (daysElapsed <= 0) return 0;
    
    const annualizedReturn = (position.accruedInterest / position.amount) * (365 / daysElapsed) * 100;
    return annualizedReturn.toFixed(2);
  };

  const handleWithdraw = (positionId: string) => {
    // 在实际应用中，这里会调用智能合约
    console.log('提取流动性', positionId);
  };

  const handleRepay = (loanId: string) => {
    // 在实际应用中，这里会调用智能合约
    console.log('还款', loanId);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">我的头寸</h3>
        <button 
          onClick={() => setLoading(true)}
          className="flex items-center space-x-1 text-sm text-gray-300 hover:text-white"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>刷新</span>
        </button>
      </div>
      
      <div className="mb-6">
        <div className="flex border-b border-gray-700">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'liquidity' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('liquidity')}
          >
            流动性头寸
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'loans' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('loans')}
          >
            借款头寸
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div>
          {activeTab === 'liquidity' && (
            <div>
              {liquidityPositions.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p>您还没有流动性头寸</p>
                  <button 
                    className="mt-4 text-blue-500 hover:text-blue-400"
                    onClick={() => document.querySelectorAll('[role="tab"]')[0]?.click()}
                  >
                    提供流动性
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-400 text-sm">
                        <th className="pb-2">资产</th>
                        <th className="pb-2">金额</th>
                        <th className="pb-2">APR 范围</th>
                        <th className="pb-2">实际 APY</th>
                        <th className="pb-2">累积利息</th>
                        <th className="pb-2">开始日期</th>
                        <th className="pb-2">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liquidityPositions.map((position) => (
                        <tr key={position.id} className="border-t border-gray-700">
                          <td className="py-4">{position.asset}</td>
                          <td className="py-4">{position.amount.toLocaleString()}</td>
                          <td className="py-4">{position.minAPR}% - {position.maxAPR}%</td>
                          <td className="py-4 text-green-500">{calculateAPY(position)}%</td>
                          <td className="py-4 text-green-500">+{position.accruedInterest.toLocaleString()}</td>
                          <td className="py-4">{formatDate(position.timestamp)}</td>
                          <td className="py-4">
                            <button
                              onClick={() => handleWithdraw(position.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded transition duration-200"
                            >
                              提取
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'loans' && (
            <div>
              {loanPositions.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p>您还没有借款头寸</p>
                  <button 
                    className="mt-4 text-blue-500 hover:text-blue-400"
                    onClick={() => document.querySelectorAll('[role="tab"]')[1]?.click()}
                  >
                    借款
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-400 text-sm">
                        <th className="pb-2">资产</th>
                        <th className="pb-2">借款金额</th>
                        <th className="pb-2">APR</th>
                        <th className="pb-2">累积利息</th>
                        <th className="pb-2">开始日期</th>
                        <th className="pb-2">剩余还款期数</th>
                        <th className="pb-2">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loanPositions.map((loan) => (
                        <tr key={loan.id} className="border-t border-gray-700">
                          <td className="py-4">{loan.asset}</td>
                          <td className="py-4">{loan.amount.toLocaleString()}</td>
                          <td className="py-4">{loan.apr}%</td>
                          <td className="py-4 text-yellow-500">+{loan.accruedInterest.toLocaleString()}</td>
                          <td className="py-4">{formatDate(loan.startTime)}</td>
                          <td className="py-4">{loan.remainingPayments}</td>
                          <td className="py-4">
                            <button
                              onClick={() => handleRepay(loan.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded transition duration-200"
                            >
                              还款
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 bg-gray-800 rounded-lg p-4">
        <h4 className="text-lg font-medium mb-3">头寸统计</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">总流动性</p>
            <p className="text-xl font-semibold">
              {liquidityPositions.reduce((sum, pos) => sum + pos.amount, 0).toLocaleString()} USDC
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">总借款</p>
            <p className="text-xl font-semibold">
              {loanPositions.reduce((sum, loan) => sum + loan.amount, 0).toLocaleString()} USDC
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">累积收益</p>
            <p className="text-xl font-semibold text-green-500">
              +{liquidityPositions.reduce((sum, pos) => sum + pos.accruedInterest, 0).toLocaleString()} USDC
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionsPanel;
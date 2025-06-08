'use client';

import { useState, useEffect } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const BorrowingPanel = () => {
  const [asset, setAsset] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [targetAPR, setTargetAPR] = useState('6');
  const [availableLiquidity, setAvailableLiquidity] = useState(100000); // 模拟可用流动性
  const [liquidityDistribution, setLiquidityDistribution] = useState<{apr: number, amount: number}[]>([]);

  // 模拟获取流动性分布数据
  useEffect(() => {
    const distribution = [];
    for (let i = 0; i <= 20; i++) {
      const apr = i * 5; // 0% 到 100% 的 APR
      // 创建一个类似正态分布的流动性分布，中心在 6% APR 附近
      const base = 10000;
      const peak = 50000;
      const center = 6;
      const width = 10;
      const amount = base + peak * Math.exp(-Math.pow(apr - center, 2) / (2 * width));
      distribution.push({ apr, amount });
    }
    setLiquidityDistribution(distribution);
  }, []);

  // 根据目标 APR 计算可用流动性
  useEffect(() => {
    const targetAprNum = parseFloat(targetAPR);
    // 找到所有 APR 小于等于目标 APR 的流动性
    const available = liquidityDistribution
      .filter(item => item.apr <= targetAprNum)
      .reduce((sum, item) => sum + item.amount, 0);
    setAvailableLiquidity(available);
  }, [targetAPR, liquidityDistribution]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 在实际应用中，这里会调用智能合约
    console.log('借款', { asset, amount, targetAPR });
  };

  // 计算每月还款金额（简化计算）
  const calculateMonthlyPayment = () => {
    const principal = parseFloat(amount) || 0;
    const rate = parseFloat(targetAPR) / 100 / 12; // 月利率
    const term = 12; // 12个月期限
    
    if (principal === 0 || rate === 0) return 0;
    
    return (principal * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-6">借款</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">选择资产</label>
              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USDC">USDC</option>
                <option value="ETH">ETH</option>
                <option value="WBTC">WBTC</option>
                <option value="DAI">DAI</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">借款金额</label>
              <div className="relative">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  可用: {availableLiquidity.toLocaleString()} {asset}
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">目标 APR (%)</label>
              <input
                type="range"
                min="0"
                max="20"
                step="0.1"
                value={targetAPR}
                onChange={(e) => setTargetAPR(e.target.value)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-400">0%</span>
                <span className="text-lg font-medium">{targetAPR}%</span>
                <span className="text-sm text-gray-400">20%</span>
              </div>
            </div>
            
            <div className="mb-6 bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3">借款条款</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">期限</span>
                  <span>12 个月</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">还款方式</span>
                  <span>每月等额本息</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">提前还款费</span>
                  <span>无</span>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableLiquidity}
              className={`w-full font-bold py-3 px-4 rounded-lg transition duration-200 ${
                !amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableLiquidity
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              借款
            </button>
            
            {parseFloat(amount) > availableLiquidity && (
              <p className="text-red-500 text-sm mt-2">借款金额超过可用流动性</p>
            )}
          </div>
          
          <div className="bg-gray-700 rounded-xl p-6">
            <h4 className="text-lg font-medium mb-4">借款预览</h4>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-300">借款资产</span>
                <span className="font-medium">{asset}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">借款金额</span>
                <span className="font-medium">{amount || '0'} {asset}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">年化利率</span>
                <span className="font-medium">{targetAPR}%</span>
              </div>
              
              <div className="border-t border-gray-600 my-4"></div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">每月还款</span>
                <span className="font-medium">
                  {amount && parseFloat(amount) > 0 
                    ? calculateMonthlyPayment().toFixed(2)
                    : '0'} {asset}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">总还款金额</span>
                <span className="font-medium">
                  {amount && parseFloat(amount) > 0 
                    ? (calculateMonthlyPayment() * 12).toFixed(2)
                    : '0'} {asset}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">总利息</span>
                <span className="font-medium text-yellow-500">
                  {amount && parseFloat(amount) > 0 
                    ? (calculateMonthlyPayment() * 12 - parseFloat(amount)).toFixed(2)
                    : '0'} {asset}
                </span>
              </div>
            </div>
            
            <div className="mt-6 bg-gray-800 rounded-lg p-4">
              <h5 className="text-sm font-medium mb-2">流动性分布</h5>
              <div className="h-32 bg-gray-900 rounded-lg relative overflow-hidden">
                {/* 流动性分布图 */}
                <div className="absolute bottom-0 left-0 w-full h-full flex items-end">
                  {liquidityDistribution.map((item, i) => {
                    const maxAmount = Math.max(...liquidityDistribution.map(d => d.amount));
                    const height = (item.amount / maxAmount) * 100;
                    const isSelected = item.apr <= parseFloat(targetAPR);
                    return (
                      <div 
                        key={i} 
                        className={`w-full ${isSelected ? 'bg-blue-600' : 'bg-gray-700'}`}
                        style={{ height: `${height}%` }}
                      ></div>
                    );
                  })}
                </div>
                {/* 目标APR指示线 */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500"
                  style={{ left: `${(parseFloat(targetAPR) / 20) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span>APR</span>
                <span>20%</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BorrowingPanel;
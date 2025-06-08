'use client';

import { useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const LendingPanel = () => {
  const [asset, setAsset] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [minAPR, setMinAPR] = useState('5');
  const [maxAPR, setMaxAPR] = useState('7');
  const [aprRange, setAprRange] = useState<[number, number]>([5, 7]);

  const handleMinAPRChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinAPR(value);
    setAprRange([parseFloat(value) || 0, aprRange[1]]);
  };

  const handleMaxAPRChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxAPR(value);
    setAprRange([aprRange[0], parseFloat(value) || 0]);
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const index = parseInt(e.target.name);
    
    if (index === 0) {
      setMinAPR(value.toString());
      setAprRange([value, aprRange[1]]);
    } else {
      setMaxAPR(value.toString());
      setAprRange([aprRange[0], value]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 在实际应用中，这里会调用智能合约
    console.log('提供流动性', { asset, amount, minAPR, maxAPR });
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-6">提供流动性</h3>
      
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
              <label className="block text-sm font-medium text-gray-300 mb-2">金额</label>
              <div className="relative">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded"
                >
                  最大
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">最小 APR (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={minAPR}
                  onChange={handleMinAPRChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">最大 APR (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={maxAPR}
                  onChange={handleMaxAPRChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">APR 范围</label>
              <div className="relative h-6 bg-gray-700 rounded-full">
                <div 
                  className="absolute h-full bg-blue-600 rounded-full" 
                  style={{
                    left: `${aprRange[0]}%`,
                    width: `${aprRange[1] - aprRange[0]}%`,
                  }}
                ></div>
                <input
                  type="range"
                  name="0"
                  min="0"
                  max="100"
                  step="0.1"
                  value={aprRange[0]}
                  onChange={handleRangeChange}
                  className="absolute w-full h-full opacity-0 cursor-pointer"
                />
                <input
                  type="range"
                  name="1"
                  min="0"
                  max="100"
                  step="0.1"
                  value={aprRange[1]}
                  onChange={handleRangeChange}
                  className="absolute w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              提供流动性
            </button>
          </div>
          
          <div className="bg-gray-700 rounded-xl p-6">
            <h4 className="text-lg font-medium mb-4">流动性预览</h4>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-300">资产</span>
                <span className="font-medium">{asset}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">金额</span>
                <span className="font-medium">{amount || '0'} {asset}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">APR 范围</span>
                <span className="font-medium">{minAPR}% - {maxAPR}%</span>
              </div>
              
              <div className="border-t border-gray-600 my-4"></div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">预计年化收益</span>
                <span className="font-medium text-green-500">
                  {amount && parseFloat(amount) > 0 
                    ? `${(parseFloat(amount) * (parseFloat(minAPR) + parseFloat(maxAPR)) / 200).toFixed(2)} ${asset}` 
                    : `0 ${asset}`}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">预计日收益</span>
                <span className="font-medium text-green-500">
                  {amount && parseFloat(amount) > 0 
                    ? `${(parseFloat(amount) * (parseFloat(minAPR) + parseFloat(maxAPR)) / 200 / 365).toFixed(4)} ${asset}` 
                    : `0 ${asset}`}
                </span>
              </div>
            </div>
            
            <div className="mt-6 bg-gray-800 rounded-lg p-4">
              <h5 className="text-sm font-medium mb-2">流动性分布</h5>
              <div className="h-32 bg-gray-900 rounded-lg relative overflow-hidden">
                {/* 简化的流动性分布图 */}
                <div className="absolute bottom-0 left-0 w-full h-full flex items-end">
                  {Array.from({ length: 20 }).map((_, i) => {
                    const height = Math.random() * 70 + 10;
                    const inRange = i >= aprRange[0] / 5 && i <= aprRange[1] / 5;
                    return (
                      <div 
                        key={i} 
                        className={`w-full h-${Math.floor(height)}% ${inRange ? 'bg-blue-600' : 'bg-gray-700'}`}
                        style={{ height: `${height}%` }}
                      ></div>
                    );
                  })}
                </div>
                {/* 高亮当前选择的范围 */}
                <div 
                  className="absolute bottom-0 bg-blue-500 opacity-20 h-full"
                  style={{
                    left: `${aprRange[0]}%`,
                    width: `${aprRange[1] - aprRange[0]}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span>APR</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LendingPanel;
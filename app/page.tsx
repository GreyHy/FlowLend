'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Tab } from '@headlessui/react';
import LendingPanel from '../components/LendingPanel';
import BorrowingPanel from '../components/BorrowingPanel';
import PositionsPanel from '../components/PositionsPanel';
import ConnectWallet from '../components/ConnectWallet';

export default function Home() {
  const [connected, setConnected] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center">
            <span className="text-xl font-bold">R</span>
          </div>
          <h1 className="text-2xl font-bold">RangeLend</h1>
        </div>
        <ConnectWallet connected={connected} setConnected={setConnected} />
      </header>

      <main className="container mx-auto px-4 py-8">
        {!connected ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-4">区间流动性借贷协议</h2>
              <p className="text-xl text-gray-300 max-w-2xl">
                一种基于自定义年化收益率（APR）区间的创新借贷协议。贷方可以将其资产投入特定的 APR 范围，
                从而获得更可预测的回报，类似于 Uniswap V3 的集中流动性。
              </p>
            </div>
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-2xl w-full">
              <h3 className="text-2xl font-semibold mb-4">连接钱包开始使用</h3>
              <p className="text-gray-300 mb-6">
                连接您的钱包以访问RangeLend的全部功能，包括提供流动性、借款和管理您的头寸。
              </p>
              <button 
                onClick={() => setConnected(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-full transition duration-200"
              >
                连接钱包
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">欢迎使用 RangeLend</h2>
              <p className="text-gray-300">
                在这里，您可以在自定义APR区间内提供流动性或借款，获得更精确的收益和成本控制。
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <Tab.Group>
                <Tab.List className="flex bg-gray-900">
                  <Tab className={({ selected }) =>
                    `w-1/3 py-4 text-center font-medium outline-none ${selected ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`
                  }>
                    提供流动性
                  </Tab>
                  <Tab className={({ selected }) =>
                    `w-1/3 py-4 text-center font-medium outline-none ${selected ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`
                  }>
                    借款
                  </Tab>
                  <Tab className={({ selected }) =>
                    `w-1/3 py-4 text-center font-medium outline-none ${selected ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`
                  }>
                    我的头寸
                  </Tab>
                </Tab.List>
                <Tab.Panels>
                  <Tab.Panel>
                    <LendingPanel />
                  </Tab.Panel>
                  <Tab.Panel>
                    <BorrowingPanel />
                  </Tab.Panel>
                  <Tab.Panel>
                    <PositionsPanel />
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-3">精确定义收益率</h3>
                <p className="text-gray-300">
                  设置您接受的最小和最大APR范围，获得可预测的收益。
                </p>
              </div>
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-3">灵活的借款利率</h3>
                <p className="text-gray-300">
                  选择符合您预期的借款利率，优化您的资金成本。
                </p>
              </div>
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-3">资本效率最大化</h3>
                <p className="text-gray-300">
                  类似Uniswap V3的集中流动性机制，提高资本利用效率。
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="container mx-auto px-4 py-8 border-t border-gray-700 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-400">© 2023 RangeLend Protocol. 保留所有权利。</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white">
              文档
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              GitHub
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              社区
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

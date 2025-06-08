'use client';

import { useState } from 'react';
import { useChainId, useSwitchChain } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { monadTestnet, monadMainnet } from '../config/chains';
import { AddNetworkButton } from './AddNetworkButton';

export function NetworkSwitcher() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [isOpen, setIsOpen] = useState(false);

  const networks = [
    { name: 'Ethereum', chain: mainnet },
    { name: 'Monad Testnet', chain: monadTestnet },
    { name: 'Monad', chain: monadMainnet },
  ];

  const handleNetworkSwitch = (id: number) => {
    if (switchChain) {
      switchChain({ chainId: id });
    }
    setIsOpen(false);
  };

  // 获取当前链名称
  const getCurrentChainName = () => {
    const currentNetwork = networks.find((network) => network.chain.id === chainId);
    return currentNetwork?.name || '选择网络';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center rounded-xl bg-gray-100 px-3 py-2 text-sm"
      >
        {getCurrentChainName()}
        <svg
          className="ml-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isOpen ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {networks.map((network) => (
              <button
                key={network.chain.id}
                onClick={() => handleNetworkSwitch(network.chain.id)}
                className={`block px-4 py-2 text-sm w-full text-left ${
                  chainId === network.chain.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                role="menuitem"
              >
                {network.name}
                {network.chain.testnet && <span className="ml-2 text-xs text-gray-500">(测试网)</span>}
              </button>
            ))}
            
            <div className="border-t border-gray-200 dark:border-gray-700 my-1 py-1">
              <div className="px-4 py-1 text-xs text-gray-500">
                如果网络不可用，添加到钱包:
              </div>
              <div className="flex flex-col gap-2 p-2">
                <AddNetworkButton networkType="testnet" className="w-full" />
                <AddNetworkButton networkType="mainnet" className="w-full" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
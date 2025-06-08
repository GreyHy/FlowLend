'use client';

import { useState } from 'react';

interface ConnectWalletProps {
  connected: boolean;
  setConnected: (connected: boolean) => void;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ connected, setConnected }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [address, setAddress] = useState('0x1234...5678'); // 模拟钱包地址

  const handleConnect = () => {
    // 在实际应用中，这里会调用钱包连接API
    setConnected(true);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      {!connected ? (
        <button
          onClick={handleConnect}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
        >
          连接钱包
        </button>
      ) : (
        <div>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg border border-gray-600 flex items-center space-x-2 transition duration-200"
          >
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span>{address}</span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-10 border border-gray-700">
              <button
                onClick={handleDisconnect}
                className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                断开连接
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                查看交易历史
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                复制地址
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;
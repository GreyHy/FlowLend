'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { addMonadTestnet, addMonadMainnet } from '../utils/network';

interface AddNetworkButtonProps {
  networkType: 'testnet' | 'mainnet';
  className?: string;
}

export function AddNetworkButton({ networkType, className = '' }: AddNetworkButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddNetwork = async () => {
    setIsLoading(true);
    try {
      if (networkType === 'testnet') {
        await addMonadTestnet();
        toast.success('Monad测试网添加成功');
      } else {
        await addMonadMainnet();
        toast.success('Monad主网添加成功');
      }
    } catch (error) {
      console.error('添加网络失败:', error);
      let errorMessage = '添加网络失败';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddNetwork}
      disabled={isLoading}
      className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
        networkType === 'testnet'
          ? 'bg-purple-600 text-white hover:bg-purple-700'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
    >
      {isLoading
        ? '处理中...'
        : networkType === 'testnet'
        ? '添加Monad测试网'
        : '添加Monad主网'}
    </button>
  );
} 
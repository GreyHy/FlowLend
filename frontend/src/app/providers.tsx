'use client';

import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { WagmiProvider } from 'wagmi';
import { http } from 'viem';
import { mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { monadTestnet, monadMainnet } from './config/chains';

// 配置查询客户端
const queryClient = new QueryClient();

// 配置Wagmi
const config = getDefaultConfig({
  appName: 'RangeLend',
  projectId: 'YOUR_PROJECT_ID', // 可以使用任意字符串，本地开发用
  chains: [mainnet, monadTestnet, monadMainnet], // 移除Hardhat网络，只保留Ethereum主网和Monad网络
  transports: {
    [mainnet.id]: http(),
    [monadTestnet.id]: http(monadTestnet.rpcUrls.default.http[0]),
    [monadMainnet.id]: http(monadMainnet.rpcUrls.default.http[0]),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 
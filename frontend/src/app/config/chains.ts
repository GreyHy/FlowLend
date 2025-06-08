import { Chain } from 'wagmi/chains';

// Monad测试网配置
export const monadTestnet: Chain = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz/'] },
    public: { http: ['https://testnet-rpc.monad.xyz/'] },
  },
  blockExplorers: {
    default: { name: 'MonadExplorer', url: 'https://testnet.monadexplorer.com/' },
  },
  testnet: true,
};

// Monad主网配置 (预留，当主网上线后可更新)
export const monadMainnet: Chain = {
  id: 1024, // 这是假设的ID，需要在主网上线后更新
  name: 'Monad',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.monad.xyz/'] }, // 假设的URL，需要在主网上线后更新
    public: { http: ['https://rpc.monad.xyz/'] },  // 假设的URL，需要在主网上线后更新
  },
  blockExplorers: {
    default: { name: 'MonadExplorer', url: 'https://monadexplorer.com/' }, // 假设的URL，需要在主网上线后更新
  },
  testnet: false,
}; 
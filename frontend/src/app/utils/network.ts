import { monadTestnet, monadMainnet } from "../config/chains";

/**
 * 请求将Monad测试网添加到MetaMask
 */
export const addMonadTestnet = async () => {
  if (!window.ethereum) {
    console.error("找不到MetaMask");
    throw new Error("请安装MetaMask插件");
  }

  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${monadTestnet.id.toString(16)}`,
          chainName: monadTestnet.name,
          nativeCurrency: monadTestnet.nativeCurrency,
          rpcUrls: monadTestnet.rpcUrls.default.http,
          blockExplorerUrls: [monadTestnet.blockExplorers?.default.url],
        },
      ],
    });
    
    return true;
  } catch (error) {
    console.error("添加网络失败:", error);
    throw error;
  }
};

/**
 * 请求将Monad主网添加到MetaMask（当主网上线后更新）
 */
export const addMonadMainnet = async () => {
  if (!window.ethereum) {
    console.error("找不到MetaMask");
    throw new Error("请安装MetaMask插件");
  }

  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${monadMainnet.id.toString(16)}`,
          chainName: monadMainnet.name,
          nativeCurrency: monadMainnet.nativeCurrency,
          rpcUrls: monadMainnet.rpcUrls.default.http,
          blockExplorerUrls: [monadMainnet.blockExplorers?.default.url],
        },
      ],
    });
    
    return true;
  } catch (error) {
    console.error("添加网络失败:", error);
    throw error;
  }
};

// 全局声明，扩展Window类型以包含ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
} 
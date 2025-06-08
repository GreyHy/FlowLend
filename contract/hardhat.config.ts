import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

// 获取私钥，如果没有设置则使用默认值
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    // Monad 测试网
    monadTestnet: {
      url: "https://rpc.monad.testnet-m0.org",
      chainId: 1898030,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      monadTestnet: "不需要API密钥", // Monad没有官方API密钥
    },
    customChains: [
      {
        network: "monadTestnet",
        chainId: 1898030,
        urls: {
          apiURL: "https://explorer.monad.testnet-m0.org/api",
          browserURL: "https://explorer.monad.testnet-m0.org",
        },
      },
    ],
  },
};

export default config;

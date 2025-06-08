# RangeLend - 基于APR区间的创新借贷协议

RangeLend是一个创新的借贷协议，灵感来源于Uniswap V3的集中流动性概念。在本协议中，贷方可以在特定的年化收益率（APR）区间内提供流动性，从而获得更可预测的回报。

## 项目结构

```
FlowLend/
├── backend/ - Express后端，提供API服务
├── contract/ - Solidity智能合约
└── frontend/ - Next.js前端应用
```

## 核心功能

- **基于APR区间的流动性提供**：贷方可以设定自己愿意接受的最低和最高APR，只有在这个范围内的借款请求才会使用其流动性
- **精确匹配借款利率**：借款人可以指定期望的APR，系统会自动匹配相应区间的流动性
- **抵押借款机制**：支持抵押品管理和流动性风险控制
- **多资产支持**：支持USDC、USDT、DAI和ETH等多种资产

## 技术栈

- **前端**：Next.js、TailwindCSS、wagmi、viem、ethers.js、RainbowKit
- **后端**：Express、MongoDB
- **智能合约**：Solidity、Hardhat

## 快速开始

### 前端

```bash
cd frontend
npm install
npm run dev
```

### 后端

```bash
cd backend
npm install
npm run dev
```

### 智能合约

```bash
cd contract
npm install
npx hardhat node  # 启动本地测试网络
npx hardhat run scripts/deploy.js --network localhost  # 部署合约
```

## 智能合约地址 (本地测试网络)

- USDC: 0x5FbDB2315678afecb367f032d93F642f64180aa3
- USDT: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
- DAI: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
- WETH: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
- RangeLend: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9

## 如何使用

1. **提供流动性**：用户可以选择一个资产以及他们希望的APR区间来提供流动性
2. **借款**：用户可以选择要借的资产，以及他们愿意支付的APR，并提供抵押品
3. **还款**：用户可以随时偿还他们的借款，并取回抵押品
4. **管理头寸**：用户可以在仪表盘中查看和管理他们的流动性头寸和借款

# RangeLend - 区间流动性借贷协议

![RangeLend Logo](https://via.placeholder.com/150x150.png?text=RangeLend)

## 项目概述

RangeLend 是一种基于自定义年化收益率（APR）区间的创新借贷协议。贷方可以将其资产投入特定的 APR 范围，从而获得更可预测的回报，类似于 Uniswap V3 的集中流动性。借方则有机会以其期望的利率借款。为 DeFi 借贷带来前所未有的灵活性和资本效率。

## 核心功能

- **区间流动性提供**：贷方可以设置 `lend(asset=USDC, amount=10000, minAPR=5%, maxAPR=7%)`，在特定APR范围内提供流动性
- **目标利率借款**：借方可以寻找并锁定符合其资金成本预期的借款利率
- **资本效率最大化**：类似 Uniswap V3 的集中流动性机制，提高资本利用效率
- **可预测收益**：贷方可以在其可接受的 APR 范围内提供流动性，避免传统浮动利率的不可预测性

## 技术栈

### 前端
- Next.js + TailwindCSS
- wagmi/viem (以太坊交互)
- RainbowKit (钱包连接)
- Recharts (数据可视化)

### 智能合约
- Solidity 0.8.20
- OpenZeppelin 合约库
- Hardhat/Foundry (开发与测试)

### 区块链
- Monad (与 EVM 兼容，省 gas 版)

## 项目结构

```
/
├── app/                  # Next.js 应用目录
│   ├── page.tsx          # 主页面
│   └── layout.tsx        # 应用布局
├── components/           # React 组件
│   ├── ConnectWallet.tsx # 钱包连接组件
│   ├── LendingPanel.tsx  # 提供流动性面板
│   ├── BorrowingPanel.tsx # 借款面板
│   └── PositionsPanel.tsx # 头寸管理面板
├── contracts/            # 智能合约
│   ├── RangeLend.sol     # 主协议合约
│   ├── LiquidityPool.sol # 流动性池合约
│   ├── LendingPool.sol   # 借贷池合约
│   └── RangeLendFactory.sol # 工厂合约
└── public/               # 静态资源
```

## 智能合约架构

### RangeLend.sol
核心协议合约，管理流动性和借贷逻辑。

### LiquidityPool.sol
管理特定资产的流动性池，支持不同APR区间的流动性提供。

### LendingPool.sol
管理借贷操作，包括借款和还款。

### RangeLendFactory.sol
用于创建和管理流动性池和借贷池的工厂合约。

## 使用案例

1. **寻求稳定收益的贷方**：在其可接受的 APR 范围内提供流动性，避免传统浮动利率的不可预测性。
2. **有特定利率目标的借方**：寻找并锁定符合其资金成本预期的借款利率。
3. **DeFi 协议集成**：其他协议可以集成 RangeLend，为其用户提供更精细化的借贷选项和收益策略。
4. **资金管理者/DAO 金库**：在明确的收益预期下，更有效地管理闲置资金，优化资本配置。
5. **做市商与套利者**：利用不同 APR 区间的流动性差异进行策略操作。

## 本地开发

### 前端开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 智能合约开发

```bash
# 编译合约
npx hardhat compile

# 运行测试
npx hardhat test

# 部署合约
npx hardhat run scripts/deploy.js --network <network>
```

## 路线图

- [x] 概念验证和机制设计
- [x] 核心智能合约开发
- [x] 前端界面开发
- [ ] 测试网部署
- [ ] 安全审计
- [ ] 主网部署
- [ ] 社区建设和营销

## 贡献

欢迎贡献代码、报告问题或提出改进建议。请先查看现有问题或创建新问题，然后提交拉取请求。

## 许可证

MIT

## 联系我们

- 网站：[https://rangelend.xyz](https://rangelend.xyz)
- Twitter：[@RangeLend](https://twitter.com/RangeLend)
- Discord：[RangeLend Community](https://discord.gg/rangelend)
- Email：contact@rangelend.xyz
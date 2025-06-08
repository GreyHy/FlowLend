// 部署脚本
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("部署合约的账户:", deployer.address);
  
  // 部署测试代币
  const USDC = await hre.ethers.deployContract("TestToken", ["USD Coin", "USDC", 6, 1000000]);
  await USDC.waitForDeployment();
  console.log("USDC 代币部署在:", USDC.target);
  
  const USDT = await hre.ethers.deployContract("TestToken", ["Tether USD", "USDT", 6, 1000000]);
  await USDT.waitForDeployment();
  console.log("USDT 代币部署在:", USDT.target);
  
  const DAI = await hre.ethers.deployContract("TestToken", ["Dai Stablecoin", "DAI", 18, 1000000]);
  await DAI.waitForDeployment();
  console.log("DAI 代币部署在:", DAI.target);
  
  const WETH = await hre.ethers.deployContract("TestToken", ["Wrapped Ether", "WETH", 18, 1000]);
  await WETH.waitForDeployment();
  console.log("WETH 代币部署在:", WETH.target);

  const MONAD = await hre.ethers.deployContract("TestToken", ["Monad", "MONAD", 18, 10000]);
  await MONAD.waitForDeployment();
  console.log("MONAD 代币部署在:", MONAD.target);
  
  // 部署RangeLend协议
  const RangeLend = await hre.ethers.deployContract("RangeLend");
  await RangeLend.waitForDeployment();
  console.log("RangeLend 协议部署在:", RangeLend.target);
  
  // 添加支持的资产到RangeLend
  await RangeLend.addAsset("USDC", USDC.target, 7500); // 75% 抵押率
  console.log("添加USDC到RangeLend");
  
  await RangeLend.addAsset("USDT", USDT.target, 7500); // 75% 抵押率
  console.log("添加USDT到RangeLend");
  
  await RangeLend.addAsset("DAI", DAI.target, 7500); // 75% 抵押率
  console.log("添加DAI到RangeLend");
  
  await RangeLend.addAsset("WETH", WETH.target, 8000); // 80% 抵押率
  console.log("添加WETH到RangeLend");

  await RangeLend.addAsset("MONAD", MONAD.target, 7000); // 70% 抵押率
  console.log("添加MONAD到RangeLend");
  
  console.log("部署完成!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 
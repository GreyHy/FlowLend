const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// 配置环境变量
dotenv.config();

// 初始化Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 默认路由
app.get('/', (req, res) => {
  res.send('RangeLend API 运行中');
});

// API路由
const liquidityRoutes = require('./routes/liquidity.routes');
const loanRoutes = require('./routes/loan.routes');
const marketRoutes = require('./routes/market.routes');

app.use('/api/liquidity', liquidityRoutes);
app.use('/api/loan', loanRoutes);
app.use('/api/market', marketRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

// 连接数据库
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rangelend')
  .then(() => console.log('MongoDB连接成功'))
  .catch(err => console.error('MongoDB连接失败:', err)); 
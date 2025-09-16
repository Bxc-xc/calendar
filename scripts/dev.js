#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 启动开发环境...');

// 启动Vite开发服务器
const vite = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// 等待Vite服务器启动后启动Electron
setTimeout(() => {
  console.log('⚡ 启动Electron...');
  const electron = spawn('npm', ['run', 'electron'], {
    stdio: 'inherit',
    shell: true
  });

  electron.on('close', (code) => {
    console.log(`Electron进程退出，代码: ${code}`);
    vite.kill();
  });
}, 3000);

vite.on('close', (code) => {
  console.log(`Vite进程退出，代码: ${code}`);
});

// 处理进程退出
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭开发服务器...');
  vite.kill();
  process.exit(0);
});
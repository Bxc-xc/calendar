#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 启动桌面日历应用...');

// 检查依赖是否已安装
if (!fs.existsSync('node_modules')) {
  console.log('📦 安装依赖...');
  try {
    require('child_process').execSync('npm install', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ 依赖安装失败:', error.message);
    process.exit(1);
  }
}

// 检查图标文件是否存在
if (!fs.existsSync('assets/icons/icon.png')) {
  console.log('🎨 生成图标文件...');
  try {
    require('child_process').execSync('npm run generate-icons', { stdio: 'inherit' });
  } catch (error) {
    console.warn('⚠️ 图标生成失败，将使用默认图标');
  }
}

// 启动应用
console.log('⚡ 启动应用...');
const electron = spawn('npm', ['run', 'electron-dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

electron.on('close', (code) => {
  console.log(`应用已退出，代码: ${code}`);
});

electron.on('error', (error) => {
  console.error('启动应用时出错:', error);
});

// 处理进程退出
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭应用...');
  electron.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 正在关闭应用...');
  electron.kill();
  process.exit(0);
});
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建桌面日历应用...');

try {
  // 清理之前的构建
  if (fs.existsSync('dist')) {
    console.log('🧹 清理之前的构建文件...');
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // 构建前端资源
  console.log('📦 构建前端资源...');
  execSync('npm run build', { stdio: 'inherit' });

  // 复制必要的文件到dist目录
  console.log('📋 复制必要文件...');
  const filesToCopy = ['main.js', 'preload.js', 'package.json'];
  
  filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join('dist', file));
      console.log(`✅ 已复制: ${file}`);
    }
  });

  // 复制assets目录
  if (fs.existsSync('assets')) {
    const distAssets = path.join('dist', 'assets');
    if (!fs.existsSync(distAssets)) {
      fs.mkdirSync(distAssets, { recursive: true });
    }
    
    const copyDir = (src, dest) => {
      const entries = fs.readdirSync(src, { withFileTypes: true });
      entries.forEach(entry => {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
          if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
          }
          copyDir(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      });
    };
    
    copyDir('assets', distAssets);
    console.log('✅ 已复制: assets/');
  }

  console.log('🎉 构建完成！');
  console.log('📁 构建文件位于: dist/');
  
} catch (error) {
  console.error('❌ 构建失败:', error.message);
  process.exit(1);
}
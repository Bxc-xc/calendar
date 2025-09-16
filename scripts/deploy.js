#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始部署桌面日历应用...');

try {
  // 1. 清理之前的构建
  console.log('🧹 清理之前的构建...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // 2. 安装依赖
  console.log('📦 安装依赖...');
  execSync('npm install', { stdio: 'inherit' });

  // 3. 生成图标
  console.log('🎨 生成图标...');
  execSync('npm run generate-icons', { stdio: 'inherit' });

  // 4. 构建前端
  console.log('🔨 构建前端...');
  execSync('npm run build', { stdio: 'inherit' });

  // 5. 复制必要文件
  console.log('📋 复制必要文件...');
  const filesToCopy = ['main.js', 'preload.js', 'package.json'];
  
  filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join('dist', file));
      console.log(`✅ 已复制: ${file}`);
    }
  });

  // 6. 复制assets目录
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

  // 7. 打包应用
  console.log('📦 打包应用...');
  execSync('npm run dist', { stdio: 'inherit' });

  console.log('🎉 部署完成！');
  console.log('📁 安装包位于: dist/');
  
  // 显示构建信息
  if (fs.existsSync('dist')) {
    const distFiles = fs.readdirSync('dist');
    console.log('📋 生成的文件:');
    distFiles.forEach(file => {
      const filePath = path.join('dist', file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        const size = (stats.size / 1024 / 1024).toFixed(2);
        console.log(`  - ${file} (${size} MB)`);
      }
    });
  }

} catch (error) {
  console.error('❌ 部署失败:', error.message);
  process.exit(1);
}
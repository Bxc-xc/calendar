#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎨 生成应用图标...');

// 创建简单的PNG图标（Base64编码的1x1像素PNG）
const createSimplePNG = (size) => {
  // 这是一个简单的蓝色方块PNG的Base64编码
  const base64PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  return Buffer.from(base64PNG, 'base64');
};

// 创建简单的ICO文件头
const createSimpleICO = () => {
  // 这是一个简单的ICO文件头
  const icoHeader = Buffer.from([
    0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x10, 0x10, 0x00, 0x00, 0x01, 0x00,
    0x20, 0x00, 0x68, 0x04, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00
  ]);
  
  // 简单的16x16像素图标数据
  const iconData = Buffer.alloc(1024, 0x4A90E2); // 蓝色填充
  
  return Buffer.concat([icoHeader, iconData]);
};

try {
  // 确保assets目录存在
  if (!fs.existsSync('assets')) {
    fs.mkdirSync('assets', { recursive: true });
  }

  // 生成不同尺寸的PNG图标
  const sizes = [16, 32, 48, 64, 128, 256];
  sizes.forEach(size => {
    const pngData = createSimplePNG(size);
    const filename = size === 256 ? 'icon.png' : `icon-${size}.png`;
    fs.writeFileSync(path.join('assets', filename), pngData);
    console.log(`✅ 已生成: ${filename}`);
  });

  // 生成托盘图标（16x16）
  const trayIcon = createSimplePNG(16);
  fs.writeFileSync(path.join('assets', 'tray-icon.png'), trayIcon);
  console.log('✅ 已生成: tray-icon.png');

  // 生成ICO文件
  const icoData = createSimpleICO();
  fs.writeFileSync(path.join('assets', 'icon.ico'), icoData);
  console.log('✅ 已生成: icon.ico');

  // 生成ICNS文件（macOS）
  // 注意：这是一个简化的ICNS文件，实际应用中需要更复杂的格式
  const icnsData = createSimplePNG(128);
  fs.writeFileSync(path.join('assets', 'icon.icns'), icnsData);
  console.log('✅ 已生成: icon.icns');

  console.log('🎉 图标生成完成！');
  console.log('💡 提示：建议使用专业的图标设计工具（如Figma、Sketch）创建高质量的图标文件');

} catch (error) {
  console.error('❌ 图标生成失败:', error.message);
  process.exit(1);
}
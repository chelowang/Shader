// 3D 模型渲染器 Figma 插件 - 主代码
figma.showUI(__html__, { width: 960, height: 700, themeColors: false });

// 接收 UI 消息
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'insert-to-figma') {
    // 将渲染结果插入到 Figma 画布
    const bytes = new Uint8Array(msg.bytes);
    const image = figma.createImage(bytes);
    const rect = figma.createRectangle();
    rect.name = msg.name || '3D Render';
    rect.resize(msg.width, msg.height);
    rect.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: image.hash }];

    // 放到当前视图中心
    const viewport = figma.viewport.center;
    rect.x = viewport.x - msg.width / 2;
    rect.y = viewport.y - msg.height / 2;

    figma.currentPage.appendChild(rect);
    figma.currentPage.selection = [rect];
    figma.viewport.scrollAndZoomIntoView([rect]);
    figma.notify('3D 渲染结果已插入画布');
  }

  if (msg.type === 'insert-gif-frames') {
    // 将 GIF 帧序列作为多个图片插入
    const frames = msg.frames;
    const startX = figma.viewport.center.x - msg.width / 2;
    const startY = figma.viewport.center.y - msg.height / 2;
    const nodes = [];

    for (let i = 0; i < frames.length; i++) {
      const bytes = new Uint8Array(frames[i]);
      const image = figma.createImage(bytes);
      const rect = figma.createRectangle();
      rect.name = `3D Frame ${i + 1}`;
      rect.resize(msg.width, msg.height);
      rect.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: image.hash }];
      rect.x = startX + i * (msg.width + 20);
      rect.y = startY;
      figma.currentPage.appendChild(rect);
      nodes.push(rect);
    }

    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
    figma.notify(`已插入 ${frames.length} 帧到画布`);
  }

  if (msg.type === 'close') {
    figma.closePlugin();
  }
};

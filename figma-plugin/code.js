// ASCII 渲染器 Figma 插件 - 主代码
figma.showUI(__html__, { width: 900, height: 680, themeColors: false });

// 当用户选择变化时，通知 UI
figma.on('selectionchange', () => {
  sendSelectionImage();
});

// 启动时也发送一次
sendSelectionImage();

async function sendSelectionImage() {
  const sel = figma.currentPage.selection;
  if (sel.length === 0) {
    figma.ui.postMessage({ type: 'no-selection' });
    return;
  }

  const node = sel[0];
  try {
    const bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
    figma.ui.postMessage({
      type: 'image-data',
      bytes: Array.from(bytes),
      width: Math.round(node.width),
      height: Math.round(node.height),
      name: node.name
    });
  } catch (e) {
    figma.ui.postMessage({ type: 'export-error', message: e.message });
  }
}

// 接收 UI 消息
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'request-selection') {
    await sendSelectionImage();
  }

  if (msg.type === 'insert-to-figma') {
    // 将渲染结果插入到 Figma 画布
    const bytes = new Uint8Array(msg.bytes);
    const image = figma.createImage(bytes);
    const rect = figma.createRectangle();
    rect.name = 'ASCII Render';
    rect.resize(msg.width, msg.height);
    rect.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: image.hash }];

    // 放到当前视图中心
    const viewport = figma.viewport.center;
    rect.x = viewport.x - msg.width / 2;
    rect.y = viewport.y - msg.height / 2;

    figma.currentPage.appendChild(rect);
    figma.currentPage.selection = [rect];
    figma.viewport.scrollAndZoomIntoView([rect]);
    figma.notify('ASCII 渲染结果已插入画布');
  }

  if (msg.type === 'close') {
    figma.closePlugin();
  }
};

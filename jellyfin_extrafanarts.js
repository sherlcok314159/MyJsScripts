// ==UserScript==
// @name         展示 Jellyfin 剧照（Show Jellyfin Extrafanarts via clicking）.
// @namespace    http://tampermonkey.net/
// @version      1.01
// @description  Display Extrafanarts in a waterfall stream
// @author       Apricity
// @match        http://localhost:8096/web/*
// @grant        none
// @license      GNU GPLv3
// @downloadURL https://update.greasyfork.org/scripts/483834/%E5%B1%95%E7%A4%BA%20Jellyfin%20%E5%89%A7%E7%85%A7%EF%BC%88Show%20Jellyfin%20Extrafanarts%20via%20clicking%EF%BC%89.user.js
// @updateURL https://update.greasyfork.org/scripts/483834/%E5%B1%95%E7%A4%BA%20Jellyfin%20%E5%89%A7%E7%85%A7%EF%BC%88Show%20Jellyfin%20Extrafanarts%20via%20clicking%EF%BC%89.meta.js
// ==/UserScript==

(function () {
    'use strict';

    // 动态创建瀑布流容器
    const waterfallContainer = document.createElement('div');
    waterfallContainer.id = 'waterfall-container';
    waterfallContainer.style.position = 'absolute';
    waterfallContainer.style.zIndex = '10000';
    waterfallContainer.style.display = 'none';
    waterfallContainer.style.border = '1px solid #ccc';
    waterfallContainer.style.backgroundColor = '#e4efff'; // 淡蓝色背景
    waterfallContainer.style.padding = '10px';
    waterfallContainer.style.borderRadius = '25px';
    document.body.appendChild(waterfallContainer);

    // 创建关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '5px';
    closeButton.onclick = function () {
        waterfallContainer.style.display = 'none';
    };
    waterfallContainer.appendChild(closeButton);

    // 监听鼠标悬停事件
    document.addEventListener('click', async function (event) {
        const target = event.target;

        // 检查事件的目标是否有背景图片样式
        const style = target.currentStyle || window.getComputedStyle(target, false);
        const bgImage = style.backgroundImage.slice(4, -1).replace(/"/g, "");

        if (bgImage.includes('Backdrop')) {
            if (bgImage && bgImage !== 'none') {
                // 清除旧图片
                waterfallContainer.innerHTML = '';
                waterfallContainer.appendChild(closeButton); // 重新添加关闭按钮

                // 生成新的图片链接并添加到瀑布流容器中
                // 最多选取20个剧照
                for (let i = 1; i <= 20; i++) {
                    const newSrc = bgImage.replace(/Backdrop\/\d+/, `Backdrop/${i}`);
                    // 检查图片是否存在
                    try {
                        const response = await fetch(newSrc, { method: 'HEAD' });
                        if (!response.ok) throw new Error('Image not found.');

                        const img = document.createElement('img');
                        img.src = newSrc;
                        img.style.maxWidth = '200px';
                        img.style.maxHeight = '200px';
                        img.style.margin = '10px';
                        img.style.cursor = 'zoom-in';
                        img.onclick = function () {
                            // 图片点击放大
                            const zoomedImage = document.createElement('img');
                            zoomedImage.src = img.src;
                            zoomedImage.style.position = 'fixed';
                            zoomedImage.style.top = '50%';
                            zoomedImage.style.left = '50%';
                            zoomedImage.style.transform = 'translate(-50%, -50%)';
                            zoomedImage.style.maxWidth = '90%';
                            zoomedImage.style.maxHeight = '90%';
                            zoomedImage.style.zIndex = '10001';
                            zoomedImage.onclick = function () {
                                document.body.removeChild(zoomedImage);
                            };
                            document.body.appendChild(zoomedImage);
                        };
                        waterfallContainer.appendChild(img);
                    } catch (error) {
                        console.error('An image failed to load:', error);
                        break; // 图片不存在时退出循环
                    }
                }

                // 显示瀑布流容器并调整位置
                waterfallContainer.style.display = 'block';
                const rect = target.getBoundingClientRect();
                waterfallContainer.style.left = `${rect.left + window.scrollX}px`;
                waterfallContainer.style.top = `${rect.bottom + window.scrollY}px`;
            }
        }
    });
    // 阻止事件冒泡到mouseout事件
    waterfallContainer.addEventListener('click', function (event) {
        event.stopPropagation();
    });
})();

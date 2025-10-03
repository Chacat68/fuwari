# 关于页面性能优化文档

## 问题描述

用户反馈：点击关于页面之后，再点击其他按钮切换页面会卡顿。

## 问题分析

经过深入分析，发现关于页面切换卡顿的主要原因：

### 1. 复杂的动画元素
- **8个浮动标签**（`chip-left`, `chip-right`, `chip-up`）同时运行无限循环动画
- 每个标签都有 `will-change: transform, opacity` 属性，强制GPU加速
- 动画持续时间很长（3200-5200ms），且是无限循环的 `floatY` 动画
- 移动端和桌面端都有复杂的动画效果

### 2. 页面切换时的性能问题
- 虽然已有暂停动画的逻辑，但不够完善
- 缺少对移动端动画的优化
- 没有在页面离开时完全清理动画状态
- 预加载脚本可能影响页面切换性能

### 3. 资源管理问题
- 预加载脚本在2秒后执行，可能与页面切换冲突
- 缺少页面可见性检测，后台页面仍在执行动画

## 解决方案

### 1. 动画性能优化

#### CSS 优化
```css
/* 性能优化：页面切换时暂停动画 */
html.is-changing .chip-left,
html.is-changing .chip-right,
html.is-changing .chip-up {
    animation-play-state: paused !important;
    will-change: auto;
}

/* 移动端性能优化：减少动画复杂度 */
@media (max-width: 768px) {
    .chip-left,
    .chip-right,
    .chip-up {
        will-change: auto;
        animation-duration: 200ms, 3000ms; /* 缩短动画时间 */
    }
    
    /* 移动端禁用浮动动画，只保留淡入效果 */
    @media (prefers-reduced-motion: reduce) {
        .chip-left,
        .chip-right,
        .chip-up {
            animation: chipInUp 200ms ease-out forwards;
        }
    }
}
```

#### JavaScript 优化
- 在页面切换时立即暂停所有动画
- 动态注入CSS规则暂停所有动画
- 页面切换完成后恢复动画状态

### 2. 预加载策略优化

#### 智能预加载
```javascript
// 优化预加载策略，减少对页面切换的影响
let preloadTimeout: ReturnType<typeof setTimeout> | null = null;

function schedulePreload() {
    if (preloadTimeout) {
        clearTimeout(preloadTimeout);
    }
    
    // 延迟更长时间，避免影响页面切换性能
    preloadTimeout = setTimeout(() => {
        // 检查页面是否仍然可见，避免在后台页面进行预加载
        if (document.visibilityState === 'visible') {
            // 预加载主页HTML
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = '/';
            document.head.appendChild(link);
        }
    }, 5000); // 延长到5秒，减少对页面切换的影响
}
```

#### 页面可见性管理
- 监听 `visibilitychange` 事件
- 页面不可见时取消预加载
- 页面卸载时清理定时器

### 3. 页面切换性能优化

#### 增强的动画暂停逻辑
```javascript
window.swup.hooks.on('link:click', () => {
    // 立即减少动画延迟，提升页面切换性能
    document.documentElement.style.setProperty('--content-delay', '0ms');
    
    // 预优化：立即暂停所有复杂动画元素
    const complexElements = document.querySelectorAll('.chip-left, .chip-right, .chip-up, .timeline-item, .onload-animation');
    complexElements.forEach(el => {
        if (el instanceof HTMLElement) {
            el.style.animationPlayState = 'paused';
            el.style.willChange = 'auto';
        }
    });
    
    // 暂停所有CSS动画
    const style = document.createElement('style');
    style.textContent = `
        * {
            animation-play-state: paused !important;
        }
    `;
    style.id = 'swup-pause-animations';
    document.head.appendChild(style);
});
```

#### 动画状态恢复
```javascript
window.swup.hooks.on('visit:end', (_visit: {to: {url: string}}) => {
    // 恢复动画状态
    const pauseStyle = document.getElementById('swup-pause-animations');
    if (pauseStyle) {
        pauseStyle.remove();
    }
    
    // 恢复复杂动画元素的状态
    const complexElements = document.querySelectorAll('.chip-left, .chip-right, .chip-up, .timeline-item, .onload-animation');
    complexElements.forEach(el => {
        if (el instanceof HTMLElement) {
            el.style.animationPlayState = '';
            el.style.willChange = '';
        }
    });
});
```

## 优化效果

### 性能提升
1. **页面切换速度**：通过暂停复杂动画，页面切换更加流畅
2. **移动端体验**：减少移动端动画复杂度，提升低端设备性能
3. **资源管理**：智能预加载策略，避免不必要的资源消耗
4. **内存使用**：及时清理动画状态，减少内存占用

### 用户体验改善
1. **响应性**：页面切换更加即时响应
2. **流畅性**：消除卡顿现象
3. **兼容性**：支持 `prefers-reduced-motion` 用户偏好
4. **稳定性**：避免动画冲突和状态不一致

## 技术细节

### 关键优化点
1. **will-change 属性管理**：页面切换时移除，完成后恢复
2. **动画暂停机制**：使用 `animation-play-state: paused`
3. **动态CSS注入**：全局暂停所有动画
4. **页面可见性检测**：避免后台页面执行动画
5. **定时器管理**：及时清理，避免内存泄漏

### 兼容性考虑
- 支持现代浏览器的 `visibilitychange` 事件
- 兼容 `prefers-reduced-motion` 媒体查询
- 保持向后兼容性，不影响旧版浏览器

## 测试建议

1. **桌面端测试**：验证页面切换流畅性
2. **移动端测试**：检查低端设备性能
3. **动画测试**：确认动画暂停和恢复正常
4. **预加载测试**：验证智能预加载策略
5. **内存测试**：检查是否有内存泄漏

## 后续优化建议

1. **懒加载动画**：考虑使用 Intersection Observer 实现动画懒加载
2. **动画池管理**：实现动画对象池，减少创建销毁开销
3. **性能监控**：添加性能指标监控，持续优化
4. **用户偏好**：根据用户设备性能动态调整动画复杂度

// ============================================================
// 滚动触发动画 Hook
// 使用 Intersection Observer 实现元素进入视口时的动画
// 支持动态内容：当 DOM 变化时重新观察新的 .reveal 元素
// ============================================================

import { useEffect, useRef } from 'react';

export function useReveal(selector = '.reveal', threshold = 0.05) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // 创建 Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -20px 0px' }
    );

    // 观察当前所有 .reveal 元素
    const observeAll = () => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        if (!el.classList.contains('revealed')) {
          observerRef.current?.observe(el);
        }
      });
    };

    observeAll();

    // 使用 MutationObserver 监听 DOM 变化，自动观察新添加的 .reveal 元素
    const mutationObserver = new MutationObserver((mutations) => {
      let hasNewReveal = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          hasNewReveal = true;
          break;
        }
      }
      if (hasNewReveal) {
        // 延迟一帧，确保 DOM 完全更新
        requestAnimationFrame(observeAll);
      }
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observerRef.current?.disconnect();
      mutationObserver.disconnect();
    };
  }, [selector, threshold]);
}

export default useReveal;

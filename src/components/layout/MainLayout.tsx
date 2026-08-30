// ============================================================
// 八字命理综合分析 - 主布局
// 集成粒子背景动画 + Liquid Glass 设计系统
// ============================================================

import type { ReactNode } from 'react';
import Header from './Header.tsx';
import Sidebar from './Sidebar.tsx';
import ParticleBackground from '../effects/ParticleBackground.tsx';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="main-layout">
      {/* 粒子背景层 */}
      <div className="particle-container">
        <ParticleBackground />
      </div>
      <Header />
      <div className="main-layout-body">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

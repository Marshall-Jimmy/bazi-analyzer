// ============================================================
// 八字命理综合分析 - 应用头部
// ============================================================

import { useBaziStore } from '../../store/useBaziStore.ts';
import type { ActiveTab } from '../../store/useBaziStore.ts';
import { User, Users, History } from 'lucide-react';

const tabs: { key: ActiveTab; label: string; icon: typeof User }[] = [
  { key: 'single', label: '个人命盘', icon: User },
  { key: 'synastry', label: '双人合盘', icon: Users },
  { key: 'history', label: '历史记录', icon: History },
];

export default function Header() {
  const activeTab = useBaziStore(s => s.activeTab);
  const setActiveTab = useBaziStore(s => s.setActiveTab);

  return (
    <header className="header">
      <div className="header-inner">
        {/* 标题区域 */}
        <div className="header-brand">
          <h1 className="header-title">八字命理综合分析</h1>
          <span className="header-subtitle">Bazi Comprehensive Analysis</span>
        </div>

        {/* 导航标签 */}
        <nav className="header-nav">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`nav-tab ${activeTab === key ? 'nav-tab--active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

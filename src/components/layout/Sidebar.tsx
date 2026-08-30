// ============================================================
// 八字命理综合分析 - 侧边栏
// ============================================================

import { useBaziStore } from '../../store/useBaziStore.ts';

// ---- 格式化输入信息 ----
function formatInputSummary(input: { year: number; month: number; day: number; hour: number; minute: number; gender: string } | null): string {
  if (!input) return '未设置';
  const genderLabel = input.gender === 'male' ? '男' : '女';
  return `${input.year}年${input.month}月${input.day}日 ${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')} ${genderLabel}`;
}

export default function Sidebar() {
  const activeTab = useBaziStore(s => s.activeTab);
  const synastryInput1 = useBaziStore(s => s.synastryInput1);
  const synastryInput2 = useBaziStore(s => s.synastryInput2);
  const baziResult = useBaziStore(s => s.baziResult);

  // 合盘模式：显示两人信息
  if (activeTab === 'synastry') {
    return (
      <aside className="sidebar">
        <div className="sidebar-section">
          <h3 className="sidebar-section-title">合盘信息</h3>
          <div className="sidebar-person-card">
            <div className="person-badge person-badge--a">甲方</div>
            <p className="person-info">{formatInputSummary(synastryInput1)}</p>
          </div>
          <div className="sidebar-person-card">
            <div className="person-badge person-badge--b">乙方</div>
            <p className="person-info">{formatInputSummary(synastryInput2)}</p>
          </div>
        </div>
      </aside>
    );
  }

  // 历史记录模式：不显示侧边栏
  if (activeTab === 'history') {
    return null;
  }

  // 个人命盘模式：仅显示当前命盘摘要
  return (
    <aside className="sidebar">
      {baziResult && (
        <div className="sidebar-section">
          <h3 className="sidebar-section-title">当前命盘</h3>
          <div className="sidebar-summary">
            <div className="summary-pillar-grid">
              {(['year', 'month', 'day', 'hour'] as const).map(pillar => {
                const p = baziResult.fourPillars[pillar];
                const pillarLabel = { year: '年柱', month: '月柱', day: '日柱', hour: '时柱' }[pillar];
                return (
                  <div key={pillar} className="summary-pillar-item">
                    <span className="summary-pillar-label">{pillarLabel}</span>
                    <span className="summary-pillar-stem">{p.stem}</span>
                    <span className="summary-pillar-branch">{p.branch}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

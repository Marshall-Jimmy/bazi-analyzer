// ============================================================
// 五行力量分布图 - RadarChart
// ============================================================
// 使用 Recharts 雷达图展示金木水火土各五行力量分布
// 输入：FiveElementCount
// ============================================================

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { FiveElementCount } from '../../engine/index.ts';

// ---- 五行配色方案 ----
const ELEMENT_COLORS: Record<string, string> = {
  木: '#4ade80',   // 绿色
  火: '#f87171',   // 红色
  土: '#facc15',   // 黄色
  金: '#e2e8f0',   // 白色/浅灰
  水: '#60a5fa',   // 蓝色
};

const ELEMENT_FILL_OPACITY: Record<string, string> = {
  木: 'rgba(74, 222, 128, 0.25)',
  火: 'rgba(248, 113, 113, 0.25)',
  土: 'rgba(250, 204, 21, 0.25)',
  金: 'rgba(226, 232, 240, 0.25)',
  水: 'rgba(96, 165, 250, 0.25)',
};

interface FiveElementChartProps {
  data: FiveElementCount;
  className?: string;
  showValues?: boolean;
}

export default function FiveElementChart({
  data,
  className = '',
  showValues = true,
}: FiveElementChartProps) {
  const elements = ['木', '火', '土', '金', '水'] as const;
  const keys = ['wood', 'fire', 'earth', 'metal', 'water'] as const;

  // 构造雷达图数据：每个五行一个数据点
  const chartData = elements.map((name, i) => ({
    name,
    value: data[keys[i]],
    color: ELEMENT_COLORS[name],
    fill: ELEMENT_FILL_OPACITY[name],
  }));

  // 计算最大值，用于归一化
  const maxValue = Math.max(...keys.map(k => data[k]), 1);

  // 自定义 Tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; color: string } }> }) => {
    if (!active || !payload || payload.length === 0) return null;
    const item = payload[0].payload;
    const percentage = ((item.value / data.total) * 100).toFixed(1);
    return (
      <div className="rounded-lg border border-amber-900/50 bg-zinc-900/95 px-3 py-2 text-sm shadow-xl backdrop-blur-sm">
        <p className="font-bold" style={{ color: item.color }}>
          {item.name}
        </p>
        <p className="text-zinc-300">
          数量: {item.value} ({percentage}%)
        </p>
      </div>
    );
  };

  return (
    <div className={`rounded-xl border border-amber-900/30 bg-zinc-900/60 p-4 backdrop-blur-sm ${className}`}>
      <h3 className="mb-3 text-center text-sm font-medium text-amber-200/80">
        五行力量分布
      </h3>

      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid
            stroke="rgba(217, 119, 6, 0.15)"
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="name"
            tick={{
              fill: '#d4a574',
              fontSize: 14,
              fontWeight: 600,
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, maxValue]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="五行力量"
            dataKey="value"
            stroke="#d97706"
            strokeWidth={2}
            fill="rgba(217, 119, 6, 0.2)"
            dot={false}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>

      {/* 底部数值显示 */}
      {showValues && (
        <div className="mt-2 grid grid-cols-5 gap-2">
          {elements.map((name, i) => {
            const count = data[keys[i]];
            const pct = data.total > 0 ? ((count / data.total) * 100).toFixed(0) : '0';
            return (
              <div
                key={name}
                className="flex flex-col items-center rounded-lg bg-zinc-800/50 px-1 py-1.5"
              >
                <span
                  className="text-xs font-bold"
                  style={{ color: ELEMENT_COLORS[name] }}
                >
                  {name}
                </span>
                <span className="text-base font-bold text-zinc-100">
                  {count}
                </span>
                <span className="text-[10px] text-zinc-500">{pct}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 流年图表 - BarChart
// ============================================================
// 显示当前大运下近10年流年的吉凶
// 输入：LiuNian[]
// 每年一个柱子，颜色代表吉凶
// ============================================================

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import type { LiuNian } from '../../engine/index.ts';
import { HEAVENLY_STEMS, EARTHLY_BRANCHES } from '../../engine/index.ts';

// ---- 吉凶配色 ----
const TREND_COLORS = {
  good: '#4ade80',
  neutral: '#facc15',
  bad: '#f87171',
} as const;

const TREND_LABELS = {
  good: '吉',
  neutral: '平',
  bad: '凶',
} as const;

// ---- 流年评分模拟函数 ----
function calcLiuNianScore(liuNian: LiuNian, dayMasterElement: number): number {
  const stemElement = liuNian.pillar.stemElement;
  const branchElement = liuNian.pillar.branchElement;

  // 五行生克关系映射
  const shengMap: Record<number, number> = { 0: 4, 1: 0, 2: 1, 3: 2, 4: 3 };

  const stemScore = shengMap[stemElement] === dayMasterElement ? 3
    : stemElement === dayMasterElement ? 1
    : shengMap[dayMasterElement] === stemElement ? -1
    : -2;

  const branchScore = shengMap[branchElement] === dayMasterElement ? 3
    : branchElement === dayMasterElement ? 1
    : shengMap[dayMasterElement] === branchElement ? -1
    : -2;

  // 加入随机波动模拟更真实的结果（基于年份的确定性伪随机）
  const seed = liuNian.year * 7 + 13;
  const jitter = ((seed * 9301 + 49297) % 233280) / 233280 * 10 - 5;

  const raw = stemScore + branchScore + jitter;
  return Math.round(Math.max(0, Math.min(100, ((raw + 4) / 8) * 100)));
}

function getTrend(score: number): 'good' | 'neutral' | 'bad' {
  if (score >= 65) return 'good';
  if (score >= 40) return 'neutral';
  return 'bad';
}

interface LiuNianChartProps {
  liuNianList: LiuNian[];
  dayMasterElement: number;
  className?: string;
  /** 点击流年项的回调 */
  onLiuNianClick?: (liuNian: LiuNian, index: number) => void;
}

export default function LiuNianChart({
  liuNianList,
  dayMasterElement,
  className = '',
  onLiuNianClick,
}: LiuNianChartProps) {
  // 取最近10年流年
  const recentLiuNian = liuNianList.slice(-10);

  // 构造图表数据
  const chartData = recentLiuNian.map((liuNian, idx) => {
    const score = calcLiuNianScore(liuNian, dayMasterElement);
    const trend = getTrend(score);
    return {
      index: idx,
      year: liuNian.year,
      stemName: HEAVENLY_STEMS[liuNian.stem],
      branchName: EARTHLY_BRANCHES[liuNian.branch],
      pillarName: `${HEAVENLY_STEMS[liuNian.stem]}${EARTHLY_BRANCHES[liuNian.branch]}`,
      score,
      trend,
      color: TREND_COLORS[trend],
    };
  });

  // 自定义 Tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chartData[0] }> }) => {
    if (!active || !payload || payload.length === 0) return null;
    const item = payload[0].payload;
    return (
      <div className="rounded-lg border border-amber-900/50 bg-zinc-900/95 px-3 py-2 text-sm shadow-xl backdrop-blur-sm">
        <p className="font-bold text-amber-200">
          {item.year}年 ({item.pillarName})
        </p>
        <p className="text-zinc-400">
          天干: {item.stemName} / 地支: {item.branchName}
        </p>
        <p className="mt-1 font-bold" style={{ color: item.color }}>
          {TREND_LABELS[item.trend]} ({item.score}分)
        </p>
      </div>
    );
  };

  if (recentLiuNian.length === 0) {
    return (
      <div className={`rounded-xl border border-amber-900/30 bg-zinc-900/60 p-6 text-center backdrop-blur-sm ${className}`}>
        <p className="text-zinc-500">暂无流年数据</p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-amber-900/30 bg-zinc-900/60 p-4 backdrop-blur-sm ${className}`}>
      <h3 className="mb-3 text-center text-sm font-medium text-amber-200/80">
        流年吉凶（近{recentLiuNian.length}年）
      </h3>

      {/* 柱状图 */}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(217, 119, 6, 0.1)"
            vertical={false}
          />
          <XAxis
            dataKey="year"
            tick={{ fill: '#a8a29e', fontSize: 11 }}
            tickFormatter={(v: number) => `${v}`}
            axisLine={{ stroke: 'rgba(217, 119, 6, 0.2)' }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#a8a29e', fontSize: 11 }}
            ticks={[0, 25, 50, 75, 100]}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(217, 119, 6, 0.05)' }} />
          <Bar
            dataKey="score"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            onClick={(data) => {
              const idx = (data as unknown as { index: number }).index;
              if (onLiuNianClick && recentLiuNian[idx]) {
                onLiuNianClick(recentLiuNian[idx], idx);
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                fillOpacity={0.8}
                stroke={entry.color}
                strokeWidth={1}
              />
            ))}
            {/* 柱顶标签：吉/平/凶 */}
            <LabelList
              dataKey="trend"
              position="top"
              formatter={(value) => TREND_LABELS[String(value) as keyof typeof TREND_LABELS]}
              style={{
                fontSize: 11,
                fontWeight: 700,
                fill: '#d4a574',
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* 流年详情列表 */}
      <div className="mt-3 grid grid-cols-5 gap-1.5 sm:grid-cols-10">
        {chartData.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (onLiuNianClick && recentLiuNian[idx]) {
                onLiuNianClick(recentLiuNian[idx], idx);
              }
            }}
            className="flex flex-col items-center rounded-lg border border-zinc-700/30 bg-zinc-800/30 px-1 py-1.5 transition-all hover:border-zinc-600/50 hover:bg-zinc-800/60"
          >
            <span className="text-[10px] text-zinc-500">{item.year}</span>
            <span className="text-xs font-bold text-zinc-200">{item.pillarName}</span>
            <span
              className="mt-0.5 rounded px-1 py-0.5 text-[10px] font-bold"
              style={{
                color: item.color,
                backgroundColor: `${item.color}15`,
              }}
            >
              {item.score}
            </span>
          </button>
        ))}
      </div>

      {/* 图例 */}
      <div className="mt-2 flex items-center justify-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: TREND_COLORS.good }} />
          吉 (&gt;=65)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: TREND_COLORS.neutral }} />
          平 (40-64)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: TREND_COLORS.bad }} />
          凶 (&lt;40)
        </span>
      </div>
    </div>
  );
}

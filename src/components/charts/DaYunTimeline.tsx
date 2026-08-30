// ============================================================
// 大运时间轴 - 自定义时间轴 + LineChart
// ============================================================
// 展示大运走势，横轴为年龄/年份，纵轴为吉凶评分
// 每步大运显示天干地支，颜色编码吉凶
// 可点击查看详情
// ============================================================

import { useState, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import type { DaYun } from '../../engine/index.ts';
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

// ---- 大运评分模拟函数 ----
// 根据大运天干地支与日主的生克关系计算吉凶评分
function calcDaYunScore(daYun: DaYun, dayMasterElement: number): number {
  // 简化评分逻辑：基于大运天干地支五行与日主的生克关系
  const stemElement = daYun.pillar.stemElement;
  const branchElement = daYun.pillar.branchElement;

  // 生我者 +2，同我者 +1，我生者 -1，克我者 -2，我克者 0
  const shengMap: Record<number, number> = { 0: 4, 1: 0, 2: 1, 3: 2, 4: 3 };
  const keMap: Record<number, number> = { 0: 2, 1: 3, 2: 4, 3: 0, 4: 1 };

  const stemRelation = shengMap[stemElement] === dayMasterElement ? 2
    : stemElement === dayMasterElement ? 1
    : shengMap[dayMasterElement] === stemElement ? -1
    : keMap[stemElement] === dayMasterElement ? -2
    : 0;

  const branchRelation = shengMap[branchElement] === dayMasterElement ? 2
    : branchElement === dayMasterElement ? 1
    : shengMap[dayMasterElement] === branchElement ? -1
    : keMap[branchElement] === dayMasterElement ? -2
    : 0;

  // 归一化到 0-100 分
  const raw = stemRelation + branchRelation;
  return Math.round(((raw + 4) / 8) * 100);
}

function getTrend(score: number): 'good' | 'neutral' | 'bad' {
  if (score >= 65) return 'good';
  if (score >= 40) return 'neutral';
  return 'bad';
}

interface DaYunTimelineProps {
  daYunList: DaYun[];
  dayMasterElement: number;
  className?: string;
  /** 点击大运项的回调 */
  onDaYunClick?: (daYun: DaYun, index: number) => void;
}

export default function DaYunTimeline({
  daYunList,
  dayMasterElement,
  className = '',
  onDaYunClick,
}: DaYunTimelineProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // 构造图表数据
  const chartData = daYunList.map((daYun, idx) => {
    const score = calcDaYunScore(daYun, dayMasterElement);
    const trend = getTrend(score);
    return {
      index: idx,
      startAge: daYun.startAge,
      startYear: daYun.startYear,
      endAge: idx < daYunList.length - 1 ? daYunList[idx + 1].startAge : daYun.startAge + 10,
      stemName: HEAVENLY_STEMS[daYun.stem],
      branchName: EARTHLY_BRANCHES[daYun.branch],
      pillarName: `${HEAVENLY_STEMS[daYun.stem]}${EARTHLY_BRANCHES[daYun.branch]}`,
      score,
      trend,
      color: TREND_COLORS[trend],
    };
  });

  const handleClick = useCallback((idx: number) => {
    setSelectedIdx(prev => prev === idx ? null : idx);
    if (onDaYunClick && daYunList[idx]) {
      onDaYunClick(daYunList[idx], idx);
    }
  }, [onDaYunClick, daYunList]);

  // 自定义 Tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chartData[0] }> }) => {
    if (!active || !payload || payload.length === 0) return null;
    const item = payload[0].payload;
    return (
      <div className="rounded-lg border border-amber-900/50 bg-zinc-900/95 px-3 py-2 text-sm shadow-xl backdrop-blur-sm">
        <p className="font-bold text-amber-200">
          {item.pillarName}运
        </p>
        <p className="text-zinc-400">
          {item.startYear}年 ~ {Math.round(item.endAge)}岁
        </p>
        <p className="text-zinc-300">
          起运年龄: {item.startAge}岁
        </p>
        <p className="mt-1 font-bold" style={{ color: item.color }}>
          {TREND_LABELS[item.trend]} ({item.score}分)
        </p>
      </div>
    );
  };

  if (daYunList.length === 0) {
    return (
      <div className={`rounded-xl border border-amber-900/30 bg-zinc-900/60 p-6 text-center backdrop-blur-sm ${className}`}>
        <p className="text-zinc-500">暂无大运数据</p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-amber-900/30 bg-zinc-900/60 p-4 backdrop-blur-sm ${className}`}>
      <h3 className="mb-3 text-center text-sm font-medium text-amber-200/80">
        大运走势图
      </h3>

      {/* 折线图 */}
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(217, 119, 6, 0.1)"
          />
          <XAxis
            dataKey="startYear"
            tick={{ fill: '#a8a29e', fontSize: 11 }}
            tickFormatter={(v: number) => `${v}`}
            label={{ value: '起运年份', position: 'insideBottom', offset: -5, fill: '#78716c', fontSize: 11 }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#a8a29e', fontSize: 11 }}
            ticks={[0, 25, 50, 75, 100]}
            label={{ value: '评分', angle: -90, position: 'insideLeft', fill: '#78716c', fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* 吉凶分界线 */}
          <ReferenceLine y={65} stroke="#4ade80" strokeDasharray="6 3" strokeOpacity={0.4} />
          <ReferenceLine y={40} stroke="#f87171" strokeDasharray="6 3" strokeOpacity={0.4} />
          <Line
            type="monotone"
            dataKey="score"
            strokeWidth={2.5}
            dot={(props: Record<string, unknown>) => {
              const { cx, cy, index, payload } = props as { cx: number; cy: number; index: number; payload: { color: string } };
              const isSelected = selectedIdx === index;
              return (
                <circle
                  key={`dot-${index}`}
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 7 : 5}
                  fill={payload.color}
                  stroke={isSelected ? '#fff' : '#1c1917'}
                  strokeWidth={isSelected ? 2.5 : 2}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleClick(index)}
                />
              );
            }}
            activeDot={false}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                stroke={entry.color}
                fill={entry.color}
              />
            ))}
          </Line>
        </LineChart>
      </ResponsiveContainer>

      {/* 大运时间轴标签 */}
      <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
        {chartData.map((item, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <button
              key={idx}
              onClick={() => handleClick(idx)}
              className={`flex-shrink-0 rounded-lg border px-2 py-1.5 text-center transition-all ${
                isSelected
                  ? 'border-amber-600/60 bg-amber-900/30 shadow-md'
                  : 'border-zinc-700/50 bg-zinc-800/40 hover:border-zinc-600/50 hover:bg-zinc-800/60'
              }`}
            >
              <span className="block text-xs font-bold text-zinc-200">
                {item.pillarName}
              </span>
              <span className="block text-[10px] text-zinc-500">
                {item.startYear}年
              </span>
              <span
                className="mt-0.5 block rounded px-1.5 py-0.5 text-[10px] font-bold"
                style={{
                  color: item.color,
                  backgroundColor: `${item.color}15`,
                }}
              >
                {TREND_LABELS[item.trend]}
              </span>
            </button>
          );
        })}
      </div>

      {/* 选中详情 */}
      {selectedIdx !== null && chartData[selectedIdx] && (
        <div className="mt-3 rounded-lg border border-amber-900/40 bg-zinc-800/60 p-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-amber-200">
                {chartData[selectedIdx].pillarName}运
              </span>
              <span className="ml-2 text-sm text-zinc-400">
                第{selectedIdx + 1}步大运
              </span>
            </div>
            <span
              className="rounded-full px-3 py-1 text-sm font-bold"
              style={{
                color: chartData[selectedIdx].color,
                backgroundColor: `${chartData[selectedIdx].color}20`,
              }}
            >
              {TREND_LABELS[chartData[selectedIdx].trend]} - {chartData[selectedIdx].score}分
            </span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-sm text-zinc-400">
            <div>
              <span className="text-zinc-600">起运年份</span>
              <p className="text-zinc-200">{chartData[selectedIdx].startYear}年</p>
            </div>
            <div>
              <span className="text-zinc-600">起运年龄</span>
              <p className="text-zinc-200">{chartData[selectedIdx].startAge}岁</p>
            </div>
            <div>
              <span className="text-zinc-600">天干地支</span>
              <p className="text-zinc-200">
                {chartData[selectedIdx].stemName} {chartData[selectedIdx].branchName}
              </p>
            </div>
          </div>
        </div>
      )}

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

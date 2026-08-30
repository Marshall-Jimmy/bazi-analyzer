// ============================================================
// 合盘雷达图 - RadarChart
// ============================================================
// 对比两人各维度的匹配度
// 维度：天干和谐、地支和谐、用神互补、大运同步、五行平衡
// 两人用不同颜色区分
// ============================================================

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { SynastryResult } from '../../engine/index.ts';

// ---- 两人配色 ----
const PERSON_COLORS = {
  person1: {
    stroke: '#f59e0b',   // 琥珀色（甲方）
    fill: 'rgba(245, 158, 11, 0.2)',
    name: '甲方',
  },
  person2: {
    stroke: '#8b5cf6',   // 紫色（乙方）
    fill: 'rgba(139, 92, 246, 0.2)',
    name: '乙方',
  },
} as const;

// ---- 维度定义 ----
interface Dimension {
  key: string;
  label: string;
  /** 从 SynastryResult 中提取甲方分数 */
  getScore1: (result: SynastryResult) => number;
  /** 从 SynastryResult 中提取乙方分数 */
  getScore2: (result: SynastryResult) => number;
}

const DIMENSIONS: Dimension[] = [
  {
    key: 'stemHarmony',
    label: '天干和谐',
    getScore1: (r) => {
      // 天干关系平均分
      if (r.stemRelations.length === 0) return 50;
      const avg = r.stemRelations.reduce((sum, item) => sum + item.score, 0) / r.stemRelations.length;
      return Math.round(avg);
    },
    getScore2: (r) => {
      // 乙方视角（同样的天干关系，对称）
      if (r.stemRelations.length === 0) return 50;
      const avg = r.stemRelations.reduce((sum, item) => sum + item.score, 0) / r.stemRelations.length;
      return Math.round(avg);
    },
  },
  {
    key: 'branchHarmony',
    label: '地支和谐',
    getScore1: (r) => {
      if (r.branchRelations.length === 0) return 50;
      const avg = r.branchRelations.reduce((sum, item) => sum + item.score, 0) / r.branchRelations.length;
      return Math.round(avg);
    },
    getScore2: (r) => {
      if (r.branchRelations.length === 0) return 50;
      const avg = r.branchRelations.reduce((sum, item) => sum + item.score, 0) / r.branchRelations.length;
      return Math.round(avg);
    },
  },
  {
    key: 'yongShenComplement',
    label: '用神互补',
    getScore1: (r) => Math.round(r.yongShenComplement.complementScore * 100),
    getScore2: (r) => Math.round(r.yongShenComplement.complementScore * 100),
  },
  {
    key: 'daYunSync',
    label: '大运同步',
    getScore1: (r) => Math.round(r.daYunSync.syncScore * 100),
    getScore2: (r) => Math.round(r.daYunSync.syncScore * 100),
  },
  {
    key: 'fiveElementBalance',
    label: '五行平衡',
    getScore1: (r) => {
      // 基于日柱对比的兼容性
      return Math.round(r.dayPillarCompare.compatibility * 100);
    },
    getScore2: (r) => {
      return Math.round(r.dayPillarCompare.compatibility * 100);
    },
  },
];

interface SynastryRadarProps {
  data: SynastryResult;
  person1Name?: string;
  person2Name?: string;
  className?: string;
}

export default function SynastryRadar({
  data,
  person1Name = '甲方',
  person2Name = '乙方',
  className = '',
}: SynastryRadarProps) {
  // 构造雷达图数据
  const chartData = DIMENSIONS.map(dim => ({
    dimension: dim.label,
    [PERSON_COLORS.person1.name]: dim.getScore1(data),
    [PERSON_COLORS.person2.name]: dim.getScore2(data),
  }));

  // 自定义 Tooltip
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (!active || !payload || payload.length === 0) return null;
    return (
      <div className="rounded-lg border border-amber-900/50 bg-zinc-900/95 px-3 py-2 text-sm shadow-xl backdrop-blur-sm">
        <p className="mb-1 font-bold text-amber-200">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="text-zinc-300">
            <span className="inline-block h-2 w-2 rounded-full mr-1" style={{ backgroundColor: entry.color }} />
            {entry.name}: <span className="font-bold">{entry.value}</span>分
          </p>
        ))}
      </div>
    );
  };

  // 自定义图例
  const renderLegend = () => (
    <div className="flex items-center justify-center gap-6 pt-1">
      <span className="flex items-center gap-1.5 text-xs text-zinc-400">
        <span
          className="inline-block h-3 w-3 rounded-full border-2"
          style={{
            backgroundColor: PERSON_COLORS.person1.fill,
            borderColor: PERSON_COLORS.person1.stroke,
          }}
        />
        {person1Name}
      </span>
      <span className="flex items-center gap-1.5 text-xs text-zinc-400">
        <span
          className="inline-block h-3 w-3 rounded-full border-2"
          style={{
            backgroundColor: PERSON_COLORS.person2.fill,
            borderColor: PERSON_COLORS.person2.stroke,
          }}
        />
        {person2Name}
      </span>
    </div>
  );

  return (
    <div className={`rounded-xl border border-amber-900/30 bg-zinc-900/60 p-4 backdrop-blur-sm ${className}`}>
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-medium text-amber-200/80">
          合盘匹配度分析
        </h3>
        <span className="rounded-full bg-amber-900/30 px-3 py-0.5 text-sm font-bold text-amber-200">
          综合 {data.overallScore}分
        </span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="65%">
          <PolarGrid
            stroke="rgba(217, 119, 6, 0.15)"
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{
              fill: '#d4a574',
              fontSize: 12,
              fontWeight: 600,
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name={person1Name}
            dataKey={PERSON_COLORS.person1.name}
            stroke={PERSON_COLORS.person1.stroke}
            fill={PERSON_COLORS.person1.fill}
            strokeWidth={2}
          />
          <Radar
            name={person2Name}
            dataKey={PERSON_COLORS.person2.name}
            stroke={PERSON_COLORS.person2.stroke}
            fill={PERSON_COLORS.person2.fill}
            strokeWidth={2}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </RadarChart>
      </ResponsiveContainer>

      {/* 各维度分数详情 */}
      <div className="mt-2 grid grid-cols-5 gap-2">
        {DIMENSIONS.map(dim => {
          const score1 = dim.getScore1(data);
          const score2 = dim.getScore2(data);
          const avgScore = Math.round((score1 + score2) / 2);
          const color =
            avgScore >= 70 ? '#4ade80'
            : avgScore >= 45 ? '#facc15'
            : '#f87171';

          return (
            <div
              key={dim.key}
              className="flex flex-col items-center rounded-lg bg-zinc-800/50 px-1 py-2"
            >
              <span className="text-[10px] font-medium text-zinc-500">
                {dim.label}
              </span>
              <span
                className="mt-0.5 text-lg font-bold"
                style={{ color }}
              >
                {avgScore}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

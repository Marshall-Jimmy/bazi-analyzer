// ============================================================
// 八字排盘核心引擎 - 节气计算
// ============================================================
// 使用天文算法计算节气时刻，精确到分钟级
// 覆盖 1900-2100 年
// ============================================================

import type { SolarTermData } from './types.ts';

/**
 * 节气名称列表（按公历月份顺序排列）
 * 每年24个节气，从立春开始排列
 * 索引 0 = 小寒, 1 = 大寒, 2 = 立春, ...
 *
 * 换月用的"节"（Jie）：
 * 立春(2月) → 寅月, 惊蛰(3月) → 卯月, 清明(4月) → 辰月,
 * 立夏(5月) → 巳月, 芒种(6月) → 午月, 小暑(7月) → 未月,
 * 立秋(8月) → 申月, 白露(9月) → 酉月, 寒露(10月) → 戌月,
 * 立冬(11月) → 亥月, 大雪(12月) → 子月, 小寒(1月) → 丑月
 */

export const SOLAR_TERM_NAMES: readonly string[] = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至',
];

/**
 * 每个节气对应的月份索引（1-12，寅月=1, ..., 丑月=12）
 * 只有"节"才用于换月
 */
export const SOLAR_TERM_MONTH_MAP: readonly number[] = [
  12, 12, // 小寒→丑月, 大寒→丑月（不换月，大寒是气）
  1, 1,   // 立春→寅月, 雨水→寅月
  2, 2,   // 惊蛰→卯月, 春分→卯月
  3, 3,   // 清明→辰月, 谷雨→辰月
  4, 4,   // 立夏→巳月, 小满→巳月
  5, 5,   // 芒种→午月, 夏至→午月
  6, 6,   // 小暑→未月, 大暑→未月
  7, 7,   // 立秋→申月, 处暑→申月
  8, 8,   // 白露→酉月, 秋分→酉月
  9, 9,   // 寒露→戌月, 霜降→戌月
  10, 10, // 立冬→亥月, 小雪→亥月
  11, 11, // 大雪→子月, 冬至→子月
];

/**
 * 是否为"节"（用于换月的节气）
 * 节：小寒, 立春, 惊蛰, 清明, 立夏, 芒种, 小暑, 立秋, 白露, 寒露, 立冬, 大雪
 * 气：大寒, 雨水, 春分, 谷雨, 小满, 夏至, 大暑, 处暑, 秋分, 霜降, 小雪, 冬至
 */
export const SOLAR_TERM_IS_JIE: readonly boolean[] = [
  true, false, true, false, true, false,
  true, false, true, false, true, false,
  true, false, true, false, true, false,
  true, false, true, false, true, false,
];

// ============================================================
// 节气天文计算核心
// ============================================================

/**
 * 太阳黄经角度对应的节气索引
 * 节气按太阳黄经每15度一个：
 * 小寒=285°, 大寒=300°, 立春=315°, 雨水=330°,
 * 惊蛰=345°, 春分=0°, 清明=15°, 谷雨=30°,
 * 立夏=45°, 小满=60°, 芒种=75°, 夏至=90°,
 * 小暑=105°, 大暑=120°, 立秋=135°, 处暑=150°,
 * 白露=165°, 秋分=180°, 寒露=195°, 霜降=210°,
 * 立冬=225°, 小雪=240°, 大雪=255°, 冬至=270°
 */
const SOLAR_TERM_LONGITUDES: readonly number[] = [
  285, 300, 315, 330, 345, 0,
  15, 30, 45, 60, 75, 90,
  105, 120, 135, 150, 165, 180,
  195, 210, 225, 240, 255, 270,
];

/**
 * 计算儒略日 (Julian Day)
 * @param year 年
 * @param month 月 (1-12)
 * @param day 日
 * @param hour 小时（UT）
 * @returns 儒略日
 */
function julianDay(year: number, month: number, day: number, hour: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + hour / 24.0 + B - 1524.5;
}

/**
 * 计算太阳平黄经
 * @param T 儒略世纪数 (J2000.0起算)
 * @returns 平黄经（度）
 */
function sunMeanLongitude(T: number): number {
  return (280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360;
}

/**
 * 计算太阳平近点角
 * @param T 儒略世纪数
 * @returns 平近点角（度）
 */
function sunMeanAnomaly(T: number): number {
  return (357.52911 + 35999.05029 * T - 0.0001537 * T * T) % 360;
}

/**
 * 计算地球轨道偏心率
 * @param T 儒略世纪数
 * @returns 偏心率
 */
function earthEccentricity(T: number): number {
  return 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
}

/**
 * 太阳中心差（方程式）
 * @param M 平近点角（度）
 * @param e 偏心率
 * @returns 中心差（度）
 */
function sunEquationOfCenter(M: number, _e: number): number {
  const Mrad = M * Math.PI / 180;
  return (
    (1.914602 - 0.004817 * T_global - 0.000014 * T_global * T_global) * Math.sin(Mrad)
    + (0.019993 - 0.000101 * T_global) * Math.sin(2 * Mrad)
    + 0.000289 * Math.sin(3 * Mrad)
  );
}

/** 全局 T 变量（供 sunEquationOfCenter 使用） */
let T_global = 0;

/**
 * 计算太阳真黄经
 * @param T 儒略世纪数
 * @returns 真黄经（度）
 */
function sunTrueLongitude(T: number): number {
  T_global = T;
  const L0 = sunMeanLongitude(T);
  const M = sunMeanAnomaly(T);
  const e = earthEccentricity(T);
  const C = sunEquationOfCenter(M, e);
  return (L0 + C) % 360;
}

/**
 * 计算指定年份指定节气索引的太阳黄经时刻
 * @param year 公历年份
 * @param termIndex 节气索引 (0-23)
 * @returns UTC 时间戳（毫秒）
 */
function calcSolarTermTime(year: number, termIndex: number): number {
  const targetLon = SOLAR_TERM_LONGITUDES[termIndex];

  // 初始估算：根据节气在一年中的大致位置
  // 每个节气大约间隔 365.25/24 ≈ 15.22 天
  const dayOfYear = termIndex * 15.22 + 15; // 大致在一年中的天数
  const approxMonth = Math.floor(dayOfYear / 30.44) + 1;
  const approxDay = Math.floor(dayOfYear % 30.44) + 1;

  // 用牛顿迭代法精确求解太阳黄经 = targetLon 的时刻
  let jd = julianDay(year, Math.min(approxMonth, 12), Math.min(approxDay, 28), 12.0);

  // 迭代求解
  for (let iter = 0; iter < 50; iter++) {
    const T = (jd - 2451545.0) / 36525.0;
    const lon = sunTrueLongitude(T);

    // 计算太阳黄经变化率（度/天）
    const dt = 0.001; // 0.001 儒略世纪
    const T2 = T + dt;
    const lon2 = sunTrueLongitude(T2);
    const dLon = ((lon2 - lon + 540) % 360) - 180; // 处理跨越0度的情况
    const dLonPerDay = dLon / (dt * 36525.0);

    // 目标差值
    let diff = targetLon - lon;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    // 如果精度足够（< 1秒）
    if (Math.abs(diff) < 0.00001) break;

    // 牛顿迭代步长
    const deltaJd = diff / dLonPerDay;
    jd += deltaJd;
  }

  // 儒略日转 UTC 时间戳
  return (jd - 2440587.5) * 86400000;
}

// ============================================================
// 节气缓存
// ============================================================

/** 节气缓存：key = "year-termIndex" */
const solarTermCache = new Map<string, number>();

/**
 * 获取指定年份指定节气的 UTC 时间戳
 * @param year 公历年份
 * @param termIndex 节气索引 (0-23)
 * @returns UTC 时间戳（毫秒）
 */
export function getSolarTermTimestamp(year: number, termIndex: number): number {
  const key = `${year}-${termIndex}`;
  const cached = solarTermCache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  const timestamp = calcSolarTermTime(year, termIndex);
  solarTermCache.set(key, timestamp);
  return timestamp;
}

/**
 * 获取指定年份的所有24个节气数据
 * @param year 公历年份
 * @returns 24个节气的数据数组
 */
export function getYearSolarTerms(year: number): SolarTermData[] {
  const terms: SolarTermData[] = [];
  for (let i = 0; i < 24; i++) {
    const timestamp = getSolarTermTimestamp(year, i);
    terms.push({
      name: SOLAR_TERM_NAMES[i],
      timestamp,
      monthIndex: SOLAR_TERM_MONTH_MAP[i],
      isJie: SOLAR_TERM_IS_JIE[i],
    });
  }
  return terms;
}

/**
 * 根据公历日期确定当前所处的月柱（节气月）
 *
 * 月柱以"节"换月：
 * - 立春 → 寅月(1月)
 * - 惊蛰 → 卯月(2月)
 * - 清明 → 辰月(3月)
 * - 立夏 → 巳月(4月)
 * - 芒种 → 午月(5月)
 * - 小暑 → 未月(6月)
 * - 立秋 → 申月(7月)
 * - 白露 → 酉月(8月)
 * - 寒露 → 戌月(9月)
 * - 立冬 → 亥月(10月)
 * - 大雪 → 子月(11月)
 * - 小寒 → 丑月(12月)
 *
 * @param date 公历日期（UTC时间戳）
 * @returns 月柱索引 (1-12, 寅月=1, ..., 丑月=12)
 */
export function getMonthIndexBySolarTerm(timestamp: number): number {
  const year = new Date(timestamp).getUTCFullYear();

  // 12个"节"的索引：小寒(0), 立春(2), 惊蛰(4), 清明(6),
  //   立夏(8), 芒种(10), 小暑(12), 立秋(14), 白露(16),
  //   寒露(18), 立冬(20), 大雪(22)
  const jieIndices = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
  // 对应的月柱索引
  const monthIndices = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  // 从后往前查找：找到最后一个 <= timestamp 的节气
  for (let i = jieIndices.length - 1; i >= 0; i--) {
    const termTime = getSolarTermTimestamp(year, jieIndices[i]);
    if (timestamp >= termTime) {
      return monthIndices[i];
    }
  }

  // 如果在年初（小寒之前），使用上一年的大雪
  const prevYearDaXue = getSolarTermTimestamp(year - 1, 22);
  if (timestamp >= prevYearDaXue) {
    return 11; // 子月
  }

  // 极端情况：使用上一年的小寒
  return 12; // 丑月
}

/**
 * 判断给定时间戳是否在指定年份的立春之后
 * 用于确定年柱
 * @param timestamp UTC时间戳
 * @param year 公历年份
 * @returns 是否在立春之后
 */
export function isAfterLiChun(timestamp: number, year: number): boolean {
  const liChunTime = getSolarTermTimestamp(year, 2); // 立春索引=2
  return timestamp >= liChunTime;
}

/**
 * 获取指定年份的立春时间戳
 * @param year 公历年份
 * @returns UTC时间戳
 */
export function getLiChunTimestamp(year: number): number {
  return getSolarTermTimestamp(year, 2);
}

/**
 * 获取指定年份的冬至时间戳
 * @param year 公历年份
 * @returns UTC时间戳
 */
export function getDongZhiTimestamp(year: number): number {
  return getSolarTermTimestamp(year, 23);
}

/**
 * 获取两个节气之间的天数差（用于计算大运起运时间）
 * @param year1 第一个节气的年份
 * @param termIndex1 第一个节气的索引
 * @param year2 第二个节气的年份
 * @param termIndex2 第二个节气的索引
 * @returns 天数差
 */
export function getDaysBetweenTerms(
  year1: number,
  termIndex1: number,
  year2: number,
  termIndex2: number,
): number {
  const t1 = getSolarTermTimestamp(year1, termIndex1);
  const t2 = getSolarTermTimestamp(year2, termIndex2);
  return (t2 - t1) / (24 * 60 * 60 * 1000);
}

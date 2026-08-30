// ============================================================
// 八字排盘核心引擎 - 衍生计算
// ============================================================
// 包含：十神、藏干、纳音、空亡、胎元、命宫、身宫
// ============================================================

import type {
  EarthlyBranch,
  FiveElementCount,
  FourPillars,
  HeavenlyStem,
  KongWangInfo,
  MingGongInfo,
  NaYinInfo,
  Pillar,
  ShenGongInfo,
  TaiYuanInfo,
  TenGod,
  TenGodMap,
} from './types.ts';
import {
  EARTHLY_BRANCHES,
  getKongWangBranches,
  getSexagenaryIndex,
  HEAVENLY_STEMS,
  STEM_ELEMENT,
  STEM_YIN_YANG,
  TEN_GOD_TABLE,
} from './constants.ts';

// ============================================================
// 十神计算
// ============================================================

/**
 * 计算两个天干之间的十神关系
 * @param dayStem 日干索引
 * @param targetStem 目标天干索引
 * @returns 十神
 */
export function getTenGod(dayStem: number, targetStem: number): TenGod {
  const dayElement = STEM_ELEMENT[dayStem];
  const targetElement = STEM_ELEMENT[targetStem];
  const dayYY = STEM_YIN_YANG[dayStem];
  const targetYY = STEM_YIN_YANG[targetStem];

  // 判断阴阳是否相同
  const sameYinYang = dayYY === targetYY ? 0 : 1;

  // 五行关系
  // 同我(0), 我生(1), 我克(2), 克我(3), 生我(4)
  let relation: number;

  if (dayElement === targetElement) {
    relation = 0; // 同我
  } else {
    // 木0→火1→土2→金3→水4→木0 (相生)
    // 木0→土2→水4→火1→金3→木0 (相克)
    const generate = [1, 2, 3, 4, 0]; // 我生
    const overcome = [2, 3, 4, 0, 1]; // 我克

    if (generate[dayElement] === targetElement) {
      relation = 1; // 我生
    } else if (overcome[dayElement] === targetElement) {
      relation = 2; // 我克
    } else if (generate[targetElement] === dayElement) {
      relation = 4; // 生我
    } else {
      relation = 3; // 克我
    }
  }

  return TEN_GOD_TABLE[dayElement][sameYinYang][relation] as TenGod;
}

/**
 * 计算四柱的十神映射
 * @param fourPillars 四柱
 * @returns 十神映射
 */
export function calcTenGodMap(fourPillars: FourPillars): TenGodMap {
  const dayStem = fourPillars.day.stem;

  // 四柱天干的十神
  const stems = {
    year: getTenGod(dayStem, fourPillars.year.stem),
    month: getTenGod(dayStem, fourPillars.month.stem),
    day: getTenGod(dayStem, fourPillars.day.stem), // 日干自身 → 比肩
    hour: getTenGod(dayStem, fourPillars.hour.stem),
  };

  // 四柱地支藏干的十神
  const branchHiddenStems = {
    year: fourPillars.year.hiddenStems.map((hs) => ({
      stem: hs.stem as HeavenlyStem,
      tenGod: getTenGod(dayStem, hs.stem),
      weight: hs.weight,
    })),
    month: fourPillars.month.hiddenStems.map((hs) => ({
      stem: hs.stem as HeavenlyStem,
      tenGod: getTenGod(dayStem, hs.stem),
      weight: hs.weight,
    })),
    day: fourPillars.day.hiddenStems.map((hs) => ({
      stem: hs.stem as HeavenlyStem,
      tenGod: getTenGod(dayStem, hs.stem),
      weight: hs.weight,
    })),
    hour: fourPillars.hour.hiddenStems.map((hs) => ({
      stem: hs.stem as HeavenlyStem,
      tenGod: getTenGod(dayStem, hs.stem),
      weight: hs.weight,
    })),
  };

  return { stems, branchHiddenStems };
}

// ============================================================
// 空亡计算
// ============================================================

/**
 * 计算空亡
 * 以年柱和日柱的地支分别查空亡
 * @param yearPillar 年柱
 * @param dayPillar 日柱
 * @returns 空亡信息
 */
export function calcKongWang(yearPillar: Pillar, dayPillar: Pillar): KongWangInfo {
  // 年柱空亡
  const yearIndex = getSexagenaryIndex(yearPillar.stem, yearPillar.branch);
  const yearKongWang = getKongWangBranches(yearIndex);

  // 日柱空亡
  const dayIndex = getSexagenaryIndex(dayPillar.stem, dayPillar.branch);
  const dayKongWang = getKongWangBranches(dayIndex);

  // 合并空亡地支（去重）
  const allKongWang = new Set<number>();
  allKongWang.add(yearKongWang[0]);
  allKongWang.add(yearKongWang[1]);
  allKongWang.add(dayKongWang[0]);
  allKongWang.add(dayKongWang[1]);

  return {
    branches: Array.from(allKongWang).sort() as EarthlyBranch[],
    fromYear: true,
    fromDay: true,
  };
}

// ============================================================
// 胎元计算
// ============================================================

/**
 * 计算胎元
 * 胎元算法：月干进一位，日支进三位
 * 即：胎元天干 = 月干 + 1，胎元地支 = 日支 + 3
 * @param monthPillar 月柱
 * @param dayPillar 日柱
 * @returns 胎元信息
 */
export function calcTaiYuan(monthPillar: Pillar, dayPillar: Pillar): TaiYuanInfo {
  const stem = (monthPillar.stem + 1) % 10;
  const branch = (dayPillar.branch + 3) % 12;
  return {
    stem: stem as HeavenlyStem,
    branch: branch as EarthlyBranch,
    stemName: HEAVENLY_STEMS[stem],
    branchName: EARTHLY_BRANCHES[branch],
  };
}

// ============================================================
// 命宫计算
// ============================================================

/**
 * 计算命宫
 * 命宫算法：以月支为起点，从寅位开始逆数到生时地支的位置，
 * 再从月支顺数相同步数，得到命宫地支。
 * 命宫天干通过五虎遁月法推算。
 *
 * 简化算法：
 * 命宫地支 = (14 - 月支 - 时支) % 12
 * 命宫天干通过年干推算
 *
 * @param monthPillar 月柱
 * @param hourBranch 时支索引 (0-11)
 * @returns 命宫信息
 */
export function calcMingGong(monthPillar: Pillar, hourBranch: number): MingGongInfo {
  // 月支位置编号，寅=2, 卯=3, ..., 丑=1
  const mbp = (monthPillar.branch === 0) ? 1 : monthPillar.branch + 1;

  // 时支位置编号，子=1, 丑=2, ..., 亥=12
  const hbp = (hourBranch === 0) ? 1 : hourBranch + 1;

  // 命宫位置 = 14 - 月支位置 - 时支位置 (mod 12)
  let gongPos = (14 - mbp - hbp) % 12;
  if (gongPos <= 0) gongPos += 12;

  // 命宫地支 = 位置编号 - 1 (因为子=1对应索引0)
  const branch = gongPos - 1;

  // 命宫天干：用月柱天干推算（命宫视为一个特殊的月柱）
  // 使用五虎遁月法，但命宫地支对应的月序号
  // 命宫地支序号（寅=1开始）：gongPos
  // 需要知道年干来推命宫天干
  // 简化：命宫天干 = (月干 + (命宫地支 - 月支 + 12) % 12) % 10
  const stem = (monthPillar.stem + ((branch - monthPillar.branch + 12) % 12)) % 10;

  return {
    stem: stem as HeavenlyStem,
    branch: branch as EarthlyBranch,
    stemName: HEAVENLY_STEMS[stem],
    branchName: EARTHLY_BRANCHES[branch],
  };
}

// ============================================================
// 身宫计算
// ============================================================

/**
 * 计算身宫
 * 身宫算法：以月支为起点，从寅位开始顺数到生时地支的位置，
 * 再从月支顺数相同步数，得到身宫地支。
 *
 * 简化算法：
 * 身宫地支 = (月支 + 时支 + 2) % 12
 *
 * @param monthPillar 月柱
 * @param hourBranch 时支索引 (0-11)
 * @returns 身宫信息
 */
export function calcShenGong(monthPillar: Pillar, hourBranch: number): ShenGongInfo {
  // 身宫地支 = (月支 + 时支 + 2) % 12
  const branch = (monthPillar.branch + hourBranch + 2) % 12;

  // 身宫天干：同命宫算法
  const stem = (monthPillar.stem + ((branch - monthPillar.branch + 12) % 12)) % 10;

  return {
    stem: stem as HeavenlyStem,
    branch: branch as EarthlyBranch,
    stemName: HEAVENLY_STEMS[stem],
    branchName: EARTHLY_BRANCHES[branch],
  };
}

// ============================================================
// 五行统计
// ============================================================

/**
 * 统计四柱的五行数量
 * 统计规则：
 * - 每柱天干算1个五行
 * - 每柱地支本气算1个五行
 * - 藏干的中气算0.5个，余气算0.3个（四舍五入）
 *
 * @param fourPillars 四柱
 * @returns 五行统计
 */
export function calcFiveElementCount(fourPillars: FourPillars): FiveElementCount {
  const counts = [0, 0, 0, 0, 0]; // 木火土金水

  const pillars = [
    fourPillars.year,
    fourPillars.month,
    fourPillars.day,
    fourPillars.hour,
  ];

  for (const pillar of pillars) {
    // 天干五行
    counts[pillar.stemElement] += 1;

    // 地支本气五行
    counts[pillar.branchElement] += 1;

    // 藏干五行（加权）
    for (const hidden of pillar.hiddenStems) {
      if (hidden.weight === 3) continue; // 本气已算
      counts[hidden.element] += hidden.weight === 2 ? 0.5 : 0.3;
    }
  }

  // 四舍五入
  const wood = Math.round(counts[0]);
  const fire = Math.round(counts[1]);
  const earth = Math.round(counts[2]);
  const metal = Math.round(counts[3]);
  const water = Math.round(counts[4]);

  return {
    wood,
    fire,
    earth,
    metal,
    water,
    total: wood + fire + earth + metal + water,
  };
}

// ============================================================
// 纳音计算（已在 constants.ts 中，此处提供便捷函数）
// ============================================================

/**
 * 获取四柱纳音总览
 * @param fourPillars 四柱
 * @returns 四柱纳音信息
 */
export function calcNaYinOverview(fourPillars: FourPillars): {
  year: NaYinInfo;
  month: NaYinInfo;
  day: NaYinInfo;
  hour: NaYinInfo;
} {
  return {
    year: fourPillars.year.naYin,
    month: fourPillars.month.naYin,
    day: fourPillars.day.naYin,
    hour: fourPillars.hour.naYin,
  };
}

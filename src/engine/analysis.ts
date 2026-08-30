// ============================================================
// 八字排盘 - 多维分析引擎
// ============================================================
// 包含：日主强弱、五行平衡、用神喜忌、性格特质、
//       事业取向、财富格局、婚姻感情、子女缘、
//       原生家庭、健康倾向、大运走势、流年提示、
//       趋避建议、全部分析汇总
// ============================================================

import type {
  AnalysisInput,
  BaziResult,
  DaYun,
  FiveElement,
  FiveElementCount,
  TenGodMap,
} from './types.ts';
import type { ShenShaResult } from './shensha.ts';
import type { PatternResult } from './pattern.ts';
import { calculateShenSha } from './shensha.ts';
import { determinePattern } from './pattern.ts';
import {
  BRANCH_ELEMENT,
  EARTHLY_BRANCHES,
  FIVE_ELEMENT_NAMES,
  HEAVENLY_STEMS,
  STEM_ELEMENT,
} from './constants.ts';
import {
  FIVE_ELEMENT_SHENG,
  FIVE_ELEMENT_KE,
  FIVE_ELEMENT_BEING_SHENG,
  FIVE_ELEMENT_BEING_KE,
  FIVE_ELEMENT_DIRECTIONS,
  FIVE_ELEMENT_COLORS,
  FIVE_ELEMENT_INDUSTRIES,
  FIVE_ELEMENT_ORGANS,
  FIVE_ELEMENT_IMBALANCE_HEALTH,
  DAY_MASTER_PERSONALITY,
  TEN_GOD_PERSONALITY_EFFECT,
  CAREER_BY_DAY_MASTER,
  CAREER_BY_TEN_GOD,
  MARRIAGE_RULES,
  CHILDREN_RULES,
  TIAO_HOU_TABLE,
  YONG_SHEN_RULES,
  DAY_MASTER_STRENGTH_RULES,
  EARTHLY_BRANCH_CLASH,
  EARTHLY_BRANCH_COMBINE,
  EARTHLY_BRANCH_TRINE,
  EARTHLY_BRANCH_PUNISHMENT,
  EARTHLY_BRANCH_HARM,
  EARTHLY_BRANCH_BREAK,
  BRANCH_NAMES,
} from '../data/knowledgeBase.ts';

// ============================================================
// 分析结果类型定义
// ============================================================

export interface DayMasterStrengthResult {
  strength: 'strong' | 'weak' | 'balanced';
  score: number;
  details: {
    deLing: boolean;
    deDi: boolean;
    deShi: boolean;
    factors: string[];
  };
}

export interface FiveElementBalanceResult {
  counts: FiveElementCount;
  missing: FiveElement[];
  excessive: FiveElement[];
  analysis: string;
}

export interface YongShenResult {
  yongShen: FiveElement;
  xiShen: FiveElement[];
  jiShen: FiveElement[];
  analysis: string;
}

export interface PersonalityResult {
  traits: string[];
  analysis: string;
}

export interface CareerResult {
  directions: string[];
  suitable: string[];
  avoid: string[];
  analysis: string;
}

export interface WealthResult {
  level: string;
  pattern: string;
  analysis: string;
}

export interface MarriageResult {
  timing: string;
  pattern: string;
  advice: string[];
  analysis: string;
}

export interface ChildrenResult {
  prospect: string;
  analysis: string;
}

export interface FamilyResult {
  analysis: string;
}

export interface HealthResult {
  risks: {
    organ: string;
    element: FiveElement;
    severity: 'low' | 'medium' | 'high';
  }[];
  advice: string;
}

export interface DaYunTrendResult {
  periods: {
    period: string;
    trend: 'good' | 'neutral' | 'bad';
    description: string;
  }[];
}

export interface LiuNianResult {
  year: number;
  overall: string;
  details: string[];
  advice: string;
}

export interface AdviceResult {
  favorable: string[];
  unfavorable: string[];
  directions: string[];
  keyYears: {
    year: number;
    type: string;
    description: string;
  }[];
  colors: string[];
}

export interface FullAnalysisResult {
  dayMasterStrength: DayMasterStrengthResult;
  fiveElementBalance: FiveElementBalanceResult;
  yongShen: YongShenResult;
  personality: PersonalityResult;
  career: CareerResult;
  wealth: WealthResult;
  marriage: MarriageResult;
  children: ChildrenResult;
  family: FamilyResult;
  health: HealthResult;
  daYunTrend: DaYunTrendResult;
  liuNian: LiuNianResult;
  advice: AdviceResult;
  /** 神煞分析 */
  shenSha: ShenShaResult;
  /** 格局判定 */
  pattern: PatternResult;
}

// ============================================================
// 辅助函数
// ============================================================

/** 获取地支关系描述 */
function getBranchRelationDesc(b1: number, b2: number): string[] {
  const results: string[] = [];
  const b1Name = BRANCH_NAMES[b1];
  const b2Name = BRANCH_NAMES[b2];

  for (const [a, c] of EARTHLY_BRANCH_CLASH) {
    if ((a === b1 && c === b2) || (a === b2 && c === b1)) {
      results.push(`${b1Name}${b2Name}冲`);
    }
  }
  for (const { branches, name } of EARTHLY_BRANCH_COMBINE) {
    if ((branches[0] === b1 && branches[1] === b2) || (branches[0] === b2 && branches[1] === b1)) {
      results.push(name);
    }
  }
  for (const { branches, name } of EARTHLY_BRANCH_TRINE) {
    if (branches.includes(b1) && branches.includes(b2)) {
      results.push(name);
    }
  }
  for (const [a, c] of EARTHLY_BRANCH_HARM) {
    if ((a === b1 && c === b2) || (a === b2 && c === b1)) {
      results.push(`${b1Name}${b2Name}害`);
    }
  }
  for (const [a, c] of EARTHLY_BRANCH_BREAK) {
    if ((a === b1 && c === b2) || (a === b2 && c === b1)) {
      results.push(`${b1Name}${b2Name}破`);
    }
  }
  for (const { branches, name } of EARTHLY_BRANCH_PUNISHMENT) {
    if (branches.includes(b1) && branches.includes(b2) && branches[0] !== branches[1]) {
      results.push(name);
    }
  }
  return results;
}

/** 统计十神出现次数 */
function countTenGods(tenGodMap: TenGodMap): Record<string, number> {
  const counts: Record<string, number> = {};
  // 统计天干十神
  for (const key of ['year', 'month', 'hour'] as const) {
    const tg = tenGodMap.stems[key];
    counts[tg] = (counts[tg] || 0) + 1;
  }
  // 统计藏干十神（加权）
  for (const key of ['year', 'month', 'day', 'hour'] as const) {
    for (const hs of tenGodMap.branchHiddenStems[key]) {
      counts[hs.tenGod] = (counts[hs.tenGod] || 0) + hs.weight * 0.5;
    }
  }
  return counts;
}

/** 获取主要十神（出现次数最多的） */
function getDominantTenGods(tenGodMap: TenGodMap): string[] {
  const counts = countTenGods(tenGodMap);
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted.filter(([, v]) => v > 0.5).slice(0, 3).map(([k]) => k);
}

// ============================================================
// 一、日主强弱分析
// ============================================================

export function analyzeDayMasterStrength(
  _input: AnalysisInput,
  bazi: BaziResult,
): DayMasterStrengthResult {
  const dmElement = bazi.dayMasterElement;
  const fp = bazi.fourPillars;
  let score = 50; // 基准分50，满分100
  const factors: string[] = [];

  // ---- 得令判断 ----
  let deLing = false;
  const monthElement = fp.month.branchElement;
  if (monthElement === dmElement) {
    score += 20;
    deLing = true;
    factors.push(DAY_MASTER_STRENGTH_RULES.deLing.sameElement);
  } else if (FIVE_ELEMENT_SHENG[monthElement] === dmElement) {
    score += 15;
    deLing = true;
    factors.push(DAY_MASTER_STRENGTH_RULES.deLing.generateElement);
  } else if (FIVE_ELEMENT_KE[monthElement] === dmElement) {
    score -= 15;
    factors.push(DAY_MASTER_STRENGTH_RULES.deLing.overcomeElement);
  } else if (FIVE_ELEMENT_BEING_SHENG[monthElement] === dmElement) {
    score -= 5;
    factors.push(DAY_MASTER_STRENGTH_RULES.deLing.beingGeneratedElement);
  } else {
    score -= 10;
    factors.push(DAY_MASTER_STRENGTH_RULES.deLing.beingOvercomeElement);
  }

  // ---- 得地判断 ----
  let deDi = false;
  const dayBranchElement = fp.day.branchElement;
  const hourBranchElement = fp.hour.branchElement;

  if (dayBranchElement === dmElement || FIVE_ELEMENT_SHENG[dayBranchElement] === dmElement) {
    score += 10;
    deDi = true;
    factors.push(DAY_MASTER_STRENGTH_RULES.deDi.dayBranchSupport);
  } else if (FIVE_ELEMENT_KE[dayBranchElement] === dmElement) {
    score -= 8;
    factors.push(DAY_MASTER_STRENGTH_RULES.deDi.dayBranchOppose);
  }

  if (hourBranchElement === dmElement || FIVE_ELEMENT_SHENG[hourBranchElement] === dmElement) {
    score += 8;
    deDi = true;
    factors.push(DAY_MASTER_STRENGTH_RULES.deDi.hourBranchSupport);
  } else if (FIVE_ELEMENT_KE[hourBranchElement] === dmElement) {
    score -= 5;
    factors.push(DAY_MASTER_STRENGTH_RULES.deDi.hourBranchOppose);
  }

  // ---- 得势判断 ----
  let deShi = false;
  const fec = bazi.fiveElementCount;
  const elementCounts: number[] = [fec.wood, fec.fire, fec.earth, fec.metal, fec.water];
  const sameCount = elementCounts[dmElement];
  const generateCount = elementCounts[FIVE_ELEMENT_BEING_SHENG[dmElement]];
  const supportCount = sameCount + generateCount;
  const total = fec.total || 1;

  if (supportCount / total > 0.45) {
    score += 12;
    deShi = true;
    factors.push(DAY_MASTER_STRENGTH_RULES.deShi.manySameElement);
  } else if (supportCount / total < 0.25) {
    score -= 12;
    factors.push(DAY_MASTER_STRENGTH_RULES.deShi.manyOvercomeElement);
  }

  // ---- 限制分数范围 ----
  score = Math.max(5, Math.min(95, score));

  // ---- 综合判断 ----
  let strength: 'strong' | 'weak' | 'balanced';
  if (score >= 65) {
    strength = 'strong';
    factors.push(DAY_MASTER_STRENGTH_RULES.overall.strong);
  } else if (score <= 40) {
    strength = 'weak';
    factors.push(DAY_MASTER_STRENGTH_RULES.overall.weak);
  } else {
    strength = 'balanced';
    factors.push(DAY_MASTER_STRENGTH_RULES.overall.balanced);
  }

  return { strength, score, details: { deLing, deDi, deShi, factors } };
}

// ============================================================
// 二、五行平衡分析
// ============================================================

export function analyzeFiveElementBalance(bazi: BaziResult): FiveElementBalanceResult {
  const counts = bazi.fiveElementCount;
  const elementCounts: number[] = [counts.wood, counts.fire, counts.earth, counts.metal, counts.water];
  const total = counts.total || 1;
  const average = total / 5;

  const missing: FiveElement[] = [];
  const excessive: FiveElement[] = [];

  for (let i = 0; i < 5; i++) {
    if (elementCounts[i] === 0) {
      missing.push(i as FiveElement);
    } else if (elementCounts[i] > average * 1.5) {
      excessive.push(i as FiveElement);
    }
  }

  const elementNameMap: Record<number, string> = { 0: '木', 1: '火', 2: '土', 3: '金', 4: '水' };
  const parts: string[] = [];

  parts.push(`五行分布：木${counts.wood}、火${counts.fire}、土${counts.earth}、金${counts.metal}、水${counts.water}`);

  if (missing.length > 0) {
    parts.push(`命局缺${missing.map((e) => elementNameMap[e]).join('、')}，需适当补充`);
  }
  if (excessive.length > 0) {
    parts.push(`${excessive.map((e) => elementNameMap[e]).join('、')}过旺，需适当克制`);
  }
  if (missing.length === 0 && excessive.length === 0) {
    parts.push('五行分布较为均衡');
  }

  return {
    counts,
    missing,
    excessive,
    analysis: parts.join('。') + '。',
  };
}

// ============================================================
// 三、用神喜忌分析
// ============================================================

export function analyzeYongShen(
  bazi: BaziResult,
  strength: DayMasterStrengthResult,
): YongShenResult {
  const dmElement = bazi.dayMasterElement;
  const monthBranch = bazi.fourPillars.month.branch;
  let yongShen: FiveElement;
  let xiShen: FiveElement[] = [];
  let jiShen: FiveElement[] = [];
  const analysisParts: string[] = [];

  if (strength.strength === 'strong') {
    // 强日主：克泄耗为用
    const keElement = FIVE_ELEMENT_KE[dmElement]; // 克日主的五行
    const xieElement = FIVE_ELEMENT_SHENG[dmElement]; // 日主生的五行
    const haoElement = FIVE_ELEMENT_BEING_KE[dmElement]; // 日主克的五行

    // 优先选择克日主的五行（官杀）为用神
    yongShen = keElement;
    xiShen = [xieElement, haoElement];
    jiShen = [FIVE_ELEMENT_BEING_SHENG[dmElement], dmElement];

    analysisParts.push(YONG_SHEN_RULES.strong.description);
    analysisParts.push(`用神为${FIVE_ELEMENT_NAMES[yongShen]}（官杀），喜${xiShen.map((e) => FIVE_ELEMENT_NAMES[e]).join('、')}`);
    analysisParts.push(`忌${jiShen.map((e) => FIVE_ELEMENT_NAMES[e]).join('、')}`);
  } else if (strength.strength === 'weak') {
    // 弱日主：生扶为用
    const shengElement = FIVE_ELEMENT_BEING_SHENG[dmElement]; // 生日主的五行
    const fuElement = dmElement; // 同类五行

    yongShen = shengElement;
    xiShen = [fuElement];
    jiShen = [FIVE_ELEMENT_KE[dmElement], FIVE_ELEMENT_SHENG[dmElement], FIVE_ELEMENT_BEING_KE[dmElement]];

    analysisParts.push(YONG_SHEN_RULES.weak.description);
    analysisParts.push(`用神为${FIVE_ELEMENT_NAMES[yongShen]}（印星），喜${xiShen.map((e) => FIVE_ELEMENT_NAMES[e]).join('、')}`);
    analysisParts.push(`忌${jiShen.map((e) => FIVE_ELEMENT_NAMES[e]).join('、')}`);
  } else {
    // 中和：以调候为主
    const tiaoHou = TIAO_HOU_TABLE[monthBranch]?.[dmElement];
    if (tiaoHou) {
      yongShen = tiaoHou.yongShen;
      xiShen = [yongShen];
      jiShen = [];
      analysisParts.push(YONG_SHEN_RULES.balanced.description);
      analysisParts.push(tiaoHou.description);
    } else {
      yongShen = FIVE_ELEMENT_BEING_SHENG[dmElement];
      xiShen = [yongShen];
      jiShen = [];
      analysisParts.push('日主中和，以生扶为辅');
    }
  }

  return {
    yongShen,
    xiShen,
    jiShen,
    analysis: analysisParts.join('。') + '。',
  };
}

// ============================================================
// 四、性格特质分析
// ============================================================

export function analyzePersonality(
  bazi: BaziResult,
  tenGodMap: TenGodMap,
  strength: DayMasterStrengthResult,
): PersonalityResult {
  const dmElement = bazi.dayMasterElement;
  const allTraits: string[] = [];
  const analysisParts: string[] = [];

  // 日主五行基本性格
  const dmPersonality = DAY_MASTER_PERSONALITY[dmElement];
  allTraits.push(...dmPersonality.traits);
  analysisParts.push(dmPersonality.description);

  // 日主强弱对性格的影响
  if (strength.strength === 'strong') {
    allTraits.push('自信', '果断', '有魄力');
    analysisParts.push('日主偏强，性格偏向自信果断，有领导力。');
  } else if (strength.strength === 'weak') {
    allTraits.push('谨慎', '温和', '善于合作');
    analysisParts.push('日主偏弱，性格偏向温和谨慎，善于与人合作。');
  } else {
    allTraits.push('稳重', '中庸', '善于协调');
    analysisParts.push('日主中和，性格稳重，善于协调各方关系。');
  }

  // 主要十神对性格的影响
  const dominantGods = getDominantTenGods(tenGodMap);
  for (const godKey of dominantGods) {
    const effect = TEN_GOD_PERSONALITY_EFFECT[godKey];
    if (effect) {
      allTraits.push(...effect.traits);
      analysisParts.push(effect.description);
    }
  }

  // 去重
  const uniqueTraits = [...new Set(allTraits)];

  return {
    traits: uniqueTraits,
    analysis: analysisParts.join('。') + '。以上为倾向性性格分析，实际性格还受后天环境和教育影响。',
  };
}

// ============================================================
// 五、事业取向分析
// ============================================================

export function analyzeCareer(
  bazi: BaziResult,
  tenGodMap: TenGodMap,
): CareerResult {
  const dmElement = bazi.dayMasterElement;
  const careerByDM = CAREER_BY_DAY_MASTER[dmElement];
  const allSuitable: string[] = [...careerByDM.suitable];
  const allAvoid: string[] = [...careerByDM.avoid];
  const analysisParts: string[] = [];

  analysisParts.push(`${FIVE_ELEMENT_NAMES[dmElement]}日主之人，事业方向宜向${careerByDM.directions.join('、')}发展。`);

  // 十神对应的事业
  const dominantGods = getDominantTenGods(tenGodMap);
  for (const godKey of dominantGods) {
    const careerByTG = CAREER_BY_TEN_GOD[godKey];
    if (careerByTG) {
      allSuitable.push(...careerByTG.suitable);
      analysisParts.push(careerByTG.description);
    }
  }

  // 去重
  const uniqueSuitable = [...new Set(allSuitable)];
  const uniqueAvoid = [...new Set(allAvoid)];

  return {
    directions: careerByDM.directions,
    suitable: uniqueSuitable,
    avoid: uniqueAvoid,
    analysis: analysisParts.join('。') + '。以上为倾向性建议，实际事业选择还需结合个人兴趣和能力。',
  };
}

// ============================================================
// 六、财富格局分析
// ============================================================

export function analyzeWealth(
  bazi: BaziResult,
  tenGodMap: TenGodMap,
): WealthResult {
  const strength = analyzeDayMasterStrength(bazi.input, bazi);
  const counts = countTenGods(tenGodMap);
  const analysisParts: string[] = [];
  let level = '中等财运';
  let pattern = '一般格局';

  // 判断财星力量
  const caiCount = (counts['zhengCai'] || 0) + (counts['pianCai'] || 0);
  const shiShangCount = (counts['shiShen'] || 0) + (counts['shangGuan'] || 0);
  const biJieCount = (counts['biJian'] || 0) + (counts['jieCai'] || 0);

  // 身强财旺
  if (strength.strength === 'strong' && caiCount >= 2) {
    level = '上等财运';
    pattern = '身强财旺';
    analysisParts.push('日主有力，财星有根，有聚财之能，财运亨通。');
  }
  // 食伤生财
  else if (shiShangCount >= 1.5 && caiCount >= 1) {
    level = '上等财运';
    pattern = '食伤生财';
    analysisParts.push('食伤生财格局，以才华和技术创造财富，属于智慧型致富。');
  }
  // 比劫夺财
  else if (biJieCount >= 2.5 && caiCount >= 1) {
    level = '财运有波折';
    pattern = '比劫夺财';
    analysisParts.push('比劫过旺克财，容易因朋友或竞争导致破财，需注意理财和合作风险。');
  }
  // 身弱财重
  else if (strength.strength === 'weak' && caiCount >= 2) {
    level = '财多身弱';
    pattern = '财多身弱';
    analysisParts.push('财星过多而日主无力承担，看似有钱实则辛苦，需增强自身能力才能驾驭财富。');
  }
  // 财星为忌
  else if (strength.strength === 'weak' && caiCount >= 1) {
    level = '财运需努力';
    pattern = '财星为忌';
    analysisParts.push('财星为忌神，求财过程中容易因财生灾，不宜投机冒险，宜稳健经营。');
  }
  // 一般格局
  else {
    level = '中等财运';
    pattern = '平稳格局';
    analysisParts.push('财运平稳，通过努力可以积累财富，宜脚踏实地，循序渐进。');
  }

  return {
    level,
    pattern,
    analysis: analysisParts.join('。') + '。以上为倾向性分析，实际财运受多种因素影响。',
  };
}

// ============================================================
// 七、婚姻感情分析
// ============================================================

export function analyzeMarriage(
  bazi: BaziResult,
  tenGodMap: TenGodMap,
  gender: 'male' | 'female',
): MarriageResult {
  const rules = gender === 'male' ? MARRIAGE_RULES.male : MARRIAGE_RULES.female;
  const counts = countTenGods(tenGodMap);
  const analysisParts: string[] = [];
  const adviceList: string[] = [];
  let timing = '适婚年龄';
  let pattern = '一般格局';

  // 判断婚姻星位置
  const starKey = gender === 'male' ? 'zhengCai' : 'zhengGuan';
  const loverKey = gender === 'male' ? 'pianCai' : 'qiSha';
  const starCount = counts[starKey] || 0;
  const loverCount = counts[loverKey] || 0;

  // 婚姻星在四柱的位置
  const starPositions: string[] = [];
  if (tenGodMap.stems.year === starKey || tenGodMap.stems.year === loverKey) {
    starPositions.push('年柱');
    timing = rules.timing.early;
  }
  if (tenGodMap.stems.month === starKey || tenGodMap.stems.month === loverKey) {
    starPositions.push('月柱');
    if (timing === '适婚年龄') timing = rules.timing.middle;
  }
  // 日支
  const dayBranchElement = bazi.fourPillars.day.branchElement;
  if (dayBranchElement === bazi.dayMasterElement ? false : true) {
    // 日支为配偶宫
    starPositions.push('日支');
    if (timing === '适婚年龄') timing = rules.timing.middle;
  }
  if (tenGodMap.stems.hour === starKey || tenGodMap.stems.hour === loverKey) {
    starPositions.push('时柱');
    if (starPositions.length === 1 && starPositions[0] === '时柱') timing = rules.timing.late;
  }

  // 无婚姻星
  if (starCount === 0 && loverCount === 0) {
    timing = rules.timing.noStar;
    pattern = '婚姻缘分较薄';
    adviceList.push('主动拓展社交圈，增加结识良缘的机会');
  }

  // 婚姻格局判断
  const strength = analyzeDayMasterStrength(bazi.input, bazi);
  const starIsUseful = (strength.strength === 'weak' && (starKey === 'zhengCai' || starKey === 'zhengGuan'))
    ? false
    : (strength.strength === 'strong' && (starKey === 'zhengCai' || starKey === 'zhengGuan'))
      ? true
      : strength.strength === 'balanced';

  for (const p of rules.patterns) {
    if (p.name === '财星为用' || p.name === '官星为用') {
      if (starIsUseful && starCount >= 1) {
        pattern = p.name;
        analysisParts.push(p.description);
      }
    }
    if (p.name === '财星为忌' || p.name === '官星为忌') {
      if (!starIsUseful && starCount >= 1) {
        pattern = p.name;
        analysisParts.push(p.description);
      }
    }
    if ((p.name === '正偏财混杂' || p.name === '官杀混杂') && starCount >= 1 && loverCount >= 1) {
      pattern = p.name;
      analysisParts.push(p.description);
      adviceList.push('感情中需保持忠诚，避免异性缘复杂带来的困扰');
    }
    if (p.name === '比劫争财' && gender === 'male' && (counts['biJian'] || 0) + (counts['jieCai'] || 0) >= 2) {
      pattern = p.name;
      analysisParts.push(p.description);
      adviceList.push('感情中需注意竞争者，经营好二人世界');
    }
    if (p.name === '伤官见官' && gender === 'female' && (counts['shangGuan'] || 0) >= 1 && starCount >= 1) {
      pattern = p.name;
      analysisParts.push(p.description);
      adviceList.push('对伴侣要求不宜过高，学会欣赏和包容');
    }
  }

  // 日支冲克检查
  const dayBranch = bazi.fourPillars.day.branch;
  const yearBranch = bazi.fourPillars.year.branch;
  const monthBranch = bazi.fourPillars.month.branch;
  const hourBranch = bazi.fourPillars.hour.branch;

  for (const [a, c] of EARTHLY_BRANCH_CLASH) {
    if ((a === dayBranch && (c === yearBranch || c === monthBranch || c === hourBranch)) ||
        (c === dayBranch && (a === yearBranch || a === monthBranch || a === hourBranch))) {
      analysisParts.push('日支（配偶宫）逢冲，感情容易有波折。');
      adviceList.push('婚姻中需多包容理解，遇事冷静沟通');
      break;
    }
  }

  if (analysisParts.length === 0) {
    analysisParts.push('婚姻感情格局平稳，宜用心经营。');
  }

  if (adviceList.length === 0) {
    adviceList.push('珍惜缘分，用心经营感情');
    adviceList.push('保持良好沟通，互相尊重');
  }

  return {
    timing,
    pattern,
    advice: adviceList,
    analysis: analysisParts.join('。') + '。以上为倾向性分析，婚姻幸福主要取决于双方共同经营。',
  };
}

// ============================================================
// 八、子女缘分析
// ============================================================

export function analyzeChildren(
  bazi: BaziResult,
  tenGodMap: TenGodMap,
): ChildrenResult {
  const gender = bazi.input.gender === 'male' ? 'male' : 'female';
  const rules = CHILDREN_RULES[gender];
  const counts = countTenGods(tenGodMap);
  const analysisParts: string[] = [];
  let prospect = '子女缘分中等';

  // 统计子女星力量
  const childrenStarTotal = rules.childrenStar.reduce((sum, key) => sum + (counts[key] || 0), 0);

  if (childrenStarTotal >= 2) {
    prospect = '子女缘分深厚';
    analysisParts.push('子女星有力，子女缘分深厚。');
  } else if (childrenStarTotal >= 1) {
    prospect = '子女缘分中等';
    analysisParts.push('子女星有根，子女缘分中等。');
  } else {
    prospect = '子女缘分较薄';
    analysisParts.push('子女星力量不足，子女缘分较薄，需多关心。');
  }

  // 判断子女星为用还是为忌
  const strength = analyzeDayMasterStrength(bazi.input, bazi);
  const starIsUseful = (strength.strength === 'weak')
    ? true
    : (strength.strength === 'strong')
      ? false
      : true;

  for (const p of rules.patterns) {
    if (p.name === '官杀为用' || p.name === '食伤为用') {
      if (starIsUseful) {
        analysisParts.push(p.description);
      }
    }
    if (p.name === '官杀为忌' || p.name === '食伤为忌') {
      if (!starIsUseful) {
        analysisParts.push(p.description);
      }
    }
    if (p.name === '官杀有力' || p.name === '食伤有力') {
      if (childrenStarTotal >= 2) {
        analysisParts.push(p.description);
      }
    }
    if (p.name === '官杀无力' || p.name === '食伤无力') {
      if (childrenStarTotal < 1) {
        analysisParts.push(p.description);
      }
    }
  }

  analysisParts.push(rules.description);

  return {
    prospect,
    analysis: analysisParts.join('。') + '。以上为倾向性分析，亲子关系主要取决于后天的教育和陪伴。',
  };
}

// ============================================================
// 九、原生家庭分析
// ============================================================

export function analyzeFamily(
  bazi: BaziResult,
  tenGodMap: TenGodMap,
): FamilyResult {
  const analysisParts: string[] = [];
  const counts = countTenGods(tenGodMap);

  // 印星看父母（正印看母亲，偏印看继母/养母）
  const yinCount = (counts['zhengYin'] || 0) + (counts['pianYin'] || 0);
  if (yinCount >= 2) {
    analysisParts.push('印星有力，父母对自身帮助较大，家庭环境相对优越。');
  } else if (yinCount >= 1) {
    analysisParts.push('印星有根，父母有一定助力，家庭关系和睦。');
  } else {
    analysisParts.push('印星力量不足，与父母的缘分或助力可能有限，需自立自强。');
  }

  // 年柱看祖上
  const yearPillar = bazi.fourPillars.year;
  analysisParts.push(`年柱${HEAVENLY_STEMS[yearPillar.stem]}${EARTHLY_BRANCHES[yearPillar.branch]}，反映祖上根基。`);

  // 月柱看父母
  const monthPillar = bazi.fourPillars.month;
  analysisParts.push(`月柱${HEAVENLY_STEMS[monthPillar.stem]}${EARTHLY_BRANCHES[monthPillar.branch]}，反映父母宫。`);

  // 比劫看兄弟姐妹
  const biJieCount = (counts['biJian'] || 0) + (counts['jieCai'] || 0);
  if (biJieCount >= 2) {
    analysisParts.push('比劫多，兄弟姐妹缘分较深，朋友也多。');
  } else if (biJieCount >= 1) {
    analysisParts.push('比劫有根，兄弟姐妹缘分中等。');
  } else {
    analysisParts.push('比劫少，兄弟姐妹缘分较薄，独立性强。');
  }

  return {
    analysis: analysisParts.join('。') + '。以上为倾向性分析，家庭关系主要取决于后天经营。',
  };
}

// ============================================================
// 十、健康倾向分析
// ============================================================

export function analyzeHealth(
  _bazi: BaziResult,
  fiveElementCount: FiveElementCount,
): HealthResult {
  const risks: { organ: string; element: FiveElement; severity: 'low' | 'medium' | 'high' }[] = [];
  const elementCounts: number[] = [fiveElementCount.wood, fiveElementCount.fire, fiveElementCount.earth, fiveElementCount.metal, fiveElementCount.water];
  const total = fiveElementCount.total || 1;
  const average = total / 5;

  for (let i = 0; i < 5; i++) {
    const element = i as FiveElement;
    const count = elementCounts[i];
    const organInfo = FIVE_ELEMENT_ORGANS[element];

    if (count === 0) {
      // 五行缺失
      risks.push({
        organ: organInfo.organs.join('、'),
        element,
        severity: 'medium',
      });
    } else if (count > average * 1.6) {
      // 五行过旺
      risks.push({
        organ: organInfo.organs.join('、'),
        element,
        severity: 'high',
      });
    } else if (count < average * 0.5) {
      // 五行偏弱
      risks.push({
        organ: organInfo.organs.join('、'),
        element,
        severity: 'low',
      });
    }
  }

  // 生成健康建议
  const adviceParts: string[] = [];
  for (const risk of risks) {
    const element = risk.element;
    const organInfo = FIVE_ELEMENT_ORGANS[element];
    const imbalanceInfo = FIVE_ELEMENT_IMBALANCE_HEALTH[element];

    if (risk.severity === 'high') {
      adviceParts.push(`${organInfo.organs.join('、')}相关系统需特别注意，建议定期体检。`);
      if (imbalanceInfo.excess.length > 0) {
        adviceParts.push(imbalanceInfo.excess[0]);
      }
    } else if (risk.severity === 'medium') {
      adviceParts.push(`${organInfo.organs.join('、')}系统需适当关注。`);
      if (imbalanceInfo.deficiency.length > 0) {
        adviceParts.push(imbalanceInfo.deficiency[0]);
      }
    }
  }

  if (risks.length === 0) {
    adviceParts.push('五行分布较为均衡，无明显健康风险倾向。');
  }

  adviceParts.push('以上为倾向性健康提示，不构成医疗建议，如有不适请及时就医。');

  return {
    risks,
    advice: adviceParts.join('。') + '。',
  };
}

// ============================================================
// 十一、大运走势分析
// ============================================================

export function analyzeDaYunTrend(
  bazi: BaziResult,
  daYunList: DaYun[],
): DaYunTrendResult {
  const strength = analyzeDayMasterStrength(bazi.input, bazi);
  const yongShenResult = analyzeYongShen(bazi, strength);
  const periods: { period: string; trend: 'good' | 'neutral' | 'bad'; description: string }[] = [];

  for (const daYun of daYunList) {
    const stemElement = daYun.pillar.stemElement;
    const branchElement = daYun.pillar.branchElement;
    const stemName = HEAVENLY_STEMS[daYun.stem];
    const branchName = EARTHLY_BRANCHES[daYun.branch];
    const periodStr = `${stemName}${branchName}（${daYun.startAge.toFixed(0)}-${(daYun.startAge + 10).toFixed(0)}岁）`;

    let trend: 'good' | 'neutral' | 'bad' = 'neutral';
    const descriptions: string[] = [];

    // 判断大运五行与用神的关系
    const isYongShen = stemElement === yongShenResult.yongShen || branchElement === yongShenResult.yongShen;
    const isXiShen = yongShenResult.xiShen.some((e) => stemElement === e || branchElement === e);
    const isJiShen = yongShenResult.jiShen.some((e) => stemElement === e || branchElement === e);

    if (isYongShen || isXiShen) {
      trend = 'good';
      descriptions.push(`大运走${FIVE_ELEMENT_NAMES[isYongShen ? yongShenResult.yongShen : stemElement]}运，为喜用方向`);
    } else if (isJiShen) {
      trend = 'bad';
      descriptions.push(`大运走忌神方向，运势有压力`);
    }

    // 检查大运与命局的合冲
    const fp = bazi.fourPillars;
    const allBranches = [fp.year.branch, fp.month.branch, fp.day.branch, fp.hour.branch];
    for (const pb of allBranches) {
      const relations = getBranchRelationDesc(daYun.branch, pb);
      for (const rel of relations) {
        if (rel.includes('冲')) {
          descriptions.push(`与命局有${rel}，主变动`);
        } else if (rel.includes('合') || rel.includes('三合')) {
          descriptions.push(`与命局有${rel}，主合作机遇`);
        }
      }
    }

    if (descriptions.length === 0) {
      descriptions.push('运势平稳，不温不火');
    }

    periods.push({
      period: periodStr,
      trend,
      description: descriptions.join('，'),
    });
  }

  return { periods };
}

// ============================================================
// 十二、流年提示分析
// ============================================================

export function analyzeLiuNian(
  bazi: BaziResult,
  daYunList: DaYun[],
  year: number,
): LiuNianResult {
  const dmElement = bazi.dayMasterElement;
  const strength = analyzeDayMasterStrength(bazi.input, bazi);
  const yongShenResult = analyzeYongShen(bazi, strength);

  // 计算流年天干地支
  const yearStem = ((year - 4) % 10 + 10) % 10;
  const yearBranch = ((year - 4) % 12 + 12) % 12;
  const stemElement = STEM_ELEMENT[yearStem];
  const branchElement = BRANCH_ELEMENT[yearBranch];
  const stemName = HEAVENLY_STEMS[yearStem];

  const details: string[] = [];
  const adviceParts: string[] = [];
  let overall = '平';

  // 流年天干与日主的关系
  if (stemElement === dmElement) {
    details.push(`流年天干${stemName}与日主同属${FIVE_ELEMENT_NAMES[dmElement]}，自我意识增强`);
  } else if (FIVE_ELEMENT_SHENG[stemElement] === dmElement) {
    details.push(`流年天干${stemName}生日主，有贵人相助之象`);
  } else if (FIVE_ELEMENT_KE[stemElement] === dmElement) {
    details.push(`流年天干${stemName}克日主，有压力和挑战`);
  } else if (FIVE_ELEMENT_SHENG[dmElement] === stemElement) {
    details.push(`流年天干${stemName}为日主所生，才华得以展现`);
  } else {
    details.push(`流年天干${stemName}为日主所克，有消耗但也有收获`);
  }

  // 流年与用神的关系
  if (stemElement === yongShenResult.yongShen || branchElement === yongShenResult.yongShen) {
    overall = '吉';
    details.push(`流年走用神${FIVE_ELEMENT_NAMES[yongShenResult.yongShen]}运，运势有助`);
  } else if (yongShenResult.jiShen.some((e) => stemElement === e || branchElement === e)) {
    overall = '凶';
    details.push(`流年走忌神运，需谨慎应对`);
  }

  // 流年地支与命局的关系
  const fp = bazi.fourPillars;
  const allBranches = [fp.year.branch, fp.month.branch, fp.day.branch, fp.hour.branch];
  for (const pb of allBranches) {
    const relations = getBranchRelationDesc(yearBranch, pb);
    for (const rel of relations) {
      if (rel.includes('冲')) {
        details.push(`流年地支与命局有${rel}，主变动`);
      } else if (rel.includes('合')) {
        details.push(`流年地支与命局有${rel}，主和合`);
      } else if (rel.includes('三合')) {
        details.push(`流年地支与命局有${rel}，主机遇`);
      } else if (rel.includes('刑')) {
        details.push(`流年地支与命局有${rel}，需注意是非`);
      } else if (rel.includes('害')) {
        details.push(`流年地支与命局有${rel}，需防小人`);
      }
    }
  }

  // 流年与大运的关系
  const currentDaYun = daYunList.find(
    (dy) => year >= dy.startYear && year < dy.startYear + 10,
  );
  if (currentDaYun) {
    const dyRelations = getBranchRelationDesc(yearBranch, currentDaYun.branch);
    for (const rel of dyRelations) {
      details.push(`流年与大运有${rel}`);
    }
  }

  // 建议
  if (overall === '吉') {
    adviceParts.push('此年运势较好，可积极把握机遇');
  } else if (overall === '凶') {
    adviceParts.push('此年需谨慎行事，保守为上');
  } else {
    adviceParts.push('此年运势平稳，宜稳中求进');
  }
  adviceParts.push('以上为倾向性提示，具体运势还受个人选择和努力影响');

  return {
    year,
    overall,
    details,
    advice: adviceParts.join('。') + '。',
  };
}

// ============================================================
// 十三、趋避与行动建议
// ============================================================

export function generateAdvice(
  bazi: BaziResult,
  analysis: FullAnalysisResult,
): AdviceResult {
  const yongShen = analysis.yongShen.yongShen;
  const favorable: string[] = [];
  const unfavorable: string[] = [];
  const keyYears: { year: number; type: string; description: string }[] = [];

  // 有利事项
  const yongIndustries = FIVE_ELEMENT_INDUSTRIES[yongShen];
  if (yongIndustries.length > 0) {
    favorable.push(...yongIndustries.slice(0, 5));
  }
  favorable.push(`从事与${FIVE_ELEMENT_NAMES[yongShen]}相关的行业`);

  // 不利事项
  for (const ji of analysis.yongShen.jiShen) {
    unfavorable.push(`避免与${FIVE_ELEMENT_NAMES[ji]}相关的过度投入`);
  }

  // 方位建议
  const directions = FIVE_ELEMENT_DIRECTIONS[yongShen];
  const allDirections = [...directions];

  // 颜色建议
  const colors = FIVE_ELEMENT_COLORS[yongShen];

  // 关键年份
  const currentYear = new Date().getFullYear();
  for (let offset = -2; offset <= 10; offset++) {
    const targetYear = currentYear + offset;
    if (targetYear < bazi.input.year) continue;

    const yearStem = ((targetYear - 4) % 10 + 10) % 10;
    const yearBranch = ((targetYear - 4) % 12 + 12) % 12;
    const yearStemElement = STEM_ELEMENT[yearStem];
    const yearBranchElement = BRANCH_ELEMENT[yearBranch];

    if (yearStemElement === yongShen || yearBranchElement === yongShen) {
      keyYears.push({
        year: targetYear,
        type: 'favorable',
        description: `${HEAVENLY_STEMS[yearStem]}${EARTHLY_BRANCHES[yearBranch]}年，走用神运，运势较佳`,
      });
    } else if (analysis.yongShen.jiShen.some((e) => yearStemElement === e || yearBranchElement === e)) {
      keyYears.push({
        year: targetYear,
        type: 'caution',
        description: `${HEAVENLY_STEMS[yearStem]}${EARTHLY_BRANCHES[yearBranch]}年，走忌神运，需谨慎`,
      });
    }
  }

  // 限制关键年份数量
  if (keyYears.length > 8) {
    keyYears.length = 8;
  }

  return {
    favorable,
    unfavorable,
    directions: allDirections,
    keyYears,
    colors,
  };
}

// ============================================================
// 十四、运行全部分析并汇总
// ============================================================

export function runFullAnalysis(
  input: AnalysisInput,
  bazi: BaziResult,
): FullAnalysisResult {
  // 1. 日主强弱
  const dayMasterStrength = analyzeDayMasterStrength(input, bazi);

  // 2. 五行平衡
  const fiveElementBalance = analyzeFiveElementBalance(bazi);

  // 3. 用神喜忌
  const yongShen = analyzeYongShen(bazi, dayMasterStrength);

  // 4. 性格特质
  const personality = analyzePersonality(bazi, bazi.tenGods, dayMasterStrength);

  // 5. 事业取向
  const career = analyzeCareer(bazi, bazi.tenGods);

  // 6. 财富格局
  const wealth = analyzeWealth(bazi, bazi.tenGods);

  // 7. 婚姻感情
  const marriage = analyzeMarriage(bazi, bazi.tenGods, input.gender === 'male' ? 'male' : 'female');

  // 8. 子女缘
  const children = analyzeChildren(bazi, bazi.tenGods);

  // 9. 原生家庭
  const family = analyzeFamily(bazi, bazi.tenGods);

  // 10. 健康倾向
  const health = analyzeHealth(bazi, bazi.fiveElementCount);

  // 11. 大运走势
  const daYunTrend = analyzeDaYunTrend(bazi, bazi.daYunList);

  // 12. 流年提示
  const currentYear = new Date().getFullYear();
  const liuNian = analyzeLiuNian(bazi, bazi.daYunList, currentYear);

  // 汇总
  const fullResult: FullAnalysisResult = {
    dayMasterStrength,
    fiveElementBalance,
    yongShen,
    personality,
    career,
    wealth,
    marriage,
    children,
    family,
    health,
    daYunTrend,
    liuNian,
    advice: { favorable: [], unfavorable: [], directions: [], keyYears: [], colors: [] },
    shenSha: { shenShaList: [], summary: '' },
    pattern: { pattern: '', patternType: '', description: '', characteristics: [], suitableCareer: [], avoidCareer: [], isValid: false, strength: 0, analysis: '' },
  };

  // 13. 神煞分析
  fullResult.shenSha = calculateShenSha(bazi);

  // 14. 格局判定
  fullResult.pattern = determinePattern(bazi);

  // 15. 趋避建议
  fullResult.advice = generateAdvice(bazi, fullResult);

  return fullResult;
}

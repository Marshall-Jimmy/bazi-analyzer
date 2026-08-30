// ============================================================
// 八字排盘 - 合盘分析引擎
// ============================================================
// 包含：双人合盘分析、天干关系对比、地支关系对比、
//       日柱互看、用神互补性、大运同步性、
//       流年共振点、合盘建议
// ============================================================

import type {
  AnalysisInput,
  BaziResult,
  DaYun,
  FiveElement,
} from './types.ts';
import {
  EARTHLY_BRANCHES,
  FIVE_ELEMENT_NAMES,
  HEAVENLY_STEMS,
  STEM_ELEMENT,
  STEM_YIN_YANG,
} from './constants.ts';
import {
  FIVE_ELEMENT_SHENG,
  FIVE_ELEMENT_KE,
  EARTHLY_BRANCH_CLASH,
  EARTHLY_BRANCH_COMBINE,
  EARTHLY_BRANCH_TRINE,
  EARTHLY_BRANCH_PUNISHMENT,
  EARTHLY_BRANCH_HARM,
  EARTHLY_BRANCH_BREAK,
  HEAVENLY_STEM_COMBINE,
  HEAVENLY_STEM_CLASH,
  BRANCH_NAMES,
  STEM_NAMES,
} from '../data/knowledgeBase.ts';
import {
  analyzeDayMasterStrength,
  analyzeYongShen,
} from './analysis.ts';

// ============================================================
// 合盘分析结果类型定义
// ============================================================

export interface StemRelationItem {
  stem1: string;
  stem2: string;
  relation: string;
  type: 'combine' | 'clash' | 'overcome' | 'neutral';
  score: number;
}

export interface BranchRelationItem {
  branch1: string;
  branch2: string;
  relations: string[];
  score: number;
}

export interface DayPillarCompareResult {
  dayStemRelation: string;
  dayBranchRelation: string;
  compatibility: number;
  description: string;
}

export interface YongShenComplementResult {
  complementScore: number;
  description: string;
  details: string[];
}

export interface DaYunSyncResult {
  syncScore: number;
  syncPeriods: {
    period1: string;
    period2: string;
    similarity: number;
    description: string;
  }[];
  description: string;
}

export interface LiuNianResonanceResult {
  resonancePoints: {
    year: number;
    description: string;
    type: 'positive' | 'negative' | 'neutral';
  }[];
  description: string;
}

export interface SynastryAdvice {
  strengths: string[];
  challenges: string[];
  suggestions: string[];
  overallAdvice: string;
}

export interface KeyYearItem {
  year: number;
  description: string;
  type: 'favorable' | 'caution' | 'neutral';
}

export interface SynastryResult {
  overall: string;
  overallScore: number;
  stemRelations: StemRelationItem[];
  branchRelations: BranchRelationItem[];
  dayPillarCompare: DayPillarCompareResult;
  yongShenComplement: YongShenComplementResult;
  daYunSync: DaYunSyncResult;
  liuNianResonance: LiuNianResonanceResult;
  advice: SynastryAdvice;
  keyYears: KeyYearItem[];
}

// ============================================================
// 辅助函数
// ============================================================

/** 获取两个天干之间的关系 */
function getStemRelation(s1: number, s2: number): { relation: string; type: 'combine' | 'clash' | 'overcome' | 'neutral'; score: number } {
  // 天干五合
  for (const { stems, name } of HEAVENLY_STEM_COMBINE) {
    if ((stems[0] === s1 && stems[1] === s2) || (stems[0] === s2 && stems[1] === s1)) {
      return { relation: name, type: 'combine', score: 10 };
    }
  }
  // 天干四冲
  for (const [a, c] of HEAVENLY_STEM_CLASH) {
    if ((a === s1 && c === s2) || (a === s2 && c === s1)) {
      return { relation: `${STEM_NAMES[s1]}${STEM_NAMES[s2]}冲`, type: 'clash', score: -8 };
    }
  }
  // 天干相克
  const e1 = STEM_ELEMENT[s1];
  const e2 = STEM_ELEMENT[s2];
  if (FIVE_ELEMENT_KE[e1] === e2) {
    return { relation: `${STEM_NAMES[s1]}克${STEM_NAMES[s2]}`, type: 'overcome', score: -5 };
  }
  if (FIVE_ELEMENT_KE[e2] === e1) {
    return { relation: `${STEM_NAMES[s2]}克${STEM_NAMES[s1]}`, type: 'overcome', score: -5 };
  }
  // 天干相生
  if (FIVE_ELEMENT_SHENG[e1] === e2) {
    return { relation: `${STEM_NAMES[s1]}生${STEM_NAMES[s2]}`, type: 'neutral', score: 5 };
  }
  if (FIVE_ELEMENT_SHENG[e2] === e1) {
    return { relation: `${STEM_NAMES[s2]}生${STEM_NAMES[s1]}`, type: 'neutral', score: 5 };
  }
  return { relation: '无特殊关系', type: 'neutral', score: 0 };
}

/** 获取两个地支之间的关系 */
function getBranchRelations(b1: number, b2: number): { relations: string[]; score: number } {
  const relations: string[] = [];
  let score = 0;

  // 六冲
  for (const [a, c] of EARTHLY_BRANCH_CLASH) {
    if ((a === b1 && c === b2) || (a === b2 && c === b1)) {
      relations.push(`${BRANCH_NAMES[b1]}${BRANCH_NAMES[b2]}冲`);
      score -= 10;
    }
  }
  // 六合
  for (const { branches, name } of EARTHLY_BRANCH_COMBINE) {
    if ((branches[0] === b1 && branches[1] === b2) || (branches[0] === b2 && branches[1] === b1)) {
      relations.push(name);
      score += 12;
    }
  }
  // 三合
  for (const { branches, name } of EARTHLY_BRANCH_TRINE) {
    if (branches.includes(b1) && branches.includes(b2)) {
      relations.push(name);
      score += 8;
    }
  }
  // 相害
  for (const [a, c] of EARTHLY_BRANCH_HARM) {
    if ((a === b1 && c === b2) || (a === b2 && c === b1)) {
      relations.push(`${BRANCH_NAMES[b1]}${BRANCH_NAMES[b2]}害`);
      score -= 5;
    }
  }
  // 相破
  for (const [a, c] of EARTHLY_BRANCH_BREAK) {
    if ((a === b1 && c === b2) || (a === b2 && c === b1)) {
      relations.push(`${BRANCH_NAMES[b1]}${BRANCH_NAMES[b2]}破`);
      score -= 3;
    }
  }
  // 相刑
  for (const { branches, name, type } of EARTHLY_BRANCH_PUNISHMENT) {
    if (branches.length >= 2 && branches.includes(b1) && branches.includes(b2)) {
      relations.push(`${name}（${type}）`);
      score -= 6;
    }
  }

  if (relations.length === 0) {
    relations.push('无特殊关系');
  }

  return { relations, score };
}

// ============================================================
// 一、天干关系对比
// ============================================================

export function compareHeavenlyStems(
  bazi1: BaziResult,
  bazi2: BaziResult,
): StemRelationItem[] {
  const results: StemRelationItem[] = [];
  const stems1 = [
    bazi1.fourPillars.year.stem,
    bazi1.fourPillars.month.stem,
    bazi1.fourPillars.day.stem,
    bazi1.fourPillars.hour.stem,
  ];
  const stems2 = [
    bazi2.fourPillars.year.stem,
    bazi2.fourPillars.month.stem,
    bazi2.fourPillars.day.stem,
    bazi2.fourPillars.hour.stem,
  ];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];

  // 同柱天干对比
  for (let i = 0; i < 4; i++) {
    const { relation, type, score } = getStemRelation(stems1[i], stems2[i]);
    if (type !== 'neutral' || score !== 0) {
      results.push({
        stem1: STEM_NAMES[stems1[i]],
        stem2: STEM_NAMES[stems2[i]],
        relation: `${pillarNames[i]}天干${relation}`,
        type,
        score,
      });
    }
  }

  // 跨柱天干对比（只取重要关系）
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (i === j) continue;
      const { relation, type, score } = getStemRelation(stems1[i], stems2[j]);
      if (type === 'combine' || type === 'clash') {
        results.push({
          stem1: STEM_NAMES[stems1[i]],
          stem2: STEM_NAMES[stems2[j]],
          relation: `${pillarNames[i]}与对方${pillarNames[j]}天干${relation}`,
          type,
          score: score * 0.5,
        });
      }
    }
  }

  return results;
}

// ============================================================
// 二、地支关系对比
// ============================================================

export function compareEarthlyBranches(
  bazi1: BaziResult,
  bazi2: BaziResult,
): BranchRelationItem[] {
  const results: BranchRelationItem[] = [];
  const branches1 = [
    bazi1.fourPillars.year.branch,
    bazi1.fourPillars.month.branch,
    bazi1.fourPillars.day.branch,
    bazi1.fourPillars.hour.branch,
  ];
  const branches2 = [
    bazi2.fourPillars.year.branch,
    bazi2.fourPillars.month.branch,
    bazi2.fourPillars.day.branch,
    bazi2.fourPillars.hour.branch,
  ];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];

  // 同柱地支对比
  for (let i = 0; i < 4; i++) {
    const { relations, score } = getBranchRelations(branches1[i], branches2[i]);
    if (score !== 0) {
      results.push({
        branch1: BRANCH_NAMES[branches1[i]],
        branch2: BRANCH_NAMES[branches2[i]],
        relations: relations.map((r) => `${pillarNames[i]}地支${r}`),
        score,
      });
    }
  }

  // 跨柱地支对比
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (i === j) continue;
      const { relations, score } = getBranchRelations(branches1[i], branches2[j]);
      if (score !== 0) {
        results.push({
          branch1: BRANCH_NAMES[branches1[i]],
          branch2: BRANCH_NAMES[branches2[j]],
          relations: relations.map((r) => `${pillarNames[i]}与对方${pillarNames[j]}地支${r}`),
          score: score * 0.5,
        });
      }
    }
  }

  return results;
}

// ============================================================
// 三、日柱互看
// ============================================================

export function compareDayPillars(
  bazi1: BaziResult,
  bazi2: BaziResult,
): DayPillarCompareResult {
  const dayStem1 = bazi1.fourPillars.day.stem;
  const dayStem2 = bazi2.fourPillars.day.stem;
  const dayBranch1 = bazi1.fourPillars.day.branch;
  const dayBranch2 = bazi2.fourPillars.day.branch;

  // 天干关系
  const stemRel = getStemRelation(dayStem1, dayStem2);
  const dayStemRelation = stemRel.relation;

  // 地支关系
  const branchRel = getBranchRelations(dayBranch1, dayBranch2);
  const dayBranchRelation = branchRel.relations.join('、');

  // 五行互补性
  const e1 = STEM_ELEMENT[dayStem1];
  const e2 = STEM_ELEMENT[dayStem2];
  let elementScore = 0;
  const descriptions: string[] = [];

  if (FIVE_ELEMENT_SHENG[e1] === e2 || FIVE_ELEMENT_SHENG[e2] === e1) {
    elementScore += 8;
    descriptions.push('日干五行相生，有互补之象');
  }
  if (e1 === e2) {
    elementScore += 3;
    descriptions.push('日干五行相同，有共鸣感');
  }
  if (FIVE_ELEMENT_KE[e1] === e2 || FIVE_ELEMENT_KE[e2] === e1) {
    elementScore -= 5;
    descriptions.push('日干五行相克，需磨合');
  }

  // 阴阳配合
  const yy1 = STEM_YIN_YANG[dayStem1];
  const yy2 = STEM_YIN_YANG[dayStem2];
  if (yy1 !== yy2) {
    elementScore += 5;
    descriptions.push('日干阴阳相异，有互补吸引');
  } else {
    descriptions.push('日干阴阳相同，有共鸣但可能缺乏互补');
  }

  const compatibility = Math.max(0, Math.min(100, 50 + stemRel.score + branchRel.score + elementScore));

  const description = descriptions.join('。') + '。';

  return {
    dayStemRelation,
    dayBranchRelation,
    compatibility,
    description,
  };
}

// ============================================================
// 四、用神互补性分析
// ============================================================

export function analyzeYongShenComplement(
  bazi1: BaziResult,
  bazi2: BaziResult,
): YongShenComplementResult {
  const strength1 = analyzeDayMasterStrength(bazi1.input, bazi1);
  const strength2 = analyzeDayMasterStrength(bazi2.input, bazi2);
  const yongShen1 = analyzeYongShen(bazi1, strength1);
  const yongShen2 = analyzeYongShen(bazi2, strength2);

  const details: string[] = [];
  let complementScore = 50;

  // 检查A的用神是否在B的命局中丰富
  const fec1 = bazi1.fiveElementCount;
  const fec2 = bazi2.fiveElementCount;
  const counts1 = [fec1.wood, fec1.fire, fec1.earth, fec1.metal, fec1.water];
  const counts2 = [fec2.wood, fec2.fire, fec2.earth, fec2.metal, fec2.water];
  const total1 = fec1.total || 1;
  const total2 = fec2.total || 1;

  // A的用神在B的命局中的比例
  const aYongInB = counts2[yongShen1.yongShen] / total2;
  if (aYongInB > 0.2) {
    complementScore += 15;
    details.push(`甲方用神${FIVE_ELEMENT_NAMES[yongShen1.yongShen]}在乙方命局中较丰富，乙方能为甲方提供支持`);
  }

  // B的用神在A的命局中的比例
  const bYongInA = counts1[yongShen2.yongShen] / total1;
  if (bYongInA > 0.2) {
    complementScore += 15;
    details.push(`乙方用神${FIVE_ELEMENT_NAMES[yongShen2.yongShen]}在甲方命局中较丰富，甲方能为乙方提供支持`);
  }

  // A的忌神在B的命局中是否少
  for (const ji of yongShen1.jiShen) {
    if (counts2[ji] / total2 < 0.15) {
      complementScore += 5;
    }
  }

  // B的忌神在A的命局中是否少
  for (const ji of yongShen2.jiShen) {
    if (counts1[ji] / total1 < 0.15) {
      complementScore += 5;
    }
  }

  // 五行互补
  const missing1: FiveElement[] = [];
  const missing2: FiveElement[] = [];
  for (let i = 0; i < 5; i++) {
    if (counts1[i] === 0) missing1.push(i as FiveElement);
    if (counts2[i] === 0) missing2.push(i as FiveElement);
  }

  for (const m of missing1) {
    if (counts2[m] > 0) {
      complementScore += 8;
      details.push(`甲方缺${FIVE_ELEMENT_NAMES[m]}，乙方有${FIVE_ELEMENT_NAMES[m]}，可互补`);
    }
  }
  for (const m of missing2) {
    if (counts1[m] > 0) {
      complementScore += 8;
      details.push(`乙方缺${FIVE_ELEMENT_NAMES[m]}，甲方有${FIVE_ELEMENT_NAMES[m]}，可互补`);
    }
  }

  complementScore = Math.max(10, Math.min(100, complementScore));

  const description = complementScore >= 70
    ? '双方用神互补性较好，在一起能互相助益'
    : complementScore >= 50
      ? '双方用神有一定互补性，关系较为平稳'
      : '双方用神互补性一般，需要更多磨合和包容';

  return {
    complementScore,
    description,
    details,
  };
}

// ============================================================
// 五、大运同步性
// ============================================================

export function analyzeDaYunSync(
  daYun1: DaYun[],
  daYun2: DaYun[],
): DaYunSyncResult {
  const syncPeriods: {
    period1: string;
    period2: string;
    similarity: number;
    description: string;
  }[] = [];
  let totalSync = 0;
  let comparedCount = 0;

  // 取两人大运的交集时间段进行比较
  const minLen = Math.min(daYun1.length, daYun2.length);

  for (let i = 0; i < minLen; i++) {
    const dy1 = daYun1[i];
    const dy2 = daYun2[i];

    const stem1Element = dy1.pillar.stemElement;
    const branch1Element = dy1.pillar.branchElement;
    const stem2Element = dy2.pillar.stemElement;
    const branch2Element = dy2.pillar.branchElement;

    let similarity = 0;
    const descParts: string[] = [];

    // 天干五行是否相同
    if (stem1Element === stem2Element) {
      similarity += 30;
      descParts.push(`天干同属${FIVE_ELEMENT_NAMES[stem1Element]}`);
    }
    // 地支五行是否相同
    if (branch1Element === branch2Element) {
      similarity += 30;
      descParts.push(`地支同属${FIVE_ELEMENT_NAMES[branch1Element]}`);
    }
    // 天干相生
    if (FIVE_ELEMENT_SHENG[stem1Element] === stem2Element || FIVE_ELEMENT_SHENG[stem2Element] === stem1Element) {
      similarity += 15;
      descParts.push('天干五行相生');
    }
    // 地支相生
    if (FIVE_ELEMENT_SHENG[branch1Element] === branch2Element || FIVE_ELEMENT_SHENG[branch2Element] === branch1Element) {
      similarity += 15;
      descParts.push('地支五行相生');
    }
    // 天干相克
    if (FIVE_ELEMENT_KE[stem1Element] === stem2Element || FIVE_ELEMENT_KE[stem2Element] === stem1Element) {
      similarity -= 15;
      descParts.push('天干五行相克');
    }
    // 地支相克
    if (FIVE_ELEMENT_KE[branch1Element] === branch2Element || FIVE_ELEMENT_KE[branch2Element] === branch1Element) {
      similarity -= 15;
      descParts.push('地支五行相克');
    }

    similarity = Math.max(0, Math.min(100, similarity));

    const period1Str = `${HEAVENLY_STEMS[dy1.stem]}${EARTHLY_BRANCHES[dy1.branch]}（${dy1.startAge.toFixed(0)}岁起）`;
    const period2Str = `${HEAVENLY_STEMS[dy2.stem]}${EARTHLY_BRANCHES[dy2.branch]}（${dy2.startAge.toFixed(0)}岁起）`;

    syncPeriods.push({
      period1: period1Str,
      period2: period2Str,
      similarity,
      description: descParts.length > 0 ? descParts.join('，') : '无明显同步',
    });

    totalSync += similarity;
    comparedCount++;
  }

  const syncScore = comparedCount > 0 ? Math.round(totalSync / comparedCount) : 50;

  const description = syncScore >= 60
    ? '双方大运同步性较好，人生节奏较为一致'
    : syncScore >= 40
      ? '双方大运同步性一般，各有各的发展节奏'
      : '双方大运差异较大，人生节奏不太一致，需互相理解';

  return {
    syncScore,
    syncPeriods,
    description,
  };
}

// ============================================================
// 六、流年共振点
// ============================================================

export function analyzeLiuNianResonance(
  daYun1: DaYun[],
  daYun2: DaYun[],
  year: number,
): LiuNianResonanceResult {
  const resonancePoints: {
    year: number;
    description: string;
    type: 'positive' | 'negative' | 'neutral';
  }[] = [];

  // 分析前后3年
  for (let offset = -2; offset <= 5; offset++) {
    const targetYear = year + offset;
    const yearStem = ((targetYear - 4) % 10 + 10) % 10;
    const yearBranch = ((targetYear - 4) % 12 + 12) % 12;

    // 找到双方在该年的大运
    const dy1 = daYun1.find((d) => targetYear >= d.startYear && targetYear < d.startYear + 10);
    const dy2 = daYun2.find((d) => targetYear >= d.startYear && targetYear < d.startYear + 10);

    if (!dy1 || !dy2) continue;

    const descParts: string[] = [];
    let score = 0;

    // 流年天干对双方大运天干的关系
    const rel1 = getStemRelation(yearStem, dy1.stem);
    const rel2 = getStemRelation(yearStem, dy2.stem);

    if (rel1.score > 0 && rel2.score > 0) {
      score += 10;
      descParts.push(`${targetYear}年流年天干对双方大运均有助益`);
    } else if (rel1.score < 0 && rel2.score < 0) {
      score -= 10;
      descParts.push(`${targetYear}年流年天干对双方大运均有压力`);
    }

    // 流年地支对双方大运地支的关系
    const branchRel1 = getBranchRelations(yearBranch, dy1.branch);
    const branchRel2 = getBranchRelations(yearBranch, dy2.branch);

    if (branchRel1.score > 0 && branchRel2.score > 0) {
      score += 10;
      descParts.push(`${targetYear}年流年地支对双方大运均有利`);
    } else if (branchRel1.score < 0 && branchRel2.score < 0) {
      score -= 10;
      descParts.push(`${targetYear}年流年地支对双方大运均有挑战`);
    }

    // 双方大运天干地支的关系
    const dyStemRel = getStemRelation(dy1.stem, dy2.stem);
    const dyBranchRel = getBranchRelations(dy1.branch, dy2.branch);

    if (dyStemRel.score > 5 || dyBranchRel.score > 5) {
      score += 5;
      descParts.push(`${targetYear}年双方大运有相合之象`);
    }

    if (descParts.length > 0) {
      resonancePoints.push({
        year: targetYear,
        description: descParts.join('；'),
        type: score > 5 ? 'positive' : score < -5 ? 'negative' : 'neutral',
      });
    }
  }

  const description = resonancePoints.length > 0
    ? `分析发现${resonancePoints.filter((r) => r.type === 'positive').length}个积极共振点和${resonancePoints.filter((r) => r.type === 'negative').length}个需要注意的共振点`
    : '未发现明显的流年共振点';

  return {
    resonancePoints,
    description,
  };
}

// ============================================================
// 七、合盘建议
// ============================================================

export function generateSynastryAdvice(synastryResult: SynastryResult): SynastryAdvice {
  const strengths: string[] = [];
  const challenges: string[] = [];
  const suggestions: string[] = [];

  // 天干合
  const stemCombines = synastryResult.stemRelations.filter((r) => r.type === 'combine');
  if (stemCombines.length > 0) {
    strengths.push(`天干有合（${stemCombines.map((r) => r.relation).join('、')}），双方有天然的吸引力`);
  }

  // 地支合
  const branchCombines = synastryResult.branchRelations.filter((r) => r.score > 0);
  if (branchCombines.length > 0) {
    strengths.push(`地支有合（${branchCombines.flatMap((r) => r.relations).join('、')}），关系基础较好`);
  }

  // 日柱互补
  if (synastryResult.dayPillarCompare.compatibility >= 70) {
    strengths.push('日柱配合度较高，核心关系融洽');
  }

  // 用神互补
  if (synastryResult.yongShenComplement.complementScore >= 70) {
    strengths.push('用神互补性好，在一起能互相助益');
  }

  // 大运同步
  if (synastryResult.daYunSync.syncScore >= 60) {
    strengths.push('大运同步性较好，人生节奏一致');
  }

  // 天干冲
  const stemClashes = synastryResult.stemRelations.filter((r) => r.type === 'clash');
  if (stemClashes.length > 0) {
    challenges.push(`天干有冲（${stemClashes.map((r) => r.relation).join('、')}），容易有分歧`);
  }

  // 地支冲
  const branchClashes = synastryResult.branchRelations.filter((r) => r.score < 0);
  if (branchClashes.length > 0) {
    challenges.push(`地支有冲（${branchClashes.flatMap((r) => r.relations).join('、')}），关系中有摩擦点`);
  }

  // 日柱相克
  if (synastryResult.dayPillarCompare.compatibility < 40) {
    challenges.push('日柱配合度较低，核心关系需要更多磨合');
  }

  // 用神不互补
  if (synastryResult.yongShenComplement.complementScore < 50) {
    challenges.push('用神互补性不足，在一起可能消耗较多');
  }

  // 建议
  if (strengths.length > 0 && challenges.length === 0) {
    suggestions.push('双方缘分较深，宜珍惜和维护这段关系');
  }
  if (challenges.length > 0) {
    suggestions.push('关系中存在一些摩擦点，需要双方多沟通、多包容');
  }
  if (synastryResult.yongShenComplement.complementScore >= 60) {
    suggestions.push('双方在一起能互相补充不足，是较好的搭配');
  }
  if (synastryResult.daYunSync.syncScore < 50) {
    suggestions.push('双方人生节奏有差异，需互相理解对方的发展阶段');
  }

  // 流年共振建议
  const positiveResonance = synastryResult.liuNianResonance.resonancePoints.filter((r) => r.type === 'positive');
  if (positiveResonance.length > 0) {
    suggestions.push(`在${positiveResonance.map((r) => r.year).join('、')}年双方运势共振较好，可把握机遇`);
  }

  const negativeResonance = synastryResult.liuNianResonance.resonancePoints.filter((r) => r.type === 'negative');
  if (negativeResonance.length > 0) {
    suggestions.push(`在${negativeResonance.map((r) => r.year).join('、')}年双方运势均有压力，需互相支持`);
  }

  // 总体建议
  const overallScore = synastryResult.overallScore;
  const overallAdvice = overallScore >= 70
    ? '双方合盘整体较好，缘分深厚，建议珍惜这段关系，用心经营。'
    : overallScore >= 50
      ? '双方合盘整体中等，有缘有分也有挑战，需要双方共同努力经营。'
      : '双方合盘差异较大，需要更多的理解和包容，但差异也可以成为互补的动力。';

  return {
    strengths,
    challenges,
    suggestions,
    overallAdvice,
  };
}

// ============================================================
// 八、双人合盘分析（主函数）
// ============================================================

export function analyzeSynastry(
  _input1: AnalysisInput,
  _input2: AnalysisInput,
  bazi1: BaziResult,
  bazi2: BaziResult,
  relationType: 'romantic' | 'business' | 'friendship' | 'family',
): SynastryResult {
  // 1. 天干关系对比
  const stemRelations = compareHeavenlyStems(bazi1, bazi2);

  // 2. 地支关系对比
  const branchRelations = compareEarthlyBranches(bazi1, bazi2);

  // 3. 日柱互看
  const dayPillarCompare = compareDayPillars(bazi1, bazi2);

  // 4. 用神互补性
  const yongShenComplement = analyzeYongShenComplement(bazi1, bazi2);

  // 5. 大运同步性
  const daYunSync = analyzeDaYunSync(bazi1.daYunList, bazi2.daYunList);

  // 6. 流年共振点
  const currentYear = new Date().getFullYear();
  const liuNianResonance = analyzeLiuNianResonance(bazi1.daYunList, bazi2.daYunList, currentYear);

  // 计算总体评分
  let totalScore = 50; // 基准分

  // 天干关系加分
  for (const sr of stemRelations) {
    totalScore += sr.score * 0.3;
  }

  // 地支关系加分
  for (const br of branchRelations) {
    totalScore += br.score * 0.3;
  }

  // 日柱配合加分
  totalScore += (dayPillarCompare.compatibility - 50) * 0.2;

  // 用神互补加分
  totalScore += (yongShenComplement.complementScore - 50) * 0.15;

  // 大运同步加分
  totalScore += (daYunSync.syncScore - 50) * 0.1;

  totalScore = Math.max(10, Math.min(100, Math.round(totalScore)));

  // 关键年份
  const keyYears: KeyYearItem[] = [];
  for (const rp of liuNianResonance.resonancePoints) {
    keyYears.push({
      year: rp.year,
      description: rp.description,
      type: rp.type === 'positive' ? 'favorable' : rp.type === 'negative' ? 'caution' : 'neutral',
    });
  }

  // 先构建初步结果
  const relationTypeNames: Record<string, string> = {
    romantic: '感情',
    business: '合作',
    friendship: '朋友',
    family: '家庭',
  };

  const overall = totalScore >= 70
    ? `双方${relationTypeNames[relationType]}合盘评分${totalScore}分，整体配合度较高，缘分较深。`
    : totalScore >= 50
      ? `双方${relationTypeNames[relationType]}合盘评分${totalScore}分，整体配合度中等，有缘有分也有挑战。`
      : `双方${relationTypeNames[relationType]}合盘评分${totalScore}分，整体差异较大，需要更多理解和包容。`;

  const result: SynastryResult = {
    overall,
    overallScore: totalScore,
    stemRelations,
    branchRelations,
    dayPillarCompare,
    yongShenComplement,
    daYunSync,
    liuNianResonance,
    advice: { strengths: [], challenges: [], suggestions: [], overallAdvice: '' },
    keyYears,
  };

  // 7. 合盘建议
  result.advice = generateSynastryAdvice(result);

  return result;
}

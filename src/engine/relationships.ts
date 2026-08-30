// ============================================================
// 八字排盘 - 特殊关系分析引擎
// ============================================================
// 包含：荣亲关系、天干关系分析（增强版）、地支关系分析（增强版）、
//       日柱关系（核心关系）、综合关系评估
// ============================================================

import type { BaziResult } from './types.ts';
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
  getBenMingXingXiu28,
  toXingXiu27,
  analyzeXingXiuRelation,
  getRongQinDescription,
  XINGXIU_RELATION_DESCRIPTIONS,
} from './xingxiu.ts';

// ============================================================
// 类型定义
// ============================================================

/** 荣亲关系结果 */
export interface RongQinResult {
  isRongQin: boolean;
  description: string;
  detail: string;
  // 星宿体系相关字段
  xingXiuRelation?: string;
  xingXiuA?: string;
  xingXiuB?: string;
  rongQinRoleA?: string;
  rongQinRoleB?: string;
  rongQinDistance?: string;
  rongQinTitle?: string;
  rongQinSubtitle?: string;
  rongQinTraits?: string[];
  rongQinAdvice?: string;
}

/** 天干关系单项 */
export interface TianGanRelationItem {
  stem1: string;
  stem2: string;
  type: '合' | '冲' | '克' | '生' | '比和' | '泄';
  description: string;
  influence: string;
}

/** 天干关系分析结果 */
export interface TianGanRelationResult {
  relations: TianGanRelationItem[];
}

/** 地支关系单项 */
export interface DiZhiRelationItem {
  branch1: string;
  branch2: string;
  types: string[];
  descriptions: string[];
  influence: string;
}

/** 地支关系分析结果 */
export interface DiZhiRelationResult {
  relations: DiZhiRelationItem[];
}

/** 日柱关系分析结果 */
export interface DayPillarRelationResult {
  stemRelation: string;
  branchRelation: string;
  compatibility: number;
  description: string;
  advice: string;
}

/** 综合关系评估 */
export interface RelationshipProfile {
  rongQin: RongQinResult;
  tianGanRelations: TianGanRelationResult;
  diZhiRelations: DiZhiRelationResult;
  dayPillarRelation: DayPillarRelationResult;
  overallScore: number;
  summary: string;
  strengths: string[];
  challenges: string[];
  suggestions: string[];
}

// ============================================================
// A. 荣亲关系分析（基于二十八星宿 / 911星宿体系）
// ============================================================

export function analyzeRongQin(bazi1: BaziResult, bazi2: BaziResult): RongQinResult {
  const input1 = bazi1.input;
  const input2 = bazi2.input;

  // 计算两人的本命星宿（28星宿）
  const xingXiu28A = getBenMingXingXiu28(
    input1.year, input1.month, input1.day,
    bazi1.fourPillars.day.branch
  );
  const xingXiu28B = getBenMingXingXiu28(
    input2.year, input2.month, input2.day,
    bazi2.fourPillars.day.branch
  );

  // 转换为27星宿
  const xingXiu27A = toXingXiu27(xingXiu28A);
  const xingXiu27B = toXingXiu27(xingXiu28B);

  // 分析星宿关系
  const relation = analyzeXingXiuRelation(xingXiu27A, xingXiu27B);

  if (relation.isRongQin) {
    const desc = getRongQinDescription(relation.rongQinDistance);
    return {
      isRongQin: true,
      description: `你们是${desc.title}！${desc.subtitle}`,
      detail: desc.desc,
      xingXiuRelation: relation.relation,
      xingXiuA: relation.xingXiuA27,
      xingXiuB: relation.xingXiuB27,
      rongQinRoleA: relation.rongQinRoleA,
      rongQinRoleB: relation.rongQinRoleB,
      rongQinDistance: relation.rongQinDistance,
      rongQinTitle: desc.title,
      rongQinSubtitle: desc.subtitle,
      rongQinTraits: desc.traits,
      rongQinAdvice: desc.advice,
    };
  }

  // 非荣亲关系
  const otherDesc = XINGXIU_RELATION_DESCRIPTIONS[relation.relation];
  return {
    isRongQin: false,
    description: `你们不是荣亲关系，而是${relation.relation}关系`,
    detail: otherDesc
      ? otherDesc.desc
      : `你们的27星宿关系为${relation.relation}（甲方：${relation.xingXiuA27}宿，乙方：${relation.xingXiuB27}宿）。虽然你们不是荣亲关系，但这并不代表缘分浅薄，八字合盘需要综合多方面因素来看。`,
    xingXiuRelation: relation.relation,
    xingXiuA: relation.xingXiuA27,
    xingXiuB: relation.xingXiuB27,
  };
}

// ============================================================
// B. 天干关系分析（增强版）
// ============================================================

/**
 * 获取两个天干之间的关系（增强版）
 */
function getTianGanRelationDetail(s1: number, s2: number): TianGanRelationItem | null {
  const name1 = STEM_NAMES[s1];
  const name2 = STEM_NAMES[s2];

  // 天干五合
  for (const { stems, name } of HEAVENLY_STEM_COMBINE) {
    if ((stems[0] === s1 && stems[1] === s2) || (stems[0] === s2 && stems[1] === s1)) {
      return {
        stem1: name1,
        stem2: name2,
        type: '合',
        description: name,
        influence: `${name1}${name2}相合，化气为${FIVE_ELEMENT_NAMES[HEAVENLY_STEM_COMBINE.find(c =>
          (c.stems[0] === s1 && c.stems[1] === s2) || (c.stems[0] === s2 && c.stems[1] === s1)
        )!.element]}。天干相合代表两人之间有天然的吸引力和默契，容易产生好感和合作意愿，感情基础较为牢固。`,
      };
    }
  }

  // 天干四冲
  for (const [a, c] of HEAVENLY_STEM_CLASH) {
    if ((a === s1 && c === s2) || (a === s2 && c === s1)) {
      return {
        stem1: name1,
        stem2: name2,
        type: '冲',
        description: `${name1}${name2}冲`,
        influence: `${name1}${name2}相冲，代表两人在性格或行事方式上存在冲突和分歧。甲庚冲为阳木与阳金之争，乙辛冲为阴木与阴金之争，丙壬冲为阳火与阳水之争，丁癸冲为阴火与阴水之争。相冲不一定不好，有时反而能激发活力，但需要双方多包容。`,
      };
    }
  }

  // 天干比和（相同天干）
  if (s1 === s2) {
    return {
      stem1: name1,
      stem2: name2,
      type: '比和',
      description: `${name1}${name2}比和`,
      influence: `${name1}${name2}比和，即天干相同，代表两人有相似的性格特质和行事风格，容易产生共鸣和理解。比和关系的人在一起有"同类相聚"的感觉，但有时也可能因为过于相似而缺乏新鲜感。`,
    };
  }

  // 天干相克
  const e1 = STEM_ELEMENT[s1];
  const e2 = STEM_ELEMENT[s2];
  if (FIVE_ELEMENT_KE[e1] === e2) {
    return {
      stem1: name1,
      stem2: name2,
      type: '克',
      description: `${name1}（${FIVE_ELEMENT_NAMES[e1]}）克${name2}（${FIVE_ELEMENT_NAMES[e2]}）`,
      influence: `${name1}之${FIVE_ELEMENT_NAMES[e1]}克${name2}之${FIVE_ELEMENT_NAMES[e2]}，代表一方对另一方有制约或压制的作用。在关系中，${name1}方可能更强势或有主导倾向，${name2}方则需要学会在关系中保持自我。适度的克制可以形成互补，但过度则会造成压力。`,
    };
  }
  if (FIVE_ELEMENT_KE[e2] === e1) {
    return {
      stem1: name1,
      stem2: name2,
      type: '克',
      description: `${name2}（${FIVE_ELEMENT_NAMES[e2]}）克${name1}（${FIVE_ELEMENT_NAMES[e1]}）`,
      influence: `${name2}之${FIVE_ELEMENT_NAMES[e2]}克${name1}之${FIVE_ELEMENT_NAMES[e1]}，代表一方对另一方有制约或压制的作用。在关系中，${name2}方可能更强势或有主导倾向，${name1}方则需要学会在关系中保持自我。适度的克制可以形成互补，但过度则会造成压力。`,
    };
  }

  // 天干相生
  if (FIVE_ELEMENT_SHENG[e1] === e2) {
    return {
      stem1: name1,
      stem2: name2,
      type: '生',
      description: `${name1}（${FIVE_ELEMENT_NAMES[e1]}）生${name2}（${FIVE_ELEMENT_NAMES[e2]}）`,
      influence: `${name1}之${FIVE_ELEMENT_NAMES[e1]}生${name2}之${FIVE_ELEMENT_NAMES[e2]}，代表一方对另一方有滋养和帮助的作用。${name1}方像长辈或导师一样照顾${name2}方，${name2}方则能从${name1}方获得支持和能量。这种关系温暖和谐，但要注意生方不要过度付出而耗损自己。`,
    };
  }
  if (FIVE_ELEMENT_SHENG[e2] === e1) {
    return {
      stem1: name1,
      stem2: name2,
      type: '生',
      description: `${name2}（${FIVE_ELEMENT_NAMES[e2]}）生${name1}（${FIVE_ELEMENT_NAMES[e1]}）`,
      influence: `${name2}之${FIVE_ELEMENT_NAMES[e2]}生${name1}之${FIVE_ELEMENT_NAMES[e1]}，代表一方对另一方有滋养和帮助的作用。${name2}方像长辈或导师一样照顾${name1}方，${name1}方则能从${name2}方获得支持和能量。这种关系温暖和谐，但要注意生方不要过度付出而耗损自己。`,
    };
  }

  // 天干泄（我生他，但已经在上面的"生"中处理了，这里处理"泄"的情况）
  // 实际上"泄"就是反向的"生"，上面已经覆盖了
  // 如果走到这里，说明没有特殊关系
  return null;
}

export function analyzeTianGanRelations(bazi1: BaziResult, bazi2: BaziResult): TianGanRelationResult {
  const relations: TianGanRelationItem[] = [];
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
    const rel = getTianGanRelationDetail(stems1[i], stems2[i]);
    if (rel) {
      relations.push({
        ...rel,
        description: `${pillarNames[i]}：${rel.description}`,
      });
    }
  }

  // 跨柱天干对比（只取合和冲）
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (i === j) continue;
      const rel = getTianGanRelationDetail(stems1[i], stems2[j]);
      if (rel && (rel.type === '合' || rel.type === '冲')) {
        relations.push({
          ...rel,
          description: `${pillarNames[i]}甲方与${pillarNames[j]}乙方：${rel.description}`,
        });
      }
    }
  }

  return { relations };
}

// ============================================================
// C. 地支关系分析（增强版）
// ============================================================

/**
 * 获取两个地支之间的所有关系（增强版）
 */
function getDiZhiRelationDetail(b1: number, b2: number): DiZhiRelationItem {
  const name1 = BRANCH_NAMES[b1];
  const name2 = BRANCH_NAMES[b2];
  const types: string[] = [];
  const descriptions: string[] = [];

  // 六合
  for (const { branches, name } of EARTHLY_BRANCH_COMBINE) {
    if ((branches[0] === b1 && branches[1] === b2) || (branches[0] === b2 && branches[1] === b1)) {
      types.push('六合');
      descriptions.push(`${name}，六合代表和谐融洽、相互吸引，是地支关系中最吉利的关系之一。六合之人在一起容易产生亲密感，感情发展顺利。`);
    }
  }

  // 三合（检查两人地支是否属于同一三合局）
  for (const { branches, name } of EARTHLY_BRANCH_TRINE) {
    if (branches.includes(b1) && branches.includes(b2)) {
      types.push('三合');
      descriptions.push(`${name}中的两个成员，三合代表志同道合、合作无间。三合关系的人容易形成默契的搭档，在事业和感情中都能互相成就。`);
    }
  }

  // 六冲
  for (const [a, c] of EARTHLY_BRANCH_CLASH) {
    if ((a === b1 && c === b2) || (a === b2 && c === b1)) {
      types.push('六冲');
      descriptions.push(`${name1}${name2}冲，六冲代表对立和冲突，是地支关系中较为紧张的关系。六冲之人容易在价值观或生活方式上产生分歧，需要更多的理解和包容。`);
    }
  }

  // 六害
  for (const [a, c] of EARTHLY_BRANCH_HARM) {
    if ((a === b1 && c === b2) || (a === b2 && c === b1)) {
      types.push('六害');
      descriptions.push(`${name1}${name2}害，六害代表暗中妨碍和误解，容易产生猜疑或不信任。六害之人需要多沟通、多坦诚，避免因误解而伤害感情。`);
    }
  }

  // 三刑
  for (const { branches, name, type: punishType } of EARTHLY_BRANCH_PUNISHMENT) {
    if (branches.length >= 2 && branches.includes(b1) && branches.includes(b2)) {
      types.push(`三刑（${punishType}）`);
      descriptions.push(`${name}（${punishType}），三刑代表是非纠纷和刑伤，是地支关系中需要特别注意的关系。三刑之人容易因性格冲突而产生矛盾，需要双方克制和忍让。`);
    }
  }

  // 六破
  for (const [a, c] of EARTHLY_BRANCH_BREAK) {
    if ((a === b1 && c === b2) || (a === b2 && c === b1)) {
      types.push('六破');
      descriptions.push(`${name1}${name2}破，六破代表破坏和分离，容易导致关系中的不稳定因素。六破之人需要注意维护关系的稳定性，避免因小事而影响大局。`);
    }
  }

  if (types.length === 0) {
    types.push('无特殊关系');
    descriptions.push(`${name1}与${name2}之间没有特殊的地支关系，属于中性组合。`);
  }

  // 综合影响评估
  const hasPositive = types.some(t => t.includes('合'));
  const hasNegative = types.some(t => t.includes('冲') || t.includes('害') || t.includes('刑') || t.includes('破'));

  let influence: string;
  if (hasPositive && !hasNegative) {
    influence = `${name1}与${name2}之间以吉象为主，关系和谐，适合深入交往。`;
  } else if (hasNegative && !hasPositive) {
    influence = `${name1}与${name2}之间以凶象为主，关系中有摩擦，需要多加经营。`;
  } else if (hasPositive && hasNegative) {
    influence = `${name1}与${name2}之间吉凶并存，既有吸引也有冲突，属于爱恨交织的组合。`;
  } else {
    influence = `${name1}与${name2}之间关系平淡，没有明显的吉凶倾向。`;
  }

  return {
    branch1: name1,
    branch2: name2,
    types,
    descriptions,
    influence,
  };
}

export function analyzeDiZhiRelations(bazi1: BaziResult, bazi2: BaziResult): DiZhiRelationResult {
  const relations: DiZhiRelationItem[] = [];
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

  // 同柱地支对比
  for (let i = 0; i < 4; i++) {
    const rel = getDiZhiRelationDetail(branches1[i], branches2[i]);
    // 只记录有特殊关系的
    if (rel.types.length > 0 && !rel.types.includes('无特殊关系')) {
      relations.push(rel);
    }
  }

  // 跨柱地支对比（只取六合、三合、六冲）
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (i === j) continue;
      const rel = getDiZhiRelationDetail(branches1[i], branches2[j]);
      const hasImportant = rel.types.some(t =>
        t.includes('六合') || t.includes('三合') || t.includes('六冲')
      );
      if (hasImportant) {
        relations.push(rel);
      }
    }
  }

  return { relations };
}

// ============================================================
// D. 日柱关系分析（核心关系）
// ============================================================

export function analyzeDayPillarRelation(bazi1: BaziResult, bazi2: BaziResult): DayPillarRelationResult {
  const dayStem1 = bazi1.fourPillars.day.stem;
  const dayStem2 = bazi2.fourPillars.day.stem;
  const dayBranch1 = bazi1.fourPillars.day.branch;
  const dayBranch2 = bazi2.fourPillars.day.branch;

  // 天干关系
  const stemRel = getTianGanRelationDetail(dayStem1, dayStem2);
  const stemRelation = stemRel ? stemRel.description : `${STEM_NAMES[dayStem1]}与${STEM_NAMES[dayStem2]}无特殊天干关系`;

  // 地支关系
  const branchRel = getDiZhiRelationDetail(dayBranch1, dayBranch2);
  const branchRelation = branchRel.types.join('、');

  // 计算配合度
  let score = 50; // 基准分

  // 天干关系加分
  if (stemRel) {
    switch (stemRel.type) {
      case '合': score += 15; break;
      case '生': score += 10; break;
      case '比和': score += 5; break;
      case '冲': score -= 10; break;
      case '克': score -= 8; break;
      case '泄': score -= 3; break;
    }
  }

  // 地支关系加分
  for (const t of branchRel.types) {
    if (t.includes('六合')) score += 12;
    else if (t.includes('三合')) score += 8;
    else if (t.includes('六冲')) score -= 10;
    else if (t.includes('六害')) score -= 5;
    else if (t.includes('三刑')) score -= 8;
    else if (t.includes('六破')) score -= 3;
  }

  // 五行互补性
  const e1 = STEM_ELEMENT[dayStem1];
  const e2 = STEM_ELEMENT[dayStem2];

  if (FIVE_ELEMENT_SHENG[e1] === e2 || FIVE_ELEMENT_SHENG[e2] === e1) {
    score += 8;
  }
  if (e1 === e2) {
    score += 3;
  }
  if (FIVE_ELEMENT_KE[e1] === e2 || FIVE_ELEMENT_KE[e2] === e1) {
    score -= 5;
  }

  // 阴阳配合
  const yy1 = STEM_YIN_YANG[dayStem1];
  const yy2 = STEM_YIN_YANG[dayStem2];
  if (yy1 !== yy2) {
    score += 5;
  }

  const compatibility = Math.max(0, Math.min(100, Math.round(score)));

  // 生成描述
  const descParts: string[] = [];
  descParts.push(`甲方日柱为${HEAVENLY_STEMS[dayStem1]}${EARTHLY_BRANCHES[dayBranch1]}，乙方日柱为${HEAVENLY_STEMS[dayStem2]}${EARTHLY_BRANCHES[dayBranch2]}。`);

  if (stemRel) {
    switch (stemRel.type) {
      case '合':
        descParts.push(`日干相合，两人内心有天然的吸引和默契。`);
        break;
      case '生':
        descParts.push(`日干相生，一方对另一方有天然的滋养和帮助。`);
        break;
      case '比和':
        descParts.push(`日干比和，两人性格相似，容易产生共鸣。`);
        break;
      case '冲':
        descParts.push(`日干相冲，两人在性格或表达方式上有较大差异。`);
        break;
      case '克':
        descParts.push(`日干相克，一方对另一方有制约作用，需要平衡。`);
        break;
    }
  }

  if (branchRel.types.some(t => t.includes('六合'))) {
    descParts.push('日支六合，内心世界高度契合，感情基础牢固。');
  }
  if (branchRel.types.some(t => t.includes('三合'))) {
    descParts.push('日支三合，价值观和人生目标高度一致。');
  }
  if (branchRel.types.some(t => t.includes('六冲'))) {
    descParts.push('日支相冲，内心世界有冲突，需要多沟通。');
  }

  if (yy1 !== yy2) {
    descParts.push('日干阴阳相异，有互补吸引的特质。');
  }

  const description = descParts.join('');

  // 生成建议
  let advice: string;
  if (compatibility >= 80) {
    advice = '你们的日柱配合度非常高，是难得的佳配！建议珍惜这份缘分，在相处中保持真诚和用心，这段关系有很好的发展潜力。';
  } else if (compatibility >= 60) {
    advice = '你们的日柱配合度较好，有不错的感情基础。建议在相处中多关注对方的需求，保持良好的沟通，关系会越来越融洽。';
  } else if (compatibility >= 40) {
    advice = '你们的日柱配合度一般，有缘也有挑战。建议双方多包容、多理解，在差异中寻找互补，用耐心和爱心经营这段关系。';
  } else {
    advice = '你们的日柱配合度较低，相处中可能面临较多挑战。但请记住，八字只是参考，真正的感情需要双方共同努力。多沟通、多换位思考，也能建立美好的关系。';
  }

  return {
    stemRelation,
    branchRelation,
    compatibility,
    description,
    advice,
  };
}

// ============================================================
// E. 综合关系评估
// ============================================================

export function analyzeRelationships(bazi1: BaziResult, bazi2: BaziResult): RelationshipProfile {
  // 1. 荣亲关系
  const rongQin = analyzeRongQin(bazi1, bazi2);

  // 2. 天干关系
  const tianGanRelations = analyzeTianGanRelations(bazi1, bazi2);

  // 3. 地支关系
  const diZhiRelations = analyzeDiZhiRelations(bazi1, bazi2);

  // 4. 日柱关系
  const dayPillarRelation = analyzeDayPillarRelation(bazi1, bazi2);

  // 5. 计算综合评分
  let overallScore = 50; // 基准分

  // 荣亲加分
  if (rongQin.isRongQin) {
    overallScore += 10;
  }

  // 天干关系评分
  for (const rel of tianGanRelations.relations) {
    switch (rel.type) {
      case '合': overallScore += 5; break;
      case '生': overallScore += 3; break;
      case '比和': overallScore += 2; break;
      case '冲': overallScore -= 4; break;
      case '克': overallScore -= 3; break;
      case '泄': overallScore -= 1; break;
    }
  }

  // 地支关系评分
  for (const rel of diZhiRelations.relations) {
    for (const t of rel.types) {
      if (t.includes('六合')) overallScore += 6;
      else if (t.includes('三合')) overallScore += 4;
      else if (t.includes('六冲')) overallScore -= 5;
      else if (t.includes('六害')) overallScore -= 3;
      else if (t.includes('三刑')) overallScore -= 4;
      else if (t.includes('六破')) overallScore -= 2;
    }
  }

  // 日柱关系加权
  overallScore += (dayPillarRelation.compatibility - 50) * 0.3;

  overallScore = Math.max(5, Math.min(100, Math.round(overallScore)));

  // 6. 生成总结
  const summary = generateSummary(rongQin, tianGanRelations, diZhiRelations, dayPillarRelation, overallScore);

  // 7. 生成优势、挑战、建议
  const { strengths, challenges, suggestions } = generateStrengthsChallengesSuggestions(
    rongQin, tianGanRelations, diZhiRelations, dayPillarRelation, overallScore
  );

  return {
    rongQin,
    tianGanRelations,
    diZhiRelations,
    dayPillarRelation,
    overallScore,
    summary,
    strengths,
    challenges,
    suggestions,
  };
}

// ============================================================
// 辅助函数
// ============================================================

function generateSummary(
  rongQin: RongQinResult,
  tianGanRelations: TianGanRelationResult,
  diZhiRelations: DiZhiRelationResult,
  dayPillarRelation: DayPillarRelationResult,
  overallScore: number,
): string {
  const parts: string[] = [];

  if (rongQin.isRongQin) {
    parts.push('你们是荣亲关系，天生有亲近感');
  }

  const heCount = tianGanRelations.relations.filter(r => r.type === '合').length;
  const chongCount = tianGanRelations.relations.filter(r => r.type === '冲').length;
  if (heCount > 0) {
    parts.push(`天干有${heCount}组相合`);
  }
  if (chongCount > 0) {
    parts.push(`天干有${chongCount}组相冲`);
  }

  const liuHeCount = diZhiRelations.relations.filter(r => r.types.some(t => t.includes('六合'))).length;
  const sanHeCount = diZhiRelations.relations.filter(r => r.types.some(t => t.includes('三合'))).length;
  const liuChongCount = diZhiRelations.relations.filter(r => r.types.some(t => t.includes('六冲'))).length;
  if (liuHeCount > 0) {
    parts.push(`地支有${liuHeCount}组六合`);
  }
  if (sanHeCount > 0) {
    parts.push(`地支有${sanHeCount}组三合`);
  }
  if (liuChongCount > 0) {
    parts.push(`地支有${liuChongCount}组六冲`);
  }

  parts.push(`日柱配合度${dayPillarRelation.compatibility}分`);

  if (overallScore >= 70) {
    parts.push('综合来看，你们的缘分较深，关系基础较好，值得好好珍惜。');
  } else if (overallScore >= 50) {
    parts.push('综合来看，你们有缘有分也有挑战，需要双方共同努力经营。');
  } else {
    parts.push('综合来看，你们之间存在一些差异和挑战，但差异也可以成为互补的动力。');
  }

  return parts.join('。') + '';
}

function generateStrengthsChallengesSuggestions(
  rongQin: RongQinResult,
  tianGanRelations: TianGanRelationResult,
  diZhiRelations: DiZhiRelationResult,
  dayPillarRelation: DayPillarRelationResult,
  overallScore: number,
): { strengths: string[]; challenges: string[]; suggestions: string[] } {
  const strengths: string[] = [];
  const challenges: string[] = [];
  const suggestions: string[] = [];

  // 荣亲
  if (rongQin.isRongQin) {
    strengths.push('荣亲关系，年柱相同，天生有亲近感和默契');
  }

  // 天干合
  const stemHe = tianGanRelations.relations.filter(r => r.type === '合');
  if (stemHe.length > 0) {
    strengths.push(`天干有${stemHe.length}组相合（${stemHe.map(r => r.description).join('、')}），有天然的吸引力`);
  }

  // 天干生
  const stemSheng = tianGanRelations.relations.filter(r => r.type === '生');
  if (stemSheng.length > 0) {
    strengths.push(`天干有${stemSheng.length}组相生，一方能滋养另一方`);
  }

  // 天干比和
  const stemBiHe = tianGanRelations.relations.filter(r => r.type === '比和');
  if (stemBiHe.length > 0) {
    strengths.push(`天干有${stemBiHe.length}组比和，性格相似容易共鸣`);
  }

  // 地支六合
  const branchLiuHe = diZhiRelations.relations.filter(r => r.types.some(t => t.includes('六合')));
  if (branchLiuHe.length > 0) {
    strengths.push(`地支有${branchLiuHe.length}组六合，内心世界契合度高`);
  }

  // 地支三合
  const branchSanHe = diZhiRelations.relations.filter(r => r.types.some(t => t.includes('三合')));
  if (branchSanHe.length > 0) {
    strengths.push(`地支有${branchSanHe.length}组三合，价值观和目标一致`);
  }

  // 日柱配合度高
  if (dayPillarRelation.compatibility >= 70) {
    strengths.push(`日柱配合度高达${dayPillarRelation.compatibility}分，核心关系融洽`);
  }

  // 天干冲
  const stemChong = tianGanRelations.relations.filter(r => r.type === '冲');
  if (stemChong.length > 0) {
    challenges.push(`天干有${stemChong.length}组相冲（${stemChong.map(r => r.description).join('、')}），性格或行事方式有冲突`);
  }

  // 天干克
  const stemKe = tianGanRelations.relations.filter(r => r.type === '克');
  if (stemKe.length > 0) {
    challenges.push(`天干有${stemKe.length}组相克，一方可能压制另一方`);
  }

  // 地支六冲
  const branchLiuChong = diZhiRelations.relations.filter(r => r.types.some(t => t.includes('六冲')));
  if (branchLiuChong.length > 0) {
    challenges.push(`地支有${branchLiuChong.length}组六冲，价值观或生活方式有分歧`);
  }

  // 地支六害
  const branchLiuHai = diZhiRelations.relations.filter(r => r.types.some(t => t.includes('六害')));
  if (branchLiuHai.length > 0) {
    challenges.push(`地支有${branchLiuHai.length}组六害，容易产生误解和猜疑`);
  }

  // 地支三刑
  const branchSanXing = diZhiRelations.relations.filter(r => r.types.some(t => t.includes('三刑')));
  if (branchSanXing.length > 0) {
    challenges.push(`地支有${branchSanXing.length}组三刑，需要注意是非纠纷`);
  }

  // 日柱配合度低
  if (dayPillarRelation.compatibility < 40) {
    challenges.push(`日柱配合度仅${dayPillarRelation.compatibility}分，核心关系需要更多磨合`);
  }

  // 建议
  if (overallScore >= 70) {
    suggestions.push('你们的缘分较深，建议珍惜并用心经营这段关系');
  } else if (overallScore >= 50) {
    suggestions.push('你们有缘有分也有挑战，建议多沟通、多包容');
  } else {
    suggestions.push('你们之间存在一些差异，建议以开放的心态互相学习');
  }

  if (rongQin.isRongQin) {
    suggestions.push('荣亲关系的人适合做朋友或合作伙伴，也可以发展深厚的感情');
  }

  if (stemHe.length > 0) {
    suggestions.push('天干相合是你们的加分项，可以多利用这种天然的默契来增进感情');
  }

  if (stemChong.length > 0) {
    suggestions.push('天干相冲不代表不好，有时反而能激发活力，关键是要学会求同存异');
  }

  if (branchLiuChong.length > 0) {
    suggestions.push('地支相冲的人需要更多耐心，在冲突中学会换位思考');
  }

  if (dayPillarRelation.compatibility >= 60) {
    suggestions.push('日柱配合度不错，说明你们的核心性格是匹配的，这是很好的基础');
  }

  return { strengths, challenges, suggestions };
}

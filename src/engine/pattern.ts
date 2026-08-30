// ============================================================
// 八字排盘 - 格局判定引擎
// ============================================================
// 包含：正格判定（正官格、七杀格、正财格、偏财格、
//       食神格、伤官格、正印格、偏印格）、
//       特殊格局（从格、专旺格、化气格）
// ============================================================

import type { BaziResult, HeavenlyStem } from './types.ts';
import { STEM_ELEMENT, BRANCH_ELEMENT } from './constants.ts';
import {
  FIVE_ELEMENT_SHENG,
  FIVE_ELEMENT_KE,
  PATTERN_DEFINITIONS,
} from '../data/knowledgeBase.ts';

// ============================================================
// 格局结果类型
// ============================================================

export interface PatternResult {
  /** 格局名称 */
  pattern: string;
  /** 格局类型：正格 / 从格 / 专旺格 / 化气格 */
  patternType: string;
  /** 格局描述 */
  description: string;
  /** 格局特点 */
  characteristics: string[];
  /** 适合的职业方向 */
  suitableCareer: string[];
  /** 应避免的职业方向 */
  avoidCareer: string[];
  /** 格局成格条件是否满足 */
  isValid: boolean;
  /** 格局强度（0-100） */
  strength: number;
  /** 详细分析 */
  analysis: string;
}

// ============================================================
// 十神映射工具
// ============================================================

/** 获取某天干相对于日主的十神 */
function getTenGod(dayMaster: HeavenlyStem, targetStem: HeavenlyStem): string {
  const dm = dayMaster;
  const target = targetStem;

  // 同我者为比劫
  if (target === dm) return '比肩';
  if (STEM_ELEMENT[target] === STEM_ELEMENT[dm] && target !== dm) {
    // 阴阳相同为比肩，不同为劫财
    const dmYy = dm % 2; // 0=阳, 1=阴
    const targetYy = target % 2;
    return dmYy === targetYy ? '比肩' : '劫财';
  }

  // 我生者为食伤
  if (FIVE_ELEMENT_SHENG[STEM_ELEMENT[dm]] === STEM_ELEMENT[target]) {
    const dmYy = dm % 2;
    const targetYy = target % 2;
    return dmYy === targetYy ? '食神' : '伤官';
  }

  // 我克者为财
  if (FIVE_ELEMENT_KE[STEM_ELEMENT[dm]] === STEM_ELEMENT[target]) {
    const dmYy = dm % 2;
    const targetYy = target % 2;
    return dmYy === targetYy ? '偏财' : '正财';
  }

  // 克我者为官杀
  if (FIVE_ELEMENT_KE[STEM_ELEMENT[target]] === STEM_ELEMENT[dm]) {
    const dmYy = dm % 2;
    const targetYy = target % 2;
    return dmYy === targetYy ? '七杀' : '正官';
  }

  // 生我者为印
  if (FIVE_ELEMENT_SHENG[STEM_ELEMENT[target]] === STEM_ELEMENT[dm]) {
    const dmYy = dm % 2;
    const targetYy = target % 2;
    return dmYy === targetYy ? '偏印' : '正印';
  }

  return '未知';
}

// ============================================================
// 1. 正格判定
// ============================================================

/**
 * 判定正格（月令透干格）
 * 
 * 正格判定规则：
 * 1. 先看月令（月支）的本气十神
 * 2. 再看该十神是否在天干透出
 * 3. 若透出，则成格
 */
function determineNormalPattern(bazi: BaziResult): PatternResult | null {
  const monthStem = bazi.fourPillars.month.stem;
  const dayMaster = bazi.dayMaster;

  // 获取月支本气的十神
  // 获取月支本气（简化处理：用地支五行找对应天干）
  // 实际上需要查藏干，这里简化处理

  // 获取四柱天干的十神
  const yearTenGod = getTenGod(dayMaster, bazi.fourPillars.year.stem);
  const monthTenGod = getTenGod(dayMaster, bazi.fourPillars.month.stem);
  const dayTenGod = getTenGod(dayMaster, bazi.fourPillars.day.stem); // 应该是比肩
  const hourTenGod = getTenGod(dayMaster, bazi.fourPillars.hour.stem);

  const tenGods = [yearTenGod, monthTenGod, dayTenGod, hourTenGod];

  // 统计各十神出现次数
  const tenGodCount: Record<string, number> = {};
  tenGods.forEach(tg => {
    tenGodCount[tg] = (tenGodCount[tg] || 0) + 1;
  });

  // 优先判定月令透出的格局
  const monthBranchTenGod = getTenGod(dayMaster, monthStem);

  // 查找对应的格局定义
  const patternMap: Record<string, string> = {
    '正官': 'zhengGuanGe',
    '七杀': 'qiShaGe',
    '正财': 'zhengCaiGe',
    '偏财': 'pianCaiGe',
    '食神': 'shiShenGe',
    '伤官': 'shangGuanGe',
    '正印': 'zhengYinGe',
    '偏印': 'pianYinGe',
  };

  // 如果月令天干对应的十神有格局定义
  if (patternMap[monthBranchTenGod]) {
    const def = PATTERN_DEFINITIONS.find(p => p.key === patternMap[monthBranchTenGod]);
    if (def) {
      // 计算格局强度
      const strength = calculatePatternStrength(bazi, monthBranchTenGod);

      return {
        pattern: def.name,
        patternType: '正格',
        description: def.description,
        characteristics: def.characteristics,
        suitableCareer: def.suitableCareer,
        avoidCareer: def.avoidCareer,
        isValid: strength >= 60,
        strength,
        analysis: `月令${monthBranchTenGod}透干，形成${def.name}。${strength >= 60 ? '格局清纯，成格有力。' : '格局虽成但力量不足，需大运扶助。'}`,
      };
    }
  }

  // 如果月令没有成格，看其他天干
  for (const tg of ['正官', '七杀', '正财', '偏财', '食神', '伤官', '正印', '偏印']) {
    if (tenGodCount[tg] && tenGodCount[tg] >= 1) {
      const def = PATTERN_DEFINITIONS.find(p => p.key === patternMap[tg]);
      if (def) {
        const strength = calculatePatternStrength(bazi, tg);
        return {
          pattern: def.name,
          patternType: '正格',
          description: def.description,
          characteristics: def.characteristics,
          suitableCareer: def.suitableCareer,
          avoidCareer: def.avoidCareer,
          isValid: strength >= 60,
          strength,
          analysis: `${tg}透干，形成${def.name}。${strength >= 60 ? '格局有力。' : '格局力量一般。'}`,
        };
      }
    }
  }

  return null;
}

// ============================================================
// 2. 从格判定
// ============================================================

/**
 * 判定从格（从强格、从弱格、从财格、从杀格等）
 * 
 * 从格判定规则：
 * 1. 日主极弱，全局无生扶，只有克泄耗 → 从弱格
 * 2. 日主极强，全局无克泄，只有生扶 → 从强格（专旺格）
 */
function determineCongPattern(bazi: BaziResult): PatternResult | null {
  const dayMaster = bazi.dayMaster;
  const dayMasterElement = STEM_ELEMENT[dayMaster];

  // 统计全局五行力量
  let shengFuCount = 0; // 生扶日主的力量
  let keXieHaoCount = 0; // 克泄耗日主的力量

  const pillars = [
    bazi.fourPillars.year,
    bazi.fourPillars.month,
    bazi.fourPillars.day,
    bazi.fourPillars.hour,
  ];

  pillars.forEach(pillar => {
    // 天干
    const stemTenGod = getTenGod(dayMaster, pillar.stem);
    if (['比肩', '劫财', '正印', '偏印'].includes(stemTenGod)) {
      shengFuCount += 1;
    } else {
      keXieHaoCount += 1;
    }

    // 地支本气（简化：地支五行判断）
    const branchEl = BRANCH_ELEMENT[pillar.branch];
    if (branchEl === dayMasterElement) {
      shengFuCount += 1;
    } else if (FIVE_ELEMENT_SHENG[branchEl] === dayMasterElement) {
      shengFuCount += 0.5; // 生我者
    } else if (FIVE_ELEMENT_KE[branchEl] === dayMasterElement) {
      keXieHaoCount += 0.5; // 克我者
    } else {
      keXieHaoCount += 0.5; // 我克/我生者
    }
  });

  // 从弱格判定：克泄耗力量远大于生扶力量
  if (shengFuCount <= 1 && keXieHaoCount >= 6) {
    // 判断从什么格
    const caiCount = pillars.filter(p => {
      const tg = getTenGod(dayMaster, p.stem);
      return tg === '正财' || tg === '偏财';
    }).length;

    const shaCount = pillars.filter(p => {
      const tg = getTenGod(dayMaster, p.stem);
      return tg === '正官' || tg === '七杀';
    }).length;

    let patternName = '从弱格';
    let description = '日主极弱，全局无生扶，只能顺从命局中的强势五行。';

    if (caiCount >= 2) {
      patternName = '从财格';
      description = '日主极弱，财星极旺，只能顺从财势。从财格之人善于理财，财运亨通，但需注意身体健康。';
    } else if (shaCount >= 2) {
      patternName = '从杀格';
      description = '日主极弱，官杀极旺，只能顺从官杀之势。从杀格之人有威严，适合从事管理、军警等工作。';
    }

    return {
      pattern: patternName,
      patternType: '从格',
      description,
      characteristics: ['顺从大势', '善于借势', '适应力强', '不固执己见'],
      suitableCareer: ['商业', '管理', '金融', '销售'],
      avoidCareer: ['独立创业', '技术研发', '学术研究'],
      isValid: true,
      strength: 85,
      analysis: `日主极弱（生扶力量${shengFuCount}，克泄耗力量${keXieHaoCount}），形成${patternName}。从格成格条件苛刻，一旦成格则层次较高。`,
    };
  }

  // 从强格（专旺格）判定：生扶力量远大于克泄耗力量
  if (shengFuCount >= 6 && keXieHaoCount <= 1) {
    const dayMasterEl = STEM_ELEMENT[dayMaster];
    const elementName = ['木', '火', '土', '金', '水'][dayMasterEl];

    const zhuanWangNames: Record<string, string> = {
      '木': '曲直格',
      '火': '炎上格',
      '土': '稼穑格',
      '金': '从革格',
      '水': '润下格',
    };

    return {
      pattern: zhuanWangNames[elementName] || '专旺格',
      patternType: '专旺格',
      description: `日主极强，${elementName}气专旺，形成${zhuanWangNames[elementName]}。专旺格之人精力旺盛，意志坚定，适合在专一领域深耕。`,
      characteristics: ['精力旺盛', '意志坚定', '专注力强', '不轻易妥协'],
      suitableCareer: ['专业技术', '体育竞技', '艺术创作', '学术研究'],
      avoidCareer: ['需要变通的工作', '多任务并行的工作'],
      isValid: true,
      strength: 90,
      analysis: `日主极强（生扶力量${shengFuCount}，克泄耗力量${keXieHaoCount}），形成${zhuanWangNames[elementName]}。专旺格成格则精力充沛，但需注意过刚易折。`,
    };
  }

  return null;
}

// ============================================================
// 3. 化气格判定
// ============================================================

/**
 * 化气格判定（天干五合化气）
 * 
 * 化气格条件：
 * 1. 日干与月干或时干相合
 * 2. 合化后的五行在命局中极旺
 * 3. 无克制合化五行的力量
 */
function determineHuaQiPattern(bazi: BaziResult): PatternResult | null {
  const dayMaster = bazi.dayMaster;
  const yearStem = bazi.fourPillars.year.stem;
  const monthStem = bazi.fourPillars.month.stem;
  const hourStem = bazi.fourPillars.hour.stem;

  // 天干五合：(甲己, 乙庚, 丙辛, 丁壬, 戊癸)
  const hePairs: [number, number][] = [
    [0, 5], [1, 6], [2, 7], [3, 8], [4, 9],
  ];

  const huaQiElements = ['土', '金', '水', '木', '火'];

  // 检查日干是否与年干、月干、时干相合
  for (let i = 0; i < hePairs.length; i++) {
    const [a, b] = hePairs[i];
    if ((dayMaster === a && (yearStem === b || monthStem === b || hourStem === b)) ||
        (dayMaster === b && (yearStem === a || monthStem === a || hourStem === a))) {
      // 检查合化五行是否旺盛
      const huaQiElement = huaQiElements[i];
      const elementIndex = ['木', '火', '土', '金', '水'].indexOf(huaQiElement);

      // 简化：检查命局中该五行的数量
      let count = 0;
      const pillars = [bazi.fourPillars.year, bazi.fourPillars.month, bazi.fourPillars.day, bazi.fourPillars.hour];
      pillars.forEach(p => {
        if (STEM_ELEMENT[p.stem] === elementIndex) count++;
        if (BRANCH_ELEMENT[p.branch] === elementIndex) count++;
      });

      if (count >= 3) {
        return {
          pattern: `${huaQiElement}化气格`,
          patternType: '化气格',
          description: `日干与天干相合，化气为${huaQiElement}，且${huaQiElement}气旺盛。化气格之人性格随和，善于变通，有化腐朽为神奇的能力。`,
          characteristics: ['善于变通', '适应力强', '人缘极佳', '化险为夷'],
          suitableCareer: ['外交', '公关', '咨询', '调解'],
          avoidCareer: ['固执己见的工作', '需要坚持原则的工作'],
          isValid: true,
          strength: 75,
          analysis: `日干与天干五合，化气为${huaQiElement}，命局中${huaQiElement}气旺盛，形成${huaQiElement}化气格。`,
        };
      }
    }
  }

  return null;
}

// ============================================================
// 辅助函数：计算格局强度
// ============================================================

function calculatePatternStrength(bazi: BaziResult, patternTenGod: string): number {
  let strength = 50; // 基础分

  const dayMaster = bazi.dayMaster;
  const pillars = [
    bazi.fourPillars.year,
    bazi.fourPillars.month,
    bazi.fourPillars.day,
    bazi.fourPillars.hour,
  ];

  // 月令加分（月令最重要）
  const monthTenGod = getTenGod(dayMaster, bazi.fourPillars.month.stem);
  if (monthTenGod === patternTenGod) {
    strength += 20;
  }

  // 天干透出加分
  pillars.forEach(p => {
    const tg = getTenGod(dayMaster, p.stem);
    if (tg === patternTenGod) {
      strength += 10;
    }
  });

  // 地支藏干加分（简化）
  // 如果地支五行与格局十神对应的五行一致，加分

  // 有无破格因素（简化）
  // 检查是否有克制格局十神的力量

  return Math.min(100, Math.max(0, strength));
}

// ============================================================
// 主入口：格局判定
// ============================================================

export function determinePattern(bazi: BaziResult): PatternResult {
  // 优先判定特殊格局（从格、专旺格、化气格）
  const congPattern = determineCongPattern(bazi);
  if (congPattern && congPattern.isValid) {
    return congPattern;
  }

  const huaQiPattern = determineHuaQiPattern(bazi);
  if (huaQiPattern && huaQiPattern.isValid) {
    return huaQiPattern;
  }

  // 判定正格
  const normalPattern = determineNormalPattern(bazi);
  if (normalPattern) {
    return normalPattern;
  }

  // 如果都没有成格，返回"杂气格"
  return {
    pattern: '杂气格',
    patternType: '杂格',
    description: '命局五行混杂，无明显格局。杂气格之人性格多面，适应力强，但需注意专注力不足的问题。',
    characteristics: ['多才多艺', '适应力强', '兴趣广泛', '不易定性'],
    suitableCareer: ['自由职业', '跨界工作', '创意行业', '综合管理等'],
    avoidCareer: ['需要长期坚持的单一工作'],
    isValid: false,
    strength: 40,
    analysis: '命局五行力量分散，无明显成格。建议通过后天的努力和大运的扶助，在特定领域深耕，形成自己的优势。',
  };
}

export default determinePattern;

// ============================================================
// 八字排盘 - 传统神煞体系
// ============================================================
// 包含：天乙贵人、文昌贵人、桃花、驿马、将星、华盖、
//       天德贵人、月德贵人、孤辰、寡宿、红鸾、天喜等
// ============================================================

import type { BaziResult } from './types.ts';
import { BRANCH_NAMES } from '../data/knowledgeBase.ts';

// ============================================================
// 神煞定义
// ============================================================

export interface ShenSha {
  name: string;
  type: '吉' | '凶' | '中性';
  description: string;
  influence: string;
  location: string; // 在哪个柱
}

export interface ShenShaResult {
  shenShaList: ShenSha[];
  summary: string;
}

// ============================================================
// 1. 天乙贵人
// ============================================================

/** 天乙贵人查法：以日干查地支 */
const TIAN_YI_GUI_REN: Record<number, number[]> = {
  0: [0, 10],  // 甲：子、戌
  1: [1, 11],  // 乙：丑、亥
  2: [0, 10],  // 丙：子、戌
  3: [1, 11],  // 丁：丑、亥
  4: [2, 8],   // 戊：寅、申
  5: [2, 8],   // 己：寅、申
  6: [5, 3],   // 庚：巳、卯
  7: [5, 3],   // 辛：巳、卯
  8: [6, 4],   // 壬：午、辰
  9: [6, 4],   // 癸：午、辰
};

function checkTianYiGuiRen(dayMaster: number, pillars: { stem: number; branch: number }[]): ShenSha[] {
  const guiRenBranches = TIAN_YI_GUI_REN[dayMaster];
  const result: ShenSha[] = [];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];

  pillars.forEach((pillar, idx) => {
    if (guiRenBranches.includes(pillar.branch)) {
      result.push({
        name: '天乙贵人',
        type: '吉',
        description: `${pillarNames[idx]}地支${BRANCH_NAMES[pillar.branch]}为天乙贵人`,
        influence: '天乙贵人是吉神之首，主逢凶化吉、遇难呈祥。命带天乙贵人者，一生多得贵人相助，事业顺利，人际关系良好。',
        location: pillarNames[idx],
      });
    }
  });

  return result;
}

// ============================================================
// 2. 文昌贵人
// ============================================================

/** 文昌贵人查法：以日干查地支 */
const WEN_CHANG: Record<number, number> = {
  0: 10, // 甲：戌
  1: 9,  // 乙：酉
  2: 8,  // 丙：申
  3: 7,  // 丁：未
  4: 6,  // 戊：午
  5: 5,  // 己：巳
  6: 4,  // 庚：辰
  7: 3,  // 辛：卯
  8: 2,  // 壬：寅
  9: 1,  // 癸：丑
};

function checkWenChang(dayMaster: number, pillars: { stem: number; branch: number }[]): ShenSha[] {
  const wenChangBranch = WEN_CHANG[dayMaster];
  const result: ShenSha[] = [];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];

  pillars.forEach((pillar, idx) => {
    if (pillar.branch === wenChangBranch) {
      result.push({
        name: '文昌贵人',
        type: '吉',
        description: `${pillarNames[idx]}地支${BRANCH_NAMES[pillar.branch]}为文昌贵人`,
        influence: '文昌贵人主聪明智慧、学业有成。命带文昌者，头脑灵活，善于学习，考试运佳，适合从事文化、教育、学术等工作。',
        location: pillarNames[idx],
      });
    }
  });

  return result;
}

// ============================================================
// 3. 桃花（咸池）
// ============================================================

/** 桃花查法：以年支或日支查地支 */
const TAO_HUA: Record<number, number> = {
  0: 9,  // 子年/日：酉
  1: 8,  // 丑年/日：申
  2: 11, // 寅年/日：亥
  3: 10, // 卯年/日：戌
  4: 1,  // 辰年/日：丑
  5: 0,  // 巳年/日：子
  6: 3,  // 午年/日：卯
  7: 2,  // 未年/日：寅
  8: 5,  // 申年/日：巳
  9: 4,  // 酉年/日：辰
  10: 7, // 戌年/日：未
  11: 6, // 亥年/日：午
};

function checkTaoHua(yearBranch: number, dayBranch: number, pillars: { stem: number; branch: number }[]): ShenSha[] {
  const taoHuaByYear = TAO_HUA[yearBranch];
  const taoHuaByDay = TAO_HUA[dayBranch];
  const result: ShenSha[] = [];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];
  const checked = new Set<number>();

  pillars.forEach((pillar, idx) => {
    if (pillar.branch === taoHuaByYear && !checked.has(pillar.branch)) {
      checked.add(pillar.branch);
      result.push({
        name: '桃花（咸池）',
        type: '中性',
        description: `${pillarNames[idx]}地支${BRANCH_NAMES[pillar.branch]}为桃花（以年支查）`,
        influence: '桃花主人缘魅力、异性缘佳。命带桃花者，容貌出众，善于交际，感情丰富。但若桃花过旺或逢冲，则易有感情困扰。',
        location: pillarNames[idx],
      });
    }
    if (pillar.branch === taoHuaByDay && pillar.branch !== taoHuaByYear) {
      result.push({
        name: '桃花（咸池）',
        type: '中性',
        description: `${pillarNames[idx]}地支${BRANCH_NAMES[pillar.branch]}为桃花（以日支查）`,
        influence: '桃花主人缘魅力、异性缘佳。命带桃花者，容貌出众，善于交际，感情丰富。但若桃花过旺或逢冲，则易有感情困扰。',
        location: pillarNames[idx],
      });
    }
  });

  return result;
}

// ============================================================
// 4. 驿马
// ============================================================

/** 驿马查法：以年支或日支查地支 */
const YI_MA: Record<number, number> = {
  0: 6,  // 子年/日：午
  1: 7,  // 丑年/日：未
  2: 0,  // 寅年/日：子
  3: 1,  // 卯年/日：丑
  4: 6,  // 辰年/日：午
  5: 7,  // 巳年/日：未
  6: 2,  // 午年/日：寅
  7: 3,  // 未年/日：卯
  8: 6,  // 申年/日：午
  9: 7,  // 酉年/日：未
  10: 0, // 戌年/日：子
  11: 1, // 亥年/日：丑
};

function checkYiMa(yearBranch: number, dayBranch: number, pillars: { stem: number; branch: number }[]): ShenSha[] {
  const yiMaByYear = YI_MA[yearBranch];
  const yiMaByDay = YI_MA[dayBranch];
  const result: ShenSha[] = [];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];

  pillars.forEach((pillar, idx) => {
    if (pillar.branch === yiMaByYear || pillar.branch === yiMaByDay) {
      const byWhat = pillar.branch === yiMaByYear ? '年支' : '日支';
      result.push({
        name: '驿马',
        type: '中性',
        description: `${pillarNames[idx]}地支${BRANCH_NAMES[pillar.branch]}为驿马（以${byWhat}查）`,
        influence: '驿马主变动、奔波、远行。命带驿马者，一生多动少静，适合从事需要出差、旅行的工作。驿马逢冲则变动更剧烈。',
        location: pillarNames[idx],
      });
    }
  });

  return result;
}

// ============================================================
// 5. 将星
// ============================================================

/** 将星查法：以年支或日支查地支（三合局之中位） */
const JIANG_XING: Record<number, number> = {
  0: 8,  // 子年/日：申（申子辰三合，子为中位）
  1: 5,  // 丑年/日：巳（巳酉丑三合，丑为中位）
  2: 11, // 寅年/日：亥（寅午戌三合，寅为中位）
  3: 2,  // 卯年/日：寅（亥卯未三合，卯为中位）
  4: 8,  // 辰年/日：申（申子辰三合，辰为中位）
  5: 5,  // 巳年/日：巳（巳酉丑三合，巳为中位）
  6: 11, // 午年/日：亥（寅午戌三合，午为中位）
  7: 2,  // 未年/日：寅（亥卯未三合，未为中位）
  8: 8,  // 申年/日：申（申子辰三合，申为中位）
  9: 5,  // 酉年/日：巳（巳酉丑三合，酉为中位）
  10: 11,// 戌年/日：亥（寅午戌三合，戌为中位）
  11: 2, // 亥年/日：寅（亥卯未三合，亥为中位）
};

function checkJiangXing(yearBranch: number, dayBranch: number, pillars: { stem: number; branch: number }[]): ShenSha[] {
  const jiangXingByYear = JIANG_XING[yearBranch];
  const jiangXingByDay = JIANG_XING[dayBranch];
  const result: ShenSha[] = [];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];

  pillars.forEach((pillar, idx) => {
    if (pillar.branch === jiangXingByYear || pillar.branch === jiangXingByDay) {
      const byWhat = pillar.branch === jiangXingByYear ? '年支' : '日支';
      result.push({
        name: '将星',
        type: '吉',
        description: `${pillarNames[idx]}地支${BRANCH_NAMES[pillar.branch]}为将星（以${byWhat}查）`,
        influence: '将星主权威、领导才能。命带将星者，有管理才能，善于统筹，适合担任领导职务。将星与正官同柱则权力更大。',
        location: pillarNames[idx],
      });
    }
  });

  return result;
}

// ============================================================
// 6. 华盖
// ============================================================

/** 华盖查法：以年支或日支查地支（三合局之末位） */
const HUA_GAI: Record<number, number> = {
  0: 4,  // 子年/日：辰（申子辰，辰为末位）
  1: 9,  // 丑年/日：酉（巳酉丑，酉为末位）
  2: 10, // 寅年/日：戌（寅午戌，戌为末位）
  3: 7,  // 卯年/日：未（亥卯未，未为末位）
  4: 4,  // 辰年/日：辰
  5: 9,  // 巳年/日：酉
  6: 10, // 午年/日：戌
  7: 7,  // 未年/日：未
  8: 4,  // 申年/日：辰
  9: 9,  // 酉年/日：酉
  10: 10,// 戌年/日：戌
  11: 7, // 亥年/日：未
};

function checkHuaGai(yearBranch: number, dayBranch: number, pillars: { stem: number; branch: number }[]): ShenSha[] {
  const huaGaiByYear = HUA_GAI[yearBranch];
  const huaGaiByDay = HUA_GAI[dayBranch];
  const result: ShenSha[] = [];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];

  pillars.forEach((pillar, idx) => {
    if (pillar.branch === huaGaiByYear || pillar.branch === huaGaiByDay) {
      const byWhat = pillar.branch === huaGaiByYear ? '年支' : '日支';
      result.push({
        name: '华盖',
        type: '中性',
        description: `${pillarNames[idx]}地支${BRANCH_NAMES[pillar.branch]}为华盖（以${byWhat}查）`,
        influence: '华盖主孤高、才华、艺术气质。命带华盖者，性格独立，有艺术天赋，喜欢独处思考。华盖逢空亡则易有出世之念。',
        location: pillarNames[idx],
      });
    }
  });

  return result;
}

// ============================================================
// 7. 红鸾
// ============================================================

/** 红鸾查法：以年支查地支（从卯开始逆数） */
const HONG_LUAN: Record<number, number> = {
  0: 3,  // 子年：卯
  1: 2,  // 丑年：寅
  2: 1,  // 寅年：丑
  3: 0,  // 卯年：子
  4: 11, // 辰年：亥
  5: 10, // 巳年：戌
  6: 9,  // 午年：酉
  7: 8,  // 未年：申
  8: 7,  // 申年：未
  9: 6,  // 酉年：午
  10: 5, // 戌年：巳
  11: 4, // 亥年：辰
};

function checkHongLuan(yearBranch: number, pillars: { stem: number; branch: number }[]): ShenSha[] {
  const hongLuanBranch = HONG_LUAN[yearBranch];
  const result: ShenSha[] = [];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];

  pillars.forEach((pillar, idx) => {
    if (pillar.branch === hongLuanBranch) {
      result.push({
        name: '红鸾',
        type: '吉',
        description: `${pillarNames[idx]}地支${BRANCH_NAMES[pillar.branch]}为红鸾`,
        influence: '红鸾主婚姻喜庆、感情顺利。命带红鸾者，感情运佳，易遇良缘，婚姻美满。红鸾星动之年，多有婚恋之喜。',
        location: pillarNames[idx],
      });
    }
  });

  return result;
}

// ============================================================
// 8. 天喜
// ============================================================

/** 天喜查法：红鸾的对冲位 */
const TIAN_XI: Record<number, number> = {
  0: 9,  // 子年：酉（红鸾卯的对冲）
  1: 8,  // 丑年：申（红鸾寅的对冲）
  2: 7,  // 寅年：未（红鸾丑的对冲）
  3: 6,  // 卯年：午（红鸾子的对冲）
  4: 5,  // 辰年：巳（红鸾亥的对冲）
  5: 4,  // 巳年：辰（红鸾戌的对冲）
  6: 3,  // 午年：卯（红鸾酉的对冲）
  7: 2,  // 未年：寅（红鸾申的对冲）
  8: 1,  // 申年：丑（红鸾未的对冲）
  9: 0,  // 酉年：子（红鸾午的对冲）
  10: 11,// 戌年：亥（红鸾巳的对冲）
  11: 10,// 亥年：戌（红鸾辰的对冲）
};

function checkTianXi(yearBranch: number, pillars: { stem: number; branch: number }[]): ShenSha[] {
  const tianXiBranch = TIAN_XI[yearBranch];
  const result: ShenSha[] = [];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];

  pillars.forEach((pillar, idx) => {
    if (pillar.branch === tianXiBranch) {
      result.push({
        name: '天喜',
        type: '吉',
        description: `${pillarNames[idx]}地支${BRANCH_NAMES[pillar.branch]}为天喜`,
        influence: '天喜主喜庆、生育、人际关系和谐。命带天喜者，人缘极佳，易有添丁之喜，生活中常有开心之事。',
        location: pillarNames[idx],
      });
    }
  });

  return result;
}

// ============================================================
// 9. 孤辰
// ============================================================

/** 孤辰查法：以年支查地支（亥子丑人见寅，寅卯辰人见巳，巳午未人见申，申酉戌人见亥） */
const GU_CHEN: Record<number, number> = {
  0: 2,   // 子年：寅
  1: 2,   // 丑年：寅
  2: 5,   // 寅年：巳
  3: 5,   // 卯年：巳
  4: 5,   // 辰年：巳
  5: 8,   // 巳年：申
  6: 8,   // 午年：申
  7: 8,   // 未年：申
  8: 11,  // 申年：亥
  9: 11,  // 酉年：亥
  10: 11, // 戌年：亥
  11: 2,  // 亥年：寅
};

function checkGuChen(yearBranch: number, pillars: { stem: number; branch: number }[]): ShenSha[] {
  const guChenBranch = GU_CHEN[yearBranch];
  const result: ShenSha[] = [];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];

  pillars.forEach((pillar, idx) => {
    if (pillar.branch === guChenBranch) {
      result.push({
        name: '孤辰',
        type: '凶',
        description: `${pillarNames[idx]}地支${BRANCH_NAMES[pillar.branch]}为孤辰`,
        influence: '孤辰主孤独、孤僻。命带孤辰者，性格内向，不善交际，容易感到孤独。但若从事需要独立思考的工作，反而能有所成就。',
        location: pillarNames[idx],
      });
    }
  });

  return result;
}

// ============================================================
// 10. 寡宿
// ============================================================

/** 寡宿查法：以年支查地支（亥子丑人见戌，寅卯辰人见丑，巳午未人见辰，申酉戌人见未） */
const GUA_SU: Record<number, number> = {
  0: 10,  // 子年：戌
  1: 10,  // 丑年：戌
  2: 1,   // 寅年：丑
  3: 1,   // 卯年：丑
  4: 1,   // 辰年：丑
  5: 4,   // 巳年：辰
  6: 4,   // 午年：辰
  7: 4,   // 未年：辰
  8: 7,   // 申年：未
  9: 7,   // 酉年：未
  10: 7,  // 戌年：未
  11: 10, // 亥年：戌
};

function checkGuaSu(yearBranch: number, pillars: { stem: number; branch: number }[]): ShenSha[] {
  const guaSuBranch = GUA_SU[yearBranch];
  const result: ShenSha[] = [];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];

  pillars.forEach((pillar, idx) => {
    if (pillar.branch === guaSuBranch) {
      result.push({
        name: '寡宿',
        type: '凶',
        description: `${pillarNames[idx]}地支${BRANCH_NAMES[pillar.branch]}为寡宿`,
        influence: '寡宿主孤独、感情淡薄。命带寡宿者，感情路上多波折，婚姻较晚或聚少离多。建议多参加社交活动，主动拓展人际关系。',
        location: pillarNames[idx],
      });
    }
  });

  return result;
}

// ============================================================
// 11. 天德贵人
// ============================================================

/** 天德贵人查法：以月支查地支 */
const TIAN_DE: Record<number, number> = {
  0: 8,  // 子月：申
  1: 8,  // 丑月：申
  2: 6,  // 寅月：午
  3: 6,  // 卯月：午
  4: 8,  // 辰月：申
  5: 6,  // 巳月：午
  6: 6,  // 午月：午
  7: 6,  // 未月：午
  8: 8,  // 申月：申
  9: 8,  // 酉月：申
  10: 8, // 戌月：申
  11: 0, // 亥月：子
};

function checkTianDe(monthBranch: number, pillars: { stem: number; branch: number }[]): ShenSha[] {
  const tianDeBranch = TIAN_DE[monthBranch];
  const result: ShenSha[] = [];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];

  pillars.forEach((pillar, idx) => {
    if (pillar.branch === tianDeBranch) {
      result.push({
        name: '天德贵人',
        type: '吉',
        description: `${pillarNames[idx]}地支${BRANCH_NAMES[pillar.branch]}为天德贵人`,
        influence: '天德贵人主仁慈、福德。命带天德者，心地善良，乐于助人，一生多得福报，逢凶化吉的能力极强。',
        location: pillarNames[idx],
      });
    }
  });

  return result;
}

// ============================================================
// 12. 月德贵人
// ============================================================

/** 月德贵人查法：以月支查地支（三合局之生位） */
const YUE_DE: Record<number, number> = {
  0: 8,  // 子月：申（申子辰，申为生位）
  1: 8,  // 丑月：申
  2: 11, // 寅月：亥（亥卯未，亥为生位）
  3: 11, // 卯月：亥
  4: 2,  // 辰月：寅（寅午戌，寅为生位）
  5: 2,  // 巳月：寅
  6: 2,  // 午月：寅
  7: 2,  // 未月：寅
  8: 5,  // 申月：巳（巳酉丑，巳为生位）
  9: 5,  // 酉月：巳
  10: 5, // 戌月：巳
  11: 8, // 亥月：申
};

function checkYueDe(monthBranch: number, pillars: { stem: number; branch: number }[]): ShenSha[] {
  const yueDeBranch = YUE_DE[monthBranch];
  const result: ShenSha[] = [];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];

  pillars.forEach((pillar, idx) => {
    if (pillar.branch === yueDeBranch) {
      result.push({
        name: '月德贵人',
        type: '吉',
        description: `${pillarNames[idx]}地支${BRANCH_NAMES[pillar.branch]}为月德贵人`,
        influence: '月德贵人主阴德、福报。命带月德者，为人厚道，有贵人暗中相助，一生平安顺遂，少有大灾大难。',
        location: pillarNames[idx],
      });
    }
  });

  return result;
}

// ============================================================
// 主入口：计算所有神煞
// ============================================================

export function calculateShenSha(baziResult: BaziResult): ShenShaResult {
  const pillars = [
    baziResult.fourPillars.year,
    baziResult.fourPillars.month,
    baziResult.fourPillars.day,
    baziResult.fourPillars.hour,
  ];

  const dayMaster = baziResult.dayMaster;
  const yearBranch = baziResult.fourPillars.year.branch;
  const dayBranch = baziResult.fourPillars.day.branch;
  const monthBranch = baziResult.fourPillars.month.branch;

  const allShenSha: ShenSha[] = [
    ...checkTianYiGuiRen(dayMaster, pillars),
    ...checkWenChang(dayMaster, pillars),
    ...checkTaoHua(yearBranch, dayBranch, pillars),
    ...checkYiMa(yearBranch, dayBranch, pillars),
    ...checkJiangXing(yearBranch, dayBranch, pillars),
    ...checkHuaGai(yearBranch, dayBranch, pillars),
    ...checkHongLuan(yearBranch, pillars),
    ...checkTianXi(yearBranch, pillars),
    ...checkGuChen(yearBranch, pillars),
    ...checkGuaSu(yearBranch, pillars),
    ...checkTianDe(monthBranch, pillars),
    ...checkYueDe(monthBranch, pillars),
  ];

  // 生成总结
  const jiCount = allShenSha.filter(s => s.type === '吉').length;
  const xiongCount = allShenSha.filter(s => s.type === '凶').length;
  const zhongCount = allShenSha.filter(s => s.type === '中性').length;

  let summary: string;
  if (jiCount >= 4) {
    summary = `命带${jiCount}个吉神，福泽深厚。${xiongCount > 0 ? `虽有${xiongCount}个凶神，但吉能化凶。` : '一生多得贵人相助，逢凶化吉。'}`;
  } else if (xiongCount >= 3) {
    summary = `命带${xiongCount}个凶神，人生多波折。但凶神也代表历练，通过后天的努力可以转危为安。`;
  } else {
    summary = `命带${jiCount}个吉神、${xiongCount}个凶神、${zhongCount}个中性神煞，吉凶参半，人生有起有落，关键在于把握机遇、化解危机。`;
  }

  return {
    shenShaList: allShenSha,
    summary,
  };
}

export default calculateShenSha;

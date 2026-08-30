// ============================================================
// 八字排盘核心引擎 - 八字排盘核心算法（基于 lunar-javascript）
// ============================================================
// 使用 lunar-javascript（寿星万年历）作为底层排盘计算
// 包含：四柱计算、真太阳时校正、大运流年计算
// ============================================================

import { Solar } from 'lunar-javascript';
import type { EightChar as LunarEightChar } from 'lunar-javascript';
import type {
  AnalysisInput,
  BaziResult,
  DaYun,
  Gender,
  LiuNian,
  Pillar,
} from './types.ts';
import {
  BRANCH_ELEMENT,
  BRANCH_YIN_YANG,
  getNaYin,
  getSolarTimeOffset,
  HEAVENLY_STEMS,
  HIDDEN_STEMS,
  STEM_ELEMENT,
  STEM_YIN_YANG,
} from './constants.ts';
import {
  calcKongWang,
  calcMingGong,
  calcShenGong,
  calcTaiYuan,
  calcTenGodMap,
  calcFiveElementCount,
} from './derived.ts';

// ============================================================
// 天干地支字符串 → 索引映射
// ============================================================

const STEM_MAP: Record<string, number> = {
  '甲': 0, '乙': 1, '丙': 2, '丁': 3, '戊': 4,
  '己': 5, '庚': 6, '辛': 7, '壬': 8, '癸': 9,
};

const BRANCH_MAP: Record<string, number> = {
  '子': 0, '丑': 1, '寅': 2, '卯': 3, '辰': 4, '巳': 5,
  '午': 6, '未': 7, '申': 8, '酉': 9, '戌': 10, '亥': 11,
};

// ============================================================
// 真太阳时校正
// ============================================================

/**
 * 应用真太阳时校正
 * 根据经度偏移将北京时间转换为真太阳时
 * @param date 北京时间的日期
 * @param longitude 本地经度（东经为正）
 * @returns 校正后的时间
 */
export function applyTrueSolarTime(date: Date, longitude: number): Date {
  const offsetMinutes = getSolarTimeOffset(longitude);
  const result = new Date(date.getTime() + offsetMinutes * 60 * 1000);
  return result;
}

// ============================================================
// 四柱构建
// ============================================================

/**
 * 构建单柱信息
 */
function buildPillar(stem: number, branch: number): Pillar {
  return {
    stem: stem as Pillar['stem'],
    branch: branch as Pillar['branch'],
    stemElement: STEM_ELEMENT[stem],
    branchElement: BRANCH_ELEMENT[branch],
    stemYinYang: STEM_YIN_YANG[stem],
    branchYinYang: BRANCH_YIN_YANG[branch],
    hiddenStems: HIDDEN_STEMS[branch],
    naYin: getNaYin(stem as Pillar['stem'], branch),
  };
}

/**
 * 从干支字符串解析天干和地支索引
 * @param ganZhi 干支字符串，如 "丙戌"
 * @returns [天干索引, 地支索引]
 */
function parseGanZhi(ganZhi: string): [number, number] {
  const stem = STEM_MAP[ganZhi[0]];
  const branch = BRANCH_MAP[ganZhi[1]];
  if (stem === undefined || branch === undefined) {
    throw new Error(`无法解析干支字符串: ${ganZhi}`);
  }
  return [stem, branch];
}

// ============================================================
// 大运计算
// ============================================================

/**
 * 使用 lunar-javascript 计算大运列表
 *
 * @param eightChar lunar-javascript 的 EightChar 对象
 * @param gender 性别 (1=男, 0=女)
 * @param birthYear 出生年份
 * @param count 大运数量（默认8个）
 * @returns 大运列表
 */
function calcDaYunList(
  eightChar: LunarEightChar,
  gender: Gender,
  count: number = 8,
): DaYun[] {
  const genderNum = gender === 'male' ? 1 : 0;
  const yun = eightChar.getYun(genderNum);
  const daYunList = yun.getDaYun(count);

  const result: DaYun[] = [];
  for (let i = 0; i < daYunList.length; i++) {
    const dy = daYunList[i];
    const ganZhi = dy.getGanZhi();

    // 第0个大运（出生到起运前）没有干支
    if (!ganZhi) {
      continue;
    }

    const [stem, branch] = parseGanZhi(ganZhi);
    const pillar = buildPillar(stem, branch);

    result.push({
      startAge: dy.getStartAge(),
      startYear: dy.getStartYear(),
      stem: stem as DaYun['stem'],
      branch: branch as DaYun['branch'],
      pillar,
      index: i,
    });
  }

  return result;
}

// ============================================================
// 流年计算
// ============================================================

/**
 * 计算流年列表
 * 使用 lunar-javascript 的流年 API
 * @param eightChar lunar-javascript 的 EightChar 对象
 * @param gender 性别
 * @param startYear 起始年份
 * @param count 流年数量
 * @returns 流年列表
 */
function calcLiuNianList(
  eightChar: LunarEightChar,
  gender: Gender,
  startYear: number,
  count: number = 10,
): LiuNian[] {
  const genderNum = gender === 'male' ? 1 : 0;
  const yun = eightChar.getYun(genderNum);
  const daYunArr = yun.getDaYun(10);

  // 找到第一个有效的大运（index >= 1）
  let firstDaYun = daYunArr.find((dy) => dy.getIndex() >= 1);
  if (!firstDaYun) {
    // 没有大运时，直接用年份推算流年
    const liuNianList: LiuNian[] = [];
    for (let i = 0; i < count; i++) {
      const year = startYear + i;
      const solar = Solar.fromYmd(year, 6, 15); // 用年中日期获取年柱
      const lunar = solar.getLunar();
      const ec = lunar.getEightChar();
      const [stem, branch] = parseGanZhi(ec.getYear());
      const pillar = buildPillar(stem, branch);
      liuNianList.push({
        year,
        stem: stem as LiuNian['stem'],
        branch: branch as LiuNian['branch'],
        pillar,
      });
    }
    return liuNianList;
  }

  const liuNianArr = firstDaYun.getLiuNian(count);
  const liuNianList: LiuNian[] = [];

  for (const ln of liuNianArr) {
    const ganZhi = ln.getGanZhi();
    const [stem, branch] = parseGanZhi(ganZhi);
    const pillar = buildPillar(stem, branch);
    liuNianList.push({
      year: ln.getYear(),
      stem: stem as LiuNian['stem'],
      branch: branch as LiuNian['branch'],
      pillar,
    });
  }

  return liuNianList;
}

// ============================================================
// 主函数：八字排盘
// ============================================================

/**
 * 八字排盘主函数
 *
 * 使用 lunar-javascript（寿星万年历）进行底层排盘计算，
 * 保留真太阳时校正、大运流年、十神、藏干、纳音、空亡等衍生计算。
 *
 * @param input 用户输入参数
 * @returns 完整的八字排盘结果
 */
export function calculateBazi(input: AnalysisInput): BaziResult {
  // 1. 构建北京时间日期对象
  const beijingDate = new Date(
    Date.UTC(input.year, input.month - 1, input.day, input.hour, input.minute, 0),
  );

  // 2. 真太阳时校正
  const trueSolarDate = applyTrueSolarTime(beijingDate, input.longitude);
  const isAdjusted = input.longitude !== 120;

  // 3. 确定传入 lunar-javascript 的时间
  //    如果经度不是120度，使用真太阳时校正后的时间
  //    lunar-javascript 内部使用东八区时间
  const useHour = isAdjusted ? trueSolarDate.getUTCHours() : input.hour;
  const useMinute = isAdjusted ? trueSolarDate.getUTCMinutes() : input.minute;
  const useDay = isAdjusted ? trueSolarDate.getUTCDate() : input.day;
  const useMonth = isAdjusted ? trueSolarDate.getUTCMonth() + 1 : input.month;
  const useYear = isAdjusted ? trueSolarDate.getUTCFullYear() : input.year;

  // 4. 创建 Solar 对象并获取八字
  const solar = Solar.fromYmdHms(useYear, useMonth, useDay, useHour, useMinute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  // 5. 解析四柱
  const [yearStem, yearBranch] = parseGanZhi(eightChar.getYear());
  const [monthStem, monthBranch] = parseGanZhi(eightChar.getMonth());
  const [dayStem, dayBranch] = parseGanZhi(eightChar.getDay());
  const [hourStem, hourBranch] = parseGanZhi(eightChar.getTime());

  const yearPillar = buildPillar(yearStem, yearBranch);
  const monthPillar = buildPillar(monthStem, monthBranch);
  const dayPillar = buildPillar(dayStem, dayBranch);
  const hourPillar = buildPillar(hourStem, hourBranch);

  const fourPillars = {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
  };

  // 6. 日干信息
  const dayMaster = dayPillar.stem;
  const dayMasterElement = dayPillar.stemElement;
  const dayMasterYinYang = dayPillar.stemYinYang;
  const dayMasterName = HEAVENLY_STEMS[dayMaster];

  // 7. 十神
  const tenGods = calcTenGodMap(fourPillars);

  // 8. 空亡
  const kongWang = calcKongWang(yearPillar, dayPillar);

  // 9. 胎元
  const taiYuan = calcTaiYuan(monthPillar, dayPillar);

  // 10. 命宫
  const mingGong = calcMingGong(monthPillar, hourBranch);

  // 11. 身宫
  const shenGong = calcShenGong(monthPillar, hourBranch);

  // 12. 五行统计
  const fiveElementCount = calcFiveElementCount(fourPillars);

  // 13. 大运
  const daYunList = calcDaYunList(eightChar, input.gender);

  // 14. 流年（从出生年份开始）
  const liuNianList = calcLiuNianList(eightChar, input.gender, input.year, 10);

  // 15. 纳音总览
  const naYinOverview = {
    year: yearPillar.naYin,
    month: monthPillar.naYin,
    day: dayPillar.naYin,
    hour: hourPillar.naYin,
  };

  return {
    input,
    trueSolarTime: trueSolarDate,
    isTrueSolarTimeAdjusted: isAdjusted,
    fourPillars,
    dayMaster,
    dayMasterElement,
    dayMasterYinYang,
    dayMasterName,
    tenGods,
    kongWang,
    taiYuan,
    mingGong,
    shenGong,
    fiveElementCount,
    daYunList,
    liuNianList,
    naYinOverview,
  };
}

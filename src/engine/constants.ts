// ============================================================
// 八字排盘核心引擎 - 常量数据
// ============================================================

import type {
  FiveElement,
  HeavenlyStem,
  HiddenStem,
  NaYinInfo,
  ShiChenInfo,
  YinYang,
} from './types.ts';

// ---- 天干 ----

export const HEAVENLY_STEMS: readonly string[] = [
  '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸',
] as const;

/** 天干五行映射：甲乙=木, 丙丁=火, 戊己=土, 庚辛=金, 壬癸=水 */
export const STEM_ELEMENT: readonly FiveElement[] = [
  0, 0, // 甲乙 - 木
  1, 1, // 丙丁 - 火
  2, 2, // 戊己 - 土
  3, 3, // 庚辛 - 金
  4, 4, // 壬癸 - 水
] as const;

/** 天干阴阳：甲丙戊庚壬=阳, 乙丁己辛癸=阴 */
export const STEM_YIN_YANG: readonly YinYang[] = [
  0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
] as const;

// ---- 地支 ----

export const EARTHLY_BRANCHES: readonly string[] = [
  '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥',
] as const;

/** 地支五行（本气）：寅卯=木, 巳午=火, 辰未戌=土, 申酉=金, 亥子=水, 丑=土 */
export const BRANCH_ELEMENT: readonly FiveElement[] = [
  4, // 子 - 水
  2, // 丑 - 土
  0, // 寅 - 木
  0, // 卯 - 木
  2, // 辰 - 土
  1, // 巳 - 火
  1, // 午 - 火
  2, // 未 - 土
  3, // 申 - 金
  3, // 酉 - 金
  2, // 戌 - 土
  4, // 亥 - 水
] as const;

/** 地支阴阳：子寅辰午申戌=阳, 丑卯巳未酉亥=阴 */
export const BRANCH_YIN_YANG: readonly YinYang[] = [
  0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
] as const;

// ---- 五行 ----

export const FIVE_ELEMENTS: readonly string[] = [
  '木', '火', '土', '金', '水',
] as const;

export const FIVE_ELEMENT_NAMES: Record<FiveElement, string> = {
  [0]: '木',
  [1]: '火',
  [2]: '土',
  [3]: '金',
  [4]: '水',
};

// ---- 藏干 ----

/**
 * 每个地支的藏干列表
 * 本气(weight=3), 中气(weight=2), 余气(weight=1)
 * 藏干以天干索引表示
 */
export const HIDDEN_STEMS: readonly HiddenStem[][] = [
  // 子 - 癸水
  [{ stem: 9, element: 4, weight: 3 }],
  // 丑 - 己土(本气) 癸水(中气) 辛金(余气)
  [
    { stem: 5, element: 2, weight: 3 },
    { stem: 9, element: 4, weight: 2 },
    { stem: 7, element: 3, weight: 1 },
  ],
  // 寅 - 甲木(本气) 丙火(中气) 戊土(余气)
  [
    { stem: 0, element: 0, weight: 3 },
    { stem: 2, element: 1, weight: 2 },
    { stem: 4, element: 2, weight: 1 },
  ],
  // 卯 - 乙木
  [{ stem: 1, element: 0, weight: 3 }],
  // 辰 - 戊土(本气) 乙木(中气) 癸水(余气)
  [
    { stem: 4, element: 2, weight: 3 },
    { stem: 1, element: 0, weight: 2 },
    { stem: 9, element: 4, weight: 1 },
  ],
  // 巳 - 丙火(本气) 戊土(中气) 庚金(余气)
  [
    { stem: 2, element: 1, weight: 3 },
    { stem: 4, element: 2, weight: 2 },
    { stem: 6, element: 3, weight: 1 },
  ],
  // 午 - 丁火(本气) 己土(中气)
  [
    { stem: 3, element: 1, weight: 3 },
    { stem: 5, element: 2, weight: 2 },
  ],
  // 未 - 己土(本气) 丁火(中气) 乙木(余气)
  [
    { stem: 5, element: 2, weight: 3 },
    { stem: 3, element: 1, weight: 2 },
    { stem: 1, element: 0, weight: 1 },
  ],
  // 申 - 庚金(本气) 壬水(中气) 戊土(余气)
  [
    { stem: 6, element: 3, weight: 3 },
    { stem: 8, element: 4, weight: 2 },
    { stem: 4, element: 2, weight: 1 },
  ],
  // 酉 - 辛金
  [{ stem: 7, element: 3, weight: 3 }],
  // 戌 - 戊土(本气) 辛金(中气) 丁火(余气)
  [
    { stem: 4, element: 2, weight: 3 },
    { stem: 7, element: 3, weight: 2 },
    { stem: 3, element: 1, weight: 1 },
  ],
  // 亥 - 壬水(本气) 甲木(中气)
  [
    { stem: 8, element: 4, weight: 3 },
    { stem: 0, element: 0, weight: 2 },
  ],
];

// ---- 六十甲子纳音 ----

/**
 * 六十甲子纳音表
 * 索引 = (天干索引 * 6 + 地支索引 * 5) % 60
 * 但更简单的映射：以天干地支组合的六十甲子序号为索引
 * 六十甲子序号 = (天干索引 + 地支索引 * 10 - 地支索引 % 2 * 10) ... 不对
 * 正确算法：六十甲子序号 = (天干索引 * 6 + 地支索引 * 5) % 60
 *   但天干和地支必须同奇偶（即同阴阳），否则不是有效组合
 * 简化：直接用 (stemIndex * 6 + branchIndex * 5) % 60
 */

export const NA_YIN_TABLE: readonly NaYinInfo[] = [
  // 0  甲子 - 海中金
  { name: '海中金', element: 3 },
  // 1  乙丑 - 海中金
  { name: '海中金', element: 3 },
  // 2  丙寅 - 炉中火
  { name: '炉中火', element: 1 },
  // 3  丁卯 - 炉中火
  { name: '炉中火', element: 1 },
  // 4  戊辰 - 大林木
  { name: '大林木', element: 0 },
  // 5  己巳 - 大林木
  { name: '大林木', element: 0 },
  // 6  庚午 - 路旁土
  { name: '路旁土', element: 2 },
  // 7  辛未 - 路旁土
  { name: '路旁土', element: 2 },
  // 8  壬申 - 剑锋金
  { name: '剑锋金', element: 3 },
  // 9  癸酉 - 剑锋金
  { name: '剑锋金', element: 3 },
  // 10 甲戌 - 山头火
  { name: '山头火', element: 1 },
  // 11 乙亥 - 山头火
  { name: '山头火', element: 1 },
  // 12 丙子 - 涧下水
  { name: '涧下水', element: 4 },
  // 13 丁丑 - 涧下水
  { name: '涧下水', element: 4 },
  // 14 戊寅 - 城头土
  { name: '城头土', element: 2 },
  // 15 己卯 - 城头土
  { name: '城头土', element: 2 },
  // 16 庚辰 - 白蜡金
  { name: '白蜡金', element: 3 },
  // 17 辛巳 - 白蜡金
  { name: '白蜡金', element: 3 },
  // 18 壬午 - 杨柳木
  { name: '杨柳木', element: 0 },
  // 19 癸未 - 杨柳木
  { name: '杨柳木', element: 0 },
  // 20 甲申 - 泉中水
  { name: '泉中水', element: 4 },
  // 21 乙酉 - 泉中水
  { name: '泉中水', element: 4 },
  // 22 丙戌 - 屋上土
  { name: '屋上土', element: 2 },
  // 23 丁亥 - 屋上土
  { name: '屋上土', element: 2 },
  // 24 戊子 - 霹雳火
  { name: '霹雳火', element: 1 },
  // 25 己丑 - 霹雳火
  { name: '霹雳火', element: 1 },
  // 26 庚寅 - 松柏木
  { name: '松柏木', element: 0 },
  // 27 辛卯 - 松柏木
  { name: '松柏木', element: 0 },
  // 28 壬辰 - 长流水
  { name: '长流水', element: 4 },
  // 29 癸巳 - 长流水
  { name: '长流水', element: 4 },
  // 30 甲午 - 砂石金
  { name: '砂石金', element: 3 },
  // 31 乙未 - 砂石金
  { name: '砂石金', element: 3 },
  // 32 丙申 - 山下火
  { name: '山下火', element: 1 },
  // 33 丁酉 - 山下火
  { name: '山下火', element: 1 },
  // 34 戊戌 - 平地木
  { name: '平地木', element: 0 },
  // 35 己亥 - 平地木
  { name: '平地木', element: 0 },
  // 36 庚子 - 壁上土
  { name: '壁上土', element: 2 },
  // 37 辛丑 - 壁上土
  { name: '壁上土', element: 2 },
  // 38 壬寅 - 金箔金
  { name: '金箔金', element: 3 },
  // 39 癸卯 - 金箔金
  { name: '金箔金', element: 3 },
  // 40 甲辰 - 覆灯火
  { name: '覆灯火', element: 1 },
  // 41 乙巳 - 覆灯火
  { name: '覆灯火', element: 1 },
  // 42 丙午 - 天河水
  { name: '天河水', element: 4 },
  // 43 丁未 - 天河水
  { name: '天河水', element: 4 },
  // 44 戊申 - 大驿土
  { name: '大驿土', element: 2 },
  // 45 己酉 - 大驿土
  { name: '大驿土', element: 2 },
  // 46 庚戌 - 钗钏金
  { name: '钗钏金', element: 3 },
  // 47 辛亥 - 钗钏金
  { name: '钗钏金', element: 3 },
  // 48 壬子 - 桑柘木
  { name: '桑柘木', element: 0 },
  // 49 癸丑 - 桑柘木
  { name: '桑柘木', element: 0 },
  // 50 甲寅 - 大溪水
  { name: '大溪水', element: 4 },
  // 51 乙卯 - 大溪水
  { name: '大溪水', element: 4 },
  // 52 丙辰 - 沙中土
  { name: '沙中土', element: 2 },
  // 53 丁巳 - 沙中土
  { name: '沙中土', element: 2 },
  // 54 戊午 - 天上火
  { name: '天上火', element: 1 },
  // 55 己未 - 天上火
  { name: '天上火', element: 1 },
  // 56 庚申 - 石榴木
  { name: '石榴木', element: 0 },
  // 57 辛酉 - 石榴木
  { name: '石榴木', element: 0 },
  // 58 壬戌 - 大海水
  { name: '大海水', element: 4 },
  // 59 癸亥 - 大海水
  { name: '大海水', element: 4 },
];

/**
 * 获取六十甲子纳音序号
 * @param stem 天干索引 (0-9)
 * @param branch 地支索引 (0-11)
 * @returns 六十甲子序号 (0-59)
 */
export function getSexagenaryIndex(stem: HeavenlyStem, branch: number): number {
  return (stem * 6 + branch * 5) % 60;
}

/**
 * 获取纳音信息
 * @param stem 天干索引
 * @param branch 地支索引
 * @returns 纳音信息
 */
export function getNaYin(stem: HeavenlyStem, branch: number): NaYinInfo {
  const index = getSexagenaryIndex(stem, branch);
  return NA_YIN_TABLE[index];
}

// ---- 时辰 ----

export const SHI_CHEN_LIST: readonly ShiChenInfo[] = [
  { name: '子时', branch: 0, startHour: 23, endHour: 1 },   // 23:00-01:00
  { name: '丑时', branch: 1, startHour: 1, endHour: 3 },    // 01:00-03:00
  { name: '寅时', branch: 2, startHour: 3, endHour: 5 },    // 03:00-05:00
  { name: '卯时', branch: 3, startHour: 5, endHour: 7 },    // 05:00-07:00
  { name: '辰时', branch: 4, startHour: 7, endHour: 9 },    // 07:00-09:00
  { name: '巳时', branch: 5, startHour: 9, endHour: 11 },   // 09:00-11:00
  { name: '午时', branch: 6, startHour: 11, endHour: 13 },  // 11:00-13:00
  { name: '未时', branch: 7, startHour: 13, endHour: 15 },  // 13:00-15:00
  { name: '申时', branch: 8, startHour: 15, endHour: 17 },  // 15:00-17:00
  { name: '酉时', branch: 9, startHour: 17, endHour: 19 },  // 17:00-19:00
  { name: '戌时', branch: 10, startHour: 19, endHour: 21 }, // 19:00-21:00
  { name: '亥时', branch: 11, startHour: 21, endHour: 23 }, // 21:00-23:00
];

// ---- 十神关系表 ----

/**
 * 十神关系查找表
 * 索引方式：tenGodTable[日干五行][他干五行][阴阳是否相同(0=同,1=异)]
 * 五行顺序：木0 火1 土2 金3 水4
 * 阴阳：0=同性, 1=异性
 *
 * 十神推导规则（以日干为中心）：
 * 同性（阴阳相同）：比肩(同我) 劫财(同我) 食神(我生) 伤官(我生) 偏财(我克) 正财(我克) 七杀(克我) 正官(克我) 偏印(生我) 正印(生我)
 * 异性（阴阳不同）：比肩→劫财, 劫财→比肩, 食神→伤官, 伤官→食神, 偏财→正财, 正财→偏财, 七杀→正官, 正官→七杀, 偏印→正印, 正印→偏印
 *
 * 简化规则：
 * - 同我（同五行）：同性=比肩，异性=劫财
 * - 我生（日干生）：同性=食神，异性=伤官
 * - 我克（日干克）：同性=偏财，异性=正财
 * - 克我（克日干）：同性=七杀，异性=正官
 * - 生我（生日干）：同性=偏印，异性=正印
 */

export const TEN_GOD_TABLE: readonly string[][][] = [
  // 日干 = 木 (0)
  [
    // 同性 (0)
    ['biJian', 'shangGuan', 'pianCai', 'qiSha', 'pianYin'],    // 他干: 木 火 土 金 水
    // 异性 (1)
    ['jieCai', 'shiShen', 'zhengCai', 'zhengGuan', 'zhengYin'], // 他干: 木 火 土 金 水
  ],
  // 日干 = 火 (1)
  [
    ['biJian', 'shangGuan', 'pianCai', 'qiSha', 'pianYin'],
    ['jieCai', 'shiShen', 'zhengCai', 'zhengGuan', 'zhengYin'],
  ],
  // 日干 = 土 (2)
  [
    ['biJian', 'shangGuan', 'pianCai', 'qiSha', 'pianYin'],
    ['jieCai', 'shiShen', 'zhengCai', 'zhengGuan', 'zhengYin'],
  ],
  // 日干 = 金 (3)
  [
    ['biJian', 'shangGuan', 'pianCai', 'qiSha', 'pianYin'],
    ['jieCai', 'shiShen', 'zhengCai', 'zhengGuan', 'zhengYin'],
  ],
  // 日干 = 水 (4)
  [
    ['biJian', 'shangGuan', 'pianCai', 'qiSha', 'pianYin'],
    ['jieCai', 'shiShen', 'zhengCai', 'zhengGuan', 'zhengYin'],
  ],
];

// ---- 十神中文名 ----

export const TEN_GOD_NAMES: Record<string, string> = {
  biJian: '比肩',
  jieCai: '劫财',
  shiShen: '食神',
  shangGuan: '伤官',
  pianCai: '偏财',
  zhengCai: '正财',
  qiSha: '七杀',
  zhengGuan: '正官',
  pianYin: '偏印',
  zhengYin: '正印',
};

// ---- 五行生克关系 ----

/** 五行相生：木生火, 火生土, 土生金, 金生水, 水生木 */
export const FIVE_ELEMENT_GENERATE: readonly number[] = [1, 2, 3, 4, 0];

/** 五行相克：木克土, 土克水, 水克火, 火克金, 金克木 */
export const FIVE_ELEMENT_OVERCOME: readonly number[] = [2, 3, 4, 0, 1];

// ---- 空亡查找表 ----

/**
 * 空亡地支查找表
 * 索引为地支索引(0-11)，值为该地支所在旬的空亡地支
 * 六十甲子分为六旬，每旬10个干支
 * 甲子旬(0-9): 戌亥空
 * 甲戌旬(10-19): 申酉空
 * 甲申旬(20-29): 午未空
 * 甲午旬(30-39): 辰巳空
 * 甲辰旬(40-49): 寅卯空
 * 甲寅旬(50-59): 子丑空
 *
 * 用地支查空亡：找到该地支在六十甲子中的位置，确定所属旬，返回空亡地支
 */
export const KONG_WANG_BY_BRANCH: readonly (readonly number[])[] = [
  // 子(0): 在甲子旬和甲寅旬出现
  //   甲子(0) → 戌亥空; 甲寅(50) → 子丑空
  //   取第一次出现: 甲子旬 → [10, 11]
  [10, 11],
  // 丑(1): 甲丑(1) → 戌亥空
  [10, 11],
  // 寅(2): 甲寅(2) → 戌亥空
  [10, 11],
  // 卯(3): 甲卯(3) → 戌亥空
  [10, 11],
  // 辰(4): 甲辰(4) → 戌亥空
  [10, 11],
  // 巳(5): 甲巳(5) → 戌亥空
  [10, 11],
  // 午(6): 甲午(6) → 戌亥空
  [10, 11],
  // 未(7): 甲未(7) → 戌亥空
  [10, 11],
  // 申(8): 甲申(8) → 戌亥空
  [10, 11],
  // 酉(9): 甲酉(9) → 戌亥空
  [10, 11],
  // 戌(10): 甲戌(10) → 申酉空
  [8, 9],
  // 亥(11): 甲亥(11) → 申酉空
  [8, 9],
];

/**
 * 根据六十甲子序号获取空亡地支
 * @param sexagenaryIndex 六十甲子序号 (0-59)
 * @returns 空亡的两个地支索引
 */
export function getKongWangBranches(sexagenaryIndex: number): readonly [number, number] {
  const xunIndex = Math.floor(sexagenaryIndex / 10);
  // 每旬的空亡：第0旬=戌亥, 第1旬=申酉, 第2旬=午未, 第3旬=辰巳, 第4旬=寅卯, 第5旬=子丑
  const kongWangMap: readonly (readonly [number, number])[] = [
    [10, 11], // 甲子旬：戌亥空
    [8, 9],   // 甲戌旬：申酉空
    [6, 7],   // 甲申旬：午未空
    [4, 5],   // 甲午旬：辰巳空
    [2, 3],   // 甲辰旬：寅卯空
    [0, 1],   // 甲寅旬：子丑空
  ];
  return kongWangMap[xunIndex];
}

/** 月支固定：1=寅, 2=卯, ..., 12=丑 */
export const MONTH_BRANCHES: readonly number[] = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1,
] as const;

// ---- 真太阳时相关常量 ----

/** 北京时间基准经度（东经120度） */
export const BEIJING_LONGITUDE = 120.0;

/** 时区基准经度（东八区 = 120度） */
export const TIMEZONE_LONGITUDE = 120.0;

/**
 * 真太阳时校正
 * 根据经度偏移计算真太阳时与平太阳时的差值
 * 每度经度差 = 4分钟
 * @param longitude 本地经度（东经为正）
 * @param baseLongitude 基准经度（默认120度）
 * @returns 时间偏移量（分钟），正数表示本地比基准快
 */
export function getSolarTimeOffset(longitude: number, baseLongitude: number = TIMEZONE_LONGITUDE): number {
  return (longitude - baseLongitude) * 4;
}

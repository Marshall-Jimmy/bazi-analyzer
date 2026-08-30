// ============================================================
// 八字排盘核心引擎 - 类型定义
// ============================================================

// ---- 天干 ----
export const HeavenlyStem = {
  Jia: 0,   // 甲
  Yi: 1,    // 乙
  Bing: 2,  // 丙
  Ding: 3,  // 丁
  Wu: 4,    // 戊
  Ji: 5,    // 己
  Geng: 6,  // 庚
  Xin: 7,   // 辛
  Ren: 8,   // 壬
  Gui: 9,   // 癸
} as const;
export type HeavenlyStem = (typeof HeavenlyStem)[keyof typeof HeavenlyStem];

// ---- 地支 ----
export const EarthlyBranch = {
  Zi: 0,    // 子
  Chou: 1,  // 丑
  Yin: 2,   // 寅
  Mao: 3,   // 卯
  Chen: 4,  // 辰
  Si: 5,    // 巳
  Wu: 6,    // 午
  Wei: 7,   // 未
  Shen: 8,  // 申
  You: 9,   // 酉
  Xu: 10,   // 戌
  Hai: 11,  // 亥
} as const;
export type EarthlyBranch = (typeof EarthlyBranch)[keyof typeof EarthlyBranch];

// ---- 五行 ----
export const FiveElement = {
  Wood: 0,  // 木
  Fire: 1,  // 火
  Earth: 2, // 土
  Metal: 3, // 金
  Water: 4, // 水
} as const;
export type FiveElement = (typeof FiveElement)[keyof typeof FiveElement];

// ---- 阴阳 ----
export const YinYang = {
  Yang: 0,  // 阳
  Yin: 1,   // 阴
} as const;
export type YinYang = (typeof YinYang)[keyof typeof YinYang];

// ---- 性别 ----
export const Gender = {
  Male: 'male',
  Female: 'female',
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

// ---- 十神 ----
export const TenGod = {
  BiJian: 'biJian',         // 比肩
  JieCai: 'jieCai',         // 劫财
  ShiShen: 'shiShen',       // 食神
  ShangGuan: 'shangGuan',   // 伤官
  PianCai: 'pianCai',       // 偏财
  ZhengCai: 'zhengCai',     // 正财
  QiSha: 'qiSha',           // 七杀（偏官）
  ZhengGuan: 'zhengGuan',  // 正官
  PianYin: 'pianYin',       // 偏印（枭神）
  ZhengYin: 'zhengYin',     // 正印
} as const;
export type TenGod = (typeof TenGod)[keyof typeof TenGod];

// ---- 节气名称 ----
export const SolarTermName = {
  XiaoHan: '小寒',
  DaHan: '大寒',
  LiChun: '立春',
  YuShui: '雨水',
  JingZhe: '惊蛰',
  ChunFen: '春分',
  QingMing: '清明',
  GuYu: '谷雨',
  LiXia: '立夏',
  XiaoMan: '小满',
  MangZhong: '芒种',
  XiaZhi: '夏至',
  XiaoShu: '小暑',
  DaShu: '大暑',
  LiQiu: '立秋',
  ChuShu: '处暑',
  BaiLu: '白露',
  QiuFen: '秋分',
  HanLu: '寒露',
  ShuangJiang: '霜降',
  LiDong: '立冬',
  XiaoXue: '小雪',
  DaXue: '大雪',
  DongZhi: '冬至',
} as const;
export type SolarTermName = (typeof SolarTermName)[keyof typeof SolarTermName];

// ---- 藏干信息 ----
export interface HiddenStem {
  stem: HeavenlyStem;
  element: FiveElement;
  /** 藏干强度权重：本气=3, 中气=2, 余气=1 */
  weight: number;
}

// ---- 单柱（天干 + 地支） ----
export interface Pillar {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  /** 天干五行 */
  stemElement: FiveElement;
  /** 地支五行（本气五行） */
  branchElement: FiveElement;
  /** 天干阴阳 */
  stemYinYang: YinYang;
  /** 地支阴阳 */
  branchYinYang: YinYang;
  /** 地支藏干 */
  hiddenStems: HiddenStem[];
  /** 纳音信息 */
  naYin: NaYinInfo;
}

// ---- 四柱 ----
export interface FourPillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
}

// ---- 纳音信息 ----
export interface NaYinInfo {
  name: string;       // 纳音名称，如"海中金"
  element: FiveElement; // 纳音五行
}

// ---- 空亡信息 ----
export interface KongWangInfo {
  /** 空亡的地支列表 */
  branches: EarthlyBranch[];
  /** 是否为年柱空亡 */
  fromYear: boolean;
  /** 是否为日柱空亡 */
  fromDay: boolean;
}

// ---- 胎元 ----
export interface TaiYuanInfo {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  stemName: string;
  branchName: string;
}

// ---- 命宫 ----
export interface MingGongInfo {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  stemName: string;
  branchName: string;
}

// ---- 身宫 ----
export interface ShenGongInfo {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  stemName: string;
  branchName: string;
}

// ---- 大运 ----
export interface DaYun {
  /** 起运年龄（含小数，如 3.5 表示3岁半起运） */
  startAge: number;
  /** 起运年份 */
  startYear: number;
  /** 大运天干 */
  stem: HeavenlyStem;
  /** 大运地支 */
  branch: EarthlyBranch;
  /** 大运柱 */
  pillar: Pillar;
  /** 大运序号（从1开始） */
  index: number;
}

// ---- 流年 ----
export interface LiuNian {
  year: number;
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  pillar: Pillar;
}

// ---- 五行统计 ----
export interface FiveElementCount {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
  total: number;
}

// ---- 八字排盘完整结果 ----
export interface BaziResult {
  /** 用户原始输入 */
  input: AnalysisInput;
  /** 校正后的真太阳时 */
  trueSolarTime: Date;
  /** 是否使用了真太阳时校正 */
  isTrueSolarTimeAdjusted: boolean;
  /** 四柱 */
  fourPillars: FourPillars;
  /** 日干（日元） */
  dayMaster: HeavenlyStem;
  /** 日干五行 */
  dayMasterElement: FiveElement;
  /** 日干阴阳 */
  dayMasterYinYang: YinYang;
  /** 日干名称 */
  dayMasterName: string;
  /** 十神分布（四柱天干+藏干的十神） */
  tenGods: TenGodMap;
  /** 空亡信息 */
  kongWang: KongWangInfo;
  /** 胎元 */
  taiYuan: TaiYuanInfo;
  /** 命宫 */
  mingGong: MingGongInfo;
  /** 身宫 */
  shenGong: ShenGongInfo;
  /** 五行统计 */
  fiveElementCount: FiveElementCount;
  /** 大运列表 */
  daYunList: DaYun[];
  /** 流年列表（当前大运内的流年） */
  liuNianList: LiuNian[];
  /** 纳音总览 */
  naYinOverview: {
    year: NaYinInfo;
    month: NaYinInfo;
    day: NaYinInfo;
    hour: NaYinInfo;
  };
}

// ---- 十神映射 ----
export interface TenGodMap {
  /** 四柱天干的十神 */
  stems: {
    year: TenGod;
    month: TenGod;
    day: TenGod;   // 日干自身，固定为比肩
    hour: TenGod;
  };
  /** 四柱地支藏干的十神 */
  branchHiddenStems: {
    year: { stem: HeavenlyStem; tenGod: TenGod; weight: number }[];
    month: { stem: HeavenlyStem; tenGod: TenGod; weight: number }[];
    day: { stem: HeavenlyStem; tenGod: TenGod; weight: number }[];
    hour: { stem: HeavenlyStem; tenGod: TenGod; weight: number }[];
  };
}

// ---- 用户输入参数 ----
export interface AnalysisInput {
  /** 公历年 */
  year: number;
  /** 公历月 (1-12) */
  month: number;
  /** 公历日 (1-31) */
  day: number;
  /** 小时 (0-23) */
  hour: number;
  /** 分钟 (0-59) */
  minute: number;
  /** 性别 */
  gender: Gender;
  /** 经度（东经为正，西经为负），如北京 116.4 */
  longitude: number;
}

// ---- 节气数据 ----
export interface SolarTermData {
  /** 节气名称 */
  name: string;
  /** 节气时刻（UTC时间戳） */
  timestamp: number;
  /** 节气对应的月份（寅月=1, 卯月=2, ... 丑月=12） */
  monthIndex: number;
  /** 是否为节（vs 气） */
  isJie: boolean;
}

// ---- 时辰信息 ----
export interface ShiChenInfo {
  /** 时辰名称 */
  name: string;
  /** 对应地支 */
  branch: EarthlyBranch;
  /** 起始小时（含） */
  startHour: number;
  /** 结束小时（不含） */
  endHour: number;
}

// ============================================================
// 八字排盘核心引擎 - 统一导出
// ============================================================

// ---- 类型导出 ----
export type {
  AnalysisInput,
  BaziResult,
  DaYun,
  FiveElementCount,
  FourPillars,
  HiddenStem,
  KongWangInfo,
  LiuNian,
  MingGongInfo,
  NaYinInfo,
  Pillar,
  ShiChenInfo,
  ShenGongInfo,
  SolarTermData,
  TaiYuanInfo,
  TenGodMap,
} from './types.ts';

export {
  EarthlyBranch,
  FiveElement,
  Gender,
  HeavenlyStem,
  SolarTermName,
  TenGod,
  YinYang,
} from './types.ts';

// ---- 常量导出 ----
export {
  BRANCH_ELEMENT,
  BRANCH_YIN_YANG,
  EARTHLY_BRANCHES,
  FIVE_ELEMENT_GENERATE,
  FIVE_ELEMENT_NAMES,
  FIVE_ELEMENT_OVERCOME,
  FIVE_ELEMENTS,
  getKongWangBranches,
  getNaYin,
  getSexagenaryIndex,
  getSolarTimeOffset,
  HEAVENLY_STEMS,
  HIDDEN_STEMS,
  KONG_WANG_BY_BRANCH,
  MONTH_BRANCHES,
  NA_YIN_TABLE,
  SHI_CHEN_LIST,
  STEM_ELEMENT,
  STEM_YIN_YANG,
  TEN_GOD_NAMES,
  TEN_GOD_TABLE,
} from './constants.ts';

// ---- 节气计算导出 ----
export {
  getDaysBetweenTerms,
  getDongZhiTimestamp,
  getLiChunTimestamp,
  getMonthIndexBySolarTerm,
  getSolarTermTimestamp,
  getYearSolarTerms,
  isAfterLiChun,
  SOLAR_TERM_IS_JIE,
  SOLAR_TERM_MONTH_MAP,
  SOLAR_TERM_NAMES,
} from './solarTerms.ts';

// ---- 衍生计算导出 ----
export {
  calcFiveElementCount,
  calcKongWang,
  calcMingGong,
  calcNaYinOverview,
  calcShenGong,
  calcTaiYuan,
  calcTenGodMap,
  getTenGod,
} from './derived.ts';

// ---- 核心算法导出 ----
export {
  applyTrueSolarTime,
  calculateBazi,
} from './baziCalculator.ts';

// ---- 多维分析引擎导出 ----
export {
  analyzeDayMasterStrength,
  analyzeFiveElementBalance,
  analyzeYongShen,
  analyzePersonality,
  analyzeCareer,
  analyzeWealth,
  analyzeMarriage,
  analyzeChildren,
  analyzeFamily,
  analyzeHealth,
  analyzeDaYunTrend,
  analyzeLiuNian,
  generateAdvice,
  runFullAnalysis,
} from './analysis.ts';

export type {
  DayMasterStrengthResult,
  FiveElementBalanceResult,
  YongShenResult,
  PersonalityResult,
  CareerResult,
  WealthResult,
  MarriageResult,
  ChildrenResult,
  FamilyResult,
  HealthResult,
  DaYunTrendResult,
  LiuNianResult,
  AdviceResult,
  FullAnalysisResult,
} from './analysis.ts';

// ---- 合盘分析引擎导出 ----
export {
  analyzeSynastry,
  compareHeavenlyStems,
  compareEarthlyBranches,
  compareDayPillars,
  analyzeYongShenComplement,
  analyzeDaYunSync,
  analyzeLiuNianResonance,
  generateSynastryAdvice,
} from './synastry.ts';

export type {
  StemRelationItem,
  BranchRelationItem,
  DayPillarCompareResult,
  YongShenComplementResult,
  DaYunSyncResult,
  LiuNianResonanceResult,
  SynastryAdvice,
  KeyYearItem,
  SynastryResult,
} from './synastry.ts';

// ---- 特殊关系分析引擎导出 ----
export {
  analyzeRongQin,
  analyzeTianGanRelations,
  analyzeDiZhiRelations,
  analyzeDayPillarRelation,
  analyzeRelationships,
} from './relationships.ts';

export type {
  RongQinResult,
  TianGanRelationItem,
  TianGanRelationResult,
  DiZhiRelationItem,
  DiZhiRelationResult,
  DayPillarRelationResult,
  RelationshipProfile,
} from './relationships.ts';

// ---- 二十八星宿体系导出 ----
export {
  getBenMingXingXiu28,
  toXingXiu27,
  analyzeXingXiuRelation,
  getRongQinDescription,
  XINGXIU_RELATION_DESCRIPTIONS,
  XINGXIU_28_NAMES,
  XINGXIU_27_NAMES,
  XINGXIU_28_ELEMENTS,
  RONG_QIN_DESCRIPTIONS,
  XINGXIU_RELATION_DETAILS,
} from './xingxiu.ts';

export type {
  XingXiuRelationResult,
  RongQinDetail,
  RelationDetail,
} from './xingxiu.ts';

// ---- 神煞体系导出 ----
export {
  calculateShenSha,
} from './shensha.ts';

export type {
  ShenSha,
  ShenShaResult,
} from './shensha.ts';

// ---- 格局判定引擎导出 ----
export {
  determinePattern,
} from './pattern.ts';

export type {
  PatternResult,
} from './pattern.ts';

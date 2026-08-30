// ============================================================
// 八字排盘 - 知识库数据结构
// ============================================================
// 包含：五行生克、十神含义、格局定义、地支关系、
//       天干关系、日主强弱、用神喜忌、调候、
//       性格/事业/财富/婚姻/子女/健康/大运/流年规则
// ============================================================

import type { FiveElement } from '../engine/types.ts';

// ============================================================
// 一、五行生克关系
// ============================================================

/** 五行相生：A生B */
export const FIVE_ELEMENT_SHENG: Record<FiveElement, FiveElement> = {
  [0]: 1, // 木生火
  [1]: 2, // 火生土
  [2]: 3, // 土生金
  [3]: 4, // 金生水
  [4]: 0, // 水生木
};

/** 五行相克：A克B */
export const FIVE_ELEMENT_KE: Record<FiveElement, FiveElement> = {
  [0]: 2, // 木克土
  [1]: 3, // 火克金
  [2]: 4, // 土克水
  [3]: 0, // 金克木
  [4]: 1, // 水克火
};

/** 五行被生：谁生A */
export const FIVE_ELEMENT_BEING_SHENG: Record<FiveElement, FiveElement> = {
  [0]: 4, // 水生木
  [1]: 0, // 木生火
  [2]: 1, // 火生土
  [3]: 2, // 土生金
  [4]: 3, // 金生水
};

/** 五行被克：谁克A */
export const FIVE_ELEMENT_BEING_KE: Record<FiveElement, FiveElement> = {
  [0]: 3, // 金克木
  [1]: 4, // 水克火
  [2]: 0, // 木克土
  [3]: 1, // 火克金
  [4]: 2, // 土克水
};

/** 五行中文名 */
export const FIVE_ELEMENT_NAMES_MAP: Record<FiveElement, string> = {
  [0]: '木',
  [1]: '火',
  [2]: '土',
  [3]: '金',
  [4]: '水',
};

/** 五行生克关系描述 */
export const FIVE_ELEMENT_RELATIONS = {
  sheng: [
    '木生火：木为火之母，木旺则火得以延续',
    '火生土：火为土之母，火旺则土得以凝聚',
    '土生金：土为金之母，土旺则金得以蕴藏',
    '金生水：金为水之母，金旺则水得以清冽',
    '水生木：水为木之母，水旺则木得以滋润',
  ],
  ke: [
    '木克土：木能破土，根须穿透土层',
    '火克金：火能熔金，高温使金属熔化',
    '土克水：土能挡水，堤坝可阻洪水',
    '金克木：金能伐木，利器可断木材',
    '水克火：水能灭火，水流可浇烈焰',
  ],
};

// ============================================================
// 二、五行与方位、颜色、行业、季节对应
// ============================================================

/** 五行与方位对应 */
export const FIVE_ELEMENT_DIRECTIONS: Record<FiveElement, string[]> = {
  [0]: ['东方'],       // 木 - 东
  [1]: ['南方'],       // 火 - 南
  [2]: ['中央', '四方'], // 土 - 中/四方
  [3]: ['西方'],       // 金 - 西
  [4]: ['北方'],       // 水 - 北
};

/** 五行与颜色对应 */
export const FIVE_ELEMENT_COLORS: Record<FiveElement, string[]> = {
  [0]: ['绿色', '青色'],     // 木
  [1]: ['红色', '紫色'],     // 火
  [2]: ['黄色', '棕色'],     // 土
  [3]: ['白色', '银色'],     // 金
  [4]: ['黑色', '蓝色', '灰色'], // 水
};

/** 五行与行业对应 */
export const FIVE_ELEMENT_INDUSTRIES: Record<FiveElement, string[]> = {
  [0]: [
    '林业', '农业', '园艺', '木材加工', '家具制造',
    '出版', '教育', '文化', '中医药', '环保',
    '服装', '纺织', '造纸', '设计创意', '心理咨询',
  ],
  [1]: [
    '餐饮', '烹饪', '能源', '电力', '照明',
    '电子科技', '互联网', '传媒', '广告', '影视',
    '演艺', '美容化妆', '化学工业', '心理咨询', '宗教',
  ],
  [2]: [
    '房地产', '建筑', '土木工程', '矿业', '农业种植',
    '仓储物流', '物业管理', '畜牧业', '保险', '顾问咨询',
    '考古', '陶瓷', '石材加工', '殡葬服务', '秘书行政',
  ],
  [3]: [
    '金融', '银行', '证券', '投资', '法律',
    '机械制造', '汽车', '五金', '珠宝首饰', '医疗器械',
    '军警', '武术', '审计', '外科手术', '鉴定评估',
  ],
  [4]: [
    '航运', '物流运输', '旅游', '水产', '酒水饮料',
    '贸易', '商业批发', '信息通信', '清洁服务', '侦探调查',
    '水利', '渔业', '自由职业', '演艺娱乐', '夜生活服务',
  ],
};

/** 五行与季节对应 */
export const FIVE_ELEMENT_SEASONS: Record<FiveElement, { season: string; months: number[]; peak: number; weak: number }> = {
  [0]: { season: '春季', months: [1, 2, 3], peak: 2, weak: 8 },   // 木旺于寅卯月(2,3月)
  [1]: { season: '夏季', months: [4, 5, 6], peak: 5, weak: 11 },  // 火旺于巳午月(5,6月)
  [2]: { season: '四季末', months: [3, 6, 9, 12], peak: 6, weak: 0 }, // 土旺于辰戌丑未
  [3]: { season: '秋季', months: [7, 8, 9], peak: 8, weak: 2 },   // 金旺于申酉月(8,9月)
  [4]: { season: '冬季', months: [10, 11, 12], peak: 11, weak: 5 }, // 水旺于亥子月(11,12月)
};

// ============================================================
// 三、十神含义详解
// ============================================================

export interface TenGodDetail {
  key: string;
  name: string;
  nature: string;
  description: string;
  keywords: string[];
  positive: string[];
  negative: string[];
  career: string[];
  relation: string;
}

export const TEN_GOD_DETAILS: Record<string, TenGodDetail> = {
  biJian: {
    key: 'biJian',
    name: '比肩',
    nature: '中性偏刚',
    description: '与日主同五行同阴阳，代表自我力量的延伸。比肩为自身之分身，象征独立自主、意志坚定、竞争意识强。',
    keywords: ['独立', '自主', '竞争', '刚毅', '自尊'],
    positive: ['独立自主', '意志坚定', '有主见', '能独当一面', '朋友运好'],
    negative: ['固执己见', '不愿合作', '竞争过度', '容易树敌', '感情中缺乏妥协'],
    career: ['自由职业', '合伙人制', '独立经营', '专业领域', '竞争性行业'],
    relation: '代表兄弟、朋友、同辈、竞争者、合伙人',
  },
  jieCai: {
    key: 'jieCai',
    name: '劫财',
    nature: '偏凶',
    description: '与日主同五行异阴阳，代表外来的助力或争夺。劫财有夺财之意，象征好胜心强、慷慨大方但容易破财。',
    keywords: ['好胜', '慷慨', '争夺', '冲动', '义气'],
    positive: ['慷慨大方', '义气深重', '行动力强', '社交能力强', '敢于冒险'],
    negative: ['容易破财', '好赌好争', '冲动行事', '感情多变', '口舌是非'],
    career: ['销售', '公关', '运动员', '军警', '创业'],
    relation: '代表兄弟姐妹、竞争对手、损友、合伙人之争',
  },
  shiShen: {
    key: 'shiShen',
    name: '食神',
    nature: '吉星',
    description: '日主所生且同阴阳，代表才华的温和流露。食神为福星，象征温和平稳、才华内敛、享受生活。',
    keywords: ['温和', '才华', '享受', '福气', '口福'],
    positive: ['温和有礼', '才华横溢', '享受生活', '人缘极佳', '有口福'],
    negative: ['过于安逸', '缺乏进取', '容易懒散', '优柔寡断', '贪图享乐'],
    career: ['美食', '艺术', '文学创作', '教育', '演艺', '心理咨询'],
    relation: '代表子女（男命）、晚辈、学生、才华展现',
  },
  shangGuan: {
    key: 'shangGuan',
    name: '伤官',
    nature: '偏凶偏吉',
    description: '日主所生且异阴阳，代表才华的激烈展现。伤官聪明绝顶但锋芒毕露，象征才华出众、叛逆创新、口才极佳。',
    keywords: ['才华', '叛逆', '口才', '创新', '锋芒'],
    positive: ['聪明绝顶', '才华出众', '口才极佳', '创新能力强', '不拘一格'],
    negative: ['锋芒太露', '恃才傲物', '容易得罪人', '感情波折', '叛逆不羁'],
    career: ['律师', '演艺', '自由职业', '技术研发', '艺术创作', '评论家'],
    relation: '代表子女（男命）、晚辈、才华展现、叛逆行为',
  },
  pianCai: {
    key: 'pianCai',
    name: '偏财',
    nature: '吉星',
    description: '日主所克且同阴阳，代表意外之财和社交能力。偏财象征人缘广泛、善于交际、有商业头脑、意外收获。',
    keywords: ['人缘', '商业', '意外', '社交', '慷慨'],
    positive: ['人缘广泛', '商业头脑', '善于交际', '意外收获', '慷慨大方'],
    negative: ['感情不专', '贪图享受', '投机心理', '用钱大方', '异性缘复杂'],
    career: ['商业贸易', '投资', '销售', '外交', '娱乐业', '社交平台'],
    relation: '代表父亲（男命）、情人（男命）、意外收入、社交关系',
  },
  zhengCai: {
    key: 'zhengCai',
    name: '正财',
    nature: '吉星',
    description: '日主所克且异阴阳，代表正当收入和勤劳务实。正财象征勤劳踏实、节俭持家、稳定收入、务实可靠。',
    keywords: ['勤劳', '踏实', '节俭', '稳定', '务实'],
    positive: ['勤劳踏实', '节俭持家', '收入稳定', '务实可靠', '善于理财'],
    negative: ['过于保守', '缺乏魄力', '因循守旧', '小气吝啬', '不善于变通'],
    career: ['会计', '银行', '公务员', '制造业', '农业', '行政管理'],
    relation: '代表妻子（男命）、正当收入、稳定财富、务实的态度',
  },
  qiSha: {
    key: 'qiSha',
    name: '七杀',
    nature: '偏凶',
    description: '克日主且同阴阳，代表外来的压力和挑战。七杀又称偏官，象征威严果断、压力重重、危机感强、有魄力。',
    keywords: ['威严', '压力', '果断', '危机', '魄力'],
    positive: ['果断有魄力', '意志坚强', '有领导力', '敢于面对挑战', '不畏强权'],
    negative: ['压力过大', '容易树敌', '性格急躁', '健康风险', '是非纠纷'],
    career: ['军警', '法律', '外科医生', '企业高管', '竞技体育', '危机管理'],
    relation: '代表女命之情人、压力来源、挑战者、权威人物',
  },
  zhengGuan: {
    key: 'zhengGuan',
    name: '正官',
    nature: '吉星',
    description: '克日主且异阴阳，代表正当的约束和规范。正官象征正直守规、有责任感、受人尊敬、事业稳定。',
    keywords: ['正直', '守规', '责任', '受人尊敬', '稳定'],
    positive: ['正直守信', '有责任感', '受人尊敬', '事业稳定', '循规蹈矩'],
    negative: ['过于拘谨', '缺乏魄力', '胆小怕事', '墨守成规', '容易受制于人'],
    career: ['公务员', '教师', '管理岗位', '法律', '审计', '行政管理'],
    relation: '代表丈夫（女命）、上级领导、法律规范、社会地位',
  },
  pianYin: {
    key: 'pianYin',
    name: '偏印',
    nature: '偏凶',
    description: '生日主且同阴阳，又称枭神。偏印代表非正统的智慧和庇护，象征思维独特、直觉敏锐、但容易多疑善变。',
    keywords: ['独特', '直觉', '多疑', '善变', '孤僻'],
    positive: ['思维独特', '直觉敏锐', '领悟力强', '善于研究', '有神秘感'],
    negative: ['多疑善变', '孤僻不合群', '容易抑郁', '做事反复', '缺乏耐心'],
    career: ['研究开发', '玄学命理', '心理学', '艺术创作', '非主流行业', 'IT技术'],
    relation: '代表继母、养母、偏门师长、非传统知识',
  },
  zhengYin: {
    key: 'zhengYin',
    name: '正印',
    nature: '吉星',
    description: '生日主且异阴阳，代表正统的庇护和学识。正印象征仁慈宽厚、学识渊博、受人庇护、心地善良。',
    keywords: ['仁慈', '学识', '庇护', '善良', '宽容'],
    positive: ['仁慈宽厚', '学识渊博', '心地善良', '受人尊重', '善于学习'],
    negative: ['依赖性强', '缺乏主见', '过于理想化', '优柔寡断', '容易受骗'],
    career: ['教育', '学术研究', '文化出版', '慈善事业', '医疗保健', '宗教'],
    relation: '代表母亲、师长、文凭学历、庇护者、传统知识',
  },
};

// ============================================================
// 四、格局定义
// ============================================================

export interface PatternDefinition {
  key: string;
  name: string;
  tenGodKey: string;
  description: string;
  conditions: string;
  characteristics: string[];
  suitableCareer: string[];
  avoidCareer: string[];
}

export const PATTERN_DEFINITIONS: PatternDefinition[] = [
  {
    key: 'zhengGuanGe',
    name: '正官格',
    tenGodKey: 'zhengGuan',
    description: '月令正官透干或本气为正官，主贵不主富。为人端正守纪，有领导才能，适合从政或管理。',
    conditions: '月支本气为正官，且天干透出正官',
    characteristics: ['为人端正', '守纪律', '有责任感', '受人尊敬', '事业心强'],
    suitableCareer: ['公务员', '行政管理', '法律', '教育', '企业管理'],
    avoidCareer: ['投机行业', '高风险投资', '叛逆性行业'],
  },
  {
    key: 'qiShaGe',
    name: '七杀格（偏官格）',
    tenGodKey: 'qiSha',
    description: '月令七杀透干或本气为七杀，主威严果断。为人有魄力，适合武职或竞争激烈的环境。',
    conditions: '月支本气为七杀，且天干透出七杀',
    characteristics: ['果断有魄力', '威严有势', '敢于冒险', '领导力强', '不畏困难'],
    suitableCareer: ['军警', '法律', '外科医生', '企业高管', '竞技体育'],
    avoidCareer: ['安逸型工作', '文书行政', '精细手工'],
  },
  {
    key: 'zhengCaiGe',
    name: '正财格',
    tenGodKey: 'zhengCai',
    description: '月令正财透干或本气为正财，主勤劳务实。为人踏实肯干，善于理财，财运稳定。',
    conditions: '月支本气为正财，且天干透出正财',
    characteristics: ['勤劳踏实', '善于理财', '收入稳定', '节俭持家', '务实可靠'],
    suitableCareer: ['金融', '会计', '银行', '制造业', '商业'],
    avoidCareer: ['投机赌博', '高风险创业', '艺术创作'],
  },
  {
    key: 'pianCaiGe',
    name: '偏财格',
    tenGodKey: 'pianCai',
    description: '月令偏财透干或本气为偏财，主人缘广泛。为人善于交际，有商业头脑，财运有意外之喜。',
    conditions: '月支本气为偏财，且天干透出偏财',
    characteristics: ['人缘广泛', '商业头脑', '善于交际', '慷慨大方', '有意外之财'],
    suitableCareer: ['商业贸易', '投资', '销售', '外交', '娱乐业'],
    avoidCareer: ['刻板行政', '固定薪资工作', '研究型工作'],
  },
  {
    key: 'shiShenGe',
    name: '食神格',
    tenGodKey: 'shiShen',
    description: '月令食神透干或本气为食神，为福星入命。为人温和平稳，才华内敛，一生衣食无忧。',
    conditions: '月支本气为食神，且天干透出食神',
    characteristics: ['温和有礼', '才华内敛', '享受生活', '人缘极佳', '有口福'],
    suitableCareer: ['美食', '艺术', '文学', '教育', '演艺', '心理咨询'],
    avoidCareer: ['高风险行业', '军警武职', '竞争激烈行业'],
  },
  {
    key: 'shangGuanGe',
    name: '伤官格',
    tenGodKey: 'shangGuan',
    description: '月令伤官透干或本气为伤官，主才华出众但锋芒毕露。为人聪明绝顶，适合技术或自由职业。',
    conditions: '月支本气为伤官，且天干透出伤官',
    characteristics: ['聪明绝顶', '才华出众', '口才极佳', '创新能力强', '不拘一格'],
    suitableCareer: ['律师', '演艺', '技术研发', '艺术创作', '自由职业'],
    avoidCareer: ['公务员', '行政管理', '传统保守行业'],
  },
  {
    key: 'zhengYinGe',
    name: '正印格',
    tenGodKey: 'zhengYin',
    description: '月令正印透干或本气为正印，主仁慈宽厚。为人学识渊博，心地善良，受人尊重。',
    conditions: '月支本气为正印，且天干透出正印',
    characteristics: ['仁慈宽厚', '学识渊博', '心地善良', '善于学习', '受人尊重'],
    suitableCareer: ['教育', '学术研究', '文化出版', '慈善', '医疗保健'],
    avoidCareer: ['高风险投资', '军警武职', '竞争激烈的商业'],
  },
  {
    key: 'pianYinGe',
    name: '偏印格',
    tenGodKey: 'pianYin',
    description: '月令偏印透干或本气为偏印，主思维独特。为人直觉敏锐，善于研究，适合非传统领域。',
    conditions: '月支本气为偏印，且天干透出偏印',
    characteristics: ['思维独特', '直觉敏锐', '领悟力强', '善于研究', '有神秘感'],
    suitableCareer: ['研究开发', '玄学命理', '心理学', '艺术创作', 'IT技术'],
    avoidCareer: ['传统行政', '固定流程工作', '需要强社交的工作'],
  },
];

// ============================================================
// 五、地支关系表
// ============================================================

/** 地支六冲：子午冲、丑未冲、寅申冲、卯酉冲、辰戌冲、巳亥冲 */
export const EARTHLY_BRANCH_CLASH: [number, number][] = [
  [0, 6],   // 子午冲
  [1, 7],   // 丑未冲
  [2, 8],   // 寅申冲
  [3, 9],   // 卯酉冲
  [4, 10],  // 辰戌冲
  [5, 11],  // 巳亥冲
];

/** 地支六合：子丑合土、寅亥合木、卯戌合火、辰酉合金、巳申合水、午未合火/土 */
export const EARTHLY_BRANCH_COMBINE: { branches: [number, number]; element: FiveElement; name: string }[] = [
  { branches: [0, 1], element: 2, name: '子丑合土' },
  { branches: [2, 11], element: 0, name: '寅亥合木' },
  { branches: [3, 10], element: 1, name: '卯戌合火' },
  { branches: [4, 9], element: 3, name: '辰酉合金' },
  { branches: [5, 8], element: 4, name: '巳申合水' },
  { branches: [6, 7], element: 2, name: '午未合火/土' },
];

/** 地支三合局 */
export const EARTHLY_BRANCH_TRINE: { branches: [number, number, number]; element: FiveElement; name: string }[] = [
  { branches: [2, 6, 10], element: 1, name: '寅午戌三合火局' },
  { branches: [3, 7, 11], element: 0, name: '卯未亥三合木局' },
  { branches: [4, 8, 0], element: 3, name: '辰申子三合水局' },
  { branches: [5, 9, 1], element: 2, name: '巳酉丑三合金局' },
];

/** 地支三会局 */
export const EARTHLY_BRANCH_MEET: { branches: [number, number, number]; element: FiveElement; name: string }[] = [
  { branches: [2, 3, 4], element: 0, name: '寅卯辰三会东方木局' },
  { branches: [5, 6, 7], element: 1, name: '巳午未三会南方火局' },
  { branches: [8, 9, 10], element: 3, name: '申酉戌三会西方金局' },
  { branches: [11, 0, 1], element: 4, name: '亥子丑三会北方水局' },
];

/** 地支相刑 */
export const EARTHLY_BRANCH_PUNISHMENT: { branches: number[]; name: string; type: string }[] = [
  { branches: [0, 0], name: '子刑卯', type: '无礼之刑' },
  { branches: [3, 3], name: '卯刑子', type: '无礼之刑' },
  { branches: [1, 7], name: '丑刑未', type: '恃势之刑' },
  { branches: [7, 1], name: '未刑丑', type: '恃势之刑' },
  { branches: [5, 5], name: '寅刑巳', type: '无恩之刑' },
  { branches: [2, 2], name: '寅刑巳', type: '无恩之刑' },
  { branches: [8, 8], name: '巳刑申', type: '无恩之刑' },
  { branches: [2, 8], name: '寅巳申三刑', type: '无恩之刑' },
  { branches: [4, 10], name: '辰刑戌', type: '自刑' },
  { branches: [10, 4], name: '戌刑辰', type: '自刑' },
  { branches: [9, 9], name: '酉刑酉', type: '自刑' },
  { branches: [0, 0], name: '亥刑亥', type: '自刑' },
  { branches: [11, 11], name: '亥刑亥', type: '自刑' },
  { branches: [6, 6], name: '午刑午', type: '自刑' },
];

/** 地支相害（六害） */
export const EARTHLY_BRANCH_HARM: [number, number][] = [
  [0, 7],   // 子未害
  [1, 6],   // 丑午害
  [2, 5],   // 寅巳害
  [3, 4],   // 卯辰害
  [8, 11],  // 申亥害
  [9, 10],  // 酉戌害
];

/** 地支相破 */
export const EARTHLY_BRANCH_BREAK: [number, number][] = [
  [0, 3],   // 子卯破
  [1, 10],  // 丑戌破
  [2, 7],   // 寅未破
  [4, 9],   // 辰酉破
  [5, 8],   // 巳申破
  [6, 11],  // 午亥破
];

// ============================================================
// 六、天干关系
// ============================================================

/** 天干五合：甲己合土、乙庚合金、丙辛合水、丁壬合木、戊癸合火 */
export const HEAVENLY_STEM_COMBINE: { stems: [number, number]; element: FiveElement; name: string }[] = [
  { stems: [0, 5], element: 2, name: '甲己合化土' },
  { stems: [1, 6], element: 3, name: '乙庚合化金' },
  { stems: [2, 7], element: 4, name: '丙辛合化水' },
  { stems: [3, 8], element: 0, name: '丁壬合化木' },
  { stems: [4, 9], element: 1, name: '戊癸合化火' },
];

/** 天干相冲：甲庚冲、乙辛冲、丙壬冲、丁癸冲 */
export const HEAVENLY_STEM_CLASH: [number, number][] = [
  [0, 6], // 甲庚冲
  [1, 7], // 乙辛冲
  [2, 8], // 丙壬冲
  [3, 9], // 丁癸冲
];

/** 天干相克关系 */
export const HEAVENLY_STEM_OVERCOME: { stems: [number, number]; name: string }[] = [
  { stems: [0, 4], name: '甲木克戊土' },
  { stems: [0, 5], name: '甲木克己土' },
  { stems: [1, 4], name: '乙木克戊土' },
  { stems: [1, 5], name: '乙木克己土' },
  { stems: [2, 6], name: '丙火克庚金' },
  { stems: [2, 7], name: '丙火克辛金' },
  { stems: [3, 6], name: '丁火克庚金' },
  { stems: [3, 7], name: '丁火克辛金' },
  { stems: [4, 8], name: '戊土克壬水' },
  { stems: [4, 9], name: '戊土克癸水' },
  { stems: [5, 8], name: '己土克壬水' },
  { stems: [5, 9], name: '己土克癸水' },
  { stems: [6, 0], name: '庚金克甲木' },
  { stems: [6, 1], name: '庚金克乙木' },
  { stems: [7, 0], name: '辛金克甲木' },
  { stems: [7, 1], name: '辛金克乙木' },
  { stems: [8, 2], name: '壬水克丙火' },
  { stems: [8, 3], name: '壬水克丁火' },
  { stems: [9, 2], name: '癸水克丙火' },
  { stems: [9, 3], name: '癸水克丁火' },
];

// ============================================================
// 七、日主强弱判断规则
// ============================================================

/**
 * 日主强弱判断依据
 * 得令：月支五行生日主或与日主同五行
 * 得地：日支、时支五行生日主或与日主同五行
 * 得势：四柱中同类五行数量多
 */
export const DAY_MASTER_STRENGTH_RULES = {
  /** 得令判断：月支本气与日主的关系 */
  deLing: {
    sameElement: '月支本气与日主同五行，得令，日主有力',
    generateElement: '月支本气生日主，得令，日主有源',
    overcomeElement: '月支本气克日主，失令，日主受制',
    beingOvercomeElement: '日主克月支本气，日主耗力，偏弱',
    beingGeneratedElement: '日主生月支本气，日主泄气，偏弱',
  },
  /** 得地判断：日支、时支对日主的支撑 */
  deDi: {
    dayBranchSupport: '日支本气生日主或同五行，得地',
    hourBranchSupport: '时支本气生日主或同五行，得地',
    dayBranchOppose: '日支本气克日主，失地',
    hourBranchOppose: '时支本气克日主，失地',
  },
  /** 得势判断：全局五行力量对比 */
  deShi: {
    manySameElement: '同类五行数量多，得势',
    manyGenerateElement: '生我五行数量多，有源，得势',
    manyOvercomeElement: '克我五行数量多，失势',
    manyConsumeElement: '我克我生五行数量多，泄耗，失势',
  },
  /** 综合判断 */
  overall: {
    strong: '得令得地得势，日主偏强',
    weak: '失令失地失势，日主偏弱',
    balanced: '得令失地或失令得地，日主中和',
    extremelyStrong: '三得俱全且力量悬殊，日主极强',
    extremelyWeak: '三失俱全且力量悬殊，日主极弱（从格）',
  },
};

// ============================================================
// 八、用神喜忌推断逻辑
// ============================================================

/**
 * 用神喜忌推断规则
 * 强日主：克泄耗为用（官杀、食伤、财星）
 * 弱日主：生扶为用（印星、比劫）
 */
export const YONG_SHEN_RULES = {
  strong: {
    yongShen: '克泄耗为用神',
    description: '日主偏强，需要克、泄、耗来平衡',
    preferred: {
      ke: '官杀克日主，抑制过旺之气',
      xie: '食伤泄日主，将旺气转化为才华',
      hao: '财星耗日主，消耗过旺之精力',
    },
    avoid: '印星和比劫会进一步增强日主，为忌神',
  },
  weak: {
    yongShen: '生扶为用神',
    description: '日主偏弱，需要生、扶来增强',
    preferred: {
      sheng: '印星生日主，补充日主元气',
      fu: '比劫扶日主，增强日主力量',
    },
    avoid: '官杀、食伤、财星会进一步消耗日主，为忌神',
  },
  balanced: {
    yongShen: '以调候为要',
    description: '日主中和，以调候用神为主',
    preferred: '根据季节寒暖选择调候五行',
    avoid: '避免严重破坏平衡的五行',
  },
};

// ============================================================
// 九、调候用神表
// ============================================================

/**
 * 调候用神表
 * 根据出生月份（地支）和日主五行，确定调候用神
 * 月份索引：0=子, 1=丑, 2=寅, 3=卯, 4=辰, 5=巳, 6=午, 7=未, 8=申, 9=酉, 10=戌, 11=亥
 */
export const TIAO_HOU_TABLE: Record<number, Record<FiveElement, { yongShen: FiveElement; description: string }>> = {
  // 子月（农历十一月）- 严冬
  0: {
    [0]: { yongShen: 1, description: '木日主生于子月，水旺木寒，急需丙火调候暖局' },
    [1]: { yongShen: 2, description: '火日主生于子月，水旺火弱，需木来通关生火' },
    [2]: { yongShen: 1, description: '土日主生于子月，水旺土冻，急需丙火暖局解冻' },
    [3]: { yongShen: 1, description: '金日主生于子月，金寒水冷，急需丙火温暖' },
    [4]: { yongShen: 2, description: '水日主生于子月，水旺成冰，需土来筑堤防水泛' },
  },
  // 丑月（农历十二月）- 隆冬
  1: {
    [0]: { yongShen: 1, description: '木日主生于丑月，天寒地冻，急需丙火暖局' },
    [1]: { yongShen: 0, description: '火日主生于丑月，寒气重，需木来生火助暖' },
    [2]: { yongShen: 1, description: '土日主生于丑月，冻土不生万物，急需丙火解冻' },
    [3]: { yongShen: 1, description: '金日主生于丑月，金寒水冷，急需丙火温暖' },
    [4]: { yongShen: 1, description: '水日主生于丑月，寒水成冰，急需丙火暖局' },
  },
  // 寅月（农历正月）- 初春
  2: {
    [0]: { yongShen: 4, description: '木日主生于寅月，春木初生，需水滋润' },
    [1]: { yongShen: 0, description: '火日主生于寅月，春寒未尽，需木来生火' },
    [2]: { yongShen: 4, description: '土日主生于寅月，春土干燥，需水润泽' },
    [3]: { yongShen: 4, description: '金日主生于寅月，春金休囚，需土生金' },
    [4]: { yongShen: 1, description: '水日主生于寅月，春水渐退，需金生水' },
  },
  // 卯月（农历二月）- 仲春
  3: {
    [0]: { yongShen: 4, description: '木日主生于卯月，木旺需水润泽' },
    [1]: { yongShen: 0, description: '火日主生于卯月，木旺火相，需木来助' },
    [2]: { yongShen: 4, description: '土日主生于卯月，木旺克土，需火通关' },
    [3]: { yongShen: 2, description: '金日主生于卯月，木旺金弱，需土生金' },
    [4]: { yongShen: 3, description: '水日主生于卯月，木旺泄水，需金生水' },
  },
  // 辰月（农历三月）- 暮春
  4: {
    [0]: { yongShen: 1, description: '木日主生于辰月，春末木气渐退，需火泄秀' },
    [1]: { yongShen: 0, description: '火日主生于辰月，湿土晦火，需木来疏土' },
    [2]: { yongShen: 1, description: '土日主生于辰月，湿土需火温暖' },
    [3]: { yongShen: 4, description: '金日主生于辰月，湿土生金，需水洗金' },
    [4]: { yongShen: 3, description: '水日主生于辰月，土旺克水，需金生水' },
  },
  // 巳月（农历四月）- 初夏
  5: {
    [0]: { yongShen: 4, description: '木日主生于巳月，火旺木焚，急需水来救' },
    [1]: { yongShen: 2, description: '火日主生于巳月，火势渐旺，需土来泄' },
    [2]: { yongShen: 4, description: '土日主生于巳月，火炎土燥，需水润泽' },
    [3]: { yongShen: 4, description: '金日主生于巳月，火旺克金，急需水来制火' },
    [4]: { yongShen: 3, description: '水日主生于巳月，火旺水竭，需金生水' },
  },
  // 午月（农历五月）- 仲夏
  6: {
    [0]: { yongShen: 4, description: '木日主生于午月，火炎木渴，急需水来滋润' },
    [1]: { yongShen: 4, description: '火日主生于午月，火旺极盛，需水来济' },
    [2]: { yongShen: 4, description: '土日主生于午月，火炎土焦，急需水来润泽' },
    [3]: { yongShen: 4, description: '金日主生于午月，火旺金熔，急需水来救' },
    [4]: { yongShen: 3, description: '水日主生于午月，火旺水干，需金生水' },
  },
  // 未月（农历六月）- 季夏
  7: {
    [0]: { yongShen: 4, description: '木日主生于未月，暑热未退，需水润泽' },
    [1]: { yongShen: 4, description: '火日主生于未月，余热未尽，需水来济' },
    [2]: { yongShen: 4, description: '土日主生于未月，燥土需水滋润' },
    [3]: { yongShen: 4, description: '金日主生于未月，燥土不生金，需水润土生金' },
    [4]: { yongShen: 3, description: '水日主生于未月，土旺克水，需金生水' },
  },
  // 申月（农历七月）- 初秋
  8: {
    [0]: { yongShen: 1, description: '木日主生于申月，金旺克木，需火来制金' },
    [1]: { yongShen: 0, description: '火日主生于申月，金旺火退，需木来助火' },
    [2]: { yongShen: 4, description: '土日主生于申月，金旺泄土，需火来生土' },
    [3]: { yongShen: 4, description: '金日主生于申月，金旺需水泄秀' },
    [4]: { yongShen: 3, description: '水日主生于申月，金旺水相，需木泄水' },
  },
  // 酉月（农历八月）- 仲秋
  9: {
    [0]: { yongShen: 1, description: '木日主生于酉月，金旺木绝，急需火来制金' },
    [1]: { yongShen: 0, description: '火日主生于酉月，金旺火囚，需木来助火' },
    [2]: { yongShen: 1, description: '土日主生于酉月，金旺泄土，需火来生土' },
    [3]: { yongShen: 4, description: '金日主生于酉月，金旺需水泄秀' },
    [4]: { yongShen: 1, description: '水日主生于酉月，金多水浊，需火来暖' },
  },
  // 戌月（农历九月）- 暮秋
  10: {
    [0]: { yongShen: 1, description: '木日主生于戌月，秋深木凋，需水来润' },
    [1]: { yongShen: 0, description: '火日主生于戌月，秋深火退，需木来助' },
    [2]: { yongShen: 4, description: '土日主生于戌月，燥土需水润泽' },
    [3]: { yongShen: 4, description: '金日主生于戌月，秋金有余，需水泄秀' },
    [4]: { yongShen: 3, description: '水日主生于戌月，土旺克水，需金生水' },
  },
  // 亥月（农历十月）- 初冬
  11: {
    [0]: { yongShen: 1, description: '木日主生于亥月，水旺木寒，需火来暖' },
    [1]: { yongShen: 2, description: '火日主生于亥月，水旺火弱，需木通关' },
    [2]: { yongShen: 1, description: '土日主生于亥月，水旺土寒，需火来暖' },
    [3]: { yongShen: 1, description: '金日主生于亥月，水旺金寒，需火来暖' },
    [4]: { yongShen: 2, description: '水日主生于亥月，水旺成灾，需土来制' },
  },
};

// ============================================================
// 十、性格特质推导规则
// ============================================================

/** 日主五行对应的基本性格 */
export const DAY_MASTER_PERSONALITY: Record<FiveElement, { traits: string[]; description: string }> = {
  [0]: {
    traits: ['仁慈', '善良', '有同情心', '向上', '正直', '有主见'],
    description: '木日主之人，天性仁慈，心地善良，有向上生长的力量。为人正直有主见，富有同情心，但有时过于固执。',
  },
  [1]: {
    traits: ['热情', '礼貌', '急躁', '有活力', '善于表达', '重感情'],
    description: '火日主之人，热情奔放，有活力，善于表达。为人有礼貌，重感情，但有时过于急躁，容易冲动。',
  },
  [2]: {
    traits: ['稳重', '踏实', '包容', '守信', '固执', '重实际'],
    description: '土日主之人，性格稳重踏实，包容大度，重信用。为人实际可靠，但有时过于固执，缺乏变通。',
  },
  [3]: {
    traits: ['果断', '义气', '刚毅', '重义轻利', '果断', '有魄力'],
    description: '金日主之人，性格刚毅果断，重义气，有魄力。为人果断明快，但有时过于刚强，容易伤人。',
  },
  [4]: {
    traits: ['智慧', '灵活', '善变', '深沉', '善于观察', '有谋略'],
    description: '水日主之人，聪明灵活，善于观察，有谋略。为人深沉内敛，但有时过于善变，缺乏恒心。',
  },
};

/** 十神对性格的影响 */
export const TEN_GOD_PERSONALITY_EFFECT: Record<string, { traits: string[]; description: string }> = {
  biJian: {
    traits: ['独立', '自主', '竞争意识强', '自尊心强'],
    description: '比肩多者，性格独立自主，有竞争意识，自尊心强，但容易固执。',
  },
  jieCai: {
    traits: ['好胜', '慷慨', '冲动', '义气深重'],
    description: '劫财多者，好胜心强，慷慨大方，讲义气，但容易冲动行事。',
  },
  shiShen: {
    traits: ['温和', '有才华', '享受生活', '人缘好'],
    description: '食神多者，性格温和，有才华，善于享受生活，人缘极佳。',
  },
  shangGuan: {
    traits: ['聪明', '口才好', '叛逆', '锋芒毕露'],
    description: '伤官多者，聪明绝顶，口才极佳，但锋芒毕露，容易得罪人。',
  },
  pianCai: {
    traits: ['善于交际', '商业头脑', '慷慨', '异性缘好'],
    description: '偏财多者，善于交际，有商业头脑，慷慨大方，异性缘好。',
  },
  zhengCai: {
    traits: ['勤劳', '踏实', '节俭', '务实'],
    description: '正财多者，勤劳踏实，节俭持家，务实可靠，善于理财。',
  },
  qiSha: {
    traits: ['果断', '有魄力', '压力感强', '不畏困难'],
    description: '七杀多者，果断有魄力，敢于面对挑战，但压力感强。',
  },
  zhengGuan: {
    traits: ['正直', '守规矩', '有责任感', '受人尊敬'],
    description: '正官多者，正直守信，守规矩，有责任感，受人尊敬。',
  },
  pianYin: {
    traits: ['思维独特', '直觉敏锐', '多疑', '孤僻'],
    description: '偏印多者，思维独特，直觉敏锐，但容易多疑，性格偏孤僻。',
  },
  zhengYin: {
    traits: ['仁慈', '学识渊博', '善良', '善于学习'],
    description: '正印多者，仁慈宽厚，学识渊博，心地善良，善于学习。',
  },
};

// ============================================================
// 十一、事业取向规则
// ============================================================

/** 根据日主五行确定的事业方向 */
export const CAREER_BY_DAY_MASTER: Record<FiveElement, { directions: string[]; suitable: string[]; avoid: string[] }> = {
  [0]: {
    directions: ['东方', '北方'],
    suitable: ['教育', '文化', '出版', '林业', '农业', '中医药', '服装', '设计', '心理咨询'],
    avoid: ['金属冶炼', '军警武职'],
  },
  [1]: {
    directions: ['南方', '东方'],
    suitable: ['电子科技', '互联网', '传媒', '餐饮', '能源', '影视', '广告', '美容化妆'],
    avoid: ['航运物流', '水产渔业'],
  },
  [2]: {
    directions: ['中央', '南方'],
    suitable: ['房地产', '建筑', '矿业', '仓储物流', '保险', '农业种植', '畜牧业'],
    avoid: ['航运物流', '水产渔业'],
  },
  [3]: {
    directions: ['西方', '中央'],
    suitable: ['金融', '银行', '证券', '法律', '机械制造', '珠宝首饰', '医疗器械', '军警'],
    avoid: ['林业', '农业种植'],
  },
  [4]: {
    directions: ['北方', '西方'],
    suitable: ['航运', '物流运输', '旅游', '贸易', '信息通信', '商业批发', '自由职业'],
    avoid: ['餐饮', '能源', '化工'],
  },
};

/** 根据十神确定的事业取向 */
export const CAREER_BY_TEN_GOD: Record<string, { suitable: string[]; description: string }> = {
  biJian: {
    suitable: ['自由职业', '合伙人', '独立经营', '专业领域'],
    description: '比肩旺者适合独立经营或合伙事业，不宜与人合作过于紧密',
  },
  jieCai: {
    suitable: ['销售', '公关', '运动员', '军警', '创业'],
    description: '劫财旺者适合竞争性行业，有冒险精神',
  },
  shiShen: {
    suitable: ['美食', '艺术', '文学创作', '教育', '演艺'],
    description: '食神旺者适合文艺、教育、美食相关行业',
  },
  shangGuan: {
    suitable: ['律师', '技术研发', '艺术创作', '评论', '自由职业'],
    description: '伤官旺者适合需要才华和创造力的行业',
  },
  pianCai: {
    suitable: ['商业贸易', '投资', '销售', '外交', '娱乐业'],
    description: '偏财旺者适合商业和社交型行业',
  },
  zhengCai: {
    suitable: ['会计', '银行', '公务员', '制造业', '行政管理'],
    description: '正财旺者适合稳定型、务实型行业',
  },
  qiSha: {
    suitable: ['军警', '法律', '外科医生', '企业高管', '竞技体育'],
    description: '七杀旺者适合需要魄力和决断力的行业',
  },
  zhengGuan: {
    suitable: ['公务员', '教师', '管理岗位', '法律', '审计'],
    description: '正官旺者适合管理、行政、教育行业',
  },
  pianYin: {
    suitable: ['研究开发', '玄学命理', '心理学', 'IT技术', '艺术创作'],
    description: '偏印旺者适合研究型、技术型行业',
  },
  zhengYin: {
    suitable: ['教育', '学术研究', '文化出版', '慈善', '医疗保健'],
    description: '正印旺者适合教育、学术、文化行业',
  },
};

// ============================================================
// 十二、财富格局规则
// ============================================================

/** 财富格局判断 */
export const WEALTH_PATTERNS: { condition: string; level: string; description: string }[] = [
  {
    condition: '财星为用神且有力',
    level: '上等财运',
    description: '财星为用神且在命局中有力，一生财运亨通，善于理财，有聚财之能。',
  },
  {
    condition: '财星为用神但力量一般',
    level: '中等财运',
    description: '财星为用神但力量不够强，财运中等，需要努力经营才能积累财富。',
  },
  {
    condition: '财星为忌神',
    level: '财运需努力',
    description: '财星为忌神，求财过程中容易因财生灾，不宜投机冒险，宜稳健经营。',
  },
  {
    condition: '食伤生财格局',
    level: '上等财运',
    description: '食伤生财，以才华和技术创造财富，属于智慧型致富。',
  },
  {
    condition: '比劫夺财',
    level: '财运有波折',
    description: '比劫过旺克财，容易因朋友或竞争导致破财，需注意理财和合作风险。',
  },
  {
    condition: '身弱财重',
    level: '财多身弱',
    description: '财星过多而日主无力承担，看似有钱实则辛苦，需增强自身能力才能驾驭财富。',
  },
  {
    condition: '官印相生护财',
    level: '稳定财运',
    description: '官星护财，印星生身，财运稳定且有保障，适合在体制内或大企业发展。',
  },
];

// ============================================================
// 十三、婚姻感情分析规则
// ============================================================

/** 婚姻感情分析规则 */
export const MARRIAGE_RULES = {
  /** 男命看财星（正财为妻，偏财为情人） */
  male: {
    wifeStar: '正财',
    loverStar: '偏财',
    timing: {
      early: '财星在年柱，早婚倾向',
      middle: '财星在月柱或日支，适婚年龄结婚',
      late: '财星在时柱，晚婚倾向',
      noStar: '命中无财星，婚姻缘分较薄，需主动经营',
    },
    patterns: [
      { name: '财星为用', description: '妻子为贵人，婚姻助力大' },
      { name: '财星为忌', description: '因婚姻而有所消耗，需多沟通' },
      { name: '正偏财混杂', description: '异性缘复杂，需注意忠诚' },
      { name: '比劫争财', description: '感情中容易有竞争者，需经营' },
      { name: '财星逢冲', description: '感情容易有波折，需包容' },
    ],
  },
  /** 女命看官星（正官为夫，七杀为情人） */
  female: {
    husbandStar: '正官',
    loverStar: '七杀',
    timing: {
      early: '官星在年柱，早婚倾向',
      middle: '官星在月柱或日支，适婚年龄结婚',
      late: '官星在时柱，晚婚倾向',
      noStar: '命中无官星，婚姻缘分较薄，需主动经营',
    },
    patterns: [
      { name: '官星为用', description: '丈夫为贵人，婚姻助力大' },
      { name: '官星为忌', description: '因婚姻而有所约束，需调整心态' },
      { name: '官杀混杂', description: '异性缘复杂，需注意选择' },
      { name: '伤官见官', description: '对伴侣要求高，容易有摩擦' },
      { name: '官星逢冲', description: '感情容易有波折，需包容' },
    ],
  },
};

// ============================================================
// 十四、子女缘分析规则
// ============================================================

/** 子女缘分析规则 */
export const CHILDREN_RULES = {
  /** 男命看官杀（官杀为子女星） */
  male: {
    childrenStar: ['qiSha', 'zhengGuan'],
    description: '男命以官杀为子女星，七杀为儿子，正官为女儿',
    patterns: [
      { name: '官杀为用', description: '子女有出息，是父母的骄傲' },
      { name: '官杀为忌', description: '子女需要较多精力照顾' },
      { name: '官杀有力', description: '子女缘分深厚，子女有成就' },
      { name: '官杀无力', description: '子女缘分较薄，需多关心' },
    ],
  },
  /** 女命看食伤（食伤为子女星） */
  female: {
    childrenStar: ['shiShen', 'shangGuan'],
    description: '女命以食伤为子女星，食神为女儿，伤官为儿子',
    patterns: [
      { name: '食伤为用', description: '子女聪明有才华，亲子关系好' },
      { name: '食伤为忌', description: '为子女操心较多' },
      { name: '食伤有力', description: '子女缘分深厚，子女聪明' },
      { name: '食伤无力', description: '子女缘分较薄，需多关心' },
    ],
  },
};

// ============================================================
// 十五、健康倾向规则（五行对应脏腑）
// ============================================================

/** 五行与脏腑对应 */
export const FIVE_ELEMENT_ORGANS: Record<FiveElement, { organs: string[]; parts: string[]; diseases: string[] }> = {
  [0]: {
    organs: ['肝', '胆'],
    parts: ['眼睛', '筋腱', '指甲', '四肢'],
    diseases: ['肝胆疾病', '眼睛疲劳', '筋骨酸痛', '头痛', '高血压', '情绪抑郁'],
  },
  [1]: {
    organs: ['心', '小肠'],
    parts: ['舌头', '血脉', '面部'],
    diseases: ['心血管疾病', '失眠', '口腔溃疡', '炎症', '焦虑', '心律不齐'],
  },
  [2]: {
    organs: ['脾', '胃'],
    parts: ['嘴唇', '肌肉', '四肢'],
    diseases: ['消化系统疾病', '胃病', '腹胀', '食欲不振', '水肿', '糖尿病'],
  },
  [3]: {
    organs: ['肺', '大肠'],
    parts: ['鼻子', '皮肤', '毛发'],
    diseases: ['呼吸系统疾病', '皮肤病', '过敏', '咳嗽', '便秘', '鼻炎'],
  },
  [4]: {
    organs: ['肾', '膀胱'],
    parts: ['耳朵', '骨骼', '头发'],
    diseases: ['泌尿系统疾病', '肾脏问题', '腰痛', '耳鸣', '骨质疏松', '生殖系统'],
  },
};

/** 五行失衡对应的健康风险 */
export const FIVE_ELEMENT_IMBALANCE_HEALTH: Record<FiveElement, { excess: string[]; deficiency: string[] }> = {
  [0]: {
    excess: ['肝气过旺，容易头痛、易怒、高血压', '木旺克土，影响脾胃消化'],
    deficiency: ['肝气不足，容易疲劳、抑郁', '目力减退，眼睛干涩'],
  },
  [1]: {
    excess: ['心火过旺，容易失眠、焦虑、口舌生疮', '火旺克金，影响呼吸系统'],
    deficiency: ['心血不足，容易心悸、健忘', '面色苍白，精神不振'],
  },
  [2]: {
    excess: ['脾胃过旺，容易腹胀、消化不良', '土旺克水，影响肾脏泌尿'],
    deficiency: ['脾胃虚弱，容易食欲不振、乏力', '肌肉松弛，四肢无力'],
  },
  [3]: {
    excess: ['肺气过旺，容易咳嗽、皮肤敏感', '金旺克木，影响肝胆'],
    deficiency: ['肺气不足，容易气短、易感冒', '皮肤干燥，毛发稀疏'],
  },
  [4]: {
    excess: ['肾水过旺，容易水肿、畏寒', '水旺克火，影响心脏'],
    deficiency: ['肾水不足，容易腰痛、耳鸣', '记忆力减退，骨质疏松'],
  },
};

// ============================================================
// 十六、大运吉凶判断规则
// ============================================================

/** 大运吉凶判断 */
export const DA_YUN_RULES = {
  good: {
    description: '大运走用神方向，运势顺遂',
    conditions: [
      '大运天干地支均为喜用五行',
      '大运与命局形成三合局或六合',
      '大运引动命局中的用神',
      '大运化解命局中的冲克',
    ],
  },
  neutral: {
    description: '大运平平，不温不火',
    conditions: [
      '大运五行与命局关系不大',
      '大运有喜有忌，吉凶参半',
      '大运为中性五行（如日主同五行但不过旺）',
    ],
  },
  bad: {
    description: '大运走忌神方向，运势有压力',
    conditions: [
      '大运天干地支均为忌神五行',
      '大运与命局形成冲克',
      '大运引动命局中的忌神',
      '大运破坏命局中的有利格局',
    ],
  },
};

// ============================================================
// 十七、流年判断规则
// ============================================================

/** 流年判断 */
export const LIU_NIAN_RULES = {
  /** 流年与命局的关系 */
  relations: {
    combine: '流年与命局天干地支相合，主和合、合作、收获',
    clash: '流年与命局天干地支相冲，主变动、冲突、转折',
    punishment: '流年与命局地支相刑，主是非、纠纷、刑伤',
    harm: '流年与命局地支相害，主暗损、小人、阻碍',
    break: '流年与命局地支相破，主破坏、散财、分离',
    trine: '流年与命局地支三合，主合作、发展、机遇',
    meet: '流年与命局地支三会，主大变动、大机遇、大挑战',
  },
  /** 流年天干对日主的影响 */
  stemEffect: {
    yongShen: '流年天干为用神，该年运势有助',
    jiShen: '流年天干为忌神，该年运势有压力',
    sameElement: '流年天干与日主同五行，该年自我意识增强',
    generate: '流年天干生日主，该年有贵人相助',
    overcome: '流年天干克日主，该年有压力和挑战',
  },
};

// ============================================================
// 十八、月份与地支对应（用于调候查找）
// ============================================================

/** 月份（公历近似）对应地支索引 */
export const MONTH_TO_BRANCH_INDEX: Record<number, number> = {
  1: 0,   // 丑月
  2: 2,   // 寅月
  3: 3,   // 卯月
  4: 4,   // 辰月
  5: 5,   // 巳月
  6: 6,   // 午月
  7: 7,   // 未月
  8: 8,   // 申月
  9: 9,   // 酉月
  10: 10, // 戌月
  11: 11, // 亥月
  12: 0,  // 子月（注意：农历十一月对应公历12月左右）
};

/**
 * 根据公历月份和节气近似获取月支索引
 * 简化版：以公历月份近似对应
 */
export function getMonthBranchIndex(month: number): number {
  // 公历月份近似对应地支
  const mapping: Record<number, number> = {
    1: 0,   // 丑月（小寒-立春）
    2: 2,   // 寅月（立春-惊蛰）
    3: 3,   // 卯月（惊蛰-清明）
    4: 4,   // 辰月（清明-立夏）
    5: 5,   // 巳月（立夏-芒种）
    6: 6,   // 午月（芒种-小暑）
    7: 7,   // 未月（小暑-立秋）
    8: 8,   // 申月（立秋-白露）
    9: 9,   // 酉月（白露-寒露）
    10: 10, // 戌月（寒露-立冬）
    11: 11, // 亥月（立冬-大雪）
    12: 0,  // 子月（大雪-小寒）
  };
  return mapping[month] ?? 0;
}

// ============================================================
// 十九、地支名称映射
// ============================================================

export const BRANCH_NAMES: string[] = [
  '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥',
];

export const STEM_NAMES: string[] = [
  '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸',
];

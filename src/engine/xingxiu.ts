// ============================================================
// 二十八星宿 / 二十七星宿 命理体系
// 用于判定荣亲关系（911星宿体系）
// ============================================================

// 二十八星宿名称
export const XINGXIU_28_NAMES = [
  '角', '亢', '氐', '房', '心', '尾', '箕',
  '斗', '牛', '女', '虚', '危', '室', '壁',
  '奎', '娄', '胃', '昴', '毕', '觜', '参',
  '井', '鬼', '柳', '星', '张', '翼', '轸'
];

// 二十七星宿名称（去掉牛宿）
export const XINGXIU_27_NAMES = [
  '角', '亢', '氐', '房', '心', '尾', '箕',
  '斗', '女', '虚', '危', '室', '壁',
  '奎', '娄', '胃', '昴', '毕', '觜', '参',
  '井', '鬼', '柳', '星', '张', '翼', '轸'
];

// 二十八星宿五行属性
export const XINGXIU_28_ELEMENTS = [
  '木', '金', '土', '日', '月', '火', '水',
  '木', '金', '土', '日', '月', '火', '水',
  '木', '金', '土', '日', '月', '火', '水',
  '木', '金', '土', '日', '月', '火', '水'
];

// ============================================================
// 核心算法：计算本命星宿
// ============================================================

/**
 * 计算某公历日期对应的二十八星宿（传统算法）
 * 
 * 传统算法原理：
 * 1. 以农历正月初一为起点，按固定顺序轮值二十八星宿
 * 2. 轮值顺序：角→亢→氐→房→心→尾→箕→斗→牛→女→虚→危→室→壁→奎→娄→胃→昴→毕→觜→参→井→鬼→柳→星→张→翼→轸
 * 3. 每年正月初一的星宿有固定规律（可通过已知参考点推算）
 * 
 * 更精确的算法：使用已知的星宿日参考表
 * 经考证，传统星宿日可以通过公历日期直接推算
 * 
 * @param year 公历年
 * @param month 公历月
 * @param day 公历日
 * @returns 二十八星宿索引（0-27）
 */
export function getBenMingXingXiu28(year: number, month: number, day: number, _dayBranch?: number): number {
  // 使用基于公历日期的星宿推算算法
  // 该算法基于天文观测数据，以1900年1月1日为参考点
  
  // 计算从1900年1月1日到目标日期的天数差
  const baseDate = new Date(1900, 0, 1);
  const targetDate = new Date(year, month - 1, day);
  const dayDiff = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // 1900年1月1日对应的星宿为虚宿（索引10）
  // 星宿按顺序每天轮值一个
  const baseXingXiu = 10; // 虚宿
  
  // 计算目标日期的星宿
  // 注意：星宿轮值周期为28天
  const xingXiu28 = ((baseXingXiu + dayDiff) % 28 + 28) % 28;
  
  return xingXiu28;
}

/**
 * 将28星宿索引转换为27星宿索引
 * 27星宿体系去掉牛宿（索引8）
 */
export function toXingXiu27(xingXiu28: number): number {
  if (xingXiu28 < 8) return xingXiu28; // 角(0)到斗(7)
  if (xingXiu28 === 8) return 7; // 牛宿映射到斗宿（在27星宿中合并）
  return xingXiu28 - 1; // 女(9)到轸(27) → 8到26
}

// ============================================================
// 27星宿关系判定
// ============================================================

/**
 * 27星宿关系判定结果
 */
export interface XingXiuRelationResult {
  /** 关系类型：命之星、荣亲、业胎、友衰、安坏、危成 */
  relation: string;
  /** A的角色 */
  roleA: string;
  /** B的角色 */
  roleB: string;
  /** 距离：近距离、中距离、远距离 */
  distance: string;
  /** A的28星宿名称 */
  xingXiuA28: string;
  /** B的28星宿名称 */
  xingXiuB28: string;
  /** A的27星宿名称 */
  xingXiuA27: string;
  /** B的27星宿名称 */
  xingXiuB27: string;
  /** 位次差 */
  diff: number;
  /** 是否为荣亲关系 */
  isRongQin: boolean;
  /** 荣亲距离（仅荣亲关系有效） */
  rongQinDistance: string;
  /** 荣亲角色（仅荣亲关系有效）：荣/亲 */
  rongQinRoleA: string;
  rongQinRoleB: string;
}

/**
 * 分析两个人的27星宿关系
 * 
 * 27星宿关系分布规则（以A为基准，B相对于A的位置）：
 * - diff = 0: 命之星（同宿）
 * - diff = 1, 26: 近距离荣亲
 * - diff = 2, 25: 中距离荣亲
 * - diff = 3, 24: 远距离荣亲
 * - diff = 4, 23: 近距离业胎
 * - diff = 5, 22: 中距离业胎
 * - diff = 6, 21: 远距离业胎
 * - diff = 7, 20: 近距离友衰
 * - diff = 8, 19: 中距离友衰
 * - diff = 9, 18: 远距离友衰
 * - diff = 10, 17: 近距离安坏
 * - diff = 11, 16: 中距离安坏
 * - diff = 12, 15: 远距离安坏
 * - diff = 13, 14: 危成
 */
export function analyzeXingXiuRelation(xingXiu27A: number, xingXiu27B: number): XingXiuRelationResult {
  const diff = (xingXiu27B - xingXiu27A + 27) % 27;

  let relation: string;
  let roleA = '';
  let roleB = '';
  let distance = '';
  let isRongQin = false;
  let rongQinDistance = '';
  let rongQinRoleA = '';
  let rongQinRoleB = '';

  // 关系类型判定（27星宿体系）
  if (diff === 0) {
    relation = '命之星';
    roleA = '同宿';
    roleB = '同宿';
    distance = '无距离';
  } else if (diff === 1 || diff === 26) {
    relation = '荣亲';
    roleA = diff === 1 ? '荣' : '亲';
    roleB = diff === 1 ? '亲' : '荣';
    distance = '近距离';
    isRongQin = true;
    rongQinDistance = '近距离';
    rongQinRoleA = roleA;
    rongQinRoleB = roleB;
  } else if (diff === 2 || diff === 25) {
    relation = '荣亲';
    roleA = diff === 2 ? '荣' : '亲';
    roleB = diff === 2 ? '亲' : '荣';
    distance = '中距离';
    isRongQin = true;
    rongQinDistance = '中距离';
    rongQinRoleA = roleA;
    rongQinRoleB = roleB;
  } else if (diff === 3 || diff === 24) {
    relation = '荣亲';
    roleA = diff === 3 ? '荣' : '亲';
    roleB = diff === 3 ? '亲' : '荣';
    distance = '远距离';
    isRongQin = true;
    rongQinDistance = '远距离';
    rongQinRoleA = roleA;
    rongQinRoleB = roleB;
  } else if (diff === 4 || diff === 23) {
    relation = '业胎';
    roleA = diff === 4 ? '业' : '胎';
    roleB = diff === 4 ? '胎' : '业';
    distance = '近距离';
  } else if (diff === 5 || diff === 22) {
    relation = '业胎';
    roleA = diff === 5 ? '业' : '胎';
    roleB = diff === 5 ? '胎' : '业';
    distance = '中距离';
  } else if (diff === 6 || diff === 21) {
    relation = '业胎';
    roleA = diff === 6 ? '业' : '胎';
    roleB = diff === 6 ? '胎' : '业';
    distance = '远距离';
  } else if (diff === 7 || diff === 20) {
    relation = '友衰';
    roleA = diff === 7 ? '友' : '衰';
    roleB = diff === 7 ? '衰' : '友';
    distance = '近距离';
  } else if (diff === 8 || diff === 19) {
    relation = '友衰';
    roleA = diff === 8 ? '友' : '衰';
    roleB = diff === 8 ? '衰' : '友';
    distance = '中距离';
  } else if (diff === 9 || diff === 18) {
    relation = '友衰';
    roleA = diff === 9 ? '友' : '衰';
    roleB = diff === 9 ? '衰' : '友';
    distance = '远距离';
  } else if (diff === 10 || diff === 17) {
    relation = '安坏';
    roleA = diff === 10 ? '安' : '坏';
    roleB = diff === 10 ? '坏' : '安';
    distance = '近距离';
  } else if (diff === 11 || diff === 16) {
    relation = '安坏';
    roleA = diff === 11 ? '安' : '坏';
    roleB = diff === 11 ? '坏' : '安';
    distance = '中距离';
  } else if (diff === 12 || diff === 15) {
    relation = '安坏';
    roleA = diff === 12 ? '安' : '坏';
    roleB = diff === 12 ? '坏' : '安';
    distance = '远距离';
  } else {
    // diff === 13 || diff === 14
    relation = '危成';
    roleA = diff === 13 ? '危' : '成';
    roleB = diff === 13 ? '成' : '危';
    distance = diff === 13 ? '近距离' : '远距离';
  }

  return {
    relation,
    roleA,
    roleB,
    distance,
    xingXiuA28: XINGXIU_28_NAMES[xingXiu27A < 8 ? xingXiu27A : xingXiu27A + 1],
    xingXiuB28: XINGXIU_28_NAMES[xingXiu27B < 8 ? xingXiu27B : xingXiu27B + 1],
    xingXiuA27: XINGXIU_27_NAMES[xingXiu27A],
    xingXiuB27: XINGXIU_27_NAMES[xingXiu27B],
    diff,
    isRongQin,
    rongQinDistance,
    rongQinRoleA,
    rongQinRoleB,
  };
}

// ============================================================
// 荣亲关系详细描述
// ============================================================

export interface RongQinDetail {
  title: string;
  subtitle: string;
  desc: string;
  traits: string[];
  advice: string;
}

export const RONG_QIN_DESCRIPTIONS: Record<string, RongQinDetail> = {
  close: {
    title: '近距离荣亲',
    subtitle: '缘分最深、羁绊极强',
    desc: '你们是近距离荣亲关系！彼此星宿左右紧邻，缘分最深、羁绊极强，亲密无间但摩擦也多，爱恨浓烈，极易成婚、适合朝夕相处。',
    traits: [
      '相处模式：细水长流、烟火气十足，少有轰轰烈烈的热恋，像家人般安心，情绪包容度高',
      '情感属性：亲情式爱情，心动感弱、安全感极强，分开会产生类似和亲人别离的失落感',
      '适配场景：首选婚姻、长期伴侣、终身挚友；不适合短暂激情恋爱',
    ],
    advice: '近距离荣亲的人容易一见如故，有天然的默契和亲切感。适合做朋友、合作伙伴或夫妻，在相处中往往能心领神会。但也要注意，过于相似有时可能导致缺乏互补，建议在差异中寻找新鲜感。',
  },
  medium: {
    title: '中距离荣亲',
    subtitle: '婚恋最优组合',
    desc: '你们是中距离荣亲关系！位次间隔适中，是婚恋最优组合，平衡独立与亲密，矛盾少、相敬相依，婚姻稳固度最高。',
    traits: [
      '相处模式：既有亲密又有独立空间，不会过于黏腻也不会疏远',
      '情感属性：亲情与爱情并存，既能感受到伴侣的温暖又能保持自我',
      '适配场景：婚姻、长期伴侣、事业合作伙伴',
    ],
    advice: '中距离荣亲是最理想的婚恋组合，既有荣亲的亲情底色，又有适度的距离感让关系保持新鲜。建议珍惜这份缘分，在相处中保持真诚和用心。',
  },
  far: {
    title: '远距离荣亲',
    subtitle: '精神契合、异地情缘',
    desc: '你们是远距离荣亲关系！位次跨度较大，现实交集少、精神契合，牵挂很深但难长期朝夕相伴，多为长久知己、异地情缘。',
    traits: [
      '相处模式：精神层面的深度连接，即使不常见面也能心意相通',
      '情感属性：灵魂伴侣式的关系，超越世俗的亲情纽带',
      '适配场景：异地恋情、精神知己、灵魂伴侣',
    ],
    advice: '远距离荣亲的人虽然现实中可能聚少离多，但精神层面的连接非常深厚。建议保持定期沟通，用心维护这份超越距离的缘分。',
  },
};

/**
 * 获取荣亲关系的详细描述
 */
export function getRongQinDescription(distance: string): RongQinDetail {
  switch (distance) {
    case '近距离': return RONG_QIN_DESCRIPTIONS.close;
    case '中距离': return RONG_QIN_DESCRIPTIONS.medium;
    case '远距离': return RONG_QIN_DESCRIPTIONS.far;
    default: return RONG_QIN_DESCRIPTIONS.medium;
  }
}

// ============================================================
// 其他星宿关系描述
// ============================================================

export interface RelationDetail {
  title: string;
  subtitle: string;
  desc: string;
  traits: string[];
  advice: string;
  roleADesc: string;
  roleBDesc: string;
}

export const XINGXIU_RELATION_DETAILS: Record<string, Record<string, RelationDetail>> = {
  '命之星': {
    '无距离': {
      title: '命之星',
      subtitle: '灵魂镜像，高度共鸣',
      desc: '你们是命之星关系！两个人的本命星宿相同，性格、思维模式高度相似，容易产生深刻的共鸣和理解。这种关系像照镜子一样，既能看到对方的优点也能看到缺点。',
      traits: [
        '相处模式：心有灵犀，无需多言就能理解对方的想法',
        '情感属性：深度共鸣，既是知己也是灵魂伴侣',
        '适配场景：知己好友、精神伴侣、长期合作伙伴',
      ],
      advice: '命之星的人容易产生"世界上另一个我"的感觉。珍惜这份难得的默契，但也要学会欣赏彼此的不同，避免因为过于相似而缺乏成长空间。',
      roleADesc: '与你星宿相同的人，性格、思维模式高度相似',
      roleBDesc: '与你星宿相同的人，性格、思维模式高度相似',
    },
  },
  '业胎': {
    '近距离': {
      title: '近距离业胎',
      subtitle: '前世今生，宿命纠缠',
      desc: '你们是近距离业胎关系！前世有极深的业力羁绊，今生重逢继续未了的缘分。业方付出较多，胎方被照顾，关系紧密但容易纠缠不清。',
      traits: [
        '相处模式：强烈的宿命感，容易一见钟情，关系进展迅速',
        '情感属性：业力纠缠，爱恨交织，难以割舍',
        '适配场景：灵魂伴侣、深度疗愈关系、前世今生的重逢',
      ],
      advice: '近距离业胎的关系最为强烈，容易产生"命中注定"的感觉。建议保持清醒，在享受深刻连接的同时，也要建立健康的边界，避免过度纠缠。',
      roleADesc: '业方：通常是付出较多、承担更多责任的一方',
      roleBDesc: '胎方：通常是被照顾、被保护的一方',
    },
    '中距离': {
      title: '中距离业胎',
      subtitle: '业力牵绊，互相成就',
      desc: '你们是中距离业胎关系！前世有业力联系，今生互相成就。既有宿命的牵引，又有适度的空间让彼此成长。',
      traits: [
        '相处模式：有宿命感但不至于窒息，有空间也有牵绊',
        '情感属性：互相成就，在关系中共同成长',
        '适配场景：成长型伴侣、互相疗愈的关系',
      ],
      advice: '中距离业胎是最平衡的业胎关系，既有宿命的深度，又有成长的空间。建议珍惜这份缘分，在互相成就中共同成长。',
      roleADesc: '业方：引导对方成长，承担更多责任',
      roleBDesc: '胎方：在对方的引导下成长，获得滋养',
    },
    '远距离': {
      title: '远距离业胎',
      subtitle: '灵魂牵引，隔空感应',
      desc: '你们是远距离业胎关系！前世有业力联系，今生虽然现实交集不多，但灵魂层面有深刻的牵引。即使不常见面，也能感受到对方的存在。',
      traits: [
        '相处模式：现实距离远，但心灵距离近，有隔空感应',
        '情感属性：灵魂层面的深刻连接，超越世俗',
        '适配场景：异地灵魂伴侣、精神导师与学生',
      ],
      advice: '远距离业胎的人即使身处异地，也能感受到彼此的牵引。建议保持心灵沟通，用心维护这份超越距离的缘分。',
      roleADesc: '业方：在远方默默守护和付出',
      roleBDesc: '胎方：在远方感受对方的守护',
    },
  },
  '友衰': {
    '近距离': {
      title: '近距离友衰',
      subtitle: '轻松愉快，如胶似漆',
      desc: '你们是近距离友衰关系！像最好的朋友一样相处，轻松愉快，没有压力。友方更有魅力，衰方被吸引，关系亲密但不沉重。',
      traits: [
        '相处模式：轻松愉快，像朋友又像恋人，没有负担',
        '情感属性：轻松的爱情，享受当下的快乐',
        '适配场景：玩伴、轻松恋爱、兴趣相投的朋友',
      ],
      advice: '近距离友衰的关系最为轻松愉快，适合享受当下的快乐。但如果想要长期发展，需要增加关系的深度和责任感。',
      roleADesc: '友方：更有魅力、更主动、更吸引对方',
      roleBDesc: '衰方：被吸引、欣赏对方，略被动但享受',
    },
    '中距离': {
      title: '中距离友衰',
      subtitle: '亦友亦爱，恰到好处',
      desc: '你们是中距离友衰关系！既有朋友的轻松，又有恋人的亲密。距离恰到好处，既能享受相处的快乐，又能保持各自的独立。',
      traits: [
        '相处模式：亦友亦爱，轻松中带着温馨',
        '情感属性：平衡的爱情，既有激情又有友情',
        '适配场景：理想伴侣、长期恋爱、事业伙伴',
      ],
      advice: '中距离友衰是最理想的友衰关系，既有轻松的氛围，又有适度的亲密。建议珍惜这份平衡，在轻松中培养深度。',
      roleADesc: '友方：魅力四射，是关系的引领者',
      roleBDesc: '衰方：欣赏对方，在关系中找到自己的位置',
    },
    '远距离': {
      title: '远距离友衰',
      subtitle: '君子之交，淡而有味',
      desc: '你们是远距离友衰关系！像君子之交一样，淡而有味。虽然不常见面，但每次相聚都充满欢乐。',
      traits: [
        '相处模式：淡而有味，不黏腻但有情谊',
        '情感属性：轻松的朋友式爱情，没有束缚',
        '适配场景：异地友谊、偶尔相聚的知己',
      ],
      advice: '远距离友衰的关系最为淡然，适合保持轻松的心态。不必强求天天相见，每次相聚都是珍贵的礼物。',
      roleADesc: '友方：在远方散发魅力，吸引对方',
      roleBDesc: '衰方：在远方欣赏对方，保持轻松心态',
    },
  },
  '安坏': {
    '近距离': {
      title: '近距离安坏',
      subtitle: '激情碰撞，爱恨交织',
      desc: '你们是近距离安坏关系！一方破坏一方安定，关系充满张力和激情。坏方更有魅力更主动，安方更稳定更包容，爱恨交织难以分离。',
      traits: [
        '相处模式：激情强烈，爱恨交织，难以割舍',
        '情感属性：强烈的吸引力，既有痛苦又有快乐',
        '适配场景：激情恋爱、深刻的人生课题',
      ],
      advice: '近距离安坏的关系最为激烈，容易产生强烈的吸引和痛苦。建议学会在激情中保持清醒，建立健康的边界，避免过度消耗。',
      roleADesc: '安方：更稳定、更包容，是关系的安定力量',
      roleBDesc: '坏方：更有魅力、更主动，带来变化和刺激',
    },
    '中距离': {
      title: '中距离安坏',
      subtitle: '张力平衡，互相成长',
      desc: '你们是中距离安坏关系！既有安坏的张力，又有适度的空间。在拉扯中互相成长，在冲突中加深理解。',
      traits: [
        '相处模式：有张力但不窒息，有冲突但能和解',
        '情感属性：在挑战中成长，在磨合中深化',
        '适配场景：成长型伴侣、互相磨砺的关系',
      ],
      advice: '中距离安坏的关系最为平衡，既有激情又有成长。建议把冲突视为成长的机会，在磨合中建立更深的连接。',
      roleADesc: '安方：在稳定中包容对方的变化',
      roleBDesc: '坏方：在变化中推动关系成长',
    },
    '远距离': {
      title: '远距离安坏',
      subtitle: '隔空吸引，若即若离',
      desc: '你们是远距离安坏关系！隔空也能感受到对方的吸引力，若即若离的关系让人既向往又不安。',
      traits: [
        '相处模式：隔空吸引，若即若离，充满遐想',
        '情感属性：远距离的激情，想象多于现实',
        '适配场景：异地恋情、精神层面的吸引',
      ],
      advice: '远距离安坏的关系最为微妙，距离产生美但也产生不安。建议保持沟通，把距离转化为思念的美好。',
      roleADesc: '安方：在远方提供稳定的情感支撑',
      roleBDesc: '坏方：在远方散发魅力，吸引对方',
    },
  },
  '危成': {
    '近距离': {
      title: '近距离危成',
      subtitle: '挑战与成就，紧密相依',
      desc: '你们是近距离危成关系！一方是挑战（危），一方是成就（成），关系紧密，在挑战中互相成就。',
      traits: [
        '相处模式：紧密相依，共同面对挑战',
        '情感属性：在挑战中建立深厚的信任和依赖',
        '适配场景：事业伙伴、共同奋斗的伴侣',
      ],
      advice: '近距离危成的关系最为紧密，适合共同面对挑战。建议把对方视为成长的伙伴，在挑战中建立更深的连接。',
      roleADesc: '成方：从危方身上获得成长和成就',
      roleBDesc: '危方：给成方带来挑战和成长机会',
    },
    '远距离': {
      title: '远距离危成',
      subtitle: '隔空挑战，各自成长',
      desc: '你们是远距离危成关系！虽然现实距离远，但对方给你的挑战和成长机会依然存在。在各自的轨道上互相激励。',
      traits: [
        '相处模式：各自成长，隔空激励',
        '情感属性：远距离的互相成就，独立但连接',
        '适配场景：异地事业伙伴、精神导师',
      ],
      advice: '远距离危成的关系最为独立，适合在各自的领域成长。建议把对方视为远方的灯塔，在各自的道路上互相激励。',
      roleADesc: '成方：在远方从危方身上获得启发',
      roleBDesc: '危方：在远方给成方带来挑战',
    },
  },
};

// 保持向后兼容的简化描述
export const XINGXIU_RELATION_DESCRIPTIONS: Record<string, { title: string; desc: string }> = {
  '命之星': {
    title: '命之星',
    desc: '你们是命之星关系！两个人的本命星宿相同，性格、思维模式高度相似，容易产生共鸣和理解。这种关系像照镜子一样，既能看到对方的优点也能看到缺点。适合做朋友、知己，在婚姻中则需要更多的包容和磨合。',
  },
  '业胎': {
    title: '业胎关系',
    desc: '你们是业胎关系！前世有深厚的业力羁绊，今生重逢继续未了的缘分。业方通常是付出较多的一方，胎方则是被照顾的一方。这种关系有很强的宿命感，容易一见钟情，但也容易因为业力纠缠而产生痛苦。',
  },
  '友衰': {
    title: '友衰关系',
    desc: '你们是友衰关系！像朋友一样的相处模式，轻松愉快，没有压力。友方通常是更主动、更有魅力的一方，衰方则是被吸引、略被动的一方。这种关系适合做朋友、玩伴，在恋爱中可能缺乏激情和深度。',
  },
  '安坏': {
    title: '安坏关系',
    desc: '你们是安坏关系！一方是破坏者（坏），一方是安定者（安），关系中充满了张力和拉扯。坏方通常更有魅力、更主动，安方则更稳定、更包容。这种关系激情强烈，但也容易因为控制欲和不安感而产生冲突。',
  },
  '危成': {
    title: '危成关系',
    desc: '你们是危成关系！一方是危险（危），一方是成就（成），关系中充满了挑战和成长。危方通常是更有魅力、更吸引成方的一方，成方则能从危方身上获得成长和成就。这种关系适合事业合作，在恋爱中则需要处理好现实层面的问题。',
  },
};

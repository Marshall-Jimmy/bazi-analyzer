// ============================================================
// 八字命理综合分析 - 主应用组件
// 风格：深邃黑金 · 东方玄学 · 玻璃拟态 · 影院级暗色
// ============================================================

import { useState, useMemo } from 'react';
import MainLayout from './components/layout/MainLayout.tsx';
import { useBaziStore } from './store/useBaziStore.ts';
import { useReveal } from './hooks/useReveal.ts';
import type { AnalysisInput, Gender, FiveElement } from './engine/index.ts';
import {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  FIVE_ELEMENT_NAMES,
} from './engine/index.ts';
import {
  analyzeRelationships,
} from './engine/index.ts';
import type { RelationshipProfile } from './engine/index.ts';
import {
  Calculator,
  Save,
  Trash2,
  RotateCcw,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Compass,
  Palette,
  Clock,
  Heart,
  Zap,
  Shield,
  Target,
  Sparkles,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Gem,
  Crown,
} from 'lucide-react';
import SynastryRadar from './components/charts/SynastryRadar.tsx';
import { XINGXIU_RELATION_DETAILS } from './engine/xingxiu.ts';

// ============================================================
// 命理名言数据
// ============================================================
const WISDOM_QUOTES = [
  { text: '知命不惧，日日自新', source: '《周易》' },
  { text: '天行健，君子以自强不息', source: '《周易·乾卦》' },
  { text: '一命二运三风水，四积阴德五读书', source: '传统命理观' },
  { text: '善易者不占', source: '《论语》' },
  { text: '谋事在人，成事在天', source: '传统谚语' },
  { text: '积善之家，必有余庆', source: '《周易·坤卦》' },
  { text: '穷则变，变则通，通则久', source: '《周易·系辞》' },
  { text: '祸兮福之所倚，福兮祸之所伏', source: '《道德经》' },
  { text: '上善若水，水善利万物而不争', source: '《道德经》' },
  { text: '大道至简，衍化至繁', source: '《道德经》' },
  { text: '命由天定，运由己造', source: '传统命理观' },
  { text: '德不配位，必有灾殃', source: '《周易·系辞》' },
  { text: '天时不如地利，地利不如人和', source: '《孟子》' },
  { text: '福无双至，祸不单行', source: '传统谚语' },
  { text: '三十而立，四十而不惑', source: '《论语》' },
  { text: '人法地，地法天，天法道，道法自然', source: '《道德经》' },
  { text: '君子藏器于身，待时而动', source: '《周易·系辞》' },
  { text: '时来天地皆同力，运去英雄不自由', source: '《罗隐·筹笔驿》' },
  { text: '一阴一阳之谓道', source: '《周易·系辞》' },
  { text: '顺天应人，与时俱进', source: '传统命理观' },
  { text: '木秀于林，风必摧之', source: '《运命论》' },
  { text: '居安思危，思则有备', source: '《左传》' },
  { text: '否极泰来，物极必反', source: '传统哲学' },
];

// ============================================================
// 五行图标映射
// ============================================================
const ELEMENT_ICONS: Record<number, React.ReactNode> = {
  0: <Wind size={14} />,   // 木
  1: <Flame size={14} />,  // 火
  2: <Mountain size={14} />, // 土
  3: <Gem size={14} />,    // 金
  4: <Droplets size={14} />, // 水
};

// ============================================================
// 通俗解读文案映射
// ============================================================

/** 日主强弱比喻 */
const STRENGTH_METAPHOR: Record<string, string> = {
  strong: '你的命格如大树参天，根基深厚，自身能量充沛，可扛大事、担重任，宜开拓进取。就像一棵百年古树，风雨中屹立不倒，反而越经历风雨越显苍劲。',
  weak: '你的命格如幼苗初生，需要外界滋养才能茁壮成长，宜借力打力、贵人相助。就像一株兰花，虽柔弱却芬芳，在适宜的环境中能绽放独特的光彩。',
  balanced: '你的命格如春风化雨，刚柔并济，进退有度，是最为难得的中和之象。就像太极图中的阴阳鱼，动静相宜，在平衡中蕴含着无限的可能。',
};

/** 五行缺失比喻 */
const MISSING_ELEMENT_METAPHOR: Record<number, string> = {
  0: '五行缺木，如同花园少了花草，建议多接触绿色植物，在居室摆放绿植，多去公园散步。木主生发，缺木之人宜培养耐心与包容心。',
  1: '五行缺火，如同冬日少了暖阳，建议多晒太阳、穿暖色衣物，保持积极乐观的心态。火主礼，缺火之人宜培养热情与表达能力。',
  2: '五行缺土，如同浮萍无根，建议多亲近大地、徒步登山，培养踏实稳重的生活习惯。土主信，缺土之人宜培养诚信与责任感。',
  3: '五行缺金，如同秋日少了清霜，建议佩戴金属饰品，保持果断利落的行事风格。金主义，缺金之人宜培养决断力与正义感。',
  4: '五行缺水，如同旱地盼雨，建议多饮水、靠近水边，保持灵活变通的思维方式。水主智，缺水之人宜培养智慧与适应力。',
};
// 保留常量供其他模块或未来使用
void MISSING_ELEMENT_METAPHOR;

/** 用神生活化建议 */
const YONG_SHEN_ADVICE: Record<number, { color: string; direction: string; season: string; tip: string }> = {
  0: { color: '绿色', direction: '东方', season: '春天', tip: '你的幸运色是绿色，适合在东方发展，春天是你最好的季节。多穿绿色系衣物，办公桌可摆放绿色植物，有助于提升运势。' },
  1: { color: '红色', direction: '南方', season: '夏天', tip: '你的幸运色是红色，适合在南方发展，夏天是你最好的季节。多穿红色系衣物，保持热情主动，有助于事业突破。' },
  2: { color: '黄色', direction: '中部地区', season: '四季交替之时', tip: '你的幸运色是黄色，适合在中部地区发展。多穿黄色系衣物，做事宜稳重踏实，诚信是你的立身之本。' },
  3: { color: '白色/金色', direction: '西方', season: '秋天', tip: '你的幸运色是白色/金色，适合在西方发展，秋天是你最好的季节。多穿白色系衣物，保持果断决断，正义感是你的魅力所在。' },
  4: { color: '蓝色/黑色', direction: '北方', season: '冬天', tip: '你的幸运色是蓝色/黑色，适合在北方发展，冬天是你最好的季节。多穿深色系衣物，保持冷静思考，智慧是你的核心竞争力。' },
};

/** 事业取向通俗描述 */
const CAREER_TEN_GOD_DESC: Record<string, { icon: React.ReactNode; desc: string }> = {
  '官杀': { icon: <Shield size={16} />, desc: '适合管理、法律、政治等需要权威和规则的领域。你天生具有领导气质，善于制定规范、维护秩序，在组织中容易获得认可和晋升。' },
  '印星': { icon: <Sparkles size={16} />, desc: '适合教育、研究、文化等需要知识和传承的领域。你思维深邃、善于学习，能够将知识转化为智慧，是天然的导师型人才。' },
  '食伤': { icon: <Palette size={16} />, desc: '适合创意、艺术、技术等需要表达和创新的领域。你才华横溢、灵感丰富，善于用独特的视角看待世界，在创意产业中大放异彩。' },
  '财星': { icon: <Gem size={16} />, desc: '适合商业、金融、贸易等需要经营和管理的领域。你具有敏锐的商业嗅觉和出色的理财能力，善于把握机会创造财富。' },
};

/** 大运季节比喻 */
const DAYUN_SEASON_METAPHOR: Record<string, { season: string; metaphor: string; action: string }> = {
  good: { season: '春耕夏长', metaphor: '万物生长，生机勃勃', action: '适合积极进取、拓展事业、把握机遇，大胆追求心中所想' },
  bad: { season: '秋收冬藏', metaphor: '蓄势待发，静候时机', action: '适合稳扎稳打、修身养性、积蓄力量，为下一次腾飞做准备' },
  neutral: { season: '四季更替', metaphor: '平稳过渡，波澜不惊', action: '适合维持现状、稳中求进、未雨绸缪，在平淡中积累能量' },
};

// ============================================================
// 个人命盘 - 输入表单
// ============================================================
function InputForm() {
  const currentInput = useBaziStore(s => s.currentInput);
  const setInput = useBaziStore(s => s.setInput);
  const calculateBazi = useBaziStore(s => s.calculateBazi);

  const [form, setForm] = useState<AnalysisInput>(
    currentInput ?? {
      year: 1990,
      month: 1,
      day: 15,
      hour: 12,
      minute: 0,
      gender: 'male' as Gender,
      longitude: 116.4,
    }
  );

  const [isCalculating, setIsCalculating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setTimeout(() => {
      setInput(form);
      calculateBazi();
      setIsCalculating(false);
    }, 800);
  };

  const updateField = <K extends keyof AnalysisInput>(key: K, value: AnalysisInput[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <form className="input-form liquid-glass reveal" onSubmit={handleSubmit}>
      <h2 className="section-title">
        <Calculator size={18} />
        输入出生信息
      </h2>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">出生年份</label>
          <input
            type="number"
            className="form-input"
            value={form.year}
            onChange={e => updateField('year', Number(e.target.value))}
            min={1900}
            max={2100}
          />
        </div>
        <div className="form-group">
          <label className="form-label">月份</label>
          <select
            className="form-input"
            value={form.month}
            onChange={e => updateField('month', Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}月</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">日期</label>
          <input
            type="number"
            className="form-input"
            value={form.day}
            onChange={e => updateField('day', Number(e.target.value))}
            min={1}
            max={31}
          />
        </div>
        <div className="form-group">
          <label className="form-label">时</label>
          <select
            className="form-input"
            value={form.hour}
            onChange={e => updateField('hour', Number(e.target.value))}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{String(i).padStart(2, '0')}时</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">分</label>
          <input
            type="number"
            className="form-input"
            value={form.minute}
            onChange={e => updateField('minute', Number(e.target.value))}
            min={0}
            max={59}
          />
        </div>
        <div className="form-group">
          <label className="form-label">性别</label>
          <select
            className="form-input"
            value={form.gender}
            onChange={e => updateField('gender', e.target.value as Gender)}
          >
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
        </div>
        <div className="form-group form-group--wide">
          <label className="form-label">出生地经度（东经为正）</label>
          <input
            type="number"
            className="form-input"
            value={form.longitude}
            onChange={e => updateField('longitude', Number(e.target.value))}
            step={0.1}
            min={-180}
            max={180}
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className={`btn btn--primary ${isCalculating ? 'btn--loading' : ''}`}>
          <Sparkles size={16} />
          <span className="btn-text">开始排盘</span>
        </button>
      </div>
    </form>
  );
}

// ============================================================
// 个人命盘 - 四柱展示
// ============================================================
function FourPillarsDisplay() {
  const baziResult = useBaziStore(s => s.baziResult);
  const runAnalysis = useBaziStore(s => s.runAnalysis);
  const fullAnalysis = useBaziStore(s => s.fullAnalysis);
  const saveProfile = useBaziStore(s => s.saveProfile);
  const [profileName, setProfileName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!baziResult) return null;

  const { fourPillars, dayMasterName, dayMasterElement, fiveElementCount, naYinOverview, kongWang } = baziResult;

  const elementColors: Record<number, string> = {
    0: 'element-wood',
    1: 'element-fire',
    2: 'element-earth',
    3: 'element-metal',
    4: 'element-water',
  };

  const handleSave = () => {
    if (!profileName.trim()) return;
    saveProfile(profileName.trim());
    setProfileName('');
  };

  return (
    <div className="pillars-section content-enter reveal">
      <h2 className="section-title">
        <Star size={18} />
        四柱排盘
      </h2>

      {/* 四柱表格 */}
      <div className="pillars-table liquid-glass pillars-enter">
        <div className="pillars-header">
          <span></span>
          <span>年柱</span>
          <span>月柱</span>
          <span>日柱</span>
          <span>时柱</span>
        </div>
        <div className="pillars-row pillars-row--stem">
          <span className="pillars-label">天干</span>
          {(['year', 'month', 'day', 'hour'] as const).map(key => (
            <span key={key} className={`pillar-cell ${elementColors[fourPillars[key].stemElement]}`}>
              {HEAVENLY_STEMS[fourPillars[key].stem]}
            </span>
          ))}
        </div>
        <div className="pillars-row pillars-row--branch">
          <span className="pillars-label">地支</span>
          {(['year', 'month', 'day', 'hour'] as const).map(key => (
            <span key={key} className={`pillar-cell ${elementColors[fourPillars[key].branchElement]}`}>
              {EARTHLY_BRANCHES[fourPillars[key].branch]}
            </span>
          ))}
        </div>
        <div className="pillars-row pillars-row--nayin">
          <span className="pillars-label">纳音</span>
          {(['year', 'month', 'day', 'hour'] as const).map(key => (
            <span key={key} className="pillar-cell pillar-cell--nayin">
              {naYinOverview[key].name}
            </span>
          ))}
        </div>
      </div>

      {/* 日主信息 */}
      <div className="day-master-info">
        <div className="info-card">
          <span className="info-label">日主</span>
          <span className="info-value info-value--highlight">{dayMasterName}</span>
        </div>
        <div className="info-card">
          <span className="info-label">日主五行</span>
          <span className={`info-value ${elementColors[dayMasterElement]}`}>
            {ELEMENT_ICONS[dayMasterElement]}
            {FIVE_ELEMENT_NAMES[dayMasterElement]}
          </span>
        </div>
        {kongWang.branches.length > 0 && (
          <div className="info-card info-card--warning">
            <span className="info-label">空亡</span>
            <span className="info-value">
              {kongWang.branches.map(b => EARTHLY_BRANCHES[b]).join('、')}
            </span>
          </div>
        )}
      </div>

      {/* 五行统计 */}
      <div className="five-elements-bar liquid-glass reveal">
        <h3 className="subsection-title">五行分布</h3>
        <div className="elements-bar">
          {(['wood', 'fire', 'earth', 'metal', 'water'] as const).map((elem, i) => (
            <div key={elem} className="element-bar-item">
              <span className="element-bar-label">{FIVE_ELEMENT_NAMES[i as FiveElement]}</span>
              <div className="element-bar-track">
                <div
                  className={`element-bar-fill ${elementColors[i]}`}
                  style={{ width: `${Math.min((fiveElementCount[elem] / fiveElementCount.total) * 100, 100)}%` }}
                />
              </div>
              <span className="element-bar-count">{fiveElementCount[elem]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="action-bar">
        {!fullAnalysis && (
          <button
            className={`btn btn--primary ${isAnalyzing ? 'btn--loading' : ''}`}
            onClick={() => {
              setIsAnalyzing(true);
              setTimeout(() => {
                runAnalysis();
                setIsAnalyzing(false);
              }, 800);
            }}
          >
            <Sparkles size={16} />
            <span className="btn-text">开始全面分析</span>
          </button>
        )}
        <div className="save-group">
          <input
            type="text"
            className="form-input form-input--small"
            placeholder="输入命盘名称..."
            value={profileName}
            onChange={e => setProfileName(e.target.value)}
          />
          <button
            className="btn btn--secondary"
            onClick={handleSave}
            disabled={!profileName.trim() || !fullAnalysis}
          >
            <Save size={16} />
            保存命盘
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 个人命盘 - 分析结果（Bento Grid 卡片式布局）
// ============================================================
function AnalysisDisplay() {
  const fullAnalysis = useBaziStore(s => s.fullAnalysis);
  const baziResult = useBaziStore(s => s.baziResult);

  if (!fullAnalysis) return null;

  const { fiveElementCount } = baziResult || { fiveElementCount: null };

  // 五行颜色映射
  const elementColorMap: Record<number, string> = {
    0: 'var(--element-wood)',
    1: 'var(--element-fire)',
    2: 'var(--element-earth)',
    3: 'var(--element-metal)',
    4: 'var(--element-water)',
  };

  // 定义所有 Bento 卡片
  const cards: Array<{
    key: string;
    title: string;
    icon: React.ReactNode;
    span: string;
    render: () => React.ReactNode;
  }> = [
    // ---- 日主强弱 (1x1) ----
    {
      key: 'dayMasterStrength',
      title: '日主强弱',
      icon: <Mountain size={16} />,
      span: '',
      render: () => {
        const data = fullAnalysis.dayMasterStrength;
        const strengthLabel = data.strength === 'strong' ? '身强' : data.strength === 'weak' ? '身弱' : '平衡';
        const strengthColor = data.strength === 'strong' ? 'var(--element-wood)' : data.strength === 'weak' ? '#fb923c' : 'var(--gold)';
        const metaphor = STRENGTH_METAPHOR[data.strength] || '';
        return (
          <>
            <div className="bento-card-value" style={{ color: strengthColor, fontSize: '1.6rem' }}>{strengthLabel}</div>
            <div className="bento-card-indicators">
              <span className={`bento-dot ${data.details.deLing ? 'bento-dot--active' : ''}`}>得令</span>
              <span className={`bento-dot ${data.details.deDi ? 'bento-dot--active' : ''}`}>得地</span>
              <span className={`bento-dot ${data.details.deShi ? 'bento-dot--active' : ''}`}>得势</span>
            </div>
            <div className="bento-card-desc">{metaphor.slice(0, 30)}...</div>
          </>
        );
      },
    },
    // ---- 五行平衡 (2x1) ----
    {
      key: 'fiveElementBalance',
      title: '五行平衡',
      icon: <Sparkles size={16} />,
      span: 'bento-card--wide',
      render: () => {
        const data = fullAnalysis.fiveElementBalance;
        const total = fiveElementCount ? fiveElementCount.total : 1;
        const counts = fiveElementCount
          ? [fiveElementCount.wood, fiveElementCount.fire, fiveElementCount.earth, fiveElementCount.metal, fiveElementCount.water]
          : [0, 0, 0, 0, 0];
        return (
          <>
            <div className="element-bar">
              {counts.map((count, i) => (
                <div
                  key={i}
                  className="element-bar-segment"
                  style={{
                    width: `${Math.max((count / total) * 100, 2)}%`,
                    background: elementColorMap[i],
                  }}
                  title={`${FIVE_ELEMENT_NAMES[i as FiveElement]}: ${count}`}
                />
              ))}
            </div>
            <div className="element-bar-labels">
              {counts.map((count, i) => (
                <span key={i} className="element-bar-label-item" style={{ color: elementColorMap[i] }}>
                  {FIVE_ELEMENT_NAMES[i as FiveElement]} {count}
                </span>
              ))}
            </div>
            <div className="bento-card-tags">
              {data.missing.map((e, i) => (
                <span key={`m${i}`} className="bento-tag bento-tag--warning">
                  <AlertTriangle size={10} /> 缺{FIVE_ELEMENT_NAMES[e]}
                </span>
              ))}
              {data.excessive.map((e, i) => (
                <span key={`e${i}`} className="bento-tag bento-tag--info">
                  旺{FIVE_ELEMENT_NAMES[e]}
                </span>
              ))}
            </div>
            <div className="bento-card-desc">{data.analysis.slice(0, 40)}...</div>
          </>
        );
      },
    },
    // ---- 用神喜忌 (1x1) ----
    {
      key: 'yongShen',
      title: '用神喜忌',
      icon: <Target size={16} />,
      span: '',
      render: () => {
        const data = fullAnalysis.yongShen;
        const advice = YONG_SHEN_ADVICE[data.yongShen];
        return (
          <>
            <div className="bento-shen-grid">
              <div className="bento-shen-item bento-shen-item--yong">
                <span className="bento-shen-label">用神</span>
                <span className="bento-shen-value" style={{ color: 'var(--gold)' }}>{FIVE_ELEMENT_NAMES[data.yongShen]}</span>
              </div>
              <div className="bento-shen-item bento-shen-item--xi">
                <span className="bento-shen-label">喜神</span>
                <span className="bento-shen-value" style={{ color: 'var(--element-wood)' }}>{data.xiShen.map(e => FIVE_ELEMENT_NAMES[e]).join(' ')}</span>
              </div>
              <div className="bento-shen-item bento-shen-item--ji">
                <span className="bento-shen-label">忌神</span>
                <span className="bento-shen-value" style={{ color: 'var(--element-fire)' }}>{data.jiShen.map(e => FIVE_ELEMENT_NAMES[e]).join(' ')}</span>
              </div>
            </div>
            <div className="bento-card-desc">{advice ? `${advice.color} · ${advice.direction}` : ''}</div>
          </>
        );
      },
    },
    // ---- 性格特质 (1x1) ----
    {
      key: 'personality',
      title: '性格特质',
      icon: <Heart size={16} />,
      span: '',
      render: () => {
        const data = fullAnalysis.personality;
        const tagColors = [
          { bg: 'rgba(212, 168, 83, 0.12)', border: 'rgba(212, 168, 83, 0.25)', color: 'var(--gold-light)' },
          { bg: 'rgba(96, 165, 250, 0.12)', border: 'rgba(96, 165, 250, 0.25)', color: 'var(--element-water)' },
          { bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.25)', color: '#a855f7' },
          { bg: 'rgba(74, 222, 128, 0.12)', border: 'rgba(74, 222, 128, 0.25)', color: 'var(--element-wood)' },
          { bg: 'rgba(248, 113, 113, 0.12)', border: 'rgba(248, 113, 113, 0.25)', color: 'var(--element-fire)' },
        ];
        return (
          <>
            <div className="bento-card-tags">
              {data.traits.slice(0, 5).map((t, i) => {
                const tc = tagColors[i % tagColors.length];
                return (
                  <span
                    key={i}
                    className="bento-tag"
                    style={{ background: tc.bg, border: `1px solid ${tc.border}`, color: tc.color }}
                  >
                    {t}
                  </span>
                );
              })}
            </div>
            <div className="bento-card-desc">{data.analysis.slice(0, 35)}...</div>
          </>
        );
      },
    },
    // ---- 事业取向 (2x1) ----
    {
      key: 'career',
      title: '事业取向',
      icon: <Zap size={16} />,
      span: 'bento-card--wide',
      render: () => {
        const data = fullAnalysis.career;
        const matchedKey = Object.keys(CAREER_TEN_GOD_DESC).find(k => data.analysis.includes(k));
        const careerInfo = matchedKey ? CAREER_TEN_GOD_DESC[matchedKey] : null;
        return (
          <>
            <div className="bento-career-layout">
              <div className="bento-career-col">
                <div className="bento-career-direction">
                  <Compass size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                  <span className="bento-career-label">方向</span>
                  <span className="bento-career-value">{data.directions.slice(0, 3).join(' / ')}</span>
                </div>
                <div className="bento-card-tags">
                  {data.suitable.slice(0, 3).map((s, i) => (
                    <span key={i} className="bento-tag" style={{ background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.2)', color: 'var(--element-water)' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              {careerInfo && (
                <div className="bento-career-col">
                  <div className="bento-career-ten-god">
                    <span style={{ color: 'var(--gold)', flexShrink: 0 }}>{careerInfo.icon}</span>
                    <span>{careerInfo.desc.slice(0, 50)}...</span>
                  </div>
                </div>
              )}
            </div>
            <div className="bento-card-desc">适合{data.suitable.slice(0, 2).join('、')}相关领域发展</div>
          </>
        );
      },
    },
    // ---- 财富格局 (1x1) ----
    {
      key: 'wealth',
      title: '财富格局',
      icon: <Gem size={16} />,
      span: '',
      render: () => {
        const data = fullAnalysis.wealth;
        return (
          <>
            <div className="bento-card-value" style={{ color: 'var(--gold)' }}>{data.level}</div>
            <div className="bento-card-tags">
              <span className="bento-tag" style={{ background: 'rgba(212, 168, 83, 0.1)', border: '1px solid rgba(212, 168, 83, 0.2)', color: 'var(--gold-light)' }}>
                {data.pattern}
              </span>
            </div>
            <div className="bento-card-desc">{data.analysis.slice(0, 35)}...</div>
          </>
        );
      },
    },
    // ---- 婚姻感情 (1x1) ----
    {
      key: 'marriage',
      title: '婚姻感情',
      icon: <Heart size={16} />,
      span: '',
      render: () => {
        const data = fullAnalysis.marriage;
        return (
          <>
            <div className="bento-card-tags">
              <span className="bento-tag" style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)', color: '#d8b4fe' }}>
                {data.pattern}
              </span>
            </div>
            <div className="bento-marriage-timing">
              <Clock size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <span>{data.timing}</span>
            </div>
            <div className="bento-card-desc">感情中倾向于{data.pattern}模式</div>
          </>
        );
      },
    },
    // ---- 子女缘分 (1x1) ----
    {
      key: 'children',
      title: '子女缘分',
      icon: <Sparkles size={16} />,
      span: '',
      render: () => {
        const data = fullAnalysis.children;
        return (
          <>
            <div className="bento-card-value" style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{data.prospect}</div>
            <div className="bento-card-desc">{data.analysis.slice(0, 40)}...</div>
          </>
        );
      },
    },
    // ---- 健康倾向 (2x1) ----
    {
      key: 'health',
      title: '健康倾向',
      icon: <Shield size={16} />,
      span: 'bento-card--wide',
      render: () => {
        const data = fullAnalysis.health;
        return (
          <>
            <div className="bento-health-bars">
              {data.risks.slice(0, 4).map((r, i) => {
                const severityColor = r.severity === 'high' ? 'var(--element-fire)' : r.severity === 'medium' ? 'var(--element-earth)' : 'var(--element-wood)';
                const severityWidth = r.severity === 'high' ? '85%' : r.severity === 'medium' ? '55%' : '30%';
                return (
                  <div key={i} className="bento-health-item">
                    <span className="bento-health-organ">{r.organ}</span>
                    <div className="bento-health-track">
                      <div className="bento-health-fill" style={{ width: severityWidth, background: severityColor }} />
                    </div>
                    <span className="bento-health-severity" style={{ color: severityColor }}>
                      {r.severity === 'high' ? '高' : r.severity === 'medium' ? '中' : '低'}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="bento-card-desc">{data.advice.slice(0, 40)}...</div>
          </>
        );
      },
    },
    // ---- 大运走势 (3x1) ----
    {
      key: 'daYunTrend',
      title: '大运走势',
      icon: <Mountain size={16} />,
      span: 'bento-card--full',
      render: () => {
        const data = fullAnalysis.daYunTrend;
        return (
          <>
            <div className="dayun-timeline">
              {data.periods.slice(0, 5).map((p, i) => {
                const seasonInfo = DAYUN_SEASON_METAPHOR[p.trend];
                const trendColor = p.trend === 'good' ? 'var(--element-wood)' : p.trend === 'bad' ? 'var(--element-fire)' : 'var(--element-earth)';
                const trendBg = p.trend === 'good' ? 'rgba(74, 222, 128, 0.1)' : p.trend === 'bad' ? 'rgba(248, 113, 113, 0.1)' : 'rgba(250, 204, 21, 0.1)';
                const trendBorder = p.trend === 'good' ? 'rgba(74, 222, 128, 0.25)' : p.trend === 'bad' ? 'rgba(248, 113, 113, 0.25)' : 'rgba(250, 204, 21, 0.25)';
                return (
                  <div key={i} className="dayun-timeline-item">
                    <div className="dayun-timeline-connector" style={{ background: trendColor }} />
                    <span className="dayun-timeline-name">{p.period}</span>
                    <span
                      className="bento-tag"
                      style={{ background: trendBg, border: `1px solid ${trendBorder}`, color: trendColor, margin: '6px auto' }}
                    >
                      {p.trend === 'good' ? '吉' : p.trend === 'bad' ? '凶' : '平'}
                    </span>
                    <p className="dayun-timeline-desc">{p.description.slice(0, 20)}...</p>
                    {seasonInfo && (
                      <p className="dayun-timeline-season" style={{ color: trendColor }}>
                        {seasonInfo.season}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        );
      },
    },
    // ---- 流年提示 (2x1) ----
    {
      key: 'liuNian',
      title: '流年提示',
      icon: <Clock size={16} />,
      span: 'bento-card--wide',
      render: () => {
        const data = fullAnalysis.liuNian;
        return (
          <>
            <div className="bento-card-value" style={{ fontSize: '1.3rem', color: 'var(--gold)' }}>{data.year}年</div>
            <div className="bento-liunian-tips">
              {data.details.slice(0, 3).map((d, i) => (
                <div key={i} className="bento-liunian-tip">
                  <span style={{ color: 'var(--gold)', flexShrink: 0 }}><Zap size={10} /></span>
                  <span>{d.slice(0, 25)}...</span>
                </div>
              ))}
            </div>
            <div className="bento-card-desc">{data.advice.slice(0, 35)}...</div>
          </>
        );
      },
    },
    // ---- 神煞分析 (2x1) ----
    {
      key: 'shenSha',
      title: '神煞分析',
      icon: <Star size={16} />,
      span: 'bento-card--wide',
      render: () => {
        const data = fullAnalysis.shenSha;
        const jiShen = data.shenShaList.filter(s => s.type === '吉');
        const xiongShen = data.shenShaList.filter(s => s.type === '凶');
        return (
          <>
            <div className="bento-shensha-grid">
              {jiShen.slice(0, 4).map((s, i) => (
                <div key={i} className="bento-shensha-item bento-shensha-item--ji">
                  <span className="bento-shensha-name">{s.name}</span>
                  <span className="bento-shensha-location">{s.location}</span>
                </div>
              ))}
              {xiongShen.slice(0, 2).map((s, i) => (
                <div key={`x${i}`} className="bento-shensha-item bento-shensha-item--xiong">
                  <span className="bento-shensha-name">{s.name}</span>
                  <span className="bento-shensha-location">{s.location}</span>
                </div>
              ))}
            </div>
            <div className="bento-card-desc">{data.summary.slice(0, 40)}...</div>
          </>
        );
      },
    },
    // ---- 格局判定 (1x1) ----
    {
      key: 'pattern',
      title: '格局判定',
      icon: <Crown size={16} />,
      span: '',
      render: () => {
        const data = fullAnalysis.pattern;
        return (
          <>
            <div className="bento-card-value" style={{ fontSize: '1.2rem', color: 'var(--gold)' }}>{data.pattern}</div>
            <div className="bento-card-tags">
              <span className="bento-tag" style={{ background: 'rgba(212, 168, 83, 0.1)', border: '1px solid rgba(212, 168, 83, 0.2)', color: 'var(--gold-light)' }}>
                {data.patternType}
              </span>
              <span className="bento-tag" style={{ background: data.strength >= 60 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)', border: `1px solid ${data.strength >= 60 ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`, color: data.strength >= 60 ? 'var(--element-wood)' : 'var(--element-fire)' }}>
                强度{data.strength}%
              </span>
            </div>
            <div className="bento-card-desc">{data.description.slice(0, 35)}...</div>
          </>
        );
      },
    },
    // ---- 趋避建议 (1x1) ----
    {
      key: 'advice',
      title: '趋避建议',
      icon: <Compass size={16} />,
      span: '',
      render: () => {
        const data = fullAnalysis.advice;
        return (
          <>
            <div className="bento-advice-grid">
              <div className="bento-advice-col">
                <span className="bento-advice-label bento-advice-label--favorable">
                  <CheckCircle size={10} /> 宜
                </span>
                {data.favorable.slice(0, 2).map((item, i) => (
                  <span key={i} className="bento-advice-item">{item.slice(0, 10)}</span>
                ))}
              </div>
              <div className="bento-advice-col">
                <span className="bento-advice-label bento-advice-label--unfavorable">
                  <XCircle size={10} /> 忌
                </span>
                {data.unfavorable.slice(0, 2).map((item, i) => (
                  <span key={i} className="bento-advice-item">{item.slice(0, 10)}</span>
                ))}
              </div>
            </div>
            <div className="bento-card-tags" style={{ marginTop: '8px' }}>
              {data.directions.slice(0, 2).map((d, i) => (
                <span key={`d${i}`} className="bento-tag" style={{ background: 'rgba(212, 168, 83, 0.1)', border: '1px solid rgba(212, 168, 83, 0.2)', color: 'var(--gold-light)' }}>
                  <Compass size={10} /> {d}
                </span>
              ))}
              {data.colors.slice(0, 2).map((c, i) => (
                <span key={`c${i}`} className="bento-tag" style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)', color: '#d8b4fe' }}>
                  <Palette size={10} /> {c}
                </span>
              ))}
            </div>
          </>
        );
      },
    },
  ];

  return (
    <div className="analysis-section content-enter">
      <div className="bento-grid">
        {cards.map((card, idx) => (
          <div
            key={card.key}
            className={`bento-card ${card.span} reveal reveal-delay-${Math.min(idx + 1, 6)}`}
          >
            <div className="bento-card-header">
              <span style={{ color: 'var(--gold)', opacity: 0.8 }}>{card.icon}</span>
              <span className="bento-card-title">{card.title}</span>
            </div>
            {card.render()}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Hero 装饰区域
// ============================================================
function HeroBanner() {
  const quote = useMemo(() => {
    const idx = Math.floor(Math.random() * WISDOM_QUOTES.length);
    return WISDOM_QUOTES[idx];
  }, []);

  // 将谚语拆成单字，每个字独立漂浮（随机幅度和周期）
  const chars = quote.text.split('');
  const floatParams = useMemo(() =>
    chars.map(() => ({
      duration: 2.8 + Math.random() * 2,       // 2.8~4.8s 周期
      distance: 2 + Math.random() * 3,          // 2~5px 幅度
      delay: 0,                                  // 由 style.animationDelay 控制
    })),
  [chars.length]);

  return (
    <div className="hero-banner">
      <div className="hero-banner-bg" />
      <div className="hero-content">
        <p className="hero-quote">
          {chars.map((char, i) => {
            const p = floatParams[i];
            return (
              <span
                key={i}
                className="hero-float-char"
                style={{
                  animationDelay: `${i * 0.12}s`,
                  animationDuration: `0.8s, ${p.duration}s`,
                  '--float-y': `${p.distance}px`,
                } as React.CSSProperties}
              >
                {char}
              </span>
            );
          })}
        </p>
        <div className="hero-divider" />
        <span className="hero-source">{quote.source}</span>
      </div>
    </div>
  );
}

// ============================================================
// 个人命盘页面
// ============================================================
function SinglePage() {
  useReveal('.reveal', 0.1);

  return (
    <div className="page-single">
      <HeroBanner />
      <InputForm />
      <FourPillarsDisplay />
      <AnalysisDisplay />
    </div>
  );
}

// ============================================================
// 双人合盘页面
// ============================================================
function SynastryPage() {
  useReveal('.reveal', 0.1);

  const synastryInput1 = useBaziStore(s => s.synastryInput1);
  const synastryInput2 = useBaziStore(s => s.synastryInput2);
  const synastryResult = useBaziStore(s => s.synastryResult);
  const synastryBaziResult1 = useBaziStore(s => s.synastryBaziResult1);
  const synastryBaziResult2 = useBaziStore(s => s.synastryBaziResult2);
  const setSynastryInputs = useBaziStore(s => s.setSynastryInputs);
  const runSynastry = useBaziStore(s => s.runSynastry);

  const [form1, setForm1] = useState<AnalysisInput>(
    synastryInput1 ?? { year: 1990, month: 1, day: 15, hour: 12, minute: 0, gender: 'male' as Gender, longitude: 116.4 }
  );
  const [form2, setForm2] = useState<AnalysisInput>(
    synastryInput2 ?? { year: 1992, month: 6, day: 20, hour: 8, minute: 30, gender: 'female' as Gender, longitude: 116.4 }
  );

  const relationshipProfile: RelationshipProfile | null = useMemo(() => {
    if (synastryBaziResult1 && synastryBaziResult2) {
      return analyzeRelationships(synastryBaziResult1, synastryBaziResult2);
    }
    return null;
  }, [synastryBaziResult1, synastryBaziResult2]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSynastryInputs(form1, form2);
    runSynastry();
  };

  const renderMiniForm = (
    label: string,
    form: AnalysisInput,
    setForm: (f: AnalysisInput) => void,
  ) => (
    <div className="synastry-form-card liquid-glass reveal">
      <h3 className="synastry-form-label">{label}</h3>
      <div className="form-grid form-grid--compact">
        <div className="form-group">
          <label className="form-label">年份</label>
          <input type="number" className="form-input" value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })} min={1900} max={2100} />
        </div>
        <div className="form-group">
          <label className="form-label">月</label>
          <select className="form-input" value={form.month} onChange={e => setForm({ ...form, month: Number(e.target.value) })}>
            {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">日</label>
          <input type="number" className="form-input" value={form.day} onChange={e => setForm({ ...form, day: Number(e.target.value) })} min={1} max={31} />
        </div>
        <div className="form-group">
          <label className="form-label">时</label>
          <select className="form-input" value={form.hour} onChange={e => setForm({ ...form, hour: Number(e.target.value) })}>
            {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, '0')}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">分</label>
          <input type="number" className="form-input" value={form.minute} onChange={e => setForm({ ...form, minute: Number(e.target.value) })} min={0} max={59} />
        </div>
        <div className="form-group">
          <label className="form-label">性别</label>
          <select className="form-input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value as Gender })}>
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
        </div>
      </div>
    </div>
  );

  const tianGanTypeColor: Record<string, { bg: string; border: string; text: string; tagClass: string }> = {
    '合': { bg: 'rgba(74, 222, 128, 0.06)', border: 'rgba(74, 222, 128, 0.2)', text: '#4ade80', tagClass: 'relation-tag--combine' },
    '冲': { bg: 'rgba(248, 113, 113, 0.06)', border: 'rgba(248, 113, 113, 0.2)', text: '#f87171', tagClass: 'relation-tag--clash' },
    '克': { bg: 'rgba(250, 204, 21, 0.06)', border: 'rgba(250, 204, 21, 0.2)', text: '#facc15', tagClass: 'relation-tag--overcome' },
    '生': { bg: 'rgba(96, 165, 250, 0.06)', border: 'rgba(96, 165, 250, 0.2)', text: '#60a5fa', tagClass: 'relation-tag--generate' },
    '比和': { bg: 'rgba(138, 143, 152, 0.06)', border: 'rgba(138, 143, 152, 0.2)', text: '#8a8f98', tagClass: 'relation-tag--neutral' },
    '泄': { bg: 'rgba(168, 85, 247, 0.06)', border: 'rgba(168, 85, 247, 0.2)', text: '#a855f7', tagClass: 'relation-tag--neutral' },
  };

  return (
    <div className="page-synastry">
      <HeroBanner />
      <form onSubmit={handleSubmit}>
        <h2 className="section-title reveal">
          <Heart size={18} />
          双人合盘分析
        </h2>
        <div className="synastry-forms">
          {renderMiniForm('甲方信息', form1, setForm1)}
          {renderMiniForm('乙方信息', form2, setForm2)}
        </div>
        <button type="submit" className="btn btn--primary reveal">
          <Sparkles size={16} />
          开始合盘分析
        </button>
      </form>

      {synastryResult && relationshipProfile && (
        <div className="synastry-result">
          <h2 className="section-title reveal">合盘结果</h2>

          {/* 荣亲关系 - 基于二十八星宿体系 */}
          {relationshipProfile.rongQin.isRongQin ? (
            <div className="rongqin-card">
              <div className="rongqin-header">
                <Heart size={22} style={{ color: 'var(--gold)', fill: 'var(--gold)' }} />
                <span className="rongqin-title">
                  {relationshipProfile.rongQin.rongQinTitle || '荣亲关系'}
                </span>
                <span className="rongqin-badge">
                  {relationshipProfile.rongQin.xingXiuA}宿 · {relationshipProfile.rongQin.xingXiuB}宿
                </span>
              </div>
              <p className="rongqin-desc">{relationshipProfile.rongQin.description}</p>
              <p className="rongqin-detail">{relationshipProfile.rongQin.detail}</p>
              {/* 荣亲角色 */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '14px',
                padding: '12px 14px',
                background: 'rgba(212, 168, 83, 0.06)',
                borderRadius: '10px',
                border: '1px solid rgba(212, 168, 83, 0.12)',
              }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>甲方角色</span>
                  <span style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: relationshipProfile.rongQin.rongQinRoleA === '荣' ? 'var(--gold)' : 'var(--gold-light)',
                  }}>
                    {relationshipProfile.rongQin.rongQinRoleA}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                    {relationshipProfile.rongQin.rongQinRoleA === '荣' ? '滋养、成全对方' : '被庇护、依赖对方'}
                  </span>
                </div>
                <div style={{
                  width: '1px',
                  background: 'linear-gradient(180deg, transparent, var(--gold-muted), transparent)',
                }} />
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>乙方角色</span>
                  <span style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: relationshipProfile.rongQin.rongQinRoleB === '荣' ? 'var(--gold)' : 'var(--gold-light)',
                  }}>
                    {relationshipProfile.rongQin.rongQinRoleB}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                    {relationshipProfile.rongQin.rongQinRoleB === '荣' ? '滋养、成全对方' : '被庇护、依赖对方'}
                  </span>
                </div>
              </div>
              {/* 关系特质 */}
              {relationshipProfile.rongQin.rongQinTraits && relationshipProfile.rongQin.rongQinTraits.length > 0 && (
                <div style={{ marginTop: '14px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    color: 'var(--gold)',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    display: 'block',
                    marginBottom: '8px',
                  }}>
                    关系特质
                  </span>
                  {relationshipProfile.rongQin.rongQinTraits.map((trait, i) => (
                    <div key={i} style={{
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '6px',
                      marginBottom: '6px',
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.7,
                      borderLeft: '2px solid var(--gold-dark)',
                    }}>
                      {trait}
                    </div>
                  ))}
                </div>
              )}
              {/* 相处建议 */}
              {relationshipProfile.rongQin.rongQinAdvice && (
                <div style={{
                  marginTop: '14px',
                  padding: '12px 14px',
                  background: 'linear-gradient(135deg, rgba(212, 168, 83, 0.05), rgba(212, 168, 83, 0.02))',
                  borderRadius: '10px',
                  border: '1px solid rgba(212, 168, 83, 0.1)',
                  fontSize: '0.85rem',
                  color: 'var(--gold-light)',
                  lineHeight: 1.8,
                }}>
                  <span style={{ fontWeight: 600, color: 'var(--gold)', display: 'block', marginBottom: '4px' }}>
                    相处建议
                  </span>
                  {relationshipProfile.rongQin.rongQinAdvice}
                </div>
              )}
            </div>
          ) : (
            <div className="rongqin-card">
              <div className="rongqin-header">
                <Heart size={22} style={{ color: 'var(--gold)', fill: 'var(--gold)' }} />
                <span className="rongqin-title">
                  {relationshipProfile.rongQin.xingXiuRelation || '星宿关系'}
                </span>
                <span className="rongqin-badge">
                  {relationshipProfile.rongQin.xingXiuA}宿 · {relationshipProfile.rongQin.xingXiuB}宿
                </span>
              </div>
              {/* 尝试使用详细描述 */}
              {(() => {
                const relationType = relationshipProfile.rongQin.xingXiuRelation;
                const details = relationType ? XINGXIU_RELATION_DETAILS[relationType] : undefined;
                if (details) {
                  // 取第一个可用的距离描述
                  const distanceKey = Object.keys(details)[0];
                  const detail = distanceKey ? details[distanceKey] : undefined;
                  if (detail) {
                    return (
                      <>
                        <p className="rongqin-desc" style={{ fontSize: '0.85rem', color: 'var(--gold-light)', marginBottom: '6px' }}>
                          {detail.subtitle}
                        </p>
                        <p className="rongqin-desc">{detail.desc}</p>
                        {/* 角色描述 */}
                        <div style={{
                          display: 'flex', gap: '12px', marginTop: '14px',
                          padding: '12px 14px',
                          background: 'rgba(212, 168, 83, 0.06)',
                          borderRadius: '10px',
                          border: '1px solid rgba(212, 168, 83, 0.12)',
                        }}>
                          <div style={{ flex: 1, textAlign: 'center' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>甲方</span>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                              {detail.roleADesc}
                            </span>
                          </div>
                          <div style={{ width: '1px', background: 'linear-gradient(180deg, transparent, var(--gold-muted), transparent)' }} />
                          <div style={{ flex: 1, textAlign: 'center' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>乙方</span>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                              {detail.roleBDesc}
                            </span>
                          </div>
                        </div>
                        {/* 关系特质 */}
                        {detail.traits && detail.traits.length > 0 && (
                          <div style={{ marginTop: '14px' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '2px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                              关系特质
                            </span>
                            {detail.traits.map((trait: string, i: number) => (
                              <div key={i} style={{
                                padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)',
                                borderRadius: '6px', marginBottom: '6px', fontSize: '0.82rem',
                                color: 'var(--text-secondary)', lineHeight: 1.7,
                                borderLeft: '2px solid var(--gold-dark)',
                              }}>
                                {trait}
                              </div>
                            ))}
                          </div>
                        )}
                        {/* 相处建议 */}
                        {detail.advice && (
                          <div style={{
                            marginTop: '14px', padding: '12px 14px',
                            background: 'linear-gradient(135deg, rgba(212, 168, 83, 0.05), rgba(212, 168, 83, 0.02))',
                            borderRadius: '10px', border: '1px solid rgba(212, 168, 83, 0.1)',
                            fontSize: '0.85rem', color: 'var(--gold-light)', lineHeight: 1.8,
                          }}>
                            <span style={{ fontWeight: 600, color: 'var(--gold)', display: 'block', marginBottom: '4px' }}>相处建议</span>
                            {detail.advice}
                          </div>
                        )}
                      </>
                    );
                  }
                }
                return (
                  <>
                    <p className="rongqin-desc">{relationshipProfile.rongQin.description}</p>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      星宿：{relationshipProfile.rongQin.xingXiuA}宿 · {relationshipProfile.rongQin.xingXiuB}宿
                    </p>
                  </>
                );
              })()}
            </div>
          )}

          {/* 雷达图匹配度分析 */}
          <div className="reveal" style={{ marginBottom: '18px' }}>
            <SynastryRadar data={synastryResult} />
          </div>

          {/* 用神互补性分析 */}
          {synastryResult.yongShenComplement && (
            <div className="analysis-card liquid-glass reveal" style={{ marginBottom: '18px' }}>
              <h3 className="subsection-title">
                <Sparkles size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                用神互补性分析
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <div className={`day-pillar-score day-pillar-score--${
                  synastryResult.yongShenComplement.complementScore >= 0.7 ? 'high' :
                  synastryResult.yongShenComplement.complementScore >= 0.4 ? 'medium' : 'low'
                }`}>
                  <span className="day-pillar-score-value">{Math.round(synastryResult.yongShenComplement.complementScore * 100)}</span>
                  <span className="day-pillar-score-label">互补度</span>
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, flex: 1 }}>
                  {synastryResult.yongShenComplement.description}
                </p>
              </div>
              {synastryResult.yongShenComplement.details && synastryResult.yongShenComplement.details.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {synastryResult.yongShenComplement.details.map((d, i) => (
                    <div key={i} style={{
                      padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)',
                      lineHeight: 1.7, borderLeft: '2px solid rgba(139, 92, 246, 0.5)',
                    }}>
                      {d}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 天干关系 */}
          {relationshipProfile.tianGanRelations.relations.length > 0 && (
            <div className="analysis-card liquid-glass reveal">
              <h3 className="subsection-title">
                <Zap size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                天干关系分析
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {relationshipProfile.tianGanRelations.relations.map((r, i) => {
                  const color = tianGanTypeColor[r.type] || tianGanTypeColor['比和'];
                  return (
                    <div
                      key={i}
                      className="relation-card"
                      style={{
                        background: color.bg,
                        borderColor: color.border,
                        borderLeftWidth: '3px',
                        borderLeftColor: color.border,
                      }}
                    >
                      <div className="relation-card-header">
                        <span className="relation-card-stem">{r.stem1}</span>
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                        <span className="relation-card-stem">{r.stem2}</span>
                        <span className={`relation-tag ${color.tagClass}`}>{r.type}</span>
                        <span style={{ color: color.text, fontSize: '0.85rem', fontWeight: 500 }}>
                          {r.description}
                        </span>
                      </div>
                      <p className="relation-card-desc" style={{ color: 'var(--text-secondary)' }}>
                        {r.influence}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 地支关系 */}
          {relationshipProfile.diZhiRelations.relations.length > 0 && (
            <div className="analysis-card liquid-glass reveal">
              <h3 className="subsection-title">
                <Shield size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                地支关系分析
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {relationshipProfile.diZhiRelations.relations.map((r, i) => (
                  <div
                    key={i}
                    className="relation-card"
                    style={{
                      background: 'rgba(99, 102, 241, 0.04)',
                      borderColor: 'rgba(99, 102, 241, 0.12)',
                      borderLeftWidth: '3px',
                      borderLeftColor: '#6366f1',
                    }}
                  >
                    <div className="relation-card-header">
                      <span className="relation-card-stem">{r.branch1}</span>
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                      <span className="relation-card-stem">{r.branch2}</span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {r.types.map((t, j) => (
                          <span key={j} className="relation-tag relation-tag--neutral">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    {r.descriptions.map((desc, j) => (
                      <p key={j} className="relation-card-desc" style={{ color: 'var(--text-secondary)' }}>
                        {desc}
                      </p>
                    ))}
                    <p style={{ margin: '6px 0 0 0', color: '#818cf8', fontSize: '0.85rem', fontWeight: 500 }}>
                      {r.influence}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 日柱关系 */}
          <div className="analysis-card liquid-glass reveal">
            <h3 className="subsection-title">
              <Target size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
              日柱关系（核心关系）
            </h3>
            <div className="day-pillar-core">
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '18px', flexWrap: 'wrap' }}>
                <div className={`day-pillar-score day-pillar-score--${
                  relationshipProfile.dayPillarRelation.compatibility >= 70 ? 'high' :
                  relationshipProfile.dayPillarRelation.compatibility >= 40 ? 'medium' : 'low'
                }`}>
                  <span className="day-pillar-score-value">{relationshipProfile.dayPillarRelation.compatibility}</span>
                  <span className="day-pillar-score-label">分</span>
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>天干关系：</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {relationshipProfile.dayPillarRelation.stemRelation}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>地支关系：</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {relationshipProfile.dayPillarRelation.branchRelation}
                    </span>
                  </div>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8, margin: '0 0 14px 0' }}>
                {relationshipProfile.dayPillarRelation.description}
              </p>
              <div className="day-pillar-advice">
                <span style={{ fontWeight: 600, color: '#818cf8', fontSize: '0.85rem' }}>相处建议：</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7 }}>
                  {relationshipProfile.dayPillarRelation.advice}
                </span>
              </div>
            </div>
          </div>

          {/* 综合关系评估 */}
          <div className="analysis-card liquid-glass reveal">
            <h3 className="subsection-title">
              <Heart size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
              综合关系评估
            </h3>
            <div className="assessment-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '18px', flexWrap: 'wrap' }}>
                <div className={`assessment-score assessment-score--${
                  relationshipProfile.overallScore >= 70 ? 'high' :
                  relationshipProfile.overallScore >= 50 ? 'medium' : 'low'
                }`}>
                  <span className="assessment-score-value">{relationshipProfile.overallScore}</span>
                  <span className="assessment-score-label">综合分</span>
                </div>
                <div>
                  <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>
                    {relationshipProfile.overallScore >= 70 ? '缘分深厚' : relationshipProfile.overallScore >= 50 ? '有缘有分' : '需要磨合'}
                  </p>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    {relationshipProfile.summary}
                  </p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                {[
                  { label: '日柱配合', score: relationshipProfile.dayPillarRelation.compatibility, color: '#818cf8' },
                  { label: '天干关系', score: Math.min(100, 50 + relationshipProfile.tianGanRelations.relations.filter(r => r.type === '合').length * 15 - relationshipProfile.tianGanRelations.relations.filter(r => r.type === '冲').length * 10), color: '#60a5fa' },
                  { label: '地支关系', score: Math.min(100, 50 + relationshipProfile.diZhiRelations.relations.filter(r => r.types.some(t => t.includes('六合') || t.includes('三合'))).length * 12 - relationshipProfile.diZhiRelations.relations.filter(r => r.types.some(t => t.includes('六冲') || t.includes('六害') || t.includes('三刑'))).length * 8), color: '#a855f7' },
                  { label: '荣亲加成', score: relationshipProfile.rongQin.isRongQin ? 90 : 40, color: '#fbbf24' },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: item.color }}>{item.score}</span>
                    </div>
                    <div className="score-bar-track">
                      <div
                        className="score-bar-fill"
                        style={{
                          width: `${item.score}%`,
                          background: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8, margin: 0 }}>
                {relationshipProfile.summary}
              </p>
            </div>
            {relationshipProfile.strengths.length > 0 && (
              <div className="advice-block advice-block--positive" style={{ marginBottom: '12px' }}>
                <CheckCircle size={14} />
                <div>
                  <strong>优势</strong>
                  <ul>
                    {relationshipProfile.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </div>
            )}
            {relationshipProfile.challenges.length > 0 && (
              <div className="advice-block advice-block--negative" style={{ marginBottom: '12px' }}>
                <XCircle size={14} />
                <div>
                  <strong>挑战</strong>
                  <ul>
                    {relationshipProfile.challenges.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              </div>
            )}
            {relationshipProfile.suggestions.length > 0 && (
              <div className="advice-block advice-block--neutral" style={{ marginBottom: '12px' }}>
                <AlertTriangle size={14} />
                <div>
                  <strong>建议</strong>
                  <ul>
                    {relationshipProfile.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </div>
            )}
            {/* 合盘引擎补充建议 */}
            {synastryResult.advice.overallAdvice && (
              <div style={{
                marginTop: '14px', padding: '12px 14px',
                background: 'linear-gradient(135deg, rgba(212, 168, 83, 0.05), rgba(212, 168, 83, 0.02))',
                borderRadius: '10px', border: '1px solid rgba(212, 168, 83, 0.1)',
                fontSize: '0.85rem', color: 'var(--gold-light)', lineHeight: 1.8,
              }}>
                {synastryResult.advice.overallAdvice}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 历史记录页面
// ============================================================
function HistoryPage() {
  useReveal('.reveal', 0.1);

  const savedProfiles = useBaziStore(s => s.savedProfiles);
  const deleteProfile = useBaziStore(s => s.deleteProfile);
  const loadProfile = useBaziStore(s => s.loadProfile);
  const clearAll = useBaziStore(s => s.clearAll);

  if (savedProfiles.length === 0) {
    return (
      <div className="page-history">
        <h2 className="section-title">
          <Clock size={18} />
          历史记录
        </h2>
        <div className="empty-state">
          <p>暂无保存的命盘记录</p>
          <p className="empty-hint">在个人命盘页面排盘后可保存命盘</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-history">
      <div className="history-header reveal">
        <h2 className="section-title">
          <Clock size={18} />
          历史记录
        </h2>
        <button className="btn btn--danger btn--small" onClick={clearAll}>
          <RotateCcw size={14} />
          清空全部
        </button>
      </div>
      <div className="history-list">
        {savedProfiles.map((profile, idx) => (
          <div key={profile.id} className={`history-card liquid-glass reveal reveal-delay-${Math.min(idx + 1, 6)}`}>
            <div className="history-card-info">
              <h3 className="history-card-name">{profile.name}</h3>
              <p className="history-card-date">
                {new Date(profile.createdAt).toLocaleString('zh-CN')}
              </p>
              <p className="history-card-input">
                {profile.input.year}年{profile.input.month}月{profile.input.day}日
                {profile.input.gender === 'male' ? ' 男' : ' 女'}
              </p>
              <p className="history-card-daymaster">
                日主: {profile.result.dayMasterName}（{FIVE_ELEMENT_NAMES[profile.result.dayMasterElement]}）
              </p>
            </div>
            <div className="history-card-actions">
              <button className="btn btn--secondary btn--small" onClick={() => loadProfile(profile)}>
                加载
              </button>
              <button className="btn btn--danger btn--small" onClick={() => deleteProfile(profile.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// App 主组件
// ============================================================
export default function App() {
  const activeTab = useBaziStore(s => s.activeTab);

  return (
    <MainLayout>
      {activeTab === 'single' && <SinglePage />}
      {activeTab === 'synastry' && <SynastryPage />}
      {activeTab === 'history' && <HistoryPage />}
    </MainLayout>
  );
}

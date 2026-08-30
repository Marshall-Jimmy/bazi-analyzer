// 验证重构后的 baziCalculator 输出
import { calculateBazi } from './src/engine/baziCalculator.ts';

// 测试用例1：2006年2月13日14:00 男命（用户示例中的日期）
const result1 = calculateBazi({
  year: 2006, month: 2, day: 13, hour: 14, minute: 0,
  gender: 'male', longitude: 120,
});

console.log('=== 测试用例1: 2006-02-13 14:00 男 ===');
console.log(`年柱: ${result1.fourPillars.year.stem} ${result1.fourPillars.year.branch}`);
console.log(`月柱: ${result1.fourPillars.month.stem} ${result1.fourPillars.month.branch}`);
console.log(`日柱: ${result1.fourPillars.day.stem} ${result1.fourPillars.day.branch}`);
console.log(`时柱: ${result1.fourPillars.hour.stem} ${result1.fourPillars.hour.branch}`);
console.log(`日主: ${result1.dayMasterName}`);
console.log(`大运数量: ${result1.daYunList.length}`);
if (result1.daYunList.length > 0) {
  console.log(`第1步大运: startAge=${result1.daYunList[0].startAge}, startYear=${result1.daYunList[0].startYear}`);
}
console.log(`流年数量: ${result1.liuNianList.length}`);
console.log(`真太阳时校正: ${result1.isTrueSolarTimeAdjusted}`);
console.log(`胎元: ${result1.taiYuan.stemName}${result1.taiYuan.branchName}`);
console.log(`命宫: ${result1.mingGong.stemName}${result1.mingGong.branchName}`);
console.log(`身宫: ${result1.shenGong.stemName}${result1.shenGong.branchName}`);
console.log('');

// 测试用例2：2005年12月23日08:37 男命（lunar-javascript 测试用例）
const result2 = calculateBazi({
  year: 2005, month: 12, day: 23, hour: 8, minute: 37,
  gender: 'male', longitude: 120,
});

console.log('=== 测试用例2: 2005-12-23 08:37 男 ===');
console.log(`年柱: ${result2.fourPillars.year.stem} ${result2.fourPillars.year.branch}`);
console.log(`月柱: ${result2.fourPillars.month.stem} ${result2.fourPillars.month.branch}`);
console.log(`日柱: ${result2.fourPillars.day.stem} ${result2.fourPillars.day.branch}`);
console.log(`时柱: ${result2.fourPillars.hour.stem} ${result2.fourPillars.hour.branch}`);
// lunar-javascript 测试: 乙酉 戊子 辛巳 壬辰
// 对应索引: year=1,10 month=4,0 day=7,5 hour=8,0
console.log('期望: 乙(1)酉(10) 戊(4)子(0) 辛(7)巳(5) 壬(8)辰(4)');
console.log('');

// 测试用例3：1988年2月15日23:30 男命（lunar-javascript 测试用例）
const result3 = calculateBazi({
  year: 1988, month: 2, day: 15, hour: 23, minute: 30,
  gender: 'male', longitude: 120,
});

console.log('=== 测试用例3: 1988-02-15 23:30 男 ===');
console.log(`年柱: ${result3.fourPillars.year.stem} ${result3.fourPillars.year.branch}`);
console.log(`月柱: ${result3.fourPillars.month.stem} ${result3.fourPillars.month.branch}`);
console.log(`日柱: ${result3.fourPillars.day.stem} ${result3.fourPillars.day.branch}`);
console.log(`时柱: ${result3.fourPillars.hour.stem} ${result3.fourPillars.hour.branch}`);
// lunar-javascript 测试: 戊辰 甲寅 庚子 戊子
console.log('期望: 戊(4)辰(4) 甲(0)寅(2) 庚(6)子(0) 戊(4)子(0)');
console.log('');

// 测试用例4：1999年6月7日09:11 男命（lunar-javascript 测试用例）
const result4 = calculateBazi({
  year: 1999, month: 6, day: 7, hour: 9, minute: 11,
  gender: 'male', longitude: 120,
});

console.log('=== 测试用例4: 1999-06-07 09:11 男 ===');
console.log(`年柱: ${result4.fourPillars.year.stem} ${result4.fourPillars.year.branch}`);
console.log(`月柱: ${result4.fourPillars.month.stem} ${result4.fourPillars.month.branch}`);
console.log(`日柱: ${result4.fourPillars.day.stem} ${result4.fourPillars.day.branch}`);
console.log(`时柱: ${result4.fourPillars.hour.stem} ${result4.fourPillars.hour.branch}`);
// lunar-javascript 测试: 己卯 庚午 庚寅 辛巳
console.log('期望: 己(5)卯(3) 庚(6)午(6) 庚(6)寅(2) 辛(7)巳(5)');
console.log('');

// 测试用例5：验证大运
console.log('=== 测试用例5: 大运验证 (2005-12-23 08:37 男) ===');
for (const dy of result2.daYunList.slice(0, 3)) {
  console.log(`大运${dy.index}: startAge=${dy.startAge}, startYear=${dy.startYear}, stem=${dy.stem}, branch=${dy.branch}`);
}

// 测试用例6：验证流年
console.log('');
console.log('=== 测试用例6: 流年验证 (2005-12-23 08:37 男) ===');
for (const ln of result2.liuNianList.slice(0, 5)) {
  console.log(`流年: year=${ln.year}, stem=${ln.stem}, branch=${ln.branch}`);
}

console.log('');
console.log('所有测试完成!');

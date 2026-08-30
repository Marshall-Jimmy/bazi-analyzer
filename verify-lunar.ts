import { Solar } from 'lunar-javascript';

const solar = Solar.fromYmdHms(2005, 12, 23, 8, 37, 0);
const lunar = solar.getLunar();
const eightChar = lunar.getEightChar();
console.log('Year:', eightChar.getYear());
console.log('Month:', eightChar.getMonth());
console.log('Day:', eightChar.getDay());
console.log('Time:', eightChar.getTime());
console.log('');

// 测试用例3
const solar3 = Solar.fromYmdHms(1988, 2, 15, 23, 30, 0);
const lunar3 = solar3.getLunar();
const ec3 = lunar3.getEightChar();
console.log('Test3 Year:', ec3.getYear());
console.log('Test3 Month:', ec3.getMonth());
console.log('Test3 Day:', ec3.getDay());
console.log('Test3 Time:', ec3.getTime());
console.log('');

// 测试用例4
const solar4 = Solar.fromYmdHms(1999, 6, 7, 9, 11, 0);
const lunar4 = solar4.getLunar();
const ec4 = lunar4.getEightChar();
console.log('Test4 Year:', ec4.getYear());
console.log('Test4 Month:', ec4.getMonth());
console.log('Test4 Day:', ec4.getDay());
console.log('Test4 Time:', ec4.getTime());

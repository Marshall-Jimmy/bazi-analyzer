declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;
    getLunar(): Lunar;
    next(days: number): Solar;
    nextYear(years: number): Solar;
    nextMonth(months: number): Solar;
    nextHour(hours: number): Solar;
    toYmd(): string;
    toYmdHms(): string;
  }

  export class Lunar {
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Lunar;
    getSolar(): Solar;
    getEightChar(): EightChar;
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getTimeInGanZhi(): string;
    getYearInGanZhiExact(): string;
    getMonthInGanZhiExact(): string;
    getYearGanIndexExact(): number;
    getPrevJie(): Lunar;
    getNextJie(): Lunar;
    getJieQiTable(): Record<string, Lunar>;
    next(days: number): Lunar;
  }

  export class EightChar {
    static fromLunar(lunar: Lunar): EightChar;
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    getYearNaYin(): string;
    getMonthNaYin(): string;
    getDayNaYin(): string;
    getTimeNaYin(): string;
    getTaiYuan(): string;
    getMingGong(): string;
    getShenGong(): string;
    setSect(sect: number): void;
    getYun(gender: number, sect?: number): Yun;
    getYearHideGan(): string;
    getMonthHideGan(): string;
    getDayHideGan(): string;
    getTimeHideGan(): string;
    getYearShiShenGan(): string;
    getMonthShiShenGan(): string;
    getDayShiShenGan(): string;
    getTimeShiShenGan(): string;
    getYearShiShenZhi(): string;
    getMonthShiShenZhi(): string;
    getDayShiShenZhi(): string;
    getTimeShiShenZhi(): string;
    getYearDiShi(): string;
    getMonthDiShi(): string;
    getDayDiShi(): string;
    getTimeDiShi(): string;
  }

  export class Yun {
    getGender(): number;
    getStartYear(): number;
    getStartMonth(): number;
    getStartDay(): number;
    getStartHour(): number;
    isForward(): boolean;
    getLunar(): Lunar;
    getStartSolar(): Solar;
    getDaYun(n?: number): DaYun[];
  }

  export class DaYun {
    getStartYear(): number;
    getEndYear(): number;
    getStartAge(): number;
    getEndAge(): number;
    getIndex(): number;
    getLunar(): Lunar;
    getGanZhi(): string;
    getXun(): string;
    getXunKong(): string;
    getLiuNian(n?: number): LiuNian[];
    getXiaoYun(n?: number): XiaoYun[];
  }

  export class LiuNian {
    getYear(): number;
    getAge(): number;
    getIndex(): number;
    getLunar(): Lunar;
    getGanZhi(): string;
    getXun(): string;
    getXunKong(): string;
    getLiuYue(): LiuYue[];
  }

  export class LiuYue {
    getIndex(): number;
    getMonthInChinese(): string;
    getGanZhi(): string;
    getXun(): string;
    getXunKong(): string;
  }

  export class XiaoYun {
    getYear(): number;
    getAge(): number;
    getIndex(): number;
    getGanZhi(): string;
    getXun(): string;
    getXunKong(): string;
  }
}

import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators";
import { Task } from "@lit/task";

import '../charts/day-production-chart.js';
import { TimeDataList, timeDataToStats } from './transform.js';

// TODO maybe use date-fns ??? Nah just writing to show awareness.

const DOMAIN = 'https://saj-api-proxy.fennore.workers.dev/?https://fop.saj-electric.com';

const requestMap: Map<string, string> = new Map([
    // solar power today
    ['day', `[domain]/bigScreen/getSinglePlantElecChart?${new URLSearchParams({plantuid: '[uid]', clientDate:'[today]', chartDateType: '1'})}`],
    // solar power yesterday
    ['compareDay', `[domain]/bigScreen/getSinglePlantElecChart?${new URLSearchParams({plantuid: '[uid]', clientDate:'[yesterday]', chartDateType: '1'})}`],
    // solar power this month
    ['month',  `[domain]/bigScreen/getSinglePlantElecChart?${new URLSearchParams({plantuid: '[uid]', clientDate:'[today]', chartDateType: '2'})}`],
    // solar power previous month
    ['compareMonth',  `[domain]/bigScreen/getSinglePlantElecChart?${new URLSearchParams({plantuid: '[uid]', clientDate:'[lastmonth]', chartDateType: '2'})}`],
    // solar power this year
    ['year', `[domain]/bigScreen/getSinglePlantElecChart?${new URLSearchParams({plantuid: '[uid]', clientDate:'[today]', chartDateType: '3'})}`],
    // solar power this year
    ['compareYear', `[domain]/bigScreen/getSinglePlantElecChart?${new URLSearchParams({plantuid: '[uid]', clientDate:'[lastyear]', chartDateType: '3'})}`],
    // solar power compare years
    ['years', `[domain]/bigScreen/getSinglePlantElecChart?${new URLSearchParams({plantuid: '[uid]', clientDate:'[today]', chartDateType: '4'})}`],
]);

/**
 * Get plant local date.
 */
const getPlantDate: (tz: number, date: Date) => Date = (plantTZ = 2, date) => {
    const plantDate = new Date(date);
    plantDate.setHours(date.getHours() + Math.round(date.getTimezoneOffset()/60) + plantTZ);

    return plantDate;
}

/**
 * Format Date to yyyy-m-d string.
 */
const getYmd: (date: Date) => string = date => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

/**
 * Get today date in string format.
 */
const getToday: (tz?: number) => string = (plantTZ = 2) => {
    const plantToday = getPlantDate(plantTZ, new Date());
    // yyyy-m-d
    return getYmd(plantToday);
}

/**
 * Get yesterday date in string format.
 */
const getYesterday: (tz?: number) => string = (plantTZ = 2) => {
    const plantYesterday = getPlantDate(plantTZ, new Date());
    plantYesterday.setDate(plantYesterday.getDate() - 1);
    // yyyy-m-d
    return getYmd(plantYesterday);
}

/**
 * Get last month date in string format.
 */
const getLastMonth: (tz?: number) => string = (plantTZ = 2) => {
    const plantLastMonth = getPlantDate(plantTZ, new Date());
    plantLastMonth.setMonth(plantLastMonth.getMonth() - 1, 1);
    // yyyy-m-d
    return getYmd(plantLastMonth);
}

/**
 * Get last year date in string format.
 */
const getLastYear: (tz?: number) => string = (plantTZ = 2) => {
    const plantLastYear = getPlantDate(plantTZ, new Date());
    plantLastYear.setFullYear(plantLastYear.getFullYear() - 1, 0, 1);
    // yyyy-m-d
    return getYmd(plantLastYear);
}

@customElement('chart-dashboard')
export class ChartDashboard extends LitElement {
    private stats = new Task(
        this,
        {
            task: async () => {
                if(!this.plantUid) {
                    return [];
                }

                try {
                    const results = await Promise.all([
                        this.getStats('day'),
                        this.getStats('month'),
                        this.getStats('year'),
                        this.getStats('compareDay'),
                        this.getStats('compareMonth'),
                        this.getStats('compareYear'),
                        this.getStats('years'),
                    ]);

                    // TODO current day stats should run with a listener on timer (every 5 mins?)

                    // TODO current month stats should run with a listener on timer (every 60 mins?)

                    // TODO save static data to indexDB and only fetch it when it is not available for current date
                    
                    return {
                        day: timeDataToStats(results?.[0], results[3]),
                        month: timeDataToStats(results[1], results[4]),
                        year: timeDataToStats(results[2], results[5]),
                        years: timeDataToStats(results[6])
                    };
                } catch(error) {
                    console.error(error);
                    // TODO show message when failed (might be offline ?)

                    return [];
                }
            },
            args: () => [this.plantUid]
        }
    );
    
    @property()
    accessor plantUid: string | null = null;

    getUrl: (url?:string) => URL = url => {

        const filledUrl = url?.replace('[domain]', DOMAIN)
            .replace(encodeURIComponent('[uid]'), encodeURIComponent(this.plantUid ?? ''))
            .replace(encodeURIComponent('[today]'), encodeURIComponent(getToday()))
            .replace(encodeURIComponent('[yesterday]'), encodeURIComponent(getYesterday()))
            .replace(encodeURIComponent('[lastmonth]'), encodeURIComponent(getLastMonth()))
            .replace(encodeURIComponent('[lastyear]'), encodeURIComponent(getLastYear()));
        
        return new URL(filledUrl ?? '');
    }

    getStats: (type: string) => Promise<TimeDataList<string, number>> = type => fetch(this.getUrl(requestMap.get(type))).then(response => {
        if(response.ok) {
            return response.json();
        }

        return Promise.resolve({
            dataCountList: [],
            dataTimeList: []
        });
    })

    override render() {
        console.log('stats on render', this.stats.value);
        const stats = [
            ['time', 'today', 'yesterday'],
            ['09:00', 40, 30],
            ['12:00', 80, 90],
            ['15:00', 95, 105],
        ]
        return html`<day-production-chart stats=${stats}></day-production-chart>`;
    }
}
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators";

import '../charts/day-production-chart.js';

// TODO maybe use date-fns ??? Nah just writing to show awareness.

const DOMAIN = 'https://fop.saj-electric.com';

const requestMap: Map<string, string> = new Map([
    // solar power today
    ['day', `[domain]/bigScreen/getSinglePlantElecChart?${new URLSearchParams({plantuid: '[uid]', clientDate:'[today]', chartDateType: '1'})}`],
    // solar power yesterday
    ['compareDay', `[domain]/bigScreen/getSinglePlantElecChart?${new URLSearchParams({plantuid: '[uid]', clientDate:'[yesterday]', chartDateType: '1'})}`],
    // solar power this month
    ['month',  `[domain]/bigScreen/getSinglePlantElecChart?${new URLSearchParams({plantuid: '[uid]', clientDate:'[today]', chartDateType: '2'})}`],
    // solar power this year
    ['year', `[domain]/bigScreen/getSinglePlantElecChart?${new URLSearchParams({plantuid: '[uid]', clientDate:'[today]', chartDateType: '3'})}`],
    // solar power compare years
    ['compareYears', `[domain]/bigScreen/getSinglePlantElecChart?${new URLSearchParams({plantuid: '[uid]', clientDate:'[today]', chartDateType: '4'})}`],
]);

/**
 * Get plant local date.
 */
const getPlantDate: (tz: number, date: Date) => Date = (plantTZ = 2, date) => {
    const plantDate = new Date(date);
    plantDate.setHours(date.getHours() - date.getTimezoneOffset() + plantTZ);

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
    // yyyy-m-d
    return getYmd(plantYesterday);
}

@customElement('chart-dashboard')
export class ChartDashboard extends LitElement {
    constructor() {
        super();
        
        Promise.all([
            fetch(this.getUrl(requestMap.get('day'))),
            fetch(this.getUrl(requestMap.get('month'))),
            fetch(this.getUrl(requestMap.get('year'))),
            fetch(this.getUrl(requestMap.get('compareDay'))),
            fetch(this.getUrl(requestMap.get('compareYears'))),
        ]).then(results => {
            console.log('all data', results)
        }).catch((error) => {
            console.error(error);
        });
    }
    
    @property()
    accessor plantUid: string | null = null;

    getUrl: (url?:string) => URL = url => {

        const filledUrl = url?.replace('[domain]', DOMAIN)
            .replace(encodeURIComponent('[uid]'), encodeURIComponent(this.plantUid ?? ''))
            .replace(encodeURIComponent('[today]'), encodeURIComponent(getToday()))
            .replace(encodeURIComponent('[yesterday]'), encodeURIComponent(getYesterday()));

        console.log('url', url, filledUrl);
        
        return new URL(filledUrl ?? '');
    }

    override render() {
        console.log('uid', this.plantUid);
        return html`The dashboard`;
    }
}
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators";
import { Task } from "@lit/task";

import '../charts/day-production-chart.js';
import './transform.js';

// TODO maybe use date-fns ??? Nah just writing to show awareness.

const DOMAIN = 'https://saj-api-proxy.fennore.workers.dev/?https://fop.saj-electric.com';

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
    // yyyy-m-d
    return getYmd(plantYesterday);
}

@customElement('chart-dashboard')
export class ChartDashboard extends LitElement {
    private stats = new Task(
        this,
        {
            task: async () => {
                console.log('plant ID on task run', this.plantUid);
                if(!this.plantUid) {
                    return [];
                }

                try {
                    const result = await Promise.all([
                        this.getStats('day'),
                        this.getStats('month'),
                        this.getStats('year'),
                        this.getStats('compareDay'),
                        this.getStats('compareYears'),
                    ]);

                    // TODO day stats should run with a listener on timer (every 5 mins?)

                    // TODO month stats should run with a listener on timer (every 30 mins?)
                    
                    return timeDataToStats(result);
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
            .replace(encodeURIComponent('[yesterday]'), encodeURIComponent(getYesterday()));
        
        return new URL(filledUrl ?? '');
    }

    getStats: (type: string) => any = type => fetch(this.getUrl(requestMap.get(type))).then(response => {
        if(response.ok) {
            return response.json();
        }

        return Promise.resolve([]);
    })

    override render() {
        console.log('stats on render', this.stats.value);
        const stats = [
            ['day', '09:00', '12:00', '15:00'],
            ['today', 40, 80, 75],
            ['yesterday', 30, 95, 45],
        ]
        return html`<day-production-chart stats=${stats}></day-production-chart>`;
    }
}
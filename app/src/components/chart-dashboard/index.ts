import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import { Task } from "@lit/task";

// import '../charts/day-production-chart.js';
// import '../charts/month-production-chart.js';
// import '../charts/year-production-chart.js';
// import '../charts/all-production-chart.js';
import '../charts/rotation-chart.js';
import { TimeDataList, timeDataToStats } from './transform.js';

// TODO maybe use date-fns ??? Nah just writing to show awareness.

declare type StatType = 'day' | 'month' | 'year' | 'all';

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
    #rotationList: Map<string, string> = new Map([
        ['day', 'Vandaag'],
        ['month', 'Deze maand'],
        ['year', 'Dit jaar'],
        ['all', 'Totaal per jaar']
    ]);

    #rotationTimer?: number;
    #dayTimer?: number;
    #monthTimer?: number;

    @state()
    accessor #showStats: StatType = 'day';

    // TODO set proper specific type
    private stats?: any = new Task(
        this,
        {
            task: async () => {
                if(!this.plantUid) {
                    return [];
                }

                try {
                    this.clearIntervals();

                    const results = await Promise.all([
                        this.getStats('day'),
                        this.getStats('month'),
                        this.getStats('year'),
                        this.getStats('compareDay'),
                        this.getStats('compareMonth'),
                        this.getStats('compareYear'),
                        this.getStats('years'),
                    ]);

                    this.#rotationTimer = setInterval(() => {
                        const keyList = Array.from(this.#rotationList.values());
                        const currentIndex = keyList.findIndex(key => key === this.#showStats);

                        if(currentIndex >= this.#rotationList.size - 1) {
                            this.#showStats = keyList[0];
                        } else {
                            this.#showStats = keyList[currentIndex + 1];
                        }
                    }, 20e3);

                    // TODO current day stats should run with a listener on timer (every 5 mins?)

                    // TODO current month stats should run with a listener on timer (every 60 mins?)

                    // TODO save static data to indexDB and only fetch it when it is not available for current date
                    
                    return {
                        day: timeDataToStats(results?.[0], results[3]),
                        month: timeDataToStats(results[1], results[4]),
                        year: timeDataToStats(results[2], results[5]),
                        all: timeDataToStats(results[6])
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

    clearIntervals = () => {
        if(this.#rotationTimer) {
            clearInterval(this.#rotationTimer);
            this.#rotationTimer = null;
        }

        if(this.#dayTimer) {
            clearInterval(this.#dayTimer);
            this.#dayTimer = null;
        }

        if(this.#dayTimer) {
            clearInterval(this.#monthTimer);
            this.#monthTimer = null;
        }
    }

    override render() {       
        return html`
            <rotation-chart .stats=${this.stats.value?.[this.#showStats] ?? nothing} .type=${this.#showStats}></rotation-chart>
        `;
           // <day-production-chart .stats=${this.stats.value?.day ?? nothing}></day-production-chart>
           // <month-production-chart .stats=${this.stats.value?.month ?? nothing}></month-production-chart>
           // <year-production-chart .stats=${this.stats.value?.year ?? nothing}></year-production-chart>
           // <all-production-chart .stats=${this.stats.value?.all ?? nothing}></all-production-chart>
    }
}
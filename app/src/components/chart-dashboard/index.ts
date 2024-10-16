import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import { Task } from "@lit/task";

import '../rotation-steps';
import '../charts/rotation-chart';
import '../rotation-stats';
import '../info-panel';
import { PlantDetail, TimeDataList, Weather, timeDataToStats } from './transform';

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
    // generic
    ['plantDetail', `[domain]/bigScreen/getBigScreenPlantDetail`],
    // weather
    ['weather', `[domain]/plant/getWeatherNew`],
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
    static override styles = css`
        :host {
            width: 100vw;
            height: 100vh;
            min-width: 900px;
            min-height: 600px;
            display:grid;
            grid-gap: 20px;
            grid-template-columns: 75% calc(25% - 20px);
            grid-template-rows: 60px calc(80% - 68px) calc(20% - 32px);
            grid-template-areas:
                "steps steps"
                "chart info"
                "stats info"
            ;
        }
        info-panel {
            order: 1;
        }
        rotation-stats {
            order: 2;
        }
    `;

    #menuList: Map<StatType, string> = new Map([
        ['day', 'Vandaag'],
        ['month', 'Deze maand'],
        ['year', 'Dit jaar'],
        ['all', 'Totaal per jaar']
    ]);
    #rotationList: Set<StatType> = new Set();

    #rotationTimer?: number;
    #dayTimer?: number;
    #monthTimer?: number;

    #setRotationTimer = () => {
        clearInterval(this.#rotationTimer);

        // Only set rotation timer when there is more than 1 item in rotation list
        if(this.#rotationList.size <= 1) {
            this.#showStats = Array.from(this.#rotationList)[0] ?? 'day';

            // Do nothing
            return;
        }

        this.#rotationTimer = setInterval(() => {
            const keyList = Array.from(this.#menuList.keys());
            const currentIndex = keyList.findIndex(key => key === this.#showStats);

            if(currentIndex >= this.#menuList.size - 1) {
                this.#showStats = keyList[0];
            } else {
                this.#showStats = keyList[currentIndex + 1];
            }
        }, 60e3);
    }

    #setShowStats = (event: CustomEvent) => {
        this.#showStats = event.detail.step;
        this.#setRotationTimer();
    }

    constructor() {
        super();

        // Get URL params
        const params = new URLSearchParams(window.location.search);
    
        const focusKey = params.get('focus') as StatType;

        // Set fixed rotation when applicable
        if(focusKey && this.#menuList.has(focusKey)) {
            this.#showStats = focusKey
            this.#rotationList = new Set([focusKey]);
        } else {
            this.#rotationList = new Set(['month' as StatType].concat(Array.from(this.#menuList.keys())))
        }
    }

    @state()
    accessor #showStats: StatType = 'day';

    @state()
    // accessor #stats: Record<StatType, Array<Array<string | number>> | undefined> | null = null;
    accessor #stats: any = null;

    // TODO set proper specific type
    #ranStats: Task<Array<string>, any> = new Task(
        this,
        {
            task: async () => {
                if(!this.plantUid) {
                    return [];
                }

                try {
                    this.clearIntervals();

                    // Build requests according to rotation list
                    const promises = [this.getStats('month')] as Array<Promise<any>>;
                    const requestKeys = Array.from(this.#rotationList);
                    requestKeys.forEach(statType => {
                        if(statType === 'all') {
                            promises.push(this.getStats('years'))
                        } else {
                            if(statType !== 'month') {
                                promises.push(this.getStats(statType));
                            }
                            
                            const compareKey = `compare${statType.charAt(0).toLocaleUpperCase()}${statType.slice(1)}`;
                            promises.push(this.getStats(compareKey));
                        }
                    })

                    const results = await Promise.all(promises.concat([
                        this.getStats('plantDetail', {
                            method: 'POST',
                            headers: {
                                "Content-Type":"application/x-www-form-urlencoded; charset=utf-8"
                            },
                            body: `plantuid=${encodeURIComponent(this.plantUid ?? '')}&clientDate=${encodeURIComponent(getToday())}`
                        }),
                        this.getStats('weather', {
                            method: 'POST',
                            headers: {
                                "Content-Type":"application/x-www-form-urlencoded; charset=utf-8"
                            },
                            body: `plantuid=${encodeURIComponent(this.plantUid ?? '')}`
                        })
                    ]));

                    const resultIndexOffset = (this.#rotationList.has('month') ? 0 : 1);
                    const stats: any = {
                        dayProduction: results[0].dataCountList.at(-1), // data from month request
                    };

                    requestKeys.forEach((statType, index) => {
                        if(statType === 'all') {
                            stats.all = timeDataToStats(results[index*2 + resultIndexOffset] as TimeDataList<string, number>)
                        } else {
                            stats[statType] = timeDataToStats(
                                results[index*2 + resultIndexOffset] as TimeDataList<string, number>, 
                                results[index*2 + resultIndexOffset + 1] as TimeDataList<string, number>
                            );
                        }
                    });

                    this.#stats = {
                        ...stats,
                        plantDetail: results[results.length - 2]?.plantDetail as PlantDetail,
                        weather: results[results.length - 1]?.weather as Weather,
                    };

                    if(this.#stats?.day) {
                        this.#dayTimer = setInterval(() => {
                            const plantHour = getPlantDate(2, new Date()).getHours();
                            
                            if(plantHour > 6 && plantHour < 22) {
                                this.getStats('day').then(dayStats => {
                                    const day = timeDataToStats(dayStats, results[3]);
                                    this.#stats = {
                                        ...this.#stats,
                                        day
                                    };
                                }).catch(console.error);
                                
                            }
                        }, 5*6e4);
                    }

                    // Initiate rotation timer
                    this.#setRotationTimer();

                    this.#monthTimer = setInterval(() => {
                        const plantHour = getPlantDate(2, new Date()).getHours();
                        const promises = [];

                        if(plantHour > 6 && plantHour < 22) {
                            promises.push(this.getStats('month'));
                            promises.push(this.getStats('weather', {
                                method: 'POST',
                                headers: {
                                    "Content-Type":"application/x-www-form-urlencoded; charset=utf-8"
                                },
                                body: `plantuid=${encodeURIComponent(this.plantUid ?? '')}`
                            }));
                        } else {
                            promises.push(Promise.resolve(false));
                            promises.push(Promise.resolve(false));
                        }

                        if([1,8,12,16].includes(plantHour)) {
                            promises.push(this.getStats('plantDetail', {
                                method: 'POST',
                                headers: {
                                    "Content-Type":"application/x-www-form-urlencoded; charset=utf-8"
                                },
                                body: `plantuid=${encodeURIComponent(this.plantUid ?? '')}&clientDate=${encodeURIComponent(getToday())}`
                            }));
                        } else {
                            promises.push(Promise.resolve(false));
                        }

                        Promise.all(promises).then(([monthStats, weather, plantDetail]) => {
                            const newStats = {...this.#stats};
                            if(monthStats) {
                                newStats.month = timeDataToStats(monthStats, results[4]);
                                newStats.dayProduction = monthStats.dataCountList.at(-1);
                            }

                            if(weather) {
                                newStats.weather = weather.weather;
                            }

                            if(plantDetail) {
                                newStats.plantDetail = plantDetail.plantDetail;
                            }

                            this.#stats = newStats;
                        }).catch(console.error);
                    }, 6*6e5);

                    // TODO save static data to indexDB and only fetch it when it is not available for current date
                    
                    return true;
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

    getStats: (type: string, options?: RequestInit) => Promise<any> 
        = (type, options) => fetch(this.getUrl(requestMap.get(type)), options).then(response => {
            if(response.ok) {
                return response.json();
            }

            return Promise.resolve({});
        })

    clearIntervals = () => {
        if(this.#ranStats) {
            clearInterval(this.#rotationTimer);
            clearInterval(this.#dayTimer);
            clearInterval(this.#monthTimer);
        }
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();

        this.clearIntervals();
    }

    override render() {    
        return html`
            <info-panel type=${this.#showStats}></info-panel>
            <rotation-steps .steps=${this.#menuList} activeStep=${this.#showStats} @changeStep=${this.#setShowStats}></rotation-steps>
            <rotation-chart .stats=${this.#stats?.[this.#showStats] ?? nothing} type=${this.#showStats}></rotation-chart>
            <rotation-stats .stats=${this.#stats} type=${this.#showStats}></rotation-stats>
        `;
    }
}
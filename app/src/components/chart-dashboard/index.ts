import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import { Task } from "@lit/task";

import '../rotation-steps';
import '../charts/rotation-chart';
import '../rotation-stats';
import '../info-panel';
import type { PlantDetail, TimeDataList, Weather } from './transform';
import { timeDataToStats } from './transform';
import { default as dataFactory, getPlantDate } from '../../utils/getData'

// TODO maybe use date-fns ??? Nah just writing to show awareness.

declare type StatType = 'day' | 'month' | 'year' | 'all';

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
                this.#showStats = keyList[0] ?? 'day';
            } else {
                this.#showStats = keyList[currentIndex + 1] ?? 'day';
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
    #ranStats: Task<[string | null], true | readonly []> = new Task(
        this,
        {
            task: async () => {
                if(!this.plantUid) {
                    return [];
                }

                const reader = dataFactory(this.plantUid);

                try {
                    this.clearIntervals();

                    // Build requests according to rotation list
                    const hasCompareMonthRequest = this.#rotationList.has('month');
                    const promises = [reader.getData('month')];
                    const requestKeys = Array.from(this.#rotationList);
                    requestKeys.forEach(statType => {
                        if(statType === 'all') {
                            promises.push(reader.getData('years'))
                        } else {
                            if(statType !== 'month') {
                                promises.push(reader.getData(statType));
                            }
                            
                            const compareKey = `compare${statType.charAt(0).toLocaleUpperCase()}${statType.slice(1)}`;
                            promises.push(reader.getData(compareKey));
                        }
                    })

                    const results = await Promise.all(promises.concat([
                        reader.getData('plantDetail') as Promise<PlantDetail>,
                        reader.getData('weather') as Promise<Weather>
                    ]));

                    const resultIndexOffset = (hasCompareMonthRequest ? 0 : 1);
                    const stats: any = {
                        dayProduction: results[0]?.dataCountList?.at(-1), // data from month request
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
                        const compareIndex = requestKeys.findIndex(key => key === 'day') * 2 + resultIndexOffset + 1;

                        this.#dayTimer = setInterval(() => {
                            const plantHour = getPlantDate(2, new Date()).getHours();

                            // Switching days
                            if(plantHour <= 6 && this.#stats.day?.[0]?.[1]) {
                                reader.getData('compareDay').then(compareDayStats => {
                                    results[compareIndex] = compareDayStats;

                                    this.#stats = {
                                        ...this.#stats,
                                        day: timeDataToStats({ dataCountList: [], dataTimeList: [] }, results[compareIndex] as TimeDataList<string, number>),
                                    }
                                })
                            }
                            
                            // Only update data during relevant hours
                            if(plantHour > 6 && plantHour < 22) {
                                reader.getData('day').then(dayStats => {
                                    const day = timeDataToStats(dayStats as TimeDataList<string, number>, results[compareIndex] as TimeDataList<string, number>);
                                    this.#stats = {
                                        ...this.#stats,
                                        day,
                                    };
                                }).catch(console.error);
                                
                            }
                        }, 5*6e4);
                    }

                    // Initiate rotation timer
                    this.#setRotationTimer();

                    this.#monthTimer = setInterval(() => {
                        const plantHour = getPlantDate(2, new Date()).getHours();
                        const plantDay = getPlantDate(2, new Date()).getDate();

                        const promises = [];

                        // Month changed
                        if(hasCompareMonthRequest && plantHour <= 6 && plantDay === 1 && this.#stats.month?.[0]?.[1]) {
                            reader.getData('compareMonth').then(compareMonthStats => {
                                results[1] = compareMonthStats;

                                this.#stats = {
                                    ...this.#stats,
                                    month: timeDataToStats({ dataCountList: [], dataTimeList: [] }, results[1] as TimeDataList<string, number>),
                                }
                            })
                        }

                        // Day changed
                        if(plantHour <= 6 && plantDay === 1) {
                            this.#stats = {
                                ...this.#stats,
                                dayProduction: 0
                            }
                        }

                        if(plantHour > 6 && plantHour < 22) {
                            promises.push(reader.getData('month'));
                            promises.push(reader.getData('weather'));
                        } else {
                            promises.push(Promise.resolve(false));
                            promises.push(Promise.resolve(false));
                        }

                        if([1,8,12,16].includes(plantHour)) {
                            promises.push(reader.getData('plantDetail'));
                        } else {
                            promises.push(Promise.resolve(false));
                        }

                        Promise.all(promises).then(([monthStats, weather, plantDetail]) => {
                            const newStats = {...this.#stats};
                            
                            if(hasCompareMonthRequest && monthStats) {
                                newStats.month = timeDataToStats(monthStats as TimeDataList<string, number>, results[1] as TimeDataList<string, number>);
                            }

                            if(monthStats) {
                                newStats.dayProduction = (monthStats as TimeDataList<string, number>).dataCountList?.at?.(-1); // data from month request
                            }

                            if(weather) {
                                newStats.weather = (weather as Weather).weather;
                            }

                            if(plantDetail) {
                                newStats.plantDetail = (plantDetail as PlantDetail).plantDetail;
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
            <rotation-steps .steps=${this.#menuList} activeStep=${this.#showStats} ?locked=${this.#rotationList.size <= 1} @changeStep=${this.#setShowStats}></rotation-steps>
            <rotation-chart .stats=${this.#stats?.[this.#showStats] ?? nothing} type=${this.#showStats}></rotation-chart>
            <rotation-stats .stats=${this.#stats} type=${this.#showStats}></rotation-stats>
        `;
    }
}
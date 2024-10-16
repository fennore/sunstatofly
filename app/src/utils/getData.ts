// TODO can env variables be set for github pages and how?
// TODO use config for urls
// TODO use middleWare to build requests so it can easily be swapped out with a different API

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

export default (uid: string) => {

    const getUrl: (url?:string) => URL = (url) => {

        const filledUrl = url?.replace('[domain]', DOMAIN)
            .replace(encodeURIComponent('[uid]'), encodeURIComponent(uid ?? ''))
            .replace(encodeURIComponent('[today]'), encodeURIComponent(getToday()))
            .replace(encodeURIComponent('[yesterday]'), encodeURIComponent(getYesterday()))
            .replace(encodeURIComponent('[lastmonth]'), encodeURIComponent(getLastMonth()))
            .replace(encodeURIComponent('[lastyear]'), encodeURIComponent(getLastYear()));
        
        return new URL(filledUrl ?? '');
    }
    
    const getStats: (type: string, options?: RequestInit) => Promise<any> 
        = (type, options) => fetch(getUrl(requestMap.get(type)), options).then(response => {
            if(response.ok) {
                return response.json();
            }
    
            return Promise.resolve({});
        })
        
    return ({
        getData: (type: string) => {
            if(type === 'plantDetail') {
                return getStats(type, {
                    method: 'POST',
                    headers: {
                        "Content-Type":"application/x-www-form-urlencoded; charset=utf-8"
                    },
                    body: `plantuid=${encodeURIComponent(uid ?? '')}&clientDate=${encodeURIComponent(getToday())}`
                })
            }

            if(type === 'weather') {
                return getStats(type, {
                    method: 'POST',
                    headers: {
                        "Content-Type":"application/x-www-form-urlencoded; charset=utf-8"
                    },
                    body: `plantuid=${encodeURIComponent(uid ?? '')}`
                })
            }

            return getStats(type);
        }
    });
}

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

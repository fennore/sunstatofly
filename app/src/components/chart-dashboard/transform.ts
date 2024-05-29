export declare type TimeDataList<K, V> = {
    dataTimeList: Array<K>;
    dataCountList: Array<V>;
}

export declare type PlantDetail = { 
    plantDetail: { 
        monthElectricity: number, 
        yearElectricity: number, 
        totalElectricity: number, 
        income: number, 
        totalPlantTreeNum: number, 
        totalReduceCo2: number
    } 
}

export declare type Weather = { 
    weather: {
        temp: number, 
        humidity: number, 
        precip: number, 
        winddir: number, 
        windspeed: number, 
        solarradiation: number
    } 
}

declare type timeDataToStats<K, V> = (data: TimeDataList<K, V>, compareData?: TimeDataList<K, V>) => Array<Array<string | number>>;

/**
 * Convert API data to usable data for datasets
 * 
 * @see https://echarts.apache.org/handbook/en/concepts/dataset
 */
export const timeDataToStats: timeDataToStats<string, number> = (
    { dataCountList, dataTimeList }, 
    compareData
) => {
    const { dataCountList: compareCountList, dataTimeList: compareTimeList } = compareData ?? {}
    const stats = new Map();

    dataTimeList.forEach((time, index) => {
        const timeStat = stats.get(time) ?? new Map();

        timeStat.set('data', dataCountList[index]);

        stats.set(time, timeStat)
    });

    compareTimeList?.forEach((time: string, index: number) => {
        const timeStat = stats.get(time) ?? new Map();

        timeStat.set('compare', compareCountList?.[index]);

        stats.set(time, timeStat);
    });

    return [
        ['time', 'data', 'compare']
    ].concat(Array.from(stats, ([timeKey, map]) => [timeKey, map.get('data'), map.get('compare')]));
}
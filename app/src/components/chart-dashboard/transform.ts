declare type TimeDataList<K, V> = {
    dataTimeList: Array<K>;
    dataCountList: Array<V>;
}

declare type timeDataToStats<K, V> = (data: TimeDataList<K, V>, compareData: TimeDataList<K, V>) => Array<Array<string | number>>

/**
 * Convert API data to usable data for datasets
 * 
 * @see https://echarts.apache.org/handbook/en/concepts/dataset
 */
export const timeDataToStats: timeDataToStats<string, number> = (
    { dataCountList, dataTimeList }, 
    { dataCountList: compareCountList, dataTimeList: compareTimeList }
) => {

    const stats = new Map();

    dataTimeList.forEach((time, index) => {
        const timeStat = stats.get(time) ?? new Map();

        timeStat.set('data', dataCountList[index]);

        stats.set(time, timeStat)
    });

    compareTimeList.forEach((time, index) => {
        const timeStat = stats.get(time) ?? new Map();

        timeStat.set('compare', compareCountList[index]);

        stats.set(time, timeStat);
    });

    return [
        ['time', 'data', 'compare']
    ].concat(Array.from(stats, ([timeKey, map]) => [timeKey, map.get('data'), map.get('compare')]));
}
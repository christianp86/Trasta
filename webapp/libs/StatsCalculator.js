/**
 * Calculates the total trash weight per trash type
 * @param {Array} wasteItems 
 * @returns {Array} Sorted array by type containing the total trash weight per type
 */
function calculateTotalsByType(wasteItems) {
    console.info("Total waste items:" + wasteItems.length);
    return calculateTotals(wasteItems);
}

/**
 * Calculates the total trash weight per trash type
 * @private
 * @param {Array} wasteItems 
 * @returns {Array} Sorted array by type containing the total trash weight per type
 */
function calculateTotals(wasteItems) {
    let totalsByType = [];

    const getTotalsByType = (oCurrentWasteItem) => {
        const index = totalsByType.findIndex((oItem) => oItem.label === oCurrentWasteItem.type);
        (index === -1)
            ? totalsByType.push({
                label: oCurrentWasteItem.type,
                totalWeight: oCurrentWasteItem.weight / 1000,
                dataType: 'type'
            })
            : totalsByType[index].totalWeight += oCurrentWasteItem.weight / 1000;

    }

    wasteItems.forEach(getTotalsByType);
    totalsByType.sort((a, b) => {
        return a.label.localeCompare(b.label);
    });

    return totalsByType;
}

/**
 * Calculates the total trash weight per month
 * @param {Array} wasteItems 
 * @returns {Array} - Array containing the total trash weight per month
 */
function calculateTotalsByMonth(wasteItems) {
    let totalsByMonth = [];

    const getTotalsByMonth = (oCurrentWasteItem) => {
        const date = new Date(parseInt(oCurrentWasteItem.date));
        const month = date.toLocaleString('default', { month: 'long' });
        const index = totalsByMonth.findIndex((oItem) => oItem.label === month);
        (index === -1)
            ? totalsByMonth.push({
                label: month,
                totalWeight: oCurrentWasteItem.weight / 1000,
                dataType: 'month'
            })
            : totalsByMonth[index].totalWeight += oCurrentWasteItem.weight / 1000;
    }

    wasteItems.forEach(getTotalsByMonth);
    console.debug("Totals by month: " + totalsByMonth);
    return totalsByMonth;
}

/**
 * Calculates the total trash weight for each type per month
 * @param {Array} wasteItems 
 * @returns {Map} - Map contains entry per trash type, each trash type has an array with the total trash per month
 */
function calculateTotalsByMonthAndType(wasteItems) {
    let totalsByMonthAndType = [];
    let totalsByMonthAndTypeMap = new Map();

    const getTotalsByMonthAndType = (oCurrentWasteItem) => {
        if (!totalsByMonthAndTypeMap.has(oCurrentWasteItem.type))
            totalsByMonthAndTypeMap.set(oCurrentWasteItem.type, [])

        totalsByMonthAndType = totalsByMonthAndTypeMap.get(oCurrentWasteItem.type)
        const date = new Date(parseInt(oCurrentWasteItem.date));
        const month = date.toLocaleString('default', { month: 'long' });
        const index = totalsByMonthAndType.findIndex((oItem) => oItem.label === month);
        (index === -1)
            ? totalsByMonthAndType.push({
                label: month,
                totalWeight: oCurrentWasteItem.weight / 1000,
                dataType: 'month'
            })
            : totalsByMonthAndType[index].totalWeight += oCurrentWasteItem.weight / 1000;
    }

    wasteItems.forEach(getTotalsByMonthAndType);

    return totalsByMonthAndTypeMap;
}

/**
 * @async
 * @param {Array} wasteItems 
 * @returns {Number} - Total trash weight
 */
async function calculateTotalTrashKPI(wasteItems) {
    const total = wasteItems.reduce((result, oWasteItem) => {
        return result.hasOwnProperty("weight") ? result.weight += oWasteItem.weight : result += oWasteItem.weight
    }) / 1000;

    console.info("Total Waste:" + total);
    return total;
}

export { calculateTotalTrashKPI, calculateTotalsByMonth, calculateTotalsByMonthAndType, calculateTotalsByType }
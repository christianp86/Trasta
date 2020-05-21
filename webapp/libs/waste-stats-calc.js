sap.ui.define([
    "sap/ui/base/Object",
    "sap/base/Log"
], function (Object, Log) {
    "use strict";

    return Object.extend("com.fidschenberger.wasteStatsApp.libs.wasteStatsCalculator", {

        calculateTotalTrashByCategory: function (aWasteItems) {
            Log.info("Total waste items:" + aWasteItems.length);
            return this._calculateTotals(aWasteItems);
        },

        _calculateTotals: function (aWasteItems) {
            let aTotalsByType = [];

            const fnGetTotalsByType = (oCurrentWasteItem) => {
                const index = aTotalsByType.findIndex((oItem) => oItem.label === oCurrentWasteItem.type);
                (index === -1)
                    ? aTotalsByType.push({
                        label: oCurrentWasteItem.type,
                        totalWeight: oCurrentWasteItem.weight / 1000,
                        dataType: 'type'
                    })
                    : aTotalsByType[index].totalWeight += oCurrentWasteItem.weight / 1000;

            }

            aWasteItems.forEach(fnGetTotalsByType);
            aTotalsByType.sort((a, b) => {
                return a.label.localeCompare(b.label);
            });

            return aTotalsByType;
        },

        calculateTotalsByMonth: function (aWasteItems) {
            let aTotalsByMonth = [];

            const fnGetTotalsByMonth = (oCurrentWasteItem) => {
                const oDate = new Date(parseInt(oCurrentWasteItem.date));
                const sMonth = oDate.toLocaleString('default', { month: 'long' });
                const index = aTotalsByMonth.findIndex((oItem) => oItem.label === sMonth);
                (index === -1)
                    ? aTotalsByMonth.push({
                        label: sMonth,
                        totalWeight: oCurrentWasteItem.weight / 1000,
                        dataType: 'month'
                    })
                    : aTotalsByMonth[index].totalWeight += oCurrentWasteItem.weight / 1000;
            }

            aWasteItems.forEach(fnGetTotalsByMonth);
            //Log.debug("Totals by month: " + aTotalsByMonth);
            return aTotalsByMonth;
        },

        calculateTotalsByMonthAndType: function (aWasteItems) {
            let aTotalsByMonthAndType = [];
            let mTotalsByMonthAndType = new Map();

            const fnGetTotalsByMonthAndType = (oCurrentWasteItem) => {
                // 1. Check if type entry exists in map
                if (!mTotalsByMonthAndType.has(oCurrentWasteItem.type))
                    mTotalsByMonthAndType.set(oCurrentWasteItem.type, []) // 2. add it if not

                aTotalsByMonthAndType = mTotalsByMonthAndType.get(oCurrentWasteItem.type)
                // 3. Check if month exists in array of map entry
                // 4. Add it if not
                // 5. Add weight if it does
                const oDate = new Date(parseInt(oCurrentWasteItem.date));
                const sMonth = oDate.toLocaleString('default', { month: 'long' });
                const index = aTotalsByMonthAndType.findIndex((oItem) => oItem.label === sMonth);
                (index === -1)
                    ? aTotalsByMonthAndType.push({
                        label: sMonth,
                        totalWeight: oCurrentWasteItem.weight / 1000,
                        dataType: 'month'
                    })
                    : aTotalsByMonthAndType[index].totalWeight += oCurrentWasteItem.weight / 1000;
            }

            aWasteItems.forEach(fnGetTotalsByMonthAndType);

            return mTotalsByMonthAndType;
        },

        calculateTotalTrashKPI: async function (aWasteItems) {
            const iTotal = aWasteItems.reduce(function (result, oWasteItem) {
                return result.hasOwnProperty("weight") ? result.weight += oWasteItem.weight : result += oWasteItem.weight
            }) / 1000;

            Log.info("Total Waste:" + iTotal);
            return iTotal;
        },
    });

});
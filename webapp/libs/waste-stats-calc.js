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

        calculateTotalTrashKPI: async function (aWasteItems) {
            const iTotal = aWasteItems.reduce(function (result, oWasteItem) {
                return result.hasOwnProperty("weight") ? result.weight += oWasteItem.weight : result += oWasteItem.weight
            }) / 1000;

            Log.info("Total Waste:" + iTotal);
            return iTotal;
        },
    });

});
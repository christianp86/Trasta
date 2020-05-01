sap.ui.define([
    "sap/ui/base/Object",
    "sap/base/Log"
], function (Object, Log) {
    "use strict";

    return Object.extend("com.fidschenberger.wasteStatsApp.libs.wasteStatsCalculator", {

        calculateTotalWasteValues: function(aWasteItems) {
            Log.info("Total waste items:" + aWasteItems.length );
            return this._calculateTotals(aWasteItems);
        },

        _calculateTotals: function (aWasteItems) {

            const aTotalWaste = aWasteItems.reduce(function (result, oWasteItem) {
                const sType = oWasteItem.type;
                if (!(sType in result)) {
                    result.aCumulatedWaste.push(
                        result[sType] = {
                            type: sType,
                            totalWeight: oWasteItem.weight / 1000
                        }
                    );
                } else {
                    result[sType].totalWeight += oWasteItem.weight / 1000;
                }

                return result;
            }, { aCumulatedWaste: [] });

            aTotalWaste.aCumulatedWaste.sort(function (a, b) {
                return a.type.localeCompare(b.type);
            });

            return aTotalWaste.aCumulatedWaste;

        },

        calculateTotalWaste: function (aWasteItems) {
            const iTotal = aWasteItems.reduce(function (result, oWasteItem) {
                return result.hasOwnProperty("weight") ? result.weight += oWasteItem.weight : result += oWasteItem.weight
            }) / 1000;

           Log.info("Total Waste:" + iTotal);
           return iTotal;
        },
    });

});
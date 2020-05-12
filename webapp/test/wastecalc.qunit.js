/*global QUnit */
sap.ui.define([
    "com/fidschenberger/wasteStatsApp/libs/waste-stats-calc",
    "sap/ui/model/json/JSONModel",
    "sap/ui/qunit/QUnitUtils"
], function (Wastecalc, JSONModel, QUnitUtils) {
    "use strict";
    QUnit.module("Caclulations");

    Wastecalc = new Wastecalc();
    JSONModel.loadData('wasteItemsTest.json')
        .then(() => {
            const aWasteItems = JSON.getProperty("/wasteItems").map(function (oWaste) { return Object.assign({}, oWaste); });
            // Execute Tests
            QUnit.test("Calculate Totals by Category", (assert) => {
                const aTotalsByType = Wastecalc.calculateTotalTrashByCategory(aWasteItems);
                assert.equal( 7, aTotalsByType.length, "We expect totals for 7 waste types" )
                //assert.equal( 19.84, aWasteItems)
            });
        }).catch((err) => {
            Log.error(err);
        });
});
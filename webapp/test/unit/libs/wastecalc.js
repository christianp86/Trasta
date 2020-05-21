sap.ui.define([
    "com/fidschenberger/wasteStatsApp/libs/waste-stats-calc",
    "sap/ui/model/json/JSONModel",
    "sap/ui/qunit/QUnitUtils"
], function (Wastecalc, JSONModel, QUnitUtils) {
    "use strict";
    QUnit.module("Test calculations", {
        beforeEach: function () {
            Wastecalc = new Wastecalc();
        },
    });

    QUnit.test("Calculate Totals by Category", (assert) => {
        const fnDone = assert.async();

        this.oJSONModel = new JSONModel();
        this.oJSONModel.loadData('./model/wasteItemsTest.json')
            .then(() => {
                // Execute Tests
                assert.ok(true, "Model loaded");
                const aWasteItems = this.oJSONModel.getProperty("/wasteItems").map(function (oWaste) { return Object.assign({}, oWaste); });
                const aTotalsByType = Wastecalc.calculateTotalTrashByCategory(aWasteItems);
                assert.equal(7, aTotalsByType.length, "We expect totals for 7 waste types")
                const aTotalsByMonth = Wastecalc.calculateTotalsByMonth(aWasteItems);
                assert.equal(2, aTotalsByMonth.length, "We expect two month");
                //assert.equal( 19.84, aWasteItems)
            }).then(fnDone)
            .catch((err) => {
                assert.ok(false, "Error occured: " + JSON.stringify(err));
                fnDone();
            });
    });
});
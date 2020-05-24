sap.ui.define([
    "com/fidschenberger/trasta/libs/waste-stats-calc",
    "sap/ui/model/json/JSONModel",
    "sap/ui/qunit/QUnitUtils"
], function (Wastecalc, JSONModel, QUnitUtils) {
    "use strict";

    QUnit.module("Test calculations", {
        before: function () {
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
                const trashItems = this.oJSONModel.getProperty("/wasteItems").map(function (oWaste) { return Object.assign({}, oWaste); });
                const aTotalsByType = Wastecalc.calculateTotalTrashByCategory(trashItems);
                assert.equal(7, aTotalsByType.length, "We expect totals for 7 waste types")
                //assert.equal( 19.84, aWasteItems, "Organic waste must be XX.XX")
            }).then(fnDone)
            .catch((err) => {
                assert.ok(false, "Error occured: " + JSON.stringify(err));
                fnDone();
            });
    });

    QUnit.test("Calculate totals by month", (assert) => {
        const fnDone = assert.async();
        this.oJSONModel = new JSONModel();
        this.oJSONModel.loadData('./model/wasteItemsTest.json')
            .then(() => {
                // Execute Tests
                assert.ok(true, "Model loaded");
                const trashItems = this.oJSONModel.getProperty("/wasteItems").map(function (oWaste) { return Object.assign({}, oWaste); });
                const aTotalsByMonth = Wastecalc.calculateTotalsByMonth(trashItems);
                assert.equal(2, aTotalsByMonth.length, "We expect two month");
                //assert.equal( 19.84, aWasteItems)
            }).then(fnDone)
            .catch((err) => {
                assert.ok(false, "Error occured: " + JSON.stringify(err));
                fnDone();
            });

    });
});
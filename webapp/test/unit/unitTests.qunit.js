/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
    "use strict";

    sap.ui.require([
        "com/fidschenberger/wasteStatsApp/test/unit/AllTests"
    ], function () {
        QUnit.start();
    });
});
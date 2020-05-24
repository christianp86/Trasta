/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
    "use strict";

    sap.ui.require([
        "com/fidschenberger/trasta/test/unit/AllTests"
    ], function () {
        // @ts-ignore
        QUnit.start();
    });
});
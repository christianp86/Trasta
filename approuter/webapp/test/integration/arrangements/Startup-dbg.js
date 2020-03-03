sap.ui.define([
	"sap/ui/test/Opa5"
], function(Opa5) {
	"use strict";

	return Opa5.extend("com.fidschenberger.wasteStatsApp.test.integration.arrangements.Startup", {

		iStartMyApp: function () {
			this.iStartMyUIComponent({
				componentConfig: {
					name: "com.fidschenberger.wasteStatsApp",
					async: true,
					manifest: true
				}
			});
		}

	});
});

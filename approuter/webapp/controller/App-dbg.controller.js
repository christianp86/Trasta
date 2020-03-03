sap.ui.define([
	"./BaseController",
	"sap/base/Log"
], function (Controller) {
	"use strict";

	return Controller.extend("com.fidschenberger.wasteStatsApp.controller.App", {

		onInit: function () {
			this.wasteTypes = Object.freeze({
				"PAPER": 1,
				"OTHER": 2,
				"GLAS": 3,
				"ORGANIC": 4
			});
		}
	});
});
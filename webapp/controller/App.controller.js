sap.ui.loader.config({
	shim: {
		'com/fidschenberger/wasteStatsApp/libs/localforage.min': {
			amd: true,
			exports: 'localForage'
		}
	}
});

sap.ui.define([
	"./BaseController",
	"sap/base/Log",
	"com/fidschenberger/wasteStatsApp/libs/localforage.min"
], function (Controller, Log, localForage) {
	"use strict";

	return Controller.extend("com.fidschenberger.wasteStatsApp.controller.App", {

		onInit: function () {

			var oModel = this.getView().getModel("waste_items");
			var aWaste = oModel.getProperty("/wasteItems").map(function (oWaste) { return Object.assign({}, oWaste); });

			localforage.setItem('waste', aWaste).then(function (value) {
				// Do other things once the value has been saved.
				Log.info("DB is ready with values: ", value);
			}).catch(function (err) {
				// This code runs if there were any errors
				console.log(err);
			});


		}
	});
});
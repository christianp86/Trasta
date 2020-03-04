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
			localforage.getItem('waste')
				.then((value) => {
					if (value !== null) {
						this._setWasteItemsInModel(value);
					} else {
						this._loadDataFromJSON();
					}
				}).catch((err) => {
					Log.error(err);
				});
		}

	});
});
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
	"com/fidschenberger/wasteStatsApp/libs/localforage.min",
	"com/fidschenberger/wasteStatsApp/libs/auth0-library"
], function (Controller, Log, localForage, Auth0) {
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

			this.initAuth0();
		},

		initAuth0: async function () {
			if (this._getConfigValue("enable-auth0") === "false")
				return;

			const auth0 = new Auth0();
			await auth0.configureClient();
			await auth0.updateUI();
		}

	});
});
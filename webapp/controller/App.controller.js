sap.ui.define([
	"./BaseController",
	"sap/base/Log"
], function (Controller, Log) {
	"use strict";

	return Controller.extend("com.fidschenberger.trasta.controller.App", {
		onInit: function () {
			this.showBusyIndicator();
		}
	});
});
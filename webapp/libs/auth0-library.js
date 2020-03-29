sap.ui.loader.config({
	shim: {
		'com/fidschenberger/wasteStatsApp/libs/auth0-spa-js.production': {
			amd: true,
			exports: 'createAuth0Client'
		}
	}
});

sap.ui.define([
	"sap/ui/base/Object",
	"com/fidschenberger/wasteStatsApp/libs/auth0-spa-js.production"
], function (Object, createAuth0Client) {
	"use strict";

	let auth0 = null;
	let config = null;

	return Object.extend("com.fidschenberger.wasteStatsApp.libs.auth0-library", {

		fetchAuthConfig: async function () {
			await fetch("../resources/auth0.json")
				.then((response) => response.json())
				.then(function (data) {
					console.log("Mist aus Then");
					config = data;
				})
				.catch(function (error) {
					console.error(error);
				});
		},

		configureClient: async function () {
			const reponse = await this.fetchAuthConfig();
			/* console.log("SO ein mist!");
			const config = await response.json(); */

			auth0 = await createAuth0Client({
				domain: config.domain,
				client_id: config.clientId
			});
		},

		updateUI: async function () {
			const isAuthenticated = await auth0.isAuthenticated();
			if (!isAuthenticated) {
				await auth0.loginWithRedirect({
					redirect_uri: window.location.origin
				});
			}
		}

	});
});
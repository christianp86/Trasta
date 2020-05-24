sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/base/Log",
    "sap/ui/core/EventBus",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/UIComponent"
], function (Controller, Log, EventBus, BusyIndicator, UIComponent) {
    "use strict";

    return Controller.extend("com.fidschenberger.trasta.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
        getModel: function (sName) {
            return this.getOwnerComponent().getModel(sName);
        },

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        geti18nValue: function (sKey) {
            return this.getResourceBundle().getText(sKey);
        },

        /**
         * Displays global busy indicator
         * @protected
         */
        showBusyIndicator : function () {
            BusyIndicator.show();
        },

        /**
         * Hides global busy indicator
         * @protected
         */
        hideBusyIndicator : function () {
            BusyIndicator.hide();
        },

        /**
		 * Clones an object
		 * @protected
         * @param {obj} obj Object to be cloned
		 * @returns {Object} Cloned Object
		 */
        _clone: function (obj) {
            if (null == obj || "object" != typeof obj) return obj;
            let copy = obj.constructor();
            for (const attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
            }
            return copy;
        },

        _saveModelInDB: function () {

            const aWaste = this._getWasteItemsFromModel();

            localforage.setItem('waste', aWaste)
                .then((value) => {
                    this._setWasteItemsInModel(value);
                }).catch((err) => {
                    Log.error(err);
                });
        },

        _loadDataFromJSON: function () {
            const oModel = this.getModel("waste_items");

            oModel.loadData('../model/wasteItems.json')
                .then(() => {
                    this._saveModelInDB();
                }).catch((err) => {
                    Log.error(err);
                });
        },

        /**
		 * Gets waste items as array from model
		 * @protected
		 * @returns {Array} Waste Items Entries of model
		 */
        _getWasteItemsFromModel: function () {
            const oModel = this.getModel("waste_items");
            return oModel.getProperty("/wasteItems").map(function (oWaste) { return Object.assign({}, oWaste); });
        },

        /**
		 * Sets waste items as array from model
		 * @protected
         * @param {Array} aWasteItems Waste Items Entries
		 */
        _setWasteItemsInModel: function (aWasteItems) {
            Log.info("_setWasteItemsInModel : Waste Items = " + aWasteItems.length);
            const oModel = this.getModel("waste_items");
            oModel.setProperty('/wasteItems', aWasteItems);

            EventBus = sap.ui.getCore().getEventBus();
            EventBus.publish("WasteItems", "Available");
        },

        _getConfigValue: function (sParameter) {
            const oModel = this.getModel("configuration");
            return oModel.getProperty("/config/" + sParameter);
        }
    });

});
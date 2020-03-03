sap.ui.define([
  "./BaseController",
  "sap/base/Log"
], function (Controller, Log) {
  "use strict";

  return Controller.extend("com.fidschenberger.wasteStatsApp.controller.App", {

    addWaste: function () {
      var oModel = this.getView().getModel("waste_items");
      var aWaste = oModel.getProperty("/wasteItems").map(function (oWaste) { return Object.assign({}, oWaste); });

      var oNewItem = oModel.getProperty("/newWasteItem");
      oNewItem.date = Date.now();

      var oClonedItem = this.clone(oNewItem);
      aWaste.push(oClonedItem);

      for (var propt in oNewItem) {
        oNewItem[propt] = "";
      }

      oModel.setProperty("/newWasteItem", oNewItem);
      oModel.setProperty("/wasteItems", aWaste);
    }

  });
});

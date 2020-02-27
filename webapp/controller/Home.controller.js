sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function (Controller) {
  "use strict";

  return Controller.extend("com.fidschenberger.wasteStatsApp.controller.App", {

    addWaste: function() {
      var oModel = this.getView().getModel("waste_items");
      var oNewItem = oModel.getProperty("/newWasteItem");
      oNewItem.date = Date.now();
      var aWaste = oModel.getProperty("/wasteItems").map(function (oWaste) { return Object.assign({}, oWaste); });
    
      aWaste.push(oNewItem);
      oModel.setProperty("/wasteItems", aWaste);
      for (var propt in oNewItem) {
        oNewItem[propt] = "";
      }

      oModel.setProperty("/newWasteItem", oNewItem);

    }

  });
});

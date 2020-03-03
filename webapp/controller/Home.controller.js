sap.ui.define([
  "./BaseController",
  "sap/base/Log"
], function (Controller, Log) {
  "use strict";

  return Controller.extend("com.fidschenberger.wasteStatsApp.controller.App", {

    onAfterRendering: function () {
      var ctx = document.getElementById("barChart");

      var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this._getChartLabels(),
          datasets: [{
            label: this.getResourceBundle().getText('chartLabelTotal'),
            data: this._getChartData(),
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(0, 255, 0, 0.2)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(0, 255, 0, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
    },

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
    },

    _getChartLabels: function () {
      var oModel = this.getModel("waste_types");
      var oBundle = this.getResourceBundle();
      var aWasteTypes = oModel.getProperty("/wasteTypes").map(function (oWasteType) { return oBundle.getText(oWasteType.key); });

      aWasteTypes.sort();
      return aWasteTypes;
    },

    _getChartData: function () {
      var oModel = this.getModel("waste_items");
      var aWaste = oModel.getProperty("/wasteItems").map(function (oWaste) { return Object.assign({}, oWaste); });

      var aTotalWaste = aWaste.reduce(function (result, oWasteItem) {
        var sType = oWasteItem.type;
        if (!(sType in result)) {
          result.aCumulatedWaste.push(
            result[sType] = {
              type: sType,
              totalWeight: oWasteItem.weight
            }
          );
        } else {
          result[sType].totalWeight += oWasteItem.weight;
        }

        return result;
      }, { aCumulatedWaste: [] });

      aTotalWaste.aCumulatedWaste.sort(function (a, b) {
        return a.type.localeCompare(b.type);
      });

      return aTotalWaste.aCumulatedWaste.map(function (oTotalItem) { return oTotalItem.totalWeight });
    }

  });
});

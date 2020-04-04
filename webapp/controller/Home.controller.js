sap.ui.loader.config({
  shim: {
    'com/fidschenberger/wasteStatsApp/libs/Chart.bundle.min': {
      amd: true,
      exports: 'Chart'
    }
  }
});

sap.ui.define([
  "./BaseController",
  "sap/base/Log",
  "com/fidschenberger/wasteStatsApp/libs/Chart.bundle.min"
], function (Controller, Log, Chart) {
  "use strict";

  return Controller.extend("com.fidschenberger.wasteStatsApp.controller.App", {

    aTotalWasteData: new Array(),
    aBackgroundColor: new Array([
      'rgba(255, 99, 132, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(255, 206, 86, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(153, 102, 255, 0.2)',
      'rgba(255, 159, 64, 0.2)',
      'rgba(0, 255, 0, 0.2)'
    ]),

    onAfterRendering: function () {
      this._calculateStatisticalValues();
      var ctx = document.getElementById("barChart");
      this.aTotalWasteData = this._calculateTotals();

      this.myChart = new Chart(ctx, {
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
              'rgba(0, 255, 0, 0.2)'],
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
      const oModel = this.getModel("waste_items");
      var aWaste = this._getWasteItemsFromModel();

      var oNewItem = oModel.getProperty("/newWasteItem");

      if (oNewItem.type === null || oNewItem.type === "") {
        var oSelect = this.getView().byId("selectWasteType");
        oNewItem.type = oSelect.getSelectedKey();
      }

      oNewItem.weight = Number(oNewItem.weight);
      oNewItem.date = String(Date.now());

      var oClonedItem = this._clone(oNewItem);
      aWaste.push(oClonedItem);

      for (var propt in oNewItem) {
        oNewItem[propt] = "";
      }

      oModel.setProperty("/newWasteItem", oNewItem);
      oModel.setProperty("/wasteItems", aWaste);

      this._saveModelInDB();
      this._updateChartWithNewWaste(oClonedItem);
    },

    _getChartLabels: function () {
      const oModel = this.getModel("waste_types");
      const oBundle = this.getResourceBundle();
      const oData = oModel.getProperty("/wasteTypes").sort((a, b) => {
        return a.key.localeCompare(b.key);
      });

      const aWasteTypes = oData.map((oWasteType) => {
        return oBundle.getText(oWasteType.key);
      });

      return aWasteTypes;
    },

    _calculateTotals: function () {
      const aWaste = this._getWasteItemsFromModel();

      const aTotalWaste = aWaste.reduce(function (result, oWasteItem) {
        const sType = oWasteItem.type;
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

      return aTotalWaste.aCumulatedWaste;

    },

    _getChartData: function () {
      return this.aTotalWasteData.map(function (oTotalItem) { return oTotalItem.totalWeight });
    },

    _updateChartWithNewWaste: function (oWasteItem) {
      const isWasteType = (element) => element.type === oWasteItem.type;
      const index = this.aTotalWasteData.findIndex(isWasteType);
      let value = this.myChart.data.datasets[0].data[index];
      value += oWasteItem.weight;

      this.myChart.data.datasets[0].data[index] = value;
      this.myChart.update();
    },

    _calculateStatisticalValues: async function () {
      const oModel = this.getModel("waste_statistics");
      const aWaste = this._getWasteItemsFromModel();

      const iTotal = aWaste.reduce(function (result, oWasteItem) {
        return result.hasOwnProperty("weight") ? result.weight += oWasteItem.weight : result += oWasteItem.weight
      }) / 1000;
      oModel.setProperty("/totalWaste", iTotal);
    },

  });
});

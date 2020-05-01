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
  "com/fidschenberger/wasteStatsApp/libs/Chart.bundle.min",
  "com/fidschenberger/wasteStatsApp/libs/waste-stats-calc"
], function (Controller, Log, Chart, Wastecalc) {
  "use strict";

  return Controller.extend("com.fidschenberger.wasteStatsApp.controller.Home", {

    onInit: function () {
      Wastecalc = new Wastecalc();

      this.oCanvas = this.byId("Chart");
      this.aBackgroundColor = new Array([
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(0, 255, 0, 0.2)'
      ]);

      this.oChartOptions = {
        responsive: true,
        legend: {
          align: 'center',
          position: 'top',
          title: {
            display: true,
            text: 'Legend Title',
            position: 'top',
          }
        }
      };

      this.oChartScales = {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      };

      this.aTotalWasteData = Wastecalc.calculateTotalWasteValues(this._getWasteItemsFromModel());
      this._calculateStatisticalValues();
    },

    onAfterRendering: function () {
      const ctx = document.getElementById("Chart");
      if (ctx === null) {
        this.hideBusyIndicator();
        return;
      }

      this._drawChart();
      this.hideBusyIndicator();
    },

    _drawChart: function () {
      const ctx = document.getElementById("Chart");
      const sChartType = this.getModel("configuration").getProperty("/selectedChartType");
      let options = this.oChartOptions;
      
      if (this.myChart !== undefined)
        this.myChart.destroy();

      if (sChartType !== 'pie') {
        options = {
          ...this.options, scales: this.oChartScales
        };
      }

      this.myChart = new Chart(ctx, {
        type: sChartType,
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
        options: options
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

    onSelectionChange: function (oEvent) {
      const sSelectedKey = oEvent.getSource().getProperty("selectedKey");
      const oModel = this.getModel("configuration");
      const oVerticalLayout = this.byId("verticalLayout");

      switch (sSelectedKey) {
        case "bar":
          oModel.setProperty("/visibility/chart", true);
          oModel.setProperty("/visibility/table", false);
          oModel.setProperty("/selectedChartType", sSelectedKey);

          if (oVerticalLayout.indexOfContent(this.oCanvas) === -1)
            oVerticalLayout.insertContent(this.oCanvas, 1);

          this._drawChart();
          break;

        case "pie":
          oModel.setProperty("/visibility/chart", true);
          oModel.setProperty("/visibility/table", false);
          oModel.setProperty("/selectedChartType", sSelectedKey);

          if (oVerticalLayout.indexOfContent(this.oCanvas) === -1)
            oVerticalLayout.insertContent(this.oCanvas, 1);

          this._drawChart();
          break;

        case "chart_table":
          oModel.setProperty("/visibility/chart", true);
          oModel.setProperty("/visibility/table", true);
          if (oVerticalLayout.indexOfContent(this.oCanvas) === -1) {
            oVerticalLayout.insertContent(this.oCanvas, 1);
            this._drawChart();
          }
          break;

        case "table":
          oModel.setProperty("/visibility/chart", false);
          oModel.setProperty("/visibility/table", true);
          oVerticalLayout.removeContent(1);
          break;

        default:
          break;
      }
    },

    handleDelete: function (oEvent) {
      const oItem = oEvent.getParameter("listItem"),
        sPath = oItem.getBindingContextPath(),
        aAllItems = this.getModel("waste_items").getData().wasteItems,
        index = this.getModel("waste_items").getData().wasteItems.indexOf(this.getModel("waste_items").getProperty(sPath));

      aAllItems.splice(index, 1);
      this.getModel("waste_items").setData({ wasteItems: aAllItems });
    },

    handleSwipe: function (evt) {   // register swipe event
      var oSwipeContent = evt.getParameter("swipeContent"), // get swiped content from event
        oSwipeDirection = evt.getParameter("swipeDirection"); // get swiped direction from event
      var msg = "";

      if (oSwipeDirection === "BeginToEnd") {
        // List item is approved, change swipeContent(button) text to Disapprove and type to Reject
        oSwipeContent.setText("Approve").setType("Accept");
        msg = 'Swipe direction is from the beginning to the end (left ro right in LTR languages)';

      } else {
        // List item is not approved, change swipeContent(button) text to Approve and type to Accept
        oSwipeContent.setText("Disapprove").setType("Reject");
        msg = 'Swipe direction is from the end to the beginning (right to left in LTR languages)';
      }
      //MessageToast.show(msg);
    },

    handleRefresh: function (evt) {
      setTimeout(function () {
        this.byId("pullToRefresh").hide();
        //this._pushNewProduct();
      }.bind(this), 1000);
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
      oModel.setProperty("/totalWaste", Wastecalc.calculateTotalWaste(this._getWasteItemsFromModel()));
    },

    _geti18nValue: function (sKey) {
      return this.geti18nValue(sKey);
    },

  });
});



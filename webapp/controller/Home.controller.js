// @ts-ignore
sap.ui.loader.config({
  shim: {
    'com/fidschenberger/trasta/libs/Chart.bundle.min': {
      amd: true,
      exports: 'Chart'
    },
    'com/fidschenberger/trasta/libs/localforage.min': {
      amd: true,
      exports: 'localForage'
    },
    'com/fidschenberger/trasta/libs/StatsCalculator': {
      amd: true,
      exports: 'StatsCalculator'
    }
  }
});

sap.ui.define([
  "./BaseController",
  "sap/base/Log",
  "sap/ui/core/EventBus",
  "com/fidschenberger/trasta/libs/Chart.bundle.min",
  "com/fidschenberger/trasta/libs/localforage.min",
  "com/fidschenberger/trasta/libs/waste-stats-calc",
  "com/fidschenberger/trasta/libs/StatsCalculator",
], function (Controller, Log, EventBus, Chart, localForage, Wastecalc, StatsCalculator) {
  "use strict";

  return Controller.extend("com.fidschenberger.trasta.controller.Home", {

    onInit: function () {
      this.oCanvas = this.byId("Chart");
      Wastecalc = new Wastecalc();

      EventBus = sap.ui.getCore().getEventBus();
      EventBus.subscribe("WasteItems", "Available", this._initializeChart, this);

      // @ts-ignore
      localforage.getItem('waste')
        .then((value) => {
          if (value !== null) {
            Log.info("Load data from localForage");
            this._setWasteItemsInModel(value);
          } else {
            Log.info("Load data from JSON file");
            this._loadDataFromJSON();
          }
        }).catch((err) => {
          Log.error(err);
        });

      this.aBackgroundColor = new Array(
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(0, 255, 0, 0.2)'
      );

      this.aBorderColor = new Array(
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(0, 255, 0, 1)'
      );

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
      }

      this.oChartScales = {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }

      this.oStackedBarChart = {
        xAxes: [{
          stacked: true,
        }],
        yAxes: [{
          stacked: true
        }]
      }
    },

    _initializeChart: function (sChannelId, sEventId, oData) {
      this._calculateKPIs();
      this.aTotalWasteData = this._calculateChartDataByMode();
      this._drawChart(this.aTotalWasteData);
      this.hideBusyIndicator();
    },

    onChangeDisplayMode: function (oEvent) {
      this.aTotalWasteData = this._calculateChartDataByMode();
      this._drawChart(this.aTotalWasteData);
    },

    _drawChart: function (chartDataAndLabel) {
      const ctx = document.getElementById("container-trasta---home--Chart");
      if (ctx === null) {
        this.hideBusyIndicator();
        return;
      }

      if (this.myChart !== undefined)
        this.myChart.destroy();

      const sChartType =
        (this.getModel("configuration").getProperty("/selectedChartType") === 'stacked') ? 'bar' : this.getModel("configuration").getProperty("/selectedChartType");

      const options = this._getChartOptions(this.getModel("configuration").getProperty("/selectedChartType"));
      const chartData = this._createChartDataSets(chartDataAndLabel);

      this.myChart = new Chart(ctx, {
        type: sChartType,
        data: {
          labels: this._getChartLabels(chartDataAndLabel),
          datasets: chartData
        },
        options: options
      });
    },

    _getChartLabels: function (chartDataAndLabel) {
      let aChartLabels = [];
      const oBundle = this.getResourceBundle();

      const fnMap = (oCurrentItem) => {
        return oCurrentItem.dataType === 'type' ? oBundle.getText(oCurrentItem.label) : oCurrentItem.label;
      };

      if (Array.isArray(chartDataAndLabel)) {
        aChartLabels = chartDataAndLabel.map(fnMap);
      } else {
        // Map
        aChartLabels = chartDataAndLabel.values().next().value.map(fnMap)
      }

      return aChartLabels;
    },

    _getChartData: function (aCalculatedChartData) {
      const fnMap = (oTotalItem) => { return oTotalItem.totalWeight };

      return aCalculatedChartData.map(fnMap);
    },

    _createChartDataSets: function (chartDataAndLabel) {
      let aDataSets = [];
      let index = 0;

      if (Array.isArray(chartDataAndLabel)) {
        aDataSets.push({
          label: this.getResourceBundle().getText('chartLabelTotal'),
          data: this._getChartData(chartDataAndLabel),
          backgroundColor: this.aBackgroundColor,
          borderColor: this.aBorderColor,
          borderWidth: 1
        });
      } else {
        // Map
        chartDataAndLabel.forEach((value, key) => {
          aDataSets.push({
            label: this.getResourceBundle().getText(key),
            backgroundColor: this.aBackgroundColor[index],
            borderColor: this.aBorderColor[index],
            borderWidth: 1,
            data: this._getChartData(value)
          });

          index++;
          if (index === this.aBackgroundColor.length)
            index = 0;
        });
      }

      return aDataSets;
    },

    _getChartOptions: function (sChartType) {
      let options = this.oChartOptions;
      switch (sChartType) {
        case "pie":
          break;
        case "bar":
          options = {
            ...this.options, scales: this.oChartScales
          };
          break;
        case "stacked":
          options = {
            ...this.options, scales: this.oStackedBarChart
          };
          break;
        default:
          break;
      }
      return options;
    },

    _calculateChartDataByMode: function () {
      const aAllWasteItems = this._getWasteItemsFromModel();
      switch (this.getModel("configuration").getProperty("/selectedDisplayMode")) {
        case "TYPE":
          return Wastecalc.calculateTotalTrashByCategory(aAllWasteItems);
        case "MONTH":
          return Wastecalc.calculateTotalsByMonth(aAllWasteItems);
        case "MONTHANDTYPE":
          return Wastecalc.calculateTotalsByMonthAndType(aAllWasteItems);
        default:
          return [];
      }
    },

    addWaste: function () {
      const oModel = this.getModel("waste_items");
      let aWaste = this._getWasteItemsFromModel();

      let oNewItem = oModel.getProperty("/newWasteItem");

      if (oNewItem.type === null || oNewItem.type === "") {
        const oSelect = this.getView().byId("selectWasteType");
        oNewItem.type = oSelect.getSelectedKey();
      }

      oNewItem.weight = Number(oNewItem.weight);
      oNewItem.date = String(Date.now());

      const oClonedItem = this._clone(oNewItem);
      aWaste.push(oClonedItem);

      for (const propt in oNewItem) {
        oNewItem[propt] = "";
      }

      oModel.setProperty("/newWasteItem", oNewItem);
      oModel.setProperty("/wasteItems", aWaste);

      this._saveModelInDB();
      this._updateChartWithNewWaste(oClonedItem);
    },

    _updateChartWithNewWaste: function (oWasteItem) {
      const isWasteType = (element) => element.label === oWasteItem.label;
      const index = this.aTotalWasteData.findIndex(isWasteType);
      let value = this.myChart.data.datasets[0].data[index];
      value += oWasteItem.weight / 1000;

      this.myChart.data.datasets[0].data[index] = value;
      this.myChart.update();
    },

    _calculateKPIs: async function () {
      const oModel = this.getModel("waste_statistics");
      oModel.setProperty("/totalWaste", Wastecalc.calculateTotalTrashKPI(this._getWasteItemsFromModel()));
      const test = StatsCalculator.calculateTotalTrashKPI(this._getWasteItemsFromModel());
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

          this._drawChart(this.aTotalWasteData);
          break;

        case "pie":
          oModel.setProperty("/visibility/chart", true);
          oModel.setProperty("/visibility/table", false);
          oModel.setProperty("/selectedChartType", sSelectedKey);

          if (oVerticalLayout.indexOfContent(this.oCanvas) === -1)
            oVerticalLayout.insertContent(this.oCanvas, 1);

          this._drawChart(this.aTotalWasteData);
          break;

        case "stacked":
          oModel.setProperty("/visibility/chart", true);
          oModel.setProperty("/visibility/table", false);
          oModel.setProperty("/selectedChartType", sSelectedKey);

          if (oVerticalLayout.indexOfContent(this.oCanvas) === -1)
            oVerticalLayout.insertContent(this.oCanvas, 1);

          this._drawChart(this.aTotalWasteData);
          break;

        case "chart_table":
          oModel.setProperty("/visibility/chart", true);
          oModel.setProperty("/visibility/table", true);
          if (oVerticalLayout.indexOfContent(this.oCanvas) === -1) {
            oVerticalLayout.insertContent(this.oCanvas, 1);
            this._drawChart(this.aTotalWasteData);
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

    handleRefresh: function (evt) {
      setTimeout(function () {
        this.byId("pullToRefresh").hide();
        //this._pushNewProduct();
      }.bind(this), 1000);
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
      /*       var oSwipeContent = evt.getParameter("swipeContent"), // get swiped content from event
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
            //MessageToast.show(msg); */
    },

    _geti18nValue: function (sKey) {
      return this.geti18nValue(sKey);
    }

  });
});



let chart1Data = {
  labels: ['-', '-', '-', '-', '-', '-', '-', '-'],
  datasets: [{
    // label: 'apples',
    data: [0, 0, 0, 0, 0, 0, 0, 0],
    realData: [0, 0, 0, 0, 0, 0, 0, 0],
    backgroundColor: 'rgba(118,2,196,1)'
  }]
}

let chart1Options = {
  legend: {
    display: false
  },
  tooltips: {
    enabled: false
  },
  events: [],
  scales: {
    yAxes: [{
      display: false,
      gridLines: {
        display: false
      },
      ticks: {
        beginAtZero: true,
        steps: 10,
        stepValue: 5,
        max: 100
      }
    }]
  },
  elements: {
    line: {
      //tension: 0, // disables bezier curves
    }
  },
  animation: {
    duration: 1,
    onComplete: function () {
      let chartInstance = this.chart
      let ctx = chartInstance.ctx
      ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'

      this.data.datasets.forEach(function (dataset, i) {
        let meta = chartInstance.controller.getDatasetMeta(i)
        meta.data.forEach(function (bar, index) {
          let data = dataset.realData[index]
          ctx.fillText(data + '℉', bar._model.x, bar._model.y - 5)
        })
      })
    }
  }
}

let tempChart = new Chart(document.getElementById('temp_chart'), {
  type: 'line',
  data: chart1Data,
  options: chart1Options,
  showTooltips: false
})

let chart2Data = {
  labels: ['-', '-', '-', '-', '-', '-', '-', '-'],
  datasets: [{
    // label: 'apples',
    data: [0, 0, 0, 0, 0, 0, 0, 0],
    realData: [0, 0, 0, 0, 0, 0, 0, 0],
    backgroundColor: 'rgba(118,2,196,1)'
  }]
}

let chart2Options = {
  legend: {
    display: false
  },
  tooltips: {
    enabled: false
  },
  events: [],
  scales: {
    yAxes: [{
      display: false,
      gridLines: {
        display: false
      },
      ticks: {
        beginAtZero: true,
        steps: 10,
        stepValue: 5,
        max: 100
      }
    }]
  },
  elements: {
    line: {
      //tension: 0, // disables bezier curves
    }
  },
  animation: {
    duration: 1,
    onComplete: function () {
      let chartInstance = this.chart
      let ctx = chartInstance.ctx
      ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'

      this.data.datasets.forEach(function (dataset, i) {
        let meta = chartInstance.controller.getDatasetMeta(i)
        meta.data.forEach(function (bar, index) {
          let data = dataset.realData[index]
          ctx.fillText(data + '℉', bar._model.x, bar._model.y - 5)
        })
      })
    }
  }
}

let tempChart2 = new Chart(document.getElementById('temp-chart-2'), {
  type: 'line',
  data: chart2Data,
  options: chart2Options,
  showTooltips: false
})
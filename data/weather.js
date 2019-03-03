const request = require('request')

// API_KEY stored in .env
// const APP_ID = OPEN_WEATHER_MAP_API_KEY

function retriveData () {
  request.get({ url: `http://api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=${APP_ID}` },
    function (error, response, body) {
      // console.log(error, response, body)
    })
}

let exportedMethods = {
  async updateData () {
    retriveData()
  },
  async getWeatherData () {

  }
}

module.exports = exportedMethods

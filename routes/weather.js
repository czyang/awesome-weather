const express = require('express')
const router = express.Router()
const dotenv = require('dotenv')
dotenv.config()
const geoip = require('geoip-lite')
const request = require('request')
const moment = require('moment')

// ### Please replace the value by your API KEY
const APP_ID = process.env.OPEN_WEATHER_MAP_API_KEY

const ICON_MAP = {
  '01d': 'wi-day-sunny',
  '01n': 'wi-night-clear',
  '02d': 'wi-day-cloudy',
  '02n': 'wi-night-alt-cloudy',
  '03d': 'wi-cloud',
  '03n': 'wi-cloud',
  '04d': 'wi-smoke',
  '04n': 'wi-smoke',
  '09d': 'wi-day-showers',
  '09n': 'wi-night-showers',
  '10d': 'wi-day-rain',
  '10n': 'wi-night-rain',
  '11d': 'wi-day-thunderstorm',
  '11n': 'wi-night-thunderstorm',
  '13d': 'wi-day-snow',
  '13n': 'wi-night-snow',
  '50d': 'wi-day-fog',
  '50n': 'wi-night-fog'
}

function mapIcon (icon) {
  let newIcon = ICON_MAP[icon]
  if (!newIcon) {
    newIcon = 'wi-cloud'
  }
  return newIcon
}

function assembleWeatherData (openWeatherAPIJSON) {
  let weatherJSON = {}
  weatherJSON.test = openWeatherAPIJSON
  weatherJSON.humidity = openWeatherAPIJSON.main.humidity
  weatherJSON.pressure = openWeatherAPIJSON.main.pressure
  weatherJSON.temp = openWeatherAPIJSON.main.temp
  weatherJSON.temp_max = openWeatherAPIJSON.main.temp_max
  weatherJSON.temp_min = openWeatherAPIJSON.main.temp_min
  weatherJSON.name = openWeatherAPIJSON.name
  weatherJSON.country = openWeatherAPIJSON.sys.country
  weatherJSON.coord = openWeatherAPIJSON.coord
  weatherJSON.dt = openWeatherAPIJSON.dt
  weatherJSON.wind_deg = openWeatherAPIJSON.wind.deg
  weatherJSON.wind_speed = openWeatherAPIJSON.wind.speed
  weatherJSON.weather = openWeatherAPIJSON.weather[0]
  weatherJSON.weather.icon = mapIcon(weatherJSON.weather.icon)
  return weatherJSON
}

function genHourlyData (item) {
  return {
    'dt': item.dt,
    'rain': item.rain,
    'description': item.weather[0].description,
    'icon': mapIcon(item.weather[0].icon),
    'weather_main': item.weather[0].main,
    'temp': item.main.temp,
    'humidity': item.main.humidity,
    'pressure': item.main.pressure
  }
}

function assembleForecastData (openWeatherAPIJSON) {
  let forecastJSON = {}
  forecastJSON.test = openWeatherAPIJSON

  // Because the API is 3 hours interval.
  let todayList = []
  let originList = openWeatherAPIJSON.list.slice(0, 8)
  for (let i = 0; i < originList.length; i++) {
    let item = originList[i]
    todayList.push(genHourlyData(item))
  }
  forecastJSON.todayList = todayList

  // Tomorrow
  let nextDayStartUnix = moment.unix(openWeatherAPIJSON.list[0].dt).add(1, 'days').unix()
  let tomorrowList = []
  let fillCount = 12
  let tempMin = Number.MAX_VALUE
  let tempMax = -Number.MAX_VALUE
  for (let i = 0; i < openWeatherAPIJSON.list.length && fillCount > 0; i++) {
    let item = openWeatherAPIJSON.list[i]
    // if (item.dt >= nextDayStartUnix) {
    if (i >= 5) {
      // console.log(item, item.dt, nextDayStartUnix)
      let temp = item.main.temp
      if (temp < tempMin) tempMin = temp
      if (temp > tempMax) tempMax = temp

      tomorrowList.push(genHourlyData(item))

      if (tomorrowList.length === 4) {
        forecastJSON.weatherDesc = item.weather[0].description
        forecastJSON.weatherMain = item.weather[0].main
        forecastJSON.humidity = item.main.humidity
        forecastJSON.icon = mapIcon(item.weather[0].icon)
      }

      fillCount--
    }
  }
  forecastJSON.tomorrowList = tomorrowList
  forecastJSON.tempMax = tempMax
  forecastJSON.tempMin = tempMin
  forecastJSON.cityName = openWeatherAPIJSON.city.name
  forecastJSON.country = openWeatherAPIJSON.city.country

  // 5 Days, 8 item perday.
  let dayStartUnix = moment.unix(openWeatherAPIJSON.list[0].dt).unix()
  let daysList = []
  tempMin = Number.MAX_VALUE
  tempMax = -Number.MAX_VALUE
  let dayWeather = {}
  let itemCount = 0
  for (let i = 0; i < openWeatherAPIJSON.list.length; i++) {
    let item = openWeatherAPIJSON.list[i]
    if (item.dt >= dayStartUnix) {
      let temp = item.main.temp
      if (temp < tempMin) tempMin = temp
      if (temp > tempMax) tempMax = temp
      itemCount++
      if (itemCount === 3) {
        dayWeather.weatherMain = item.weather[0].main
        dayWeather.weatherDesc = item.weather[0].description
        dayWeather.icon = mapIcon(item.weather[0].icon)
      }
      if (itemCount === 8) {
        daysList.push({ dt: item.dt, tempMin: tempMin, tempMax: tempMax, dayWeather: dayWeather })

        tempMin = Number.MAX_VALUE
        tempMax = -Number.MAX_VALUE
        dayWeather = {}
        itemCount = 0
      }

      if (i === openWeatherAPIJSON.list.length - 1 && itemCount > 0) {
        dayWeather = {}
        dayWeather.weatherMain = item.weather[0].main
        dayWeather.weatherDesc = item.weather[0].description
        dayWeather.icon = mapIcon(item.weather[0].icon)
        daysList.push({ dt: item.dt, tempMin: tempMin, tempMax: tempMax, dayWeather: dayWeather })
      }
    }
  }
  forecastJSON.daysList = daysList

  return forecastJSON
}

// Weather IP
router.get('/weather', async (req, res) => {
  let ip = req.connection.remoteAddress.split(`:`).pop()
  // console.log(ip)
  // ip = "207.97.227.239"
  ip = req.headers['x-forwarded-for']
  try {
    let geo = geoip.lookup(ip)
    if (geo) {
      // console.log(geo)
      request.get({ url: `https://api.openweathermap.org/data/2.5/weather?lat=${geo.ll[0]}&lon=${geo.ll[1]}&appid=${APP_ID}` },
        function (error, response, body) {
          // console.log(error, body)
          if (error) throw error

          let openWeatherAPIJSON = JSON.parse(body)
          res.json(assembleWeatherData(openWeatherAPIJSON))
        })
    } else {
      request.get({ url: `https://api.openweathermap.org/data/2.5/weather?zip=10001,us&appid=${APP_ID}` },
        function (error, response, body) {
          // console.log(error, body)
          if (error) throw error

          let openWeatherAPIJSON = JSON.parse(body)
          res.json(assembleWeatherData(openWeatherAPIJSON))
        })
    }
  } catch (e) {
    res.status(500).json({
      message: e.toString()
    })
  }
})

// Weather Location
router.post('/weather', async (req, res) => {
  const reqData = req.body
  if (!reqData || !reqData.latitude || !reqData.longitude) {
    console.log('latidue or longitude is null')
    res.status(400).json({ error: 'latidue or longitude is null' })
    return
  }
  try {
    request.get({ url: `https://api.openweathermap.org/data/2.5/weather?lat=${reqData.latitude}&lon=${reqData.longitude}&appid=${APP_ID}` },
      function (error, response, body) {
        console.log(error, body)
        if (error) throw error
        let openWeatherAPIJSON = JSON.parse(body)
        res.json(assembleWeatherData(openWeatherAPIJSON))
      })
  } catch (e) {
    res.status(500).json({
      message: e.toString()
    })
  }
})

// Weather Zip Code
router.post('/weather/zip', async (req, res) => {
  const reqData = req.body
  if (!reqData || !reqData.zip) {
    res.status(400).json({ error: 'zip is null' })
    return
  }
  try {
    request.get({ url: `https://api.openweathermap.org/data/2.5/weather?zip=${reqData.zip},us&appid=${APP_ID}` },
      function (error, response, body) {
        // console.log(error, body)
        if (error) throw error
        let openWeatherAPIJSON = JSON.parse(body)
        res.json(assembleWeatherData(openWeatherAPIJSON))
      })
  } catch (e) {
    res.status(500).json({
      message: e.toString()
    })
  }
})

// Forecast IP
router.get('/forecast', async (req, res) => {
  try {
    let ip = req.connection.remoteAddress.split(`:`).pop()
    ip = req.headers['x-forwarded-for']
    let geo = geoip.lookup(ip)
    if (geo) {
      // console.log(geo)
      request.get({ url: `https://api.openweathermap.org/data/2.5/forecast?lat=${geo.ll[0]}&lon=${geo.ll[1]}&appid=${APP_ID}` },
        function (error, response, body) {
          if (error) throw error
          // console.log(error, body)
          let openWeatherAPIJSON = JSON.parse(body)
          res.json(assembleForecastData(openWeatherAPIJSON))
        })
    } else {
      request.get({ url: `https://api.openweathermap.org/data/2.5/forecast?zip=10001,us&appid=${APP_ID}` },
        function (error, response, body) {
          // console.log(error, body)
          if (error) throw error
          let openWeatherAPIJSON = JSON.parse(body)
          res.json(assembleForecastData(openWeatherAPIJSON))
        })
    }
  } catch (e) {
    res.status(500).json({
      message: e.toString()
    })
  }
})

// Forecast Location
router.post('/forecast', async (req, res) => {
  const reqData = req.body
  if (!reqData || !reqData.latitude || !reqData.longitude) {
    res.status(400).json({ error: 'latidue or longitude is null' })
    return
  }
  try {
    request.get({ url: `https://api.openweathermap.org/data/2.5/forecast?lat=${reqData.latitude}&lon=${reqData.longitude}&appid=${APP_ID}` },
      function (error, response, body) {
        // console.log(error, body)
        if (error) throw error
        let openWeatherAPIJSON = JSON.parse(body)
        res.json(assembleForecastData(openWeatherAPIJSON))
      })
  } catch (e) {
    res.status(500).json({
      message: e.toString()
    })
  }
})

// Forecast Zip code
router.post('/forecast/zip', async (req, res) => {
  const reqData = req.body
  if (!reqData || !reqData.zip) {
    res.status(400).json({ error: 'zip is null' })
    return
  }
  try {
    request.get({ url: `https://api.openweathermap.org/data/2.5/forecast?zip=${reqData.zip},us&appid=${APP_ID}` },
      function (error, response, body) {
        // console.log(error, body)
        if (error) throw error
        let openWeatherAPIJSON = JSON.parse(body)
        res.json(assembleForecastData(openWeatherAPIJSON))
      })
  } catch (e) {
    res.status(500).json({
      message: e.toString()
    })
  }
})

module.exports = router

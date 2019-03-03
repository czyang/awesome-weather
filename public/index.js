function apiRequest (apiStr, method, sendData, onRes) {
  var settings = {
    'async': true,
    'crossDomain': true,
    'url': `/${apiStr}`,
    'method': method.toUpperCase(),
    'headers': {
      'Content-Type': 'application/json',
      'cache-control': 'no-cache',
    },
    'processData': false,
    'data': JSON.stringify(sendData)
  }

  $.ajax(settings).done(function (response) {
    onRes(response)
  })
}

function onClickGetLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successGeo)
  } else {
    showWarning('Opoos', 'Geolocation is not supported by your browser.')
    console.log('Geolocation is not supported by your browser.')
  }
}

function successGeo(position) {
  console.log(position, position.coords, JSON.stringify(position.coords))
  apiRequest('api/weather', 'POST', {
    'latitude': position.coords.latitude,
    'longitude': position.coords.longitude
  }, (res) => {
    console.log(res, 'weather')
    if (!res) return
    setByToday(res)
  })

  apiRequest('api/forecast', 'POST', {
    'latitude': position.coords.latitude,
    'longitude': position.coords.longitude
  }, (res) => {
    console.log(res, 'forecast')
    if (!res) return
    setByForecastData(res)
  })
}

function onClickSearch() {
  let inputStr = $('#search-input').val()
  console.log(inputStr)
  var isValidZip = /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(inputStr)
  console.log(isValidZip)
  if (!isValidZip) {
    showWarning('Opoos', `Only support USA City Zip code for now. ${inputStr} not a valide USA Zip code. Try: 94016`)
    return
  }
  apiRequest('api/weather/zip', 'POST', {
    'zip': inputStr
  }, (res) => {
    console.log(res)
    if (!res) return
    setByToday(res)
  })

  apiRequest('api/forecast/zip', 'POST', {
    'zip': inputStr
  }, (res) => {
    console.log(res)
    if (!res) return
    setByForecastData(res)
  })
}

$(document).ready(function () {
  $(".input1").on('keyup', function (e) {
    if (e.keyCode == 13) {
        // Do something
    }
  });

  apiRequest('api/weather', 'GET', {}, (res) => {
    console.log(res)
    // TODO: res is null return
    if (!res) return
    setByToday(res)
  })

  apiRequest('api/forecast', 'GET', {}, (res) => {
    console.log(res)
    // TODO: res is null return
    if (!res) return
    setByForecastData(res)
  })
})

function K2F(k) {
  return Math.floor((k - 273.15) * 9 / 5 + 32)
}

// Set up icon
function setupIcon(domId, icon) {
  var classList = $('#' + domId).attr('class').split(/\s+/)
  $.each(classList, function (index, item) {
    if (item.indexOf('wi-') > -1) {
      // String B contains String A
      $(`#${domId}`).removeClass(item)
      $(`#${domId}`).addClass(icon)
    }
  })
}

function unix2ampm(unix) {
  let date = new Date(unix * 1000)
  let hours = date.getHours()
  let suffix = 'AM'
  if (hours > 12) {
    hours -= 12
    suffix = 'PM'
  } else if (hours === 12) {
    suffix = 'PM'
  }
  return hours + ' ' + suffix
}

function getMaxMin(itemList) {
  console.log(itemList, 'bbbbbbbb')
  let maxVal = -Number.MAX_VALUE
  let minVal = Number.MAX_VALUE
  for (let i = 0; i < itemList.length; i++) {
    let item = itemList[i]
    let val = K2F(item.temp)
    if (val > maxVal) {
      maxVal = val
    } else if (val < minVal) {
      minVal = val
    }
  }
  return [maxVal, minVal]
}

function showWarning(title, desc) {
  $('#alert-modal').modal('show')
  $('#alert-modal-title').text(title)
  $('#alert-modal-desc').text(desc)
}

function setByToday(res) {
  $('#city_name_1').text(res.name  + ', ' + res.country)
  $('#temp_label_1').text(K2F(res.temp))
  $('#desc_name_1').text(res.weather.main)
  $('#sub_label_1_1').text(`Humidity ${res.humidity}%`)

  let desc = res.weather.description
  desc = desc.charAt(0).toUpperCase() + desc.slice(1)
  $('#sub_label_1_2').text(desc)
  setupIcon('big_icon_1', res.weather.icon)
}

function setByForecastData(res) {
  // Tab 1
  let todayList = res.todayList
  let [maxVal, minVal] = getMaxMin(todayList)
  $('#list-group-1').empty()
  for (let i = 0; i < todayList.length; i++) {
    let item = todayList[i]
    let tempVal = K2F(item.temp)

    //let ampm = unix2ampm(item.dt)
    let ampm = moment.unix(item.dt).format('h A')

    chart1Data.labels[i] = ampm
    chart1Data.datasets[0].data[i] = 30 + ((tempVal - minVal) / (maxVal - minVal)) * 30
    chart1Data.datasets[0].realData[i] = tempVal
    tempChart.update()

    $('#list-group-1').append(`
        <li class="list-group-item">
          <div class="row">
            <div class="col-6 col-sm-6 col-lg-6 ">
              <p class="mb-0 ml-0 theme-color" style="font-size:20px;">${ampm}</p>
              <p class="mb-0 ml-0 mt-0" style="font-size:15px;color:#424242;">${item.description}</p>
            </div>
            <div class="col-6 col-sm-6 col-lg-6 text-right">
              <div class="text-right">
                <span><i class="wi ${item.icon} text-right theme-color" style="font-size:30px;display:inline;"></i></span>
              </div>
              <div class="text-right"><span>
                <p class="mb-0 mt-0 ml-2 text-right" style="font-size:15px;color:#424242;display:inline;">${tempVal}℉</p>
              </span></div>
            </div>
          </div>
        </li>
      `)
  }

  // Tab 2
  $('#tomorrow-max-label').text(K2F(res.tempMax))
  $('#tomorrow-min-label').text(K2F(res.tempMin))
  setupIcon('tomorrow-icon', res.icon)
  $('#tomorrow-main').text(res.weatherMain)
  $('#tomorrow-desc').text(res.weatherDesc)
  $('#tomorrow-humidity').text('Humidity ' + res.humidity + '%')
  $('#tomorrow-city-name').text(res.cityName + ', ' + res.country)

  let tomorrowList = res.tomorrowList
  let [maxVal2, minVal2] = getMaxMin(tomorrowList)
  maxVal = maxVal2
  minVal = minVal2
  $('#list-group-2').empty()
  for (let i = 0; i < tomorrowList.length && i < 8; i++) {
    let item = tomorrowList[i]
    let tempVal = K2F(item.temp)

    // let ampm = unix2ampm(item.dt)
    let ampm = moment.unix(item.dt).format('h A')
    chart2Data.labels[i] = ampm
    chart2Data.datasets[0].data[i] = 30 + ((tempVal - minVal) / (maxVal - minVal)) * 30
    chart2Data.datasets[0].realData[i] = tempVal
    tempChart2.update()

    $('#list-group-2').append(`
        <li class="list-group-item">
          <div class="row">
            <div class="col-6 col-sm-6 col-lg-6 ">
              <p class="mb-0 ml-0 theme-color" style="font-size:20px;">${ampm}</p>
              <p class="mb-0 ml-0 mt-0" style="font-size:15px;color:#424242;">${item.description}</p>
            </div>
            <div class="col-6 col-sm-6 col-lg-6 text-right">
              <div class="text-right">
                <span><i class="wi ${item.icon} text-right theme-color" style="font-size:30px;display:inline;"></i></span>
              </div>
              <div class="text-right"><span>
                <p class="mb-0 mt-0 ml-2 text-right" style="font-size:15px;color:#424242;display:inline;">${tempVal}℉</p>
              </span></div>
            </div>
          </div>
        </li>
      `)
  }

  // Tab 3
  let daysList = res.daysList
  $('#list-group-3').empty()
  for (let i = 0; i < daysList.length; i++) {
    let item = daysList[i]
    let tempMaxVal = K2F(item.tempMax)
    let tempMinVal = K2F(item.tempMin)
    let timeStr = moment.unix(item.dt).format("ddd, MMM D");
    $('#list-group-3').append(`
        <li class="list-group-item">
          <div class="row">
            <div class="col-6 col-sm-6 col-lg-6 ">
              <p class="mb-0 ml-0 theme-color" style="font-size:20px;">${timeStr}</p>
              <p class="mb-0 ml-0 mt-0" style="font-size:15px;color:#424242;">${item.dayWeather.weatherDesc}</p>
            </div>
            <div class="col-6 col-sm-6 col-lg-6 text-right">
              <div class="text-right">
                <span><i class="wi ${item.dayWeather.icon} text-right theme-color" style="font-size:30px;display:inline;"></i></span>
              </div>
              <div class="text-right"><span>
                <p class="mb-0 mt-0 ml-2 text-right theme-color" style="font-size:15px;color:#424242;display:inline;">${tempMaxVal}℉ ${tempMinVal}℉</p>
              </span></div>
            </div>
          </div>
        </li>
      `)
  }
}
# Awesome Weather APP

This is a website APP made with NodeJS back-end and HTML5 front-end. It's utilize the OpenWeatherMap Free API. To get the data from API and then displayed on the front-end. 


## Structure
```
awesome-weather/
├── public/     Most front-end files
├── scss/       Sass style files
└── routes/     NodeJS route, most back-end logic in here
```


## Production Preview

You can access the App via: https://codingmelody.com/awe/ 


## Install

Uncompress the code file.

``` $ cd awesome-weather ```

*You need OpenWeatherMap API KEY to run the program.*

Create a file named ```.env```, and put your key into it like below example:

In your file: awesome-weather/.env
```
OPEN_WEATHER_MAP_API_KEY = 00****e6c**fc6***3c***
```

```
$ npm install
$ npm start
```

It should be start an program listen on ::8800 (If port has been taken, port can easily change on head of ```awesome-weather/app.js```)

Then you can access website via: http://127.0.0.1:8800/ or http://localhost:8800


## Part of Known Bugs

### 1. Data accuracy

Data from OpenWeatherMap is not very accurate like main stream weather APP. My implementable has some trouble to display tomorrow and 5 day data accuracy.

### 2. Local time

To get city local time we need another API like Google map API, since OpenWeatherMap have no information about city locale time. For now this App just show the user local time rather than city local time.




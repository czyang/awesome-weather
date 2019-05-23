const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const configRoutes = require('./routes')
const cors = require('cors')
const port = 8800

app.options('*', cors()) 
app.use(cors())

app.use(bodyParser.json())

app.use(express.static('public'))
configRoutes(app)

app.listen(port, () => {
  console.log(`Listening on :${port}`)
})

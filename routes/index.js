const weatherRoutes = require('./weather')

const constructorMethod = app => {
  app.use('/api', weatherRoutes)

  app.use('*', (req, res) => {
    res.status(404).json({ error: '404 not found' })
  })
}

module.exports = constructorMethod

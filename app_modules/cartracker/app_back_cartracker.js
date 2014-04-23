function CarTracker(api, cfg){
    var name = '/CarTracker/'
       ,css = '/css' + name + 'css/file'
       ,app = api.app
       ,csc = api.connect['static']

    api.cfg.extjs.load.requireLaunch.push(name + 'app_front_cartracker')
    app.use(name, csc(__dirname + '/'))

    app.use('/api/', csc(__dirname + '/api/'))
    app.use('/security/', csc(__dirname + '/security/'))
    app.use('/resources/', csc(__dirname + '/resources/'))

    api.cfg.extjs.load.css.push(css)
    app.use(css, api.connect.sendFile(__dirname + '/resources/css/style.css', true))
    app.use('/css' + name, csc(__dirname + '/resources/'))
}

module.exports = CarTracker

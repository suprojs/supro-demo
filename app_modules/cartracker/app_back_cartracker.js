
module.exports = CarTracker

function CarTracker(api, cfg){
    var name = '/CarTracker/'
       ,css = '/css' + name + 'css/file'
       ,app = api.app
       ,csc = api.connect['static']

    app.use(name, csc(__dirname + '/'))

    app.use('/api/', csc(__dirname + '/api/'))
    app.use('/security/', csc(__dirname + '/security/'))
    app.use('/resources/', csc(__dirname + '/resources/'))

    app.use('/css' + name, csc(__dirname + '/resources/'))
    app.use(css, api.connect.sendFile(__dirname + '/resources/css/style.css', true))

    return { css:[ css ], js:[ name + '/app_front_cartracker'], cfg: cfg }
}

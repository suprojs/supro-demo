/*
 * Run `mongod` and connect to it
 **/

module.exports = supromongod

function supromongod(api, cfg){
var n, app = api.app, name = 'supromongod'

    return {
        css:['/css/' + name + '/css'],
        js: ['/' + name + '/app_front_' + name ],
        app_use: app_use,// call this *after* `mwBasicAuthorization()`
        cfg: cfg
    }

    function app_use(){
    var app = api.app

        // order of priority; serve static files, css, l10n
        app.use('/' + name + '/', api.connect['static'](__dirname + '/'))
        app.use('/l10n/', api.mwL10n(api, __dirname, '_' + name + '.js'))
        app.use('/css/' + name + '/', api.connect['static'](__dirname + '/css/'))
        app.use('/css/' + name + '/css', api.connect.sendFile(
            __dirname + '/' + name + '.css', true)
        )
    }
}

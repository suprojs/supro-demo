
module.exports = shoeSUPRO

function shoeSUPRO(api, cfg){
var app = api.app
   ,name = '/shoesupro', n

    n = '/lib/logic'
    app.use(name + n, require('.' + n)(api, cfg))
    app.use(name, api.connect['static'](__dirname + '/'))

    app.use('/n31/', api.connect['static'](__dirname + '/../../data/so/n31/'))

    // low priority stuff:
    n = '/css' + name + '/css'
    app.use(n, api.connect.sendFile(__dirname + name + '.css', true))
    app.use('/css' + name, api.connect['static'](__dirname + '/css/'))
    app.use('/l10n/', api.mwL10n(api, __dirname, '_shoesupro.js'))

    return { css:[ n ], js:[ name + '/app_front_shoesupro'], cfg: cfg }
}

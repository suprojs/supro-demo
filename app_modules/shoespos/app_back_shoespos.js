/*
 * POS mochup
 **/
module.exports = shoesPOS

function shoesPOS(api, cfg){
var app = api.app
   ,name = '/shoespos', n

    api.app.use(name, api.connect['static'](__dirname + '/'))

    // low priority stuff:
    n = '/css' + name + '/css'
    app.use(n, api.connect.sendFile(__dirname + name + '.css', true))
    app.use('/css' + name, api.connect['static'](__dirname + '/css/'))

    app.use('/l10n/', api.mwL10n(api, __dirname, '_shoespos.js'))

    return { css:[ n ], js:[ name + '/app_front_shoespos'], cfg: cfg }
}

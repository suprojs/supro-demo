/*
 * Run `mongod` and connect to it
 **/

module.exports = supromongod

function supromongod(api, cfg){
var n, app = api.app, name = '/example'

    return
    // order of priority; serve static files, css, l10n
    app.use(name, api.connect['static'](__dirname + '/'))
    // http://$WEB_ADDRESS/l10n/ru_example.js
    /* path  to: '$ROOT/app_modules/example/l10n/ru_example.js' */
    app.use('/l10n/', api.mwL10n(api, __dirname, '_' + name.slice(1) + '.js'))

    // files: http://$WEB_ADDRESS/css/example/*
    app.use('/css' + name, api.connect['static'](__dirname + '/css/'))
    // style: http://$WEB_ADDRESS/css/example/css
    n = '/css' + name + '/css'
    app.use(n, api.connect.sendFile(__dirname + name + '.css', true/* full path*/))
    // this module stuff:
    return { css:[ n ], js:[ name + '/app_front_example'], cfg: cfg }
}

/*
        if(!cfg.backend.mongodb) return require('./lib/app.js')(cfg)

        return require('./lib/mongodb.js').connect(cfg.backend.mongodb,
        function on_app_db(err, db){
            err && process.exit(1)// it's over, don't even launch

            return require('./lib/app.js')(cfg, db)
        }
        )

        cfg.backend.ctl_on_close(function(){
            ....
        })

        if(cfg.backend.mongodb){
            if((cfg = require('./mongodb.js').client)){
            //FIXME: check `serverStatus.metrics.cursor.open.total`
                return cfg.close(true, function end_with_mongodb(err){
                    err && (body += '! MongoDB close error:' + err + '\n')
                    body += '^ MongoDB connection was closed\n'
                    log(body)

                    res.writeHead(200 ,{ 'Content-Length': body.length,
                                         'Content-Type': 'text/plain' }
                    )
                    res.end(body)

                    return the_end(err ? 2 : 0)
                })
            }
        }
*/

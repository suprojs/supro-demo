/*
 */

module.exports = logic

function logic(api, cfg){
var url = require('url')
   ,qs = require('connect/node_modules/qs')
   ,fs = require('fs')
   ,local = {
        url: null,
        cfg: cfg,
        require:{
            fs: fs
        }
    }
   ,shoe_api = {
        'objct': null, //'lists': null, 'rprts': null
        'seasn': null,
        'devel': load_api
    }

    load_api()
    return mwShoeLogic

    function mwShoeLogic(req, res, next){
    var ret = { success: true, data: null }// for errors: `return next(err)`
       ,call//                                                       \...../
       ,m = req.url.slice(1, 6)// call from UI: App.backend.req('/.../devel')

        if(!req.session) return next('!session')
        __res = res

        if('devel' === m && false /*!req.session.can['App.view.Window->tools.refresh']*/){
            res.statusCode = 401// no auth
            return next('!auth')
        }
        local.url = url.parse(req.url.slice(6))// parse into object, api has no `require()`
        local.url.query && (local.url.query = qs.parse(local.url.query))

        if((call = shoe_api[m])){
            if(!call(ret, api, local, req, res, next)){// try/catch by `connect`
                return res.json(ret)// sync
            }// async
        } else {
            return next('!handler: ' + req.url)// sync no handler
        }
        return undefined
    }

    function load_api(ret){
    var m, tmp, err = '', done = ''

        for(m in shoe_api){
            if(0 != m.indexOf('deve')){
                tmp = shoe_api[m]// save
                try {
                    shoe_api[m] = new Function(
                       'ret, api, local, req, res, next',
                        fs.readFileSync(__dirname + '/logic_' + m + '.js', 'utf8')
                    )
                    done += m + ' '
                } catch(ex){
                    log('exec fail:', ex)
                    err += ex + '\n'
                    tmp && (shoe_api[m] = tmp)// restore if error
                }
            }
        }
        if(ret){
            ret.data = done
        }
        return err && arguments[5] && (arguments[5](err) || true)// next(err), async subapi
    }
}

/*
 * Object API: warehouse, shop
 **/

function objectsBusinessLogic(ret, api, local, req, res, next){
var p, db

    if(!(db = api.db)) return next(ret.data = '!db', ret)

console.log('req.method:', req.method)

    p = local.url.pathname.slice(1)

    if('stat' == p){
        return req.method == 'GET' ? objectStat() : objectStatUpdate()
    }
    setImmediate(no_such_subapi)
    return undefined

    function no_such_subapi(){
        ret.success = !(ret.data = '!such_subapi: ' + local.url.pathname)
        return res.json(ret)
    }


// F A R S H //

    function objectStat(){
        /*, { sort: { id: -1 }}*/
        return db.getCollection('listObjects').find(null).toArray(mkItems)
    }

    function objectStatUpdate(){
    var opts, obj

        if(!Array.isArray(req.json)) return next('!arr_json')
        if(1 != req.json.length) return next('!arr_one')

        opts = { upsert: req.method !== 'PUT','new': true }
        obj = req.json[0]

        if(!obj.name || obj.name.replace(/^\w*$/, '')){
            return next('~latin:name')
        }

        return db.collectionNames(function(err ,arr){
        var i, re

            if(err) return next(err)

            if(opts.upsert){// new object
                re = new RegExp(
                    '^' + local.cfg.db_name + '[.]'
                        + obj.name +
                    '$'
                )
                for(i = 0; i < arr.length; ++i) if(re.test(arr[i].name)){
                    return next('~obj_exists:' + obj.name)//app error
                }
                /*
                coll.add = coll.add ? new Date(coll.add) : null// revive Dates
                coll.id = 0// the first document in new collection for season
                coll.busy = false// busy edit flag
                coll.fields = db_data_orders.fields// initial grid setup
                coll.columns = db_data_orders.columns
                coll.idProperty = db_data_orders.idProperty || 'id',
                coll.total_ord = 0
                coll.total_ins = 0*/
            } else {// update season
                coll = { $set: { }}
                re = req.json[0]
                for(i in re){
                    coll.$set[i] = re[i]
                }
                coll.$set.edit = new Date
                coll.$set.edit_by = req.session.user.name + ':' + req.session.can.__name
            }

            return setImmediate(no_such_subapi)//!!!dev
            //season = db.getCollection('n' + s)
            //i = db.getCollection('i' + s)// in_stock documents
            //return opts.upsert ? new_season() : edit_season()
        })

    }

    function mkItems(err, items){
        if(err) return next(err)

        return res.json((ret.data = items, ret))
    }
}

objectsBusinessLogic(ret, api, local, req, res, next)
return true// async always

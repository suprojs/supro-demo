/*
 * Season API
 *
 * developing/testing reload:
 * App.backend.req('/shoesupro/lib/logic/devel', function(err, json){ console.log(json)})
 **/

function seasonsBusinessLogic(ret, api, local, req, res, next){
/*
 * `Ext.data.Store` compatible MongoDB API
 *
 *> test.get('/shoesupro/lib/logic/order/subapi?param=value&num=1234')
local.url:{
  search: '?param=value&num=1234',
  query: { param: 'value', num: '1234' },
  pathname: '/subapi',
  path: '/subapi?param=value&num=1234',
  href: '/subapi?param=value&num=1234'
}
req.methods: 'GET'/'POST'/'PUT'
*/
var m, p, db = api.db

    if(!db || !db.status) return next('!db')

console.log('req.method:', req.method)
    // set of dynamic / not deterministic URIs
    p = local.url.pathname.slice(1)

    if('stat' == p){
        return req.method == 'GET' ? orderStat() : orderStatUpdate()
    }

    /** H I S T O R Y  **/

    if(0 == p.indexOf('hist/h')){
        if((m = p.match(/(hn\d+)/))){
            return orderHist(m[1])
        }//http://localhost:3007/shoesupro/lib/logic/seasn/hist/hn6[+init]

        if((m = p.match(/(hn\d+)[/](.+)/))){
            return orderHistItem(m[1], m[2])
        }//http://localhost:3007/shoesupro/lib/logic/seasn/hist/hn6/54044f2d90054d0000b909ef
    }

    /** O R D E R S **/

    if((m = p.match(/^(n\d+)/))){// items collection (orders)
        if(req.method[0] == 'G'){//GET
            return getStoreItems(m[1], ~p.indexOf('+init'))
        }

        if(!(Array.isArray(req.json) && req.json.length)){
            return next('!arr_json')
        }
        // no delete here: POST && PUT
        return (req.method == 'PUT' ? orderItemsEdit : orderItemsAdd)(m[1])
    }

    /** I N - S T O C K **/
console.log(p)

    /* ref: '/shoesupro/lib/logic/seasn/i5_3': m[1] = 'i5', m[2] = '_3' */
    if((m = p.match(/^(i\d+)(_\d+)?/))){// in stock documents collection
console.log('req.json:', req.json)

        if('PUT' == req.method && m[2]){//               strip '_'
            return insDocAndItemsEdit(m[1], parseInt(m[2].slice(1), 10))
        }// no other PUTs

        p = ~p.indexOf('+init')
        if('POST' == req.method && !m[2]){// new doc `App.backend.req()` by hand
            if(p){// save preliminary models, configure grid && store
                return insDocNew(m[1])
            }// no POSTs without '+init'
        }// no POSTs with doc: cannot add models (yet)

        if('G' == req.method[0]){//GET doc id
             if(!m[2]){// list in-stock documents of the season
                 return getStoreDocs(m[1], p)
             }
             //                                  strip '_'
             return insDocGet(m[1], parseInt(m[2].slice(1), 10), p)
        }
    }
    setImmediate(no_such_subapi)
    return undefined

    function no_such_subapi(){
        ret.success = !(ret.data = '!such_subapi: ' + local.url.pathname)

        return res.json(ret)
    }

// F A R S H //

/* `App.shoesupro.parseOrderItemsToStore()`
   `model.data.g_sizes`:
    {
        n: s, // name
        q: 0, // current qty (available for moves b/w objects), IN: q += i
        i: 0, // in stock, IN: q += i
        s: 0, // sold, changed by SELR ++s, --q, --r
        r: 0, // remains SELR --r
        w: 0, // items write flag / or original order count when in stock
        o: num // order count
    }
TODO: maybe this per-size logic can be implemented inside server by `eval`???
*/

    /* In-Stock CRUD */

    function insDocCommitItemsToObject(insn, docn){
    // get doc models, check order count, create move into
    // GLOB_moves, push items in GLOB_items + OBJ_moves && OBJ_items



    }

    function insDocAndItemsEdit(insn, docn){
    var hst, hid, ins, models, i, t
    // get items from n#, check current ord count vs ins.o count,
    // if not match save current `g_sizes.i` and old `g_sizes.o`
    // ask UI to reload this doc to sync with current order size counts
    //
    // get `g_sizes.i` $inc them to order.g_sizes.i, update total_ins
    // check local.url.query.edit ask for saving
        if(!(t = req.json).length) return next('!arr_json')

        models = new Array(t.length)
        for(i = 0; i < t.length; ++i){// check ids
            if(!(models[i] = t[i].id_mpcode)) return next('~id_mpcode: ' + ++i)
        }

        i = insn.slice(1)
        hst = db.getCollection('hn' + i)
        ins = db.getCollection('i' + i)

        return db.getCollection('n' + i).find(
            { id_mpcode: { $in: models }},
            { id_mpcode: 1, g_sizes: 1 }).toArray(
            checkOrdersQuantiny
        )

        function checkOrdersQuantiny(err, ord_g_sizes){
        var i, s, j, m, n, d//, o, total_ord, total_ins, total_ordins

            if(err) return next(err)
            if(t.length != ord_g_sizes.length) return next('~find_ids')

            t = t.sort(sortBy_id)// match order of items in both sets
            ord_g_sizes = ord_g_sizes.sort(sortBy_id)
            err = 0
            for(i = 0; i < t.length; ++i){
                m = t[i]// models
                s = ord_g_sizes[i]
                if(!m.id_mpcode) return next('~id_mpcode: ' + ++i)
                // check mutual ('order' and 'in stock' doc) item `id` match
                if(m.id_mpcode !== s.id_mpcode){ err = 3; break }
                m.g_sizes = m.g_sizes.sort(sortBy_n)
                s.g_sizes = s.g_sizes.sort(sortBy_n)

                /* [{n:"36", o:7, w:7, i:0}, {n:"37", o:18, w:18, i:0},...] */
                for(j = 0; j < m.g_sizes.length; ++j){
                    n = m.g_sizes[j]// sizes: in stock
                    d = s.g_sizes[j]// order
                    // check mutual `g_size.n` match
                    if(n.n !== d.n){ err = 2; break }
                    // check mutual match of count in
                    // order `g_size.o` and in stock doc copy of order `g_size.w`
                    if(n.w && n.w !== d.o){
                        err || (err = 1)
                        ret.data += m.id_mpcode + ' "'
                                 + n.n + '" ' + n.w + '!=' + d.o + '; '
                    }//NOTE: if non zero and no break (processed below)
                }
                if(err && 1 != err) break
            }
            ret.data = ''
            switch(err){
            default: break
            case 3:
            case 2:
                (3 === err) && (ret.data += '~i.id!=o.id:' + m.id + '!=' + s.id);
                (2 === err) && (ret.data += '~i.n!=o.n:'   + n.n  + '!=' + d.n);
                // fail IDs, fail size numbers
                ret.success = false
                return res.json(ret)
            case 1: ret.data = '~i.o!=o.o:' + ret.data
                // save ins counts as if normal case, but notice user about
                // mismatch and order concurrent (re)writes while doing "in stock"
                ret.success = false
                // fall thru
            }

            /* edit/update/save in stock size counts in doc */

            for(i = 0; i < t.length; ++i){
                m = t[i]// models
                s = { $set: { }}
                for(n in m) if(// skip protected fields
                    '_id' != n && 'id' != n && 'id_mpcode' != n &&
                    'add' != n && 'add_by' != n &&
                    'edit' != n && 'edit_by' != n && 'json' != n)
                {
                    if('g_sizes' == n){
                        for(j = 0; j < m.g_sizes.length; ++j){
                    /* [{n:"36", o:7, w:7, i:0}, {n:"37", o:18, w:18, i:0},...] */
                            if(1 == err){// order count was changed
                                // save current order qty into ins doc
                                m.g_sizes[j].o = ord_g_sizes[i].g_sizes[j].o
                            } else {
                                // save old order qty back after UI changes
                                m.g_sizes[j].o = m.g_sizes[j].w// virtual field
                            }//`g_sizes[j].i` as from UI
                        }
                        s.$set['data.$.g_sizes'] = m.g_sizes//ins commit
                    }
                }
                models[i] = s// construct update array
            }
            // replace data with current one
            return add_history(update_doc)
        }

        function add_history(cb){
            return hst.insert({// history collection
                _id: hid = db.ObjectId(),
                d: new Date,
                a: '=',// update/edit
                c: 'ins',
                s: '-',// status, starting update
                byu: req.session.user.name,
                byr: req.session.can.__name,
                data: req.json
            }, cb)
        }

        function update_doc(err, hitem){
            if(err) return next(err)
            if(!hitem) return next('!hsts')

            return ins.findAndModify(
                {
                    id: docn,
                    edit: parseInt(local.url.query.edit, 10)
                },
                [/*sort*/],
                { $set:{
                    edit: 0,// 0 == busy
                    edit_by: req.session.user.name
                }},
                update_doc_data
            )
        }

        function update_doc_data(err, updt){
        var updated, done, i

            if(err) return next(err)
            if(!updt) return next('~insupdt')// `edit` not matched (rewrite)

            updated = 0
            done = models.length
            for(i = 0; i < models.length; ++i){// parallel update under `edit` lock
//console.log('$set', models[i].$set)
                ins.update(
                {
                    id: docn,
                    edit: 0,
                    'data.id_mpcode': t[i].id_mpcode
                }, models[i],
                function on_update_cb(err, n){
                    if(err) return done ? (done = 0, end_update(err)) : undefined

                    updated += n
                    if(done && 0 >= --done){// if no error above and all is done,
                        return end_update(null, updated)// end of parallel update
                    }
                    return undefined
                }
                )
            }
            return undefined
        }

        function end_update(err, updated){
            if(err) return next(err)
            if(updated != models.length) return next('!insupdt')

            // inform UI about new `edit` of a document
            ret.metaData = { edit: updated = (new Date).valueOf()}
            return ins.findAndModify(
                { id: docn, edit: 0 },
                [/*sort*/],
                { $set:{
                    edit: updated,// reset busy
                    edit_by: ''
                }},
                end_history
            )
        }

        function end_history(err, insupdt){
            if(err) return next(err)
            if(!insupdt) return next('~insupdt')// `edit` not matched doc items

            return hst.findAndModify(
                { _id: hid },
                [ ],
                { $set: { s: '+' }},
                { fields: { _id: 1 }},
                on_end_history)
        }

        function on_end_history(err, h){
            if(err) return next(err)
            if(!h) return next('!hste: ' + hst.collectionName)

            if(!ret.data){// if there is no info (e.g. from errors)
                ret.data = ''// don't send data back, there aren't all fields to show
            }
            return res.json(ret)
        }
    }

    function insDocNew(insn){
    var hst, hid, ord, ins

        if(!(Array.isArray(req.json.id_mpcodes)
          && req.json.id_mpcodes.length)) return next('!arr_json')

        ord = db.getCollection('n'  + insn.slice(1))
        hst = db.getCollection('hn' + insn.slice(1))
        ins = db.getCollection(insn)

        return hst.insert({// history collection
            _id: hid = db.ObjectId(),
            d: new Date,
            a: '+',// add/create
            c: 'ins',
            s: '-',// status
            byu: req.session.user.name,
            byr: req.session.can.__name,
            data: req.json
        }, onHistory)

        function onHistory(err, hitem){
            if(err) return next(err)
            if(!hitem) return next('!hsts')

            return ins.findAndModify(
                { id: 0 },
                [/* sort*/],
                { $inc: { '#': 1}},
        function onNewINSFlag(err, metaData){
            if(err) return next(err)
            if(!metaData) return next('!meta: ' + ins.collectionName)

            // ensure number
            ret.metaData = {
                '#': metaData['#'] ? metaData['#'] + 1 : 1,
                fields: metaData.docs.fields,
                columns: metaData.docs.columns,
                idProperty: metaData.docs.columns.idProperty || "id_mpcode",
                edit: 0// send back current `edit` (below) to check concurrency
            }
            err = req.session, err = err.user.name + ':' + err.can.__name
            return ord.update(
                { id: 0 },
                { $set: { edit: new Date, edit_by: err }},
        function onStatOrd(err, stat){
            if(err) return next(err)
            if(!stat) return next('!stat: ' + ord.collectionName)

            return ord.find(
                { id_mpcode: { $in: req.json.id_mpcodes }},{
                  _id: 0, id: 1, id_mpcode: 1, g_sizes: 1,
                  total_ins: 1, total_ord: 1,
                  prodname: 1, sert: 1, sert_from: 1, sert_to: 1 }).toArray(
        function onFindModels(err, models){
            if(err) return next(err)
            /*
             * `idProperty` of subdocs is `id_mpcode`
             **/

            for(var s, j, i = 0; i < models.length; ++i){// prepare `g_sizes`
                s = models[i].g_sizes
                for(j = 0; j < s.length; ++j){
                    s[j].w = s[j].o// create local copy of order count: `mkINSDoc()`
                }
            }

            return ins.insert(
                { id: ret.metaData['#'],
                  add: new Date, add_by: req.session.user.name + ':' + req.session.can.__name,
                  edit: ret.metaData.edit = (new Date).valueOf(), edit_by: '',
                  cmnt: req.json.cmnt,
                  data: ret.data = models
                },
        function onNewINSdoc(err, docINS){
            if(err) return next(err)
            if(!docINS) return next('!insdoc: ' + ins.collectionName)

            return hst.findAndModify(
                { _id: hid },
                [ ],
                { $set: { s: '+' }},
                { fields: { _id: 1 }},
        function onEndHistory(err, h){
            if(err) return next(err)
            if(!h) return next('!hste: ' + hst.collectionName)

            return res.json(ret)
        })})})})})
        }
    }

    function insDocGet(insn, docn, init){
    var t = { id: { $in: [ docn ] }}

        if(init){// get grid config
            t.id.$in.push(0)
        }

        return db.getCollection(insn).find(t, { sort: { id: -1 }}).toArray(
            findModels
        )

        function findModels(err, docs){
        var i, models

            if(err) return next(err)
            if(!docs.length) return next('~find')

            t = docs[0].data// in stock document, prepare g_sizes
            if(!Array.isArray(t)) return next('~arrins')

            if((i = docs[1]) && 0 === i.id){// must be first item (sort)
                ret.metaData = {// setup grid/store
//TODO: send diff of changes for conflict resolution, if any
                    edit: docs[0].edit,// send doc date back to check rewrites
                    fields: i.docs.fields,
                    columns: i.docs.columns
                }
            }

            models = new Array(t.length)
            for(i = 0; i < t.length; ++i){
                if(!(models[i] = t[i].id_mpcode)) return next('~id_mpcode: ' + i)
            }

            return db.getCollection('n' + insn.slice(1)).find(
                { id_mpcode: { $in: models }},
                { id_mpcode: 1, g_sizes: 1 }).toArray(
                mkINSDoc
            )
        }

        function mkINSDoc(err, ord_g_sizes){
        var i, s, j, m, n, d, o, total_ord, total_ins
            //update: { $set: { 'json.ins': true} }
            if(err) return next(err)
            if(t.length != ord_g_sizes.length) return next('~find_ids')

            t = t.sort(sortBy_id)// match order of items in both sets
            ord_g_sizes = ord_g_sizes.sort(sortBy_id)

            for(i = 0; i < t.length; ++i){
                m = t[i]// models
                s = ord_g_sizes[i]
                if(m.id_mpcode !== s.id_mpcode) return next('~i.id!=o.id:' + m.id + '!=' + s.id)
                m.g_sizes = m.g_sizes.sort(sortBy_n)
                s.g_sizes = s.g_sizes.sort(sortBy_n)
                total_ord = total_ins = 0
                for(j = 0; j < m.g_sizes.length; ++j){
                    n = m.g_sizes[j]// sizes: in stock
                    d = s.g_sizes[j]// order
                    if(n.n !== d.n) return next('~i.n!=o.n:'   + n.n  + '!=' + d.n)
                    m.g_sizes[j] = {
                        n: n.n,
                        o: o = d.o - d.i - n.i,// remains of order
                        w: d.o,// copy of ord count to check it on save
                        i: n.i// in stock count of this preliminary document
                    }
                    total_ord += o
                    total_ins += n.i
                }
                m.total_ord = total_ord
                m.total_ins = total_ins
            }
            ret.data = t
            return res.json(ret)
        }
    }

    function getStoreDocs(insn, init){
    var find = { }

        !init && (find.id = { $gt: 0 })// no metadoc

        return db.getCollection(insn).find(find,{ sort: { id: -1 }}).toArray(mkDocs)
    }

    function mkDocs(err, docs){
    var g_sizes, i, j, m, n, d, s, total
        if(err) return next(err)

        for(i = 0; i < docs.length; ++i){
            d = docs[i]
            if(0 === d.id){// must be last item (sort)
                delete d.docs
                ret.metaData = d
                docs.splice(-1, 1)// skip from output
                break
            }
            total = 0
            g_sizes = { }// group all items' g_sizes in one row
            for(j = 0; j < d.data.length; ++j){//items
                m = d.data[j]
                for(n = 0; n < m.g_sizes.length; ++n){
                    s = m.g_sizes[n]
                    g_sizes[s.n] = g_sizes[s.n] ? g_sizes[s.n] + s.i : s.i
                }
            }
            m = [ ]
            for(n in g_sizes){// make g_sizes array
            // [{"n":"43","i":1},{"n":"44","i":1},{"n":"45","i":1},{"n":"46","i":1}]
                m.push({ n: n, i: g_sizes[n]})
                total += g_sizes[n]
            }
            delete d.data
            d.g_sizes = m
            d.total_ins = total
            d.total_itms = j
        }
        ret.data = docs
        return res.json(ret)
    }

    /* Order CRU[D] */

    function orderItemsAdd(season){
    var data, update, hid, total_ord

        data = db.getCollection(season)
        update = db.getCollection('h' + season)

        return data.findAndModify(
            { id: 0, busy: false },// find busy edit flag
            [ ],// sort
            { $set: { busy: true, edit_by: req.session.user.name }},// update flag
            { fields: { _id: 1, total_ord: 1 }},// options

        function try_start_transaction(err, free){
            if(err) return next(err)
            if(!free) return next('!transs: ' + data.collectionName)

            total_ord = free.total_ord
            // under transaction do:
            return update.insert({// add history
                _id: hid = db.ObjectId(),
                d: new Date,
                a: '=',// update/edit
                c: 'ord',// comment
                s: '-',// status
                byu: req.session.user.name,
                byr: req.session.can.__name,
                data: req.json
            }, count_models)// insert_models, finish_insert
            // try to finish transaction anyways, history will show fail
        })

        function count_models(err, history){
            if(err) return end_transaction(err)
            if(!history) return end_transaction('!hsts')
            // beleive UI about `g_sizes` and other values (but no `id`)
            // save 'add' Date as is without conversion from JSON string
            // because it is not updated or heavily used later
            return data.count(insert_models)
        }

        function insert_models(err, count){
            if(err) return end_transaction(err)
            if(!count) return end_transaction('!cnt')

            for(var i = 0, d = req.json; i < d.length; ++i){
                d[i].id = count++// assign `idProperty`
            }
            return data.insert(d, finish_insert)
        }

        function finish_insert(err, models){
            if(err) return end_transaction(err)

            if(!models || !models.length) return end_transaction('!data')

            ret.data = models

            return data.aggregate(
                { $match: {  id: { $ne: 0 }}},
                { $group: { _id: "", total: { $sum: "$total_ord" }}},
        function check_total_ord(err, sum){
        var t, $set

            if(err || !sum[0]) return end_transaction(err || '~total_ord=0')

            $set = {
                busy: false,
                edit: new Date,
                edit_by: req.session.user.name + ':' + req.session.can.__name
            }

            if(total_ord != (t = sum[0].total)){
                $set.total_ord = t
            }

            return data.findAndModify(
                { id: 0, busy: true },
                [ ],
                { $set: $set },//busy, total_ord
                { fields: { _id: 1 }},
                end_transaction
            )
        }
            )
        }

        function end_transaction(err){
            if(err){// fatal DB error, try to finish transaction
                ret.success = false
                ret.data = err
        // even if this is going to be called twice (one in `finish_insert()`)
        // it is OK: this one will make just another try
                return data.findAndModify(
                    { id: 0, busy: true },
                    [ ],
                    { $set: { busy: false }},
                    { fields: { _id: 1 }},
                    on_end_history
                )
            }

            return update.findAndModify(
                { _id: hid },
                [ ],
                { $set: { s: '+' }},
                { fields: { _id: 1 }},
                on_end_history
            )
        }

        function on_end_history(err, h){
            if(err) return next(err)
            if(!h) return next('!hste: ' + data.collectionName)

            return res.json(ret)
        }
    }

    function orderItemsEdit(season){
    var i, model, f, update, hid, total_ord
       ,data = req.json
       ,find_arr = new Array(data.length)
       ,update_arr = new Array(data.length)

        for(i = 0; i < data.length; ++i){
            model = data[i]
            if(!model.id) return next('~id: ' + i)
//TODO: add collision check (concurrent data rewrite by multiple users into one model)
//      check and update `edit` field
//      if `edit` has changed, collect changes and show to UI if requested
//      for collision/conflict resolution
//      allow overwrite (for some roles)
            update = { $set: { }}
            for(f in model) if(// skip protected fields
                '_id' != f && 'id' != f && 'add' != f && 'add_by' != f &&
                'edit' != f && 'edit_by' != f && 'json' != f)
            {
                update.$set[f] = model[f]
            }
            update.$set.edit    = new Date
            update.$set.edit_by = req.session.user.name

            find_arr [i] = { id: model.id }// `idProperty`
            //see TODO  if(model.edit) ??? hid.edit = new Date,
            //see TODO  check local.url.query.edit ask for saving
            update_arr[i] = update
        }

        data = db.getCollection(season)
        update = db.getCollection('h' + season)

        return data.findAndModify(
            { id: 0, busy: false },// find busy edit flag
            [/* sort */],
            { $set: { busy: true, edit_by: req.session.user.name }},// update flag
            { fields: { _id: 1, total_ord: 1 }},// options

        function try_start_transaction(err, free){
            if(err) return next(err)
            if(!free) return next('!transs: ' + data.collectionName)

            total_ord = free.total_ord
//TODO: add collision check (concurrent data rewrite by multiple users into one model)
//      check `edit` field, see above

            return update.insert({// add history
                _id: hid = db.ObjectId(),
                d: new Date,
                a: '=',// update/edit
                c: 'ord',
                s: '-',// status
                byu: req.session.user.name,
                byr: req.session.can.__name,
                data: req.json
            }, update_models)// get_models, finish_update
        })

        function update_models(err, history){
        var j, updated, done

            if(err) return end_transaction(err)
            if(!history) return end_transaction('!hsts')

            updated = 0
            done = find_arr.length
            for(j = 0; j < find_arr.length; ++j){
                data.update(find_arr[j], update_arr[j],
                function on_update_cb(err, n){
                    if(err) return done ? (done = 0, get_models(err)) : undefined

                    updated += n
                    if(done && 0 >= --done){// if no error above and all is done,
                        return get_models(null, updated)// end of parallel update
                    }
                    return undefined
                }
                )
            }
            return undefined
        }

        function get_models(err){
            if(err) return end_transaction(err)

            return data.find({ $or: find_arr }).toArray(finish_update)
        }

        function finish_update(err, models){
            if(err) return end_transaction(err)

            if(!models || !models.length) return end_transaction('!data')

            ret.data = models

            return data.aggregate(
                { $match: {  id: { $ne: 0 }}},
                { $group: { _id: "", total: { $sum: "$total_ord" }}},
        function check_total_ord(err, sum){
        var t, $set

            if(err || !sum[0]) return end_transaction(err || '~total_ord=0')

            $set = {
                busy: false,
                edit: new Date,
                edit_by: req.session.user.name + ':' + req.session.can.__name
            }

            if(total_ord != (t = sum[0].total)){
                $set.total_ord = t
            }

            return data.findAndModify(
                { id: 0, busy: true },
                [ ],
                { $set: $set },//busy, total_ord
                { fields: { _id: 1 }},
                end_transaction
            )
        }
            )
        }

        function end_transaction(err){
            if(err){// fatal DB error, try to finish transaction
                ret.success = false
                ret.data = err
        // even if this is going to be called twice (one in `finish_update()`)
        // it is OK: this one will make just another try
                return data.findAndModify(
                    { id: 0, busy: true },
                    [ ],
                    { $set: { busy: false }},
                    { fields: { _id: 1 }},
                    on_end_history
                )
            }

            return update.findAndModify(
                { _id: hid },
                [ ],
                { $set: { s: '+' }},
                { fields: { _id: 1 }},
                on_end_history
            )
        }

        function on_end_history(err, h){
            if(err) return next(err)
            if(!h) return next('!hste: ' + data.collectionName)

            return res.json(ret)
        }
    }

    function getStoreItems(season, init){
    var q = local.url.query, opts = { /*limit: q.limit || 16, skip: q.skip || 0*/ }

console.log('q:', q)
        if(q.sort) try {//sort: '[{"property":"_id","direction":"ASC"}]'
            q.sort = JSON.parse(q.sort)
            opts.sort = { }
            for(var i, s = 0; s < q.sort.length; ++s){
                opts.sort[(i = q.sort[s]).property] = 'A' == i.direction[0] ? 1 : -1
            }
        } catch(ex){ }
console.log('s:', season)
        opts.fields = { _id: 0 }// no default `_id`s

        q = db.getCollection(season)

        return (init ? getItemsInit : getItems)()

        function getItemsInit(){
            return q.findOne({ id: 0 }, function(err, meta){
                if(err) return next(err)
                if(!meta) return next('!meta: ' + season)

                ret.metaData = meta
                return getItems(ret, res)
            })
        }

        function getItems(){
            return q.find({ id:{ $ne: 0 }}, opts).toArray(function(err, items){
                if(err) return next(err)
                ret.data = items
                return res.json(ret)
            })
        }
    }

    /* Order History */

    function orderHistItem(hn, id){
        return db.getCollection(hn).findOne({ _id: db.ObjectId(id) },
        function(err, item){
            if(err) return next(err)
            ret.data = item
            return res.json(ret)
        })
    }

    function orderHist(hn){
        return db.getCollection(hn).find(null).toArray(function(err, hist){
            if(err) return next(err)

            for(var i = 0; i < hist.length; ++i){
                hist[i].data = JSON.stringify(hist[i].data)
            }
            ret.data = hist
            return res.json(ret)
        })
    }

    /* Order Statistics */

    function orderStatUpdate(){
    var i, s, coll, season, opts
    /* Make one insert or one update of a season meta information
     *  json: [ { add: '2014-07-31T00:00:00',
        add_by: 'default login',
        edit: null,
        edit_by: '',
        name: 'Autumn-Winter 2015/2016',
        '#': 31,
        total_plan: 0,
        total_done: 0,
        total_ord: 0,
        total_ins: 0,
        eur: 0,
        dlr: 0,
        fem: 0,
        mal: 0 } ]
      */

        if(!Array.isArray(req.json)) return next('!arr_json')
        if(1 != req.json.length) return next('!arr_one')

        opts = { upsert: req.method !== 'PUT', 'new': true }
        coll = req.json[0]
        if(!coll || !(s = coll['#']) || s <= 0){
            return next('!coll#')
        }

        return db.collectionNames(function(err ,arr){
        var re

            if(err) return next(err)

            if(opts.upsert){// new season
                re = new RegExp('^' + local.cfg.db_name + '[.]n' + s + '$')
                for(i = 0; i < arr.length; ++i) if(re.test(arr[i].name)){
                    return next('~seasn_exists: ' + s)//app error
                }
                coll.add = coll.add ? new Date(coll.add) : null// revive Dates
                coll.id = 0// the first document in new collection for season
                coll.busy = false// busy edit flag
                coll.fields = db_data_orders.fields// initial grid setup
                coll.columns = db_data_orders.columns
                coll.idProperty = db_data_orders.idProperty || 'id',
                coll.total_ord = 0
                coll.total_ins = 0
            } else {// update season
                coll = { $set: { }}
                re = req.json[0]
                for(i in re){
                    coll.$set[i] = re[i]
                }
                coll.$set.edit = new Date
                coll.$set.edit_by = req.session.user.name + ':' + req.session.can.__name
            }

            season = db.getCollection('n' + s)
            i = db.getCollection('i' + s)// in_stock documents
            return opts.upsert ? new_season() : edit_season()
        })

        function new_season(){
            return i.ensureIndex({ id: 1 },{ unique: true }, function(err){
                if(err) return next(err)
            return i.insert({
                id: 0,
                add: new Date,
                fields: db_data_in_stock.fields,// initial grid setup
                columns: db_data_in_stock.columns,
                idProperty: db_data_in_stock.idProperty || 'id',
                docs: db_data_in_stock.docs,
                busy: false,
                '#': 0
            },
            function(err, in_stock){
                if(err) return next(err)
                if(!in_stock) return next('!insins')
            return season.ensureIndex({ id: 1 },{ unique: true }, function(err){
                if(err) return next(err)
            return season.ensureIndex({ id_mpcode: 1 },{ unique: true }, function(err){
                if(err) return next(err)
            return edit_season()
            })})})})
        }

        function edit_season(){
            return season.findAndModify(
                { id: 0 },
                [/*sort*/],
                coll, opts, write_history)
        }

        function write_history(err, doc){
            if(err) return next(err)
            if(!doc) return next('!updord')
        // if no collection will be created then work is impossible,
        // thus write history by one action with status '+'
            err = {
                d: new Date,
                a: opts.upsert ? '+' : '=',// insert/create or update/edit
                c: opts.upsert ? 'new season' : 'edit meta',
                s: '+',// status
                byu: req.session.user.name,
                byr: req.session.can.__name,
                data: doc
            }// history collection
            return db.getCollection('hn' + s).insert(err, function(err, hitem){
                if(err) return next(err)
                if(!hitem) return next('!hsts')

                ret.data = [ doc ]
                return res.json(ret)
            })
        }
    }

    function orderStat(){
        return db.collectionNames(
        function(err ,arr){
        var re, len, i, s, seasons

            if(err) return next(err)

            ret.data = seasons = [ ]
            re = local.cfg.db_name
            len = re.length + 1
            re = new RegExp('^' + re + '[.]n')
            for(i = 0; i < arr.length; ++i) if(re.test(s = arr[i].name)){
                seasons.push(s.slice(len))
            }

            len = seasons.length
            for(i = 0; i < seasons.length; ++i){
                db.collection(seasons[i]).findOne({ id: 0 },(function(i){
                // parallel execution, close `i` here
                return function(err, item){
                    if(err && len){
                        len = 0
                        return next(err)
                    }

                    seasons[i] = item

                    if(len && 0 >= --len){// if no error,
                        return res.json(ret)// end of parallel update
                    }
                    return undefined
                }})(i))
            }
            return len ? void 0 : res.json(ret)
        })// db.collectionNames
    }// orderStat
}

/*
 * general tools
 **/
function sortBy_id(a, b){
    return a.id > b.id ? 1 : -1
}
function sortBy_n(a, b){
    return a.n > b.n ? 1 : -1
}


/*
 * UI Model/Grid setup data from DB (copied by/from mongo edit)
 **/
var db_data_orders = {
fields: [
    "add"
  , "add_by"
  , "edit"
  , "edit_by"
  , "id"
  , "id_mpcode"
  , "pcode"
  , "total_qty"
  , "total_ord"
  , "total_ins"
  , "total_rmn"
  , "total_sld"
  , "id_mfg"
  , "id_in"
  , "gend"
  , "prodname"
  , "ps_ord"
  , "ps_ord"
  , "ps_orddisc"
  , "ps_ret"
  , "g_color"
  , "g_material"
  , "g_sizes_set"
  , "g_matpk"
  , "g_matst"
  , "g_matpd"
  , "g_heel"
  , "g_cntr"
  , "g_sizes"
  , "sert"
  , "sert_from"
  , "sert_to"
  , "json"
  ]
, idProperty: 'id'
, columns: [
    {
      dataIndex: "id"
    , text: "id"
    , width: 28
    }
  , {
      dataIndex: "add"
    , text: "add"
    , format: "Y/m/d H:i:s l"
    , xtype: "datecolumn"
    , width: 187
    , tdCls: "so-clmn-add"
    , hidden: true
    }
  , {
      dataIndex: "id_mpcode"
    , text: "foto"
    , width: 167
    , xtype: "so_gridColumnFoto"
    }
  , {
      dataIndex: "id_mpcode"
    , text: "id_mpcode"
    , width: 167
    , xtype: "so_gridColumnSKU"
    }
  , {
      dataIndex: "id_in"
    , text: "id_in"
    , hidden: true
    , width: 28
    }
  , {
      dataIndex: "id_mfg"
    , text: "id_mfg"
    , xtype: "so_gridColumnTM"
    , width: 64
    }
  , {
      dataIndex: "g_sizes"
    , text: "g_sizes"
    , soShow: "o"
    , xtype: "so_gridColumnSizes"
    }
  , {
      dataIndex: "total_ord"
    , text: "total_ord"
    , soShow: "o"
    , xtype: "so_gridColumnSizesSum"
    , width: 44
    }
  , {
      dataIndex: "pcode"
    , text: "pcode"
    , xtype: "so_gridColumnFilter"
    }
  , {
      dataIndex: "ps_ret"
    , text: "ps_ret"
    , width: 100
    , xtype: "so_gridColumnCurrency"
    , editor: "textfield"
    }
  , {
      dataIndex: "gend"
    , text: "gend"
    , width: 44
    , editor: "textfield"
    }
  , {
      dataIndex: "prodname"
    , text: "prodname"
    , xtype: "so_gridColumnFilter"
    , editor: "textfield"
    }
  , {
      dataIndex: "ps_ord"
    , text: "ps_ord"
    }
  , {
      dataIndex: "ps_orddisc"
    , text: "ps_orddisc"
    , hidden: true
    }
  , {
      dataIndex: "g_color"
    , text: "g_color"
    , editor: "textfield"
    , xtype: "so_gridColumnSFilter"
    }
  , {
      dataIndex: "g_material"
    , text: "g_material"
    , xtype: "so_gridColumnSFilter"
    , editor: "textfield"
    }
  , {
      dataIndex: "g_matpk"
    , text: "g_matpk"
    , xtype: "so_gridColumnSFilter"
    , editor: "textfield"
    }
  , {
      dataIndex: "g_matst"
    , text: "g_matst"
    , editor: "textfield"
    }
  , {
      dataIndex: "g_matpd"
    , text: "g_matpd"
    , editor: "textfield"
    }
  , {
      dataIndex: "g_heel"
    , text: "g_heel"
    , editor: "textfield"
    }
  , {
      dataIndex: "g_cntr"
    , text: "g_cntr"
    , editor: "textfield"
    }
  , {
      dataIndex: "g_sizes_set"
    , text: "g_sizes_set"
    }
  , {
      dataIndex: "add_by"
    , text: "add_by"
    , hidden: true
    }
  , {
      dataIndex: "edit"
    , text: "edit"
    , hidden: true
    }
  , {
      dataIndex: "edit_by"
    , text: "edit_by"
    , hidden: true
    }
  , {
      dataIndex: "sert"
    , text: "sert"
    , hidden: true
    , editor: "textfield"
    }
  , {
      dataIndex: "sert_to"
    , text: "sert_to"
    , format: "Y/m/d H:i:s l"
    , xtype: "datecolumn"
    , width: 187
    , tdCls: "so-clmn-add"
    , hidden: true
    }
  , {
      dataIndex: "sert_from"
    , text: "sert_from"
    , format: "Y/m/d H:i:s l"
    , xtype: "datecolumn"
    , width: 187
    , tdCls: "so-clmn-add"
    , hidden: true
    }
  ]
/*doc = {
  "_id": new ObjectID("53f8f6a933fa3b0000144459")
, add: new Date("Sat Aug 23 2014 00:00:00 GMT+0300 (Калининградское время (зима))")
, "add_by": "default login"
, edit: new Date("Tue Aug 26 2014 17:19:14 GMT+0300 (Калининградское время (зима))")
, busy: false
, "edit_by": "default login"
, name: "Осень-зима 2011/2012"
, "#": 5
, "total_plan": 54321
, "total_done": 0
, "total_ord": 570
, "total_ins": 0
, eur: 0
, dlr: 0
, fem: 0
, mal: 0
, id: 0
, fields: [
    "add"
  , "add_by"
  , "edit"
  , "edit_by"
  , "id"
  , "id_mpcode"
  , "pcode"
  , "total_qty"
  , "total_ord"
  , "total_ins"
  , "total_qty"
  , "total_rmn"
  , "total_sld"
  , "id_mfg"
  , "id_in"
  , "gend"
  , "prodname"
  , "ps_ord"
  , "ps_ord"
  , "ps_orddisc"
  , "ps_ret"
  , "g_color"
  , "g_material"
  , "g_sizes_set"
  , "g_matpk"
  , "g_matst"
  , "g_matpd"
  , "g_heel"
  , "g_cntr"
  , "g_sizes"
  , "sert"
  , "sert_from"
  , "sert_to"
  , "json"
  ]
, columns: [
    {
      dataIndex: "id"
    , text: "id"
    , width: 28
    }
  , {
      dataIndex: "add"
    , text: "add"
    , format: "Y/m/d H:i:s l"
    , xtype: "datecolumn"
    , width: 187
    , tdCls: "so-clmn-add"
    , hidden: true
    }
  , {
      dataIndex: "id_mpcode"
    , text: "foto"
    , width: 167
    , xtype: "so_gridColumnFoto"
    }
  , {
      dataIndex: "id_mpcode"
    , text: "id_mpcode"
    , width: 167
    , xtype: "so_gridColumnSKU"
    }
  , {
      dataIndex: "id_in"
    , text: "id_in"
    , hidden: true
    , width: 28
    }
  , {
      dataIndex: "id_mfg"
    , text: "id_mfg"
    , xtype: "so_gridColumnTM"
    , width: 64
    }
  , {
      dataIndex: "g_sizes"
    , text: "g_sizes"
    , soShow: "o"
    , xtype: "so_gridColumnSizes"
    }
  , {
      dataIndex: "total_ord"
    , text: "total_ord"
    , soShow: "o"
    , xtype: "so_gridColumnSizesSum"
    , width: 44
    }
  , {
      dataIndex: "pcode"
    , text: "pcode"
    , xtype: "so_gridColumnFilter"
    }
  , {
      dataIndex: "ps_ret"
    , text: "ps_ret"
    , width: 100
    , xtype: "so_gridColumnCurrency"
    , editor: "textfield"
    }
  , {
      dataIndex: "gend"
    , text: "gend"
    , width: 44
    , editor: "textfield"
    }
  , {
      dataIndex: "prodname"
    , text: "prodname"
    , xtype: "so_gridColumnFilter"
    , editor: "textfield"
    }
  , {
      dataIndex: "ps_ord"
    , text: "ps_ord"
    }
  , {
      dataIndex: "ps_orddisc"
    , text: "ps_orddisc"
    , hidden: true
    }
  , {
      dataIndex: "g_color"
    , text: "g_color"
    , editor: "textfield"
    , xtype: "so_gridColumnSFilter"
    }
  , {
      dataIndex: "g_material"
    , text: "g_material"
    , xtype: "so_gridColumnSFilter"
    , editor: "textfield"
    }
  , {
      dataIndex: "g_matpk"
    , text: "g_matpk"
    , xtype: "so_gridColumnSFilter"
    , editor: "textfield"
    }
  , {
      dataIndex: "g_matst"
    , text: "g_matst"
    , editor: "textfield"
    }
  , {
      dataIndex: "g_matpd"
    , text: "g_matpd"
    , editor: "textfield"
    }
  , {
      dataIndex: "g_heel"
    , text: "g_heel"
    , editor: "textfield"
    }
  , {
      dataIndex: "g_cntr"
    , text: "g_cntr"
    , editor: "textfield"
    }
  , {
      dataIndex: "g_sizes_set"
    , text: "g_sizes_set"
    }
  , {
      dataIndex: "add_by"
    , text: "add_by"
    , hidden: true
    }
  , {
      dataIndex: "edit"
    , text: "edit"
    , hidden: true
    }
  , {
      dataIndex: "sert"
    , text: "sert"
    , hidden: true
    , editor: "textfield"
    }
  , {
      dataIndex: "sert_to"
    , text: "sert_to"
    , format: "Y/m/d H:i:s l"
    , xtype: "datecolumn"
    , width: 187
    , tdCls: "so-clmn-add"
    , hidden: true
    }
  , {
      dataIndex: "sert_from"
    , text: "sert_from"
    , format: "Y/m/d H:i:s l"
    , xtype: "datecolumn"
    , width: 187
    , tdCls: "so-clmn-add"
    , hidden: true
    }
  ]
};*/
}

var db_data_in_stock = {
docs: {
    fields: [
      "add"
    , "add_by"
    , "edit"
    , "edit_by"
    , "id"
    , "id_mpcode"
    , "prodname"
    , "g_sizes"
    , "total_ord"
    , "total_ins"
    , "sert"
    , "sert_from"
    , "sert_to"
    ]
  , idProperty: 'id_mpcode'
  , columns: [
      {
        dataIndex: "id"
      , text: "id"
      , width: 28
      }
    , {
        dataIndex: "add"
      , text: "add"
      , format: "Y/m/d H:i:s l"
      , xtype: "datecolumn"
      , width: 187
      , tdCls: "so-clmn-add"
      , hidden: true
      }
    , {
        dataIndex: "id_mpcode"
      , text: "id_mpcode"
      , width: 167
      , xtype: "so_gridColumnSKU"
      }
    , {
        dataIndex: "g_sizes"
      , text: "g_sizes_i"
      , soShow: "i"
      , xtype: "so_gridColumnSizes"
      }
    , {
        dataIndex: "total_ins"
      , text: "total_ins"
      , soShow: "i"
      , xtype: "so_gridColumnSizesSum"
      , width: 44
      }
    , {
        dataIndex: "prodname"
      , text: "prodname"
      , xtype: "so_gridColumnFilter"
      , editor: "textfield"
      }
    , {
        dataIndex: "sert"
      , text: "sert"
      , hidden: true
      , editor: "textfield"
      }
    , {
        dataIndex: "sert_to"
      , text: "sert_to"
      , format: "Y/m/d H:i:s l"
      , xtype: "datecolumn"
      , width: 187
      , tdCls: "so-clmn-add"
      , hidden: true
      }
    , {
        dataIndex: "sert_from"
      , text: "sert_from"
      , format: "Y/m/d H:i:s l"
      , xtype: "datecolumn"
      , width: 187
      , tdCls: "so-clmn-add"
      , hidden: true
      }
    , {
        dataIndex: "add_by"
      , text: "add_by"
      , hidden: true
      }
    , {
        dataIndex: "edit"
      , text: "edit"
      , format: "Y/m/d H:i:s l"
      , xtype: "datecolumn"
      , hidden: true
      }
    , {
        dataIndex: "edit_by"
      , text: "edit_by"
      , hidden: true
      }
    ]
  }
, fields: [
    "add"
  , "add_by"
  , "edit"
  , "edit_by"
  , "id"
  , "cmnt"
  , "g_sizes"
  , "total_ins"
  , "total_itms"
  ]
, idProperty: 'id'
, columns: [
    {
      dataIndex: "id"
    , text: "id"
    , width: 28
    }
  , {
      dataIndex: "add"
    , text: "add"
    , format: "Y/m/d H:i:s l"
    , xtype: "datecolumn"
    , width: 187
    , tdCls: "so-clmn-add"
    , hidden: true
    }
  , {
      dataIndex: "g_sizes"
    , text: "g_sizes_di"
    , soShow: "di"
    , xtype: "so_gridColumnSizes"
    }
  , {
      dataIndex: "total_ins"
    , text: "total_insd"
    , soShow: "di"
    , xtype: "so_gridColumnSizesSum"
    , width: 44
    }
  , {
      dataIndex: "total_itms"
    , soShow: "m"
    , xtype: "so_gridColumnSizesSum"
    , text: "total_itms"
    , width: 55
    }
  , {
      dataIndex: "cmnt"
    , text: "comment"
    , xtype: "so_gridColumnSKU"
    , editor: "textfield"
    , flex: 1
    }
  , {
      dataIndex: "add_by"
    , text: "add_by"
    , hidden: true
    }
  , {
      dataIndex: "edit"
    , text: "edit"
    , format: "Y/m/d H:i:s l"
    , xtype: "datecolumn"
    , hidden: true
    }
  , {
      dataIndex: "edit_by"
    , text: "edit_by"
    , hidden: true
    }
  ]

/*doc = {
  "_id": new ObjectID("53f8f6a933fa3b000014445a")
, add: new Date("Sat Aug 23 2014 23:16:41 GMT+0300 (Калининградское время (зима))")
, docs: {
    fields: [
      "add"
    , "add_by"
    , "edit"
    , "edit_by"
    , "id"
    , "id_mpcode"
    , "prodname"
    , "g_sizes"
    , "total_ord"
    , "total_ins"
    , "sert"
    , "sert_from"
    , "sert_to"
    ]
  , columns: [
      {
        dataIndex: "id"
      , text: "id"
      , width: 28
      }
    , {
        dataIndex: "add"
      , text: "add"
      , format: "Y/m/d H:i:s l"
      , xtype: "datecolumn"
      , width: 187
      , tdCls: "so-clmn-add"
      , hidden: true
      }
    , {
        dataIndex: "id_mpcode"
      , text: "id_mpcode"
      , width: 167
      , xtype: "so_gridColumnSKU"
      }
    , {
        dataIndex: "g_sizes"
      , text: "g_sizes_i"
      , soShow: "i"
      , xtype: "so_gridColumnSizes"
      }
    , {
        dataIndex: "total_ins"
      , text: "total_ins"
      , soShow: "i"
      , xtype: "so_gridColumnSizesSum"
      , width: 44
      }
    , {
        dataIndex: "prodname"
      , text: "prodname"
      , xtype: "so_gridColumnFilter"
      , editor: "textfield"
      }
    , {
        dataIndex: "sert"
      , text: "sert"
      , hidden: true
      , editor: "textfield"
      }
    , {
        dataIndex: "sert_to"
      , text: "sert_to"
      , format: "Y/m/d H:i:s l"
      , xtype: "datecolumn"
      , width: 187
      , tdCls: "so-clmn-add"
      , hidden: true
      }
    , {
        dataIndex: "sert_from"
      , text: "sert_from"
      , format: "Y/m/d H:i:s l"
      , xtype: "datecolumn"
      , width: 187
      , tdCls: "so-clmn-add"
      , hidden: true
      }
    , {
        dataIndex: "add_by"
      , text: "add_by"
      , hidden: true
      }
    , {
        dataIndex: "edit"
      , text: "edit"
      , format: "Y/m/d H:i:s l"
      , xtype: "datecolumn"
      , hidden: true
      }
    , {
        dataIndex: "edit_by"
      , text: "edit_by"
      , hidden: true
      }
    ]
  }
, fields: [
    "add"
  , "add_by"
  , "edit"
  , "edit_by"
  , "id"
  , "cmnt"
  , "g_sizes"
  , "total_ins"
  , "total_itms"
  ]
, columns: [
    {
      dataIndex: "id"
    , text: "id"
    , width: 28
    }
  , {
      dataIndex: "add"
    , text: "add"
    , format: "Y/m/d H:i:s l"
    , xtype: "datecolumn"
    , width: 187
    , tdCls: "so-clmn-add"
    , hidden: true
    }
  , {
      dataIndex: "g_sizes"
    , text: "g_sizes_di"
    , soShow: "di"
    , xtype: "so_gridColumnSizes"
    }
  , {
      dataIndex: "total_ins"
    , text: "total_insd"
    , soShow: "di"
    , xtype: "so_gridColumnSizesSum"
    , width: 44
    }
  , {
      dataIndex: "total_itms"
    , soShow: "m"
    , xtype: "so_gridColumnSizesSum"
    , text: "total_itms"
    , width: 55
    }
  , {
      dataIndex: "cmnt"
    , text: "comment"
    , xtype: "so_gridColumnSKU"
    , editor: "textfield"
    , flex: 1
    }
  , {
      dataIndex: "add_by"
    , text: "add_by"
    , hidden: true
    }
  , {
      dataIndex: "edit"
    , text: "edit"
    , format: "Y/m/d H:i:s l"
    , xtype: "datecolumn"
    , hidden: true
    }
  , {
      dataIndex: "edit_by"
    , text: "edit_by"
    , hidden: true
    }
  ]
, "#": 4
, id: 0
};*/
}

seasonsBusinessLogic(ret, api, local, req, res, next)
return true// async always

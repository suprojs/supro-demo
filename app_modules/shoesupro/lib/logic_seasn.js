/*
 * Season API
 *
 * developing/testing reload:
 * App.backend.req('/shoesupro/lib/logic/devel', function(err, json){ console.log(json)})
 **/

seasonsBusinessLogic(ret, api, local, req, res, next)
return true// async always

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

        if(!(Array.isArray(req.json) && (req.json).length)){
            return next('!arr_json')
        }
        // no delete here: POST && PUT
        return (req.method == 'PUT' ? orderItemsEdit : orderItemsAdd)(m[1])
    }

    /** I N   S T O C K **/

    /* ref: '/shoesupro/lib/logic/seasn/i5_3': m[1] = 'i5', m[2] = '_3' */
    if((m = p.match(/^(i\d+)(_\d+)?/))){// in stock documents collection
console.log('req.json:', req.json)

        if('PUT' == req.method && m[2]){//                   strip '_'
                return insDocAndItemsEdit(m[1], parseInt(m[2].slice(1), 10))
        }// no other PUTs

        p = ~p.indexOf('+init')
        if('POST' == req.method && !m[2]){// new doc `App.backend.req()` by hand
            if(p){// save preliminary models, configure grid && store
                return insDocNew(m[1])
            }// no POSTs without '+init'
        }// no POSTs with doc: cannot add models (yet)

        if('G' == req.method[0]){//GET doc id
             if(!m[2]){// list in stock documents of the season
                 return getStoreDocs(m[1], p)
             }
             //                                  strip '_'
             return insDocGet(m[1], parseInt(m[2].slice(1), 10), p)
        }
    }

    setImmediate(no_such_subapi)
    return undefined

    function no_such_subapi(){
        res.json(ret.success = !(ret.data = '!such_subapi: ' + local.url.pathname), ret)
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
*/

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
        })
        })
        })
        })
        })
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
            //update: {$set: { 'json.ins': true} }
            //return res.json(ret.data = models, ret)
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

            return res.json(ret.data = t, ret)
        }
    }

    function getStoreDocs(insn, init){
    var find = { }

        !init && (find.id = { $gt: 0 })// no metadoc

        return db.getCollection(insn).find(find, { sort: { id: -1 }}).toArray(mkDocs)
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
        return res.json(ret.data = docs, ret)
    }
    
// deleted....

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

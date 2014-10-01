(
function ShoeSupro(override){
var id = 'App.shoesupro.controller.Shoes'
   ,cfg = {
    extend: Ext.app.Controller,
    __name: id,
    views:[
        'App.shoesupro.view.Shoes'
    ],
    shoes: null,// dev tools: App.getApplication().getController('App.shoesupro.controller.Shoes').shoes
    tabs: null,
    init:
    function controllerShoesInit(){
    var me = this
       ,shoes = new App.shoesupro.view.Shoes
       ,navtree = shoes.down('panel[itemId=navtree]')
       ,tabs = shoes.down('so_tabs')

        me.shoes = shoes
        me.tabs = tabs

        tabs.updateFirstTab(Ext.widget({ xtype: 'so_allObjectStat'/*'so_panelDocs'*/ }))//!!!dev

        //shoes.down('so_gridOrderStat button[action=create_season]').fireEvent('click')//!!!dev of the form

        /*Ext.util.Observable.capture(tabs, function(){
            console.log(arguments)
        });*/

        /* static binding */
        navtree.on({
            selectionchange: loadNav
        })

        // init view
        shoes.on({
            destroy: destroyShoes
        })

        shoes.maximize()
        return

        function loadNav(selModel, selected){
        var v = selected[0], id, cmp = { xtype: 'so_panelDocs' }

            if(!v) return

            id = v.data.id
            console.log(id)

            switch(id){
                case 'ord':
                case 'inc':
                    cmp.xtype = 'so_allOrderStat'
                    break
                case 'rem':
                case 'sel':
                    cmp.xtype = 'so_allObjectStat'
                    break
            }

            if('i31' === id){//!!!dev hack #31 in_stock only
                tabs.add({
                    closable: true,
                    title: l10n.so.no + '31' + l10n.so.in_stock_title,
                    orderId: 31,
                    itemId: id += '_' + (new Date).valueOf(),// also is `storeId`
                    xtype: 'so_gridInStockList'
                })
                tabs.setActiveTab(id)

                return
            }

            if(cmp.xtype != tabs.items.getAt(0).items.getAt(0).xtype){
                tabs.updateFirstTab(Ext.widget(cmp))
                console.log('update')
            } else {
                tabs.setActiveTab(0)
            }
        }

        function destroyShoes(){
            me.shoes = me.tabs = null
            me.application.eventbus.unlisten(me.id)
            me.application.controllers.removeAtKey(me.id)
        }
    }
}
if(override) cfg.override = id
Ext.define(id, cfg)
})(App.shoesupro.controller.Shoes);


(
function OrderStat(override){
var id = 'App.shoesupro.controller.GridOrderStat'
   ,cfg = {
    extend: App.controller.Base,
    __name: id,
    //grid: null,// ref to view
    init:
    function anticontrollerOrderStatInit(){
    var me = this
       ,grid = Ext.ComponentQuery.query('so_gridOrderStat')[0]// it is the only one
       ,so_orders = grid.store
       ,btn_edit, btn_openord, btn_openins, btn_hist

        btn_edit = grid.down('button[action=edit_season]')
        btn_hist = grid.down('button[iconCls=doc-history]')
        btn_openord = grid.down('button[action=so_gridOrderItems]')
        btn_openins = grid.down('button[action=so_gridInStockList]')//gridInStockItems

        btn_edit.disable(), btn_openord.disable()
        btn_hist.disable(), btn_openins.disable()

        btn_edit.on({ click: editSeason })
        //btn_hist.on({ click: viewHistory })
        btn_openord.on({ click: openSeason })
        btn_openins.on({ click: openSeason })

        /* dynamic binding */

        me.control({
            'so_gridOrderStat button[action=create_season]':{
				click: create_editSeason
            },

            'so_formOrderAdd image#cold':{
                click: select_season
            },
            'so_formOrderAdd image#hot':{
                click: select_season
            },

            'so_gridOrderStat':{
                select: toolsEnable,
                itemdblclick: openSeason,
				destroy: destroyGridOrderStat
            }
        })

        /*Ext.util.Observable.capture(tabs, function(){
            console.log(arguments)
        })*/

        so_orders.reload({ action: 'read', start: 0 })

        /*setTimeout(function select_focus_copy_paste(){
            grid.getView().getSelectionModel().select(0)//!!!dev
            btn_open.fireEvent('click')//!!!dev of the items grid
        }, 512)*/

        return

        function toolsEnable(){
            btn_edit.disabled && btn_edit.enable(), btn_openord.enable(),
                                 btn_hist.enable(), btn_openins.enable()
        }

        function create_editSeason(edit, ev){
        var model
           ,win = new App.shoesupro.view.WinOrder
           ,formData = win.down('form').getForm()
           ,finish_btn = win.down('button#create')

            if(ev){// button event -- new
                model = new so_orders.model({
                    '#': 31,
                    add: new Date,// NOTE: Form clears the time in Date if format w/o time
                    add_by: App.User.data.name
                })
            } else {// edit
                finish_btn.setText(l10n.btnEdit)
                model = edit
            }
            formData.loadRecord(model)// load data

            finish_btn.on({
                click: function(btn){
                    formData.updateRecord(model)// update form values into model
                    if(!model.dirty){
                        return Ext.Msg.show({ buttons: Ext.Msg.OK, icon: Ext.Msg.ERROR,
                            title: l10n.formNoChange,
                            msg: '<b>' + l10n.formNoChangeMsg + '</b>'
                        })
                    }
                    // update store with new or edited model
                    if((model.phantom = (btn.text != l10n.btnEdit))){
                        so_orders.add([ model ])
                    } else {
                        model.callStore('afterEdit')
                    }

                    return so_orders.sync({
                        success: function(){
                            win.close()
                        },
                        failure: function(){
                        // store must show error message `handleStoreException`
                            so_orders.rejectChanges()
                        }
                    })
                }
            })
            win.show()
        }

        function select_season(season){
        var name
           ,form = season.up('form')
           ,year = form.down('#year').getValue()

            if('hot' == season.itemId){
                name = l10n.so.hot_season + year
                form.down('#cold').el.removeCls('selected')
            } else {
                name = l10n.so.cold_season + year + '/' + ++year
                form.down('#hot').el.removeCls('selected')
            }
            season.el.addCls('selected')
            form.getForm().setValues({ name: name }).updateRecord()
        }

        function editSeason(){
        var item = grid.getView().getSelectionModel().getSelection()[0]

            item && create_editSeason(item)
            console.log('editSeason')
        }

        function openSeason(btn){
        var tabs = grid.up('tabpanel')
           ,item = grid.view.selModel.getSelection()[0]
           ,n = item && item.data['#']

            if(!n) return
            //if(!tabs.items.getByKey(n))// append or add tabs
            tabs.add({
                xtype: btn.action ? btn.action : 'so_gridOrderItems',
                orderId: n,
                title: l10n.so.no + n + ' ' + item.data.name,
                itemId: n += '_' + (new Date).valueOf(),//= storeId
                closable: true
            })

            tabs.setActiveTab(n)
        }

        function destroyGridOrderStat(){
            App.User.can['App.view.Window->tools.refresh'] && (
                App.backend.req('/shoesupro/lib/logic/devel')// reload backend api
            )

            me.application.eventbus.unlisten(me.id)
            me.application.controllers.removeAtKey(me.id)
        }
    }
}
if(override) cfg.override = id
Ext.define(id, cfg)
})(App.shoesupro.controller.GridOrderStat);

/*
 * General logic
 **/

App.shoesupro
   .parseOrderItemsToStore = function parseOrderItemsToStore(store, oid, data){
 /*
  * parse tab-separated lines from clipboard
  *
  titles...\t  titles   \t ....
[   1      2     3 ... n + 1                         empty column   other columns     ]
id_mfg	pcode	35	36	37	38	39	40	41	42						total_qty	gend...
TAMARIS	1-22449-001	5	12	23	29	28	21	10	4						132	жен
...
  */
var i, j, c, t, line, item, larr, total
   ,id_in
   ,pcode_check = { }, clmns = { }, g_sizes
   ,user = App.User.data.name, at = new Date

    data = data.replace(/\r/g, '').split('\n')
    if(!store || !data.length || !data[1] || !data[2]){
        Ext.Msg.show({
            title: l10n.so.import_data_title,
            buttons: Ext.Msg.OK,
            icon: Ext.Msg.ERROR,
            msg: l10n.so.no_data
        })
        return
    }

    if(!~data[1].indexOf('g_sizes\t')){// if g_sizes != '3,5=2;4=6;...' (copy/paste)
        t = true, g_sizes = { } // scan sizes
    }

    line = data[1].split('\t')// scan header IDs, skip sizes
    for(j = 0; j < line.length; ++j){
        c = line[j].trim()

        if(t && j >= 2){// sizes scan...
            if(!c){
                t = false// ... is over
                continue
            }
            if(g_sizes.hasOwnProperty(c)){
                Ext.Msg.show({
                    title: l10n.so.import_data_title,
                    buttons: Ext.Msg.OK,
                    icon: Ext.Msg.ERROR,
                    msg: Ext.String.format(l10n.so.dup_size_id, c, i, '?')
                })
                return
            }
            g_sizes[c] = j
            continue
        }
        if(!c) continue// skip empty cells (after sizes)
        if('id' == c) continue
        if(clmns.hasOwnProperty(c)){
            Ext.Msg.show({
                title: l10n.so.import_data_title,
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.ERROR,
                msg: l10n.so.dup_column_id + c
            })
            return
        }
        clmns[c] = j// idx of IDs
    }// indexes are ready
    data = data.slice(2)// w/o header

    if(clmns.g_sizes >= 0){// case of copy/paste
        for(c in g_sizes){
            clmns[c] = g_sizes[c]// '3,5=2;4=6;4,5=6;5=7;5,5=7;6=7;6,5=6;7=2;'
        }
        g_sizes = null
    }

    larr  = new Array(data.length)// all possible data rows
    id_in = parseInt(oid, 10)
    for(total = i = 0; i < data.length; ++i){
        line = data[i].split('\t')
        if(!line.length) continue// skip empty lines
        // rescan sizes if pcode column === 'pcode'
        if(g_sizes && 'pcode' == line[clmns.pcode]){
            g_sizes = { } // scan new
            for(j = 2; j < line.length; ++j){// 3-d column
                c = line[j].trim()
                if(!c) break// stop rescan

                if(g_sizes.hasOwnProperty(c)){
                    console.error(g_sizes)
                    Ext.Msg.show({
                        title: l10n.so.import_data_title,
                        buttons: Ext.Msg.OK,
                        icon: Ext.Msg.ERROR,
                        msg: Ext.String.format(l10n.so.dup_size_id, c, i, '?')
                    })
                    return
                }
                g_sizes[c] = j
            }
            continue
        }
        // skip no data: id_mfg     pcode (if not copy/paste)
        if(g_sizes && (!line[0] || !line[1] || '0' === line[1] || '0' === line[0])){
            continue
        }
        if(!line[0].trim()) continue// skip no data

        item = {
            //id: is an `idProperty` thus must be assigned in backend
            add: null,
            add_by: null,
            id_in: id_in
        }
        for(c in clmns){
            if('total_qty' == c){
                t = parseInt(line[clmns[c]], 10)
                t && (item[c] = t)

            } else if('ps' == c.slice(0, 2)){
                if((t = line[clmns[c]])){
                    item[c] = parseFloat(t.replace(',', '.'))
                }
            } else if('g_sizes' == c){
                // convert from '3,5=2;4=6;4,5=6;5=7;5,5=7;6=7;6,5=6;7=2;'
                t = line[clmns[c]]
                if(t && t.indexOf('=')){
                    t = t.replace(/([^=]+)=([^;]+)+;/g,
/*                                            {
n: s, // name
q: 0, // current qty (available for moves b/w objects), IN: q += i
i: 0, // in stock, IN: q += i
s: 0, // sold, changed by SELR ++s, --q, --r
r: 0, // remains SELR --r
w: 0, // items write flag / or original order count when in stock
o: num
*/
'{"q":0,"i":0,"s":0,"r":0,"w":0,"n":"$1","o":$2},'
                    )
                    try {
                        item[c] = JSON.parse('[' + t.slice(0, t.length - 1) + ']')
                    } catch(ex){ }
                }
            } else {
                item[c] = String(line[clmns[c]]).trim()
            }
        }
        item.add = at
        item.add_by = user

        if(pcode_check[item.pcode]){
            Ext.Msg.show({
                title: l10n.so.import_data_title,
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.ERROR,
                msg: Ext.String.format(l10n.so.dup_sku, item.pcode, i)
            })
        } else {
            pcode_check[item.pcode] = true
        }
        if(!item.id_mpcode){
            item.id_mpcode = item.pcode + '@' + item.id_mfg + '#' + oid// generate SKU
        }

        if(!item.g_sizes && g_sizes){// not from '3,5=2;4=6;4,5=6;5=7;5,5=7;6=7;6,5=6;7=2;'
            item.g_sizes = [ ]
            for(c in g_sizes){
                j = parseInt(line[g_sizes[c]], 10)
                if(j) item.g_sizes.push(
                {
                    n: c, // name
                    q: 0, // current qty (available for moves b/w objects), IN: q += i
                    i: 0, // in stock, IN: q += i
                    s: 0, // sold, changed by SELR ++s, --q, --r
                    r: 0, // remains SELR --r
                    w: 0, // items write flag / or original order count when in stock
                    o: j
                }
                )
            }
        }
        larr[total++] = new store.model(item)
//console.warn('item')
//console.warn(item)
//      break
    }
    // skip slow steps
    store.totalCount = total
    store.loadRecords(larr.slice(0, total), store.addRecordsOptions)
    // done
    Ext.Msg.show({
        title:  l10n.so.import_data_title,
        buttons: Ext.Msg.OK,
        icon: Ext.Msg.INFO,
        msg: l10n.so.total_paste + total
    })
}

/*function __add_sizes_$unused(me, data){
/* paste item's sizes info
 * 0|   pcode  |                     g_sizes                           |
   1| Artikel  |	35	36	37	38	39	40	41	42	43	44	45	46	47 |
   2| 05347-00 |	0	0	0	0	0	8	16	16	24	16	8	8	0  |
   3| 05347-00 |	0	0	0	0	0	6	6	9	6	6	3	0	0  |
   4| 05347-00 |	0	0	0	0	0	5	10	25	15	5	0	0	0  |
 * /
var i, j, s, line, item, num
var g_sizes = { }, pcode = { }

    data = data.replace(/\r/g, '').split('\n')
    if(!me.store || !data.length || !data[1] || !data[2]){
        return Ext.Msg.show({
            title: 'IMPORT DATA',
            buttons: Ext.Msg.OK,
            icon: Ext.Msg.ERROR,
            msg: 'NULL DATA'
        })
    }
    line = data[0].split('\t')
    if('pcode' != line[0]){
        return Ext.Msg.show({
            title: 'IMPORT DATA',
            buttons: Ext.Msg.OK,
            icon: Ext.Msg.ERROR,
            msg: 'NO COLUMN NAMES'
        })
    }
    line = data[0].split('\t')// sizes
    for(j = 1; j < line.length; ++j){
        s = String(line[j]).trim()
        //if(!g_sizes.hasOwnProperty(s)){
            g_sizes[j] = s//map: idx <--> size name
        /*} else {
            console.error(g_sizes)
            return Ext.Msg.show({
                title: 'IMPORT DATA',
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.ERROR,
                msg: 'DUPLICATE SIZE NAME: ' + s
            })
        }* /
    }

    for(i = 1; i <= data.length - 2; ++i){
        line = data[i].split('\t')
        if(!line.length) continue// skip empty lines
        if(!line[0]) continue

        item = {
            add: at,
            add_by: user,
            pcode: line[0],
            g_sizes: [ ]
        }

        for(j = 1; j < line.length; ++j){// sizes per pcode
            s = g_sizes[j]
            num = parseInt(line[j], 10)
            if(num && s){
                item.g_sizes.push(
                {
                    n: s, // name
                    q: 0, // current qty (available for moves b/w objects), IN: q += i
                    i: 0, // in stock, IN: q += i
                    s: 0, // sold, changed by SELR ++s, --q, --r
                    r: 0, // remains SELR --r
                    w: 0, // write flag
                    o: num
                }
                )
            }
        }
        pcode[item.pcode] = item
    }

    Ext.suspendLayouts()
    item = me.store.data.items
    for(i = 0; i < item.length; ++i){
        s = item[i].data
        if((!s.g_sizes) && (s = pcode[s.pcode])){
            item[i].set('g_sizes', s.g_sizes)
        }
    }
    me.bindedGZises = false
    me.autoSizeColumns()
    Ext.resumeLayouts(true)
}
/*

http://localhost:2764/n31/53f7aa019154300000ed16c2/edit

 */

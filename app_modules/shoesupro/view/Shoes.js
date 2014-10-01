// For help button current component:
// Ext.ComponentManager.get(Ext.get(Ext.Element.getActiveElement()).id)
// Forms -- has own windows, thus [?] help buttons

Ext.util.Format.thousandSeparator = ' '
Ext.util.Format.decimalSeparator = ','
Ext.util.Format.currencyPrecision = 0
Ext.util.Format.currencySign = ' ' + Ext.util.Format.currencySign
Ext.util.Format.currencyAtEnd = true

Ext.Msg.defaultMaxWidth = 777

Ext.define('App.shoesupro.Model',{
    extend: App.model.BaseCRUD,
    fields:[ 'id', 'add' ],
    idProperty: 'id'// ordinary IDs of ExtJS, redefine `model.BaseCRUD`'s '_id'
})

/*
 * Phony Models to be reconfigured without collisions
 **/
Ext.define('App.shoesupro.model.Items',{
    extend: App.shoesupro.Model
})

Ext.define('App.shoesupro.model.InStockList',{
    extend: App.shoesupro.Model
})

Ext.define('App.shoesupro.model.InStockItems',{
    extend: App.shoesupro.Model,
    idProperty: 'id_mpcode'
})

Ext.define('App.shoesupro.Store',{
    extend: App.store.CRUD,
    handleStoreException: function handleStoreException(msg){
        l10n._ns = 'so'
        Ext.Msg.show({// handle our own logic error messages
            title: l10n.so.err_title,
            buttons: Ext.Msg.OK,
            icon: Ext.Msg.INFO,
            msg: '<b>' + l10n(msg) + '</b>'
        })
        l10n._ns = ''
    }
})

Ext.define('App.shoesupro.view.Shoes',{
    extend: App.view.Window,
    title: l10n.so.title,
    requires:[
        'App.shoesupro.view.TabPanel',
        'App.shoesupro.view.PanelDocs',
        'App.shoesupro.view.GridOrderStat',
        'App.shoesupro.ux.gridDragSelector'
    ],
    wmImg: App.backendURL + '/css/shoesupro/fashion.png',
    wmTooltip: l10n.so.tooltip,
    wmId: 'shoesupro.view.Shoes',
    id: 'shoesupro-view-Shoes',
    onEsc: Ext.emptyFn,
    width: 777, height: 577,// initial
    layout: 'border',
    items:[
    {
        xtype: 'treepanel',
        itemId: 'navtree',
        region: 'west',
        //activeTab: 1,
        split: true,
        bodyPadding: 5,
        minWidth: 175,
        width: 175,
        rootVisible: false,
        store: Ext.create('App.shoesupro.store.TreeMainMenu')
    },
    {
        xtype: 'so_tabs',
        region: 'center',
        layout: 'fit'
    }
    ]
}
)

//> view/GridOrderStat.js
Ext.define('App.shoesupro.view.AllOrderStat',{
    extend: Ext.container.Container,
    xtype: 'so_allOrderStat',
    layout: 'border',
    title: l10n.so.orders,
    iconCls: 'icon-ord',
    items:[
        { xtype: 'so_gridOrderStat', flex: 1, region: 'center' },

        {// TODO: real chart of season totals
            xtype: 'image', src: App.backendURL + '/css/shoesupro/dummy_chart.png'
           ,height: 122, region: 'south'
        }
    ]
})


//> model/OrderStat.js
App.cfg.modelOrderStat = {
    url: '/shoesupro/lib/logic/seasn/stat',
    fields:[
    'add_by',//'string'
    'edit_by',//'date'
    'name',//'string'
    { name: 'add',        type: 'date' },//'add',// 'date'
    { name: 'edit',       type: 'date' },//'edit_by',//'string'
    { name: '#',          type: 'int' },
    //{ name: 'total_plan', type: 'int' },
    //{ name: 'total_done', type: 'int' },
    { name: 'total_ord',  type: 'int' },
    { name: 'total_ins',  type: 'int' },
    { name: 'eur',        type: 'float' },
    { name: 'dlr',        type: 'float' },
    { name: 'fem',        type: 'float' },
    { name: 'mal',        type: 'float' },
    { name: 'json',       type: 'auto', persist: false }// UI status info
    ],
    columns:[
    {
        dataIndex: '#', text: l10n.so.clmn.in_stock, width: 44,
        renderer:
        function(n){
            return ''
+'<div style="color:#008000;font-weight:bold;font-size: 1.2em;text-align:center;">'
+'<br>' + n + '<br>&nbsp;'
+'</div>'
        }
    },
    {
        text: l10n.so.clmn.dates_add_edit,
        width: 200,
        renderer:
        function(_, __, model){
        var data = model.data
            return '<div class="so-clmn-dates-add-edit">' +
Ext.Date.format(data.add, 'Y/m/d H:i:s l') + '<br>' +
(data.edit ? Ext.Date.format(data.edit, 'Y/m/d H:i:s l') : l10n('')) + '</div>'
        }
    },
    {
        text: l10n.so.clmn.ce_by,
        renderer:
        function(_, __, model){
        var data = model.data
            return '<div class="so-clmn-padd">' +
data.add_by + '<br>' +
(data.edit_by ? data.edit_by : l10n('')) + '</div>'
        }
    },
    {
        dataIndex: 'name',
        text: l10n.so.seasons,
        flex: 1
    },
    {
        text: l10n.so.clmn.totals,
        width: 167,
        renderer:
        function(_, __, model){
        var data = model.data
            return '<table class="x-grid-cell x-grid-td"><tbody><tr><td>' +
l10n.so.total_ord + ':' + '</td><td><b style="color:#C6205E">' +
data.total_ord + '</b></td></tr><tr><td>' +
l10n.so.total_ins + ':' + '</td><td><b style="color:#7D7D7D">' +
data.total_ins + '</b></td></tr></tbody></table>'
        }
    },
    { dataIndex: 'add',     text: l10n.so.clmn.add, hidden: true },
    { dataIndex: 'add_by',  text: l10n.so.clmn.add_by, hidden: true },
    { dataIndex: 'edit',      text: l10n.so.clmn.edit, hidden: true },
    { dataIndex: 'edit_by',   text: l10n.so.clmn.edit_by, hidden: true },
    { dataIndex: 'total_plan',  text: l10n.so.clmn.total_plan, hidden: true },
    { dataIndex: 'total_done',  text: l10n.so.clmn.total_done, hidden: true },
//    { dataIndex: '_id', text: l10n.so.clmn.id, hidden: true }
    ]
}

Ext.define('App.shoesupro.model.OrderStat',{
    extend: App.model.BaseCRUD,
    fields: App.cfg.modelOrderStat.fields,
    idProperty: '#'// season counter
})

Ext.define('App.shoesupro.view.GridOrderStat',{
    extend: Ext.grid.Panel,
    xtype: 'so_gridOrderStat',
    //requires: [ 'App.shoesupro.model.OrderStat' ],

    header: false,
    border: 0,
    initComponent: function(){
    var sid = 'so_orders', me = this

        l10n._ns = 'so'
        Ext.applyIf(me,{
            columns: App.cfg.modelOrderStat.columns,
            dockedItems:[{
                xtype: 'toolbar',
                dock: 'top',
                layout:{ overflowHandler: 'Menu' },
                items:[
                {
                    iconCls: 'doc-add',
                    text: l10n('create_season'),
                    action: 'create_season'
                }
               ,{
                    iconCls: 'doc-edit',
                    text: l10n('edit_season'),
                    action: 'edit_season'
                },'-'
               ,{
                    iconCls: 'icon-ord-leaf',
                    text: l10n('open_season_ord'),
                    action: 'so_gridOrderItems'
                }
               ,{
                    iconCls: 'icon-ins',
                    text: l10n('open_season_ins'),
                    action: 'so_gridInStockList'
                },'-'
               ,{
                    iconCls: 'so-refresh',
                    text: l10n('refresh'),
                    scope: me,
                    handler: me.refreshGrid
                },'-'
               ,{
                    iconCls: 'doc-history',
                    text: l10n('view_history'),
                    scope: me,
                    handler: me.viewHistory
                }
               ,{
                    iconCls: 'doc-export-xls',
                    text: l10n('export_xls'),
                    scope: me,
                    handler: me.exportXLS
                }
                ]
            }]
        })
        l10n._ns = ''

        if(!me.store){// not inherited call
            me.store = Ext.StoreManager.lookup(sid) ||
                       Ext.create(App.shoesupro.Store,
            {
                storeId: sid,
                url: App.cfg.modelOrderStat.url,
                autoLoad: true,
                sortOnLoad: true,
                remoteGroup: false,
                remoteSort: false,
                sorters:{ direction: 'DESC', property: '#' },
                model: App.shoesupro.model.OrderStat
            })

            me.on("afterrender", function(){// controller needs complete view
                App.getApplication().getController('App.shoesupro.controller.GridOrderStat')
            }, me, { single: true })
        }

        me.callParent()
    },

    viewHistory: function viewHistory(btn){
    var me = this, tabs, n, t

        if(!(n = me.orderId)){// stat or items grids
            t = me.getView().getSelectionModel().getSelection()[0]
            if(!t || !(n = t.data['#'])) return
        }

        t = l10n.so.no + ' ' + n + ' ' + l10n.so.view_history
        n = 'hn' + n

        tabs = me.up('tabpanel')
        if(!(btn = tabs.items.getByKey(n))){
            tabs.add({
                xtype: 'so_gridOrderHist',
                itemId: n,
                closable: true,
                title: t
            })
        } else {
            btn.store.load({ action: 'read', start: 0 })
        }

        tabs.setActiveTab(n)
    },

    exportXLS: function exportXLS(){
    var data, modarr, i ,j, cpb

        Ext.Msg.show({
            title: l10n.so.export_xls,
            buttons: null,
            icon: Ext.Msg.INFO,
            fn: function cleanup_on_cancel(btn){
                if('cancel' == btn){
                    cpb.remove()//selection in chrome
                    cpb.removeEventListener('keydown', on_keydown)
                    cpb.value = null
                    cpb = null
                }
            },
            msg: ''
+'<div style="color: green; overflow:hidden;">' + l10n.so.press + '<b>CTRL+C</b>. ' + l10n.so.copy
+'  <textarea id="copy_paste_buffer" style="position:absolute; top:-8px; width:1px;height:1px;">'
+'     copy|paste'
+'  </textarea>'
+'</div>'
        })

        data =
l10n.so.clmn.in_stock + '\t' + l10n.so.clmn.add + '\t' + l10n.so.clmn.add_by + '\t' +
l10n.so.clmn.edit + '\t' + l10n.so.clmn.edit_by + '\t' + l10n.so.orders + ' ' + l10n.so.seasons + '\t' +
l10n.so.rateEuro + '\t' + l10n.so.rateDollar + '\t' + l10n.so.interestFemale + '\t' + l10n.so.interestMale + '\t' +
l10n.so.total_ord + '\t' + l10n.so.total_ins

        modarr = this.store.getRange()
        for(i = 0; i < modarr.length; ++i){
            j = modarr[i].data
            data += '\n' + j['#'] + '\t' + Ext.Date.format(j.add, 'Y/m/d') + '\t' + j.add_by + '\t'
                 +  (j.edit ? Ext.Date.format(j.edit, 'Y/m/d') : 'null') + '\t' + j.edit_by + '\t' + j.name + '\t'
                 +  j.eur + '\t' + j.dlr + '\t' + j.fem + '\t' + j.mal + '\t'
                 +  j.total_ord + '\t' + j.total_ins
        }

        cpb = document.getElementById('copy_paste_buffer')

        setTimeout(function select_focus_copy_paste(){
            cpb.value = data
            cpb.focus()
            cpb.select()
        }, 128)
        return cpb.addEventListener('keydown', on_keydown, true)

        function on_keydown(ev){
            if(ev.ctrlKey && (67 == ev.keyCode)){
                setTimeout(function cleanup_export(){
                    cpb.remove()//selection in chrome
                    cpb.removeEventListener('keydown', on_keydown)
                    cpb.value = null
                    cpb = null
                    Ext.Msg.hide()
                    console.log('exportXLS')
                }, 16)
            }
        }
    },

    refreshGrid: function refreshGrid(){
        this.store.reload({ action: 'read', start: 0 })
    }
})

Ext.define('App.shoesupro.view.FormOrder',{
    extend: Ext.form.Panel,
    xtype: 'so_formOrder',
    layout: 'vbox',
    border: 0,
    bodyPadding: 4,
    fieldDefaults:{
        allowBlank: false,
        labelAlign: 'left',
        margins: 4
    },
    items: null,
    initComponent: function(){
    var me = this, this_year = (new Date).getFullYear()

        Ext.apply(me,{
            items:[
        {
            xtype: 'container',
            layout: 'hbox',
            defaults:{
                margins: 4
            },
            items:[
            {
                xtype: 'fieldset',
                layout: 'vbox',
                title: l10n.so.fsetAddNewSeason,
                width: 194,
                items:[
                {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    margins: 0,
                    items:[
                    {
                        xtype: 'numberfield',
                        fieldLabel: l10n.so.no,
                        cls: 'so-season-num',
                        labelWidth: 24,
                        name: '#',
                        width: 82,
                        value: 31,
                        minValue: 1
                    },
                    {
                        xtype: 'numberfield',
                        cls: 'so-season-num',
                        itemId: 'year',
                        name: 'year',
                        width: 77,
                        value: this_year + 1,
                        minValue: this_year - 11
                    },
                    ]
                },
                {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    margins: 0,
                    items:[
                    {
                        xtype: 'image',
                        cls: 'so-season-img',
                        itemId: 'cold',
                        src: App.backendURL + '/css/shoesupro/Roundicons-12.png',
                        listeners:{
                            render: function set_fire_click(cmp){
                                cmp.el.on('click', function(){
                                    cmp.fireEvent('click', cmp)
                                })
                            }
                        }
                    },
                    {
                        xtype: 'image',
                        cls: 'so-season-img',
                        itemId: 'hot',
                        src: App.backendURL + '/css/shoesupro/Roundicons-42.png',
                        listeners:{
                            render: function set_fire_click(cmp){
                                cmp.el.on('click', function(){
                                    cmp.fireEvent('click', cmp)
                                })
                            }
                        }
                    }
                ]
                }
                ]
            },
            {
                xtype: 'fieldset',
                title: l10n.so.fsetAddNewSeasonInput,
                //flex: 1,
                width: 377,
                items:[
                {
                    xtype: 'textfield',
                    cls: 'so-season-name',
                    anchor: '100%',
                    allowBlank: false,
                    itemId: 'name',
                    name: 'name'
                },
                {
                    xtype: 'container',
                    layout: 'hbox',
                    items:[
                    {
                        xtype: 'fieldcontainer',
                        items:[
                        {
                            xtype: 'displayfield',
                            name: 'add_by',
                            width: 177,
                            labelWidth: 47,
                            fieldLabel: l10n.so.clmn.add_by,
                            renderer: function(v){
                                return ''
+ '<div style="border: 1px solid #FF7700;padding: 4px;font-weight: bold;">'
+ App.User.data.name
+ '</div>'
                            }
                        },
                        {
                            xtype: 'datefield',
                            name: 'add',
                            width: 177,
                            labelWidth: 47,
                            format: "Y-m-d H:i",
                            fieldLabel: l10n.so.clmn.add
                        }
                        ]
                    },
                    {
                        xtype: 'fieldcontainer',
                        items:[
                        {
                            xtype: 'textfield',
                            name: 'total_plan',
                            width: 127,
                            labelWidth: 65,
                            disabled: true,// no plan yet
                            afterBodyEl: '&nbsp;(' + l10n.so.clmn.pairs + ')',
                            fieldLabel: l10n.so.clmn.total_plan
                        },
                        {
                            xtype: 'textfield',
                            name: 'total_done',
                            width: 127,
                            labelWidth: 65,
                            disabled: true,// no plan yet
                            afterBodyEl: '&nbsp;(' + l10n.so.clmn.pairs + ')',
                            fieldLabel: l10n.so.clmn.total_done
                        }
                        ]
                    }
                    ]
                }
                ]
            }
            ]
        }// first row
       ,{
            xtype: 'fieldset',
            title: l10n.so.fsetRetailPricePlan,
            //flex: 1,
            layout: 'hbox',
            anchor: '100%',
            margins: 4,
            defaults:{
                margins: 4
            },
            width: 577,
            items:[
            {
                xtype: 'fieldcontainer',
                width: 247,
                items:[
                {
                    xtype: 'textfield',
                    fieldLabel: l10n.so.rateEuro,
                    afterBodyEl: '&nbsp;(' + l10n.so.curr + ')',
                    width: 147,
                    labelWidth: 65,
                    itemId: 'eur',
                    name: 'eur'
                },
                {
                    xtype: 'textfield',
                    fieldLabel: l10n.so.rateDollar,
                    afterBodyEl: '&nbsp;(' + l10n.so.curr + ')',
                    width: 147,
                    labelWidth: 65,
                    itemId: 'dlr',
                    name: 'dlr'
                }
                ]
            },
            {
                xtype: 'fieldcontainer',
                items:[
                {
                    xtype: 'textfield',
                    fieldLabel: l10n.so.interestFemale,
                    afterBodyEl: '&nbsp;%',
                    width: 137,
                    labelWidth: 97,
                    itemId: 'fem',
                    name: 'fem'
                },
                {
                    xtype: 'textfield',
                    fieldLabel: l10n.so.interestMale,
                    width: 137,
                    labelWidth: 97,
                    afterBodyEl: '&nbsp;%',
                    itemId: 'mal',
                    name: 'mal'
                }
                ]
            }
            ]
        }// second row
       ,{
            xtype: 'fieldcontainer',
            //flex: 1,
            layout: 'hbox',
            anchor: '100%',
            defaults:{
                //margins: 4
            },
            width: 577,
            items:[
            {
                xtype: 'fieldset',
                title: l10n.so.setupGrid,
                height: 222,
                flex: 1,
                layout: 'fit',
                items:[
                {
                    xtype: 'grid',
                    margins: 4,
                    plugins:[{ ptype: 'cellediting', clicksToEdit: 1 }],
                    columns:[
                        { text: l10n.so.clmn.ftext,  dataIndex: 'text', editor: "textfield", width: 177 },
                        { text: l10n.so.clmn.ftype,  dataIndex: 'type', width: 77,
                          editor: new Ext.form.field.ComboBox({
                            triggerAction: 'all',
                            editable: false,
                            store: [
                                ['auto','auto (no conversion)'],
                                ['string','String'],
                                ['int','Integer'],
                                ['float','Float'],
                                ['date','Date']
                            ]})
                        },
                        { text: l10n.so.clmn.fname,  dataIndex: 'name', editor: "textfield" },
                        { text: 'JSON',  dataIndex: 'json', editor: "textfield", flex: 1 }
                    ],
                    store:{
                        fields:[ 'text', 'type', 'name', 'json' ],
                        proxy:{ type: 'memory', reader:{ type: 'json' }},
                        data:[
                            { text: '1text', type: 'auto', name: 'other', json: '[{ }]' }
                           ,{ text: '1text', type: 'date', name: 'other', json: '[{ }]' }
                        ]
                    }
                }
                ]
            }
            ]
        }
        ]
        })
        me.callParent()
    }
})

Ext.define('App.shoesupro.view.WinOrder',{
    extend: Ext.window.Window,
    xtype: 'so_winOrder',
    title: l10n.so.create_season,
    iconCls: 'icon-ord',
    width: 605,
    //heigth: 222,
    modal: true,
    resizable: true,
    draggable: true,
    constrainHeader: true,
    layout: 'fit',
    items:[{ xtype: 'so_formOrder' }],
    dockedItems:[
    {
        xtype: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        layout:{ overflowHandler: 'Menu' },
        items:[
        {
            xtype: 'button',
            itemId: 'cancel',
            text: l10n.btnCancel,
            iconCls: 'cancel',
            handler: function(){
                this.up('window').close()
            }
        },
        '->',
        {
            xtype: 'button',
            itemId: 'create',
            text: l10n.btnCreate,
            iconCls: 'ok'
        }
        ]
    }
    ]
})

App.cfg.modelOrderHist = {
    url: '/shoesupro/lib/logic/seasn/hist/',
    fields:[{ name: 'd', type: 'date' }, 'a', 'c', 's', 'byu', 'byr', 'data'],
    columns:[
    {
        text: l10n.so.clmn.edit,
        xtype: "datecolumn",
        format: "Y/m/d H:i:s l",
        width: 200,
        dataIndex: 'd'
    },
    {
        text: l10n.so.clmn.ce_by,
        dataIndex: 'byu',
        renderer:
        function(_, __, model){
        var data = model.data
            return data.byu + ':' + data.byr
        }
    },
    {
        text: l10n.so.clmn.ce_byr,
        hidden: true,
        dataIndex: 'byr'
    },
    {
        text: l10n.so.comment,
        width: 77,
        dataIndex: 'c'
    },
    {
        text: l10n.so.action,
        width: 77,
        dataIndex: 'a'
    },
    {
        text: l10n.so.dhupdate,
        flex: 1,
        dataIndex: 'data'
    },
    {
        text: 'status',
        hidden: true,
        dataIndex: 's'
    }
    ]
}

Ext.define('App.shoesupro.model.OrderHist',{
    extend: App.model.BaseCRUD,
    fields: App.cfg.modelOrderHist.fields
    //inherited: idProperty: '_id'
})

Ext.define('App.shoesupro.view.GridOrderHist',{
    extend: Ext.grid.Panel,
    xtype: 'so_gridOrderHist',
    iconCls: "icon-ord-leaf",

    //requires:[ 'App.shoesupro.model.OrderHist' ],

    header: false,
    meKeyMap: null,
    meCpRef: null,
    meContextMenu: null,
    initComponent: function(){
    var me = this

        l10n._ns = 'so'
        Ext.applyIf(me,{
            selModel: Ext.create(Ext.selection.RowModel,{ mode: 'MULTI' }),
            columns: App.cfg.modelOrderHist.columns,
            dockedItems:[{
                xtype: 'toolbar',
                dock: 'top',
                layout:{ overflowHandler: 'Menu' },
                items:[
                {
                    iconCls: 'so-refresh',
                    text: l10n('refresh'),
                    scope: me,
                    handler: me.refreshGrid
                },'-'
               ,{
                    iconCls: 'doc-export-xls',
                    text: l10n('export_xls'),
                    handler: me.exportXLS
                }
                ]
            }]
        })
        l10n._ns = ''

        if(!me.store){// not inherited
            me.viewConfig = {
                stripeRows: false,
                getRowClass: function(record){
                    return record.data.s == '+' ? '' : 'row-err'
                }
            }

            me.on('itemdblclick', function openHistory(grid, model){
                window.open(grid.store.proxy.url + '/' + model.id)
            })

            me.store = Ext.StoreManager.lookup(me.itemId) ||
                       Ext.create(App.shoesupro.Store,
            {
                storeId: me.itemId,
                url: App.cfg.modelOrderHist.url + me.itemId,
                autoLoad: true,
                remoteSort: false,
                remoteFilter: false,
                remoteGroup: false,
                sortOnLoad: true,
                model: App.shoesupro.model.OrderHist,
                sorters:{ direction: 'DESC', property: '_id' },
                proxy:{ startParam: 'skip', limitParam: 'limit', appendId: false }
            })
        }

        me.on("afterrender", function(){
        var grid = this

            this.meCpRef = document.getElementById('grid_copy_buffer')
            this.meKeyMap = new Ext.util.KeyMap({
                target: grid.getEl().id,
                binding: [{
                    ctrl: true, key: "c"
                   ,fn: function onCTRL_C(){
console.log('ctrl+c')
                       grid.copyClipboard()
                    }
                }]
            })

            this.bindedGZises && (this.bindedGZises = false)
        }, me, { single: true })

        me.on("destroy", function destroyGridOrderItems(){
            if(this.meKeyMap){
                this.meKeyMap.destroy()
                this.meKeyMap = null
            }
            if(this.meCpRef){
                this.meCpRef = null
            }
            Ext.StoreManager.unregister(me.itemId)
        })

        me.callParent()
        return
    },

    refreshGrid: function refreshGrid(btn){
    var me = this, store = me.store

        if(!~store.proxy.url.indexOf('+init')){
            store.proxy.url += '+init'// refresh with metadata
        }
        me.bindedGZises && (me.bindedGZises = false)
        store.reload({ action: 'read', start: 0 })
        store.clearFilter()
    },

    exportXLS: function exportXLS(btn, ev){
        console.error('not implemented export xls')
    },

    copyClipboard: function copyClipboard(){
    var i ,j, h, s, model
       ,me = this
       ,value = ''
       ,header = me.headerCt.getGridColumns()
       ,sm = me.getSelectionModel()
       ,models = sm.getSelection()

        if(models.length){
            model = models[0]
            j = 0, s = '\n'
            do if((h = header[j]).dataIndex){
                if(h.text == l10n.so.clmn.foto) continue// skip no data

                value += h.text
                s += h.dataIndex
                if((j + 1) < header.length){
                    value += '\t', s += '\t'
                }
            } while (++j < header.length)
            value += s + '\n'
        }
        value = value.replace(/<br>/, ' ')// cleanup header

		for(i = 0; i < models.length; ++i){
			if(!(model = models[i])){
console.log('skip idx: ' + i)
                continue
            }
            j = 0
			do if((h = header[j]).dataIndex){
                if(h.text == l10n.so.clmn.foto) continue// skip no data

                if('g_sizes' == h.dataIndex){
                    s = App.shoesupro.view.GridColumnSizes
                                     .getSizesString(model.get('g_sizes'))
                } else {
                    s = model.get(h.dataIndex)
                    if(!s && s !== 0){
                        s = ''
                    }
                }
                if(s && s.getUTCDay){
                    s = Ext.Date.format(s, 'Y/m/d H:i:s')
                }
                value += s + ((j + 1) < header.length ? '\t' : '')
            } while (++j < header.length)
			value += '\n'
		}

        me.meCpRef.value = value
        me.meCpRef.focus()// select() by itself
        sm.deselectAll(true)
	}
})

Ext.define('App.shoesupro.view.GridColumnTM',{
    extend: Ext.grid.column.Column,
    xtype: 'so_gridColumnTM',
    items:{
        xtype: 'combobox',
        margin: 4,
        editable: false,
        emptyText: l10n.so.filter,
        multiSelect: true,
        store:[// TODO: get `id_mfg` list from backend
'ARA',
'GABOR',
'IDANA',
'JANA',
'JANITA',
'JOMOS',
'JS',
'LLOYD',
'MT',
'PG',
'PIKOLINOS',
'PK',
'REMONTE',
'RIEKER',
'ROMIKA',
'SALAMANDER',
'TAMARIS',
'VITO'
        ],
        trigger2Cls: 'so-clmnhdr-filter-clear',
        onTrigger2Click: function clearComboFilter(){
            this.clearValue()
            this.up('grid').store.removeFilter(this.up('gridcolumn').dataIndex)
        },
        listeners:{
            afterrender: function bindTriggerTooltip(){
                Ext.widget('tooltip',{
                    target: this.getEl(),
                    html: l10n.so.filterSet
                })
            },
            change: function applyComboFilter(_, value){
            var grid = this.up('grid')
               ,idx = this.up('gridcolumn').dataIndex

                if(value.length){
                    if(grid.view.selModel.selected.length){
                        grid.view.selModel.deselectAll(true)
                    }
                    grid.store.filter({
                        id: idx,
                        filterFn: function filterMFG(record){
                            return Ext.Array.contains(value, record.get(idx))
                        }
                    })
                } else {
                    grid.store.removeFilter(idx)
                }
            }
        }
    },
    listeners:{
        resize: function resizeItems(col, width){
            col.down('combobox').setWidth(width - 9)
        }
    }
})

Ext.define('App.shoesupro.view.GridColumnFilter',{
    extend: Ext.grid.column.Column,
    xtype: 'so_gridColumnFilter',
    items:{
        xtype: 'triggerfield',
        margin: 4,
        enableKeyEvents: true,
        fieldLabel: '&nbsp;',
        labelClsExtra: 'so-clmnhdr-filter',
        labelWidth: 14,
        triggerCls: 'so-clmnhdr-filter-clear',
        emptyText: l10n.so.filter,
        allowBlank: true,
        onTriggerClick: function clearTextFilter(){
            this.reset()
            this.up('grid').store.removeFilter(this.up('gridcolumn').dataIndex)
        },
        listeners:{
            afterrender: function bindTriggerTooltip(){
            var me = this

                Ext.widget('tooltip',{
                    target: me.getEl(),
                    listeners:{
                        beforeshow: function(tip){
                            tip.update(
                                l10n.so.filterTxt + '<br><br>' +
                                (me.value ? me.value : '')
                            )
                        }
                    }
                })
            },
            keyup: function applyTextFilter(){
            var v, i
               ,re = this.value
               ,grid = this.up('grid')
               ,idx = this.up('gridcolumn').dataIndex

                if(re && re.length >= 1){
                    if((v = re.split(' ')).length){
                        re = ''
                        for(i = 0; i < v.length; ++i){
                            re += (i ? '|': '') + '(?:^' + v[i] + ')'
                        }
                    }
console.log(re)
                    if(grid.view.selModel.selected.length){
                        grid.view.selModel.deselectAll(true)
                    }
                    grid.store.filter({
                        id: idx,
                        property: idx,
                        value: new RegExp(re, 'i')
                    })
                } else {
                    grid.store.removeFilter(idx)
                }
            },
            buffer: 512// input delay
        }
    },
    listeners:{
        resize: function resizeItems(col, width){
            col.down('textfield').setWidth(width - 9)
        }
    }
})

Ext.define('App.shoesupro.view.GridColumnCurrency',{
    extend: App.shoesupro.view.GridColumnFilter,
    xtype: 'so_gridColumnCurrency',
    renderer: function (v){
        return Ext.util.Format.currency(v)
    }
})

Ext.define('App.shoesupro.view.GridColumnFoto',{
    extend: Ext.grid.column.Column,
    xtype: 'so_gridColumnFoto',
    renderer: function(v,_, m){
        return '<div class="so-'
+ (1078 == m.data.gend.charCodeAt(0) ? 'w' : 'm') + '">'
+ '<img style="max-height:100%; max-width:100%;" src="'
+ App.backendURL + '/n31/' + v.slice(0, v.indexOf('#')) + '.jpg"/></div>'
    }
})

Ext.define('App.shoesupro.view.GridColumnSKU',{
    extend: Ext.grid.column.Column,
    xtype: 'so_gridColumnSKU',
    items:{
        xtype: 'triggerfield',
        margin: 4,
        enableKeyEvents: true,
        fieldLabel: '&nbsp;',
        labelClsExtra: 'so-clmnhdr-filter',
        labelWidth: 14,
        //prevFilterValue: '',
        triggerCls: 'so-clmnhdr-filter-clear',
        emptyText: l10n.so.filter,
        allowBlank: true,
        onTriggerClick: function clearTextFilter(){
            this.reset()
            this.up('grid').store.removeFilter(this.up('gridcolumn').dataIndex)
        },
        listeners:{
            afterrender: function bindTriggerTooltip(){
                Ext.widget('tooltip',{
                    target: this.getEl(),
                    html: l10n.so.filterTxtSKU
                })
            },
            keyup: function applyTextFilter(){
            // first space -- any match before '@'
            var v = this.value, grid = this.up('grid')
               ,idx = this.up('gridcolumn').dataIndex

                if(v && ((' ' != v[0] && v.length >= 1) || (v.length >= 2))){
                    if(grid.view.selModel.selected.length){
                        grid.view.selModel.deselectAll(true)
                    }
                    grid.store.filter({
                        id: idx,
                        property: idx,
                        value: new RegExp(' ' == v[0] ? '^[^@]*' + v.slice(1) : '^' + v, 'i')
                    })
                } else {
                    grid.store.removeFilter(idx)
                }
            },
            buffer: 512// input delay
        }
    },
    listeners:{
        resize: function resizeItems(col, width){
            col.down('textfield').setWidth(width - 9)
        }
    },

    defaultRenderer: function renderSizesInTable(sku){// pretify
        return sku.replace(/#/, '</b><b>#</b><b style="color:#008000;">')
                  .replace(/@/, '<b>@</b><b style="color:#000080;">') + '</b>'
//+'<div style="background-color:#FFE7B7;color:#000080;font-weight:bold;text-align:center;">'
//+'<br>' + sum + '<br>&nbsp;'
//+'</div>'
    }
})


Ext.define('App.shoesupro.view.GridColumnSFilter',{
    extend: Ext.grid.column.Column,
    xtype: 'so_gridColumnSFilter',
    items:{
        xtype: 'triggerfield',
        margin: 4,
        enableKeyEvents: true,
        fieldLabel: '&nbsp;',
        labelClsExtra: 'so-clmnhdr-filter',
        labelWidth: 14,
        triggerCls: 'so-clmnhdr-filter-clear',
        emptyText: l10n.so.filter,
        allowBlank: true,
        onTriggerClick: function clearTextFilter(){
            this.reset()
            this.up('grid').store.removeFilter(this.up('gridcolumn').dataIndex)
        },
        listeners:{
            afterrender: function bindTriggerTooltip(){
                Ext.widget('tooltip',{
                    target: this.getEl(),
                    html: l10n.so.filterTxtSKU
                })
            },
            keyup: function applyTextFilter(){
            // first space -- any match before '@'
            var v = this.value, grid = this.up('grid')
               ,idx = this.up('gridcolumn').dataIndex

                if(v && ((' ' != v[0] && v.length >= 1) || (v.length >= 2))){
                    if(grid.view.selModel.selected.length){
                        grid.view.selModel.deselectAll(true)
                    }
                    grid.store.filter({
                        id: idx,
                        property: idx,
                        value: new RegExp(' ' == v[0] ?  v.slice(1) : '^' + v, 'i')
                    })
                } else {
                    grid.store.removeFilter(idx)
                }
            },
            buffer: 512// input delay
        }
    },
    listeners:{
        resize: function resizeItems(col, width){
            col.down('textfield').setWidth(width - 9)
        }
    }
})

Ext.define('App.shoesupro.view.GridColumnSizesSum',{
    extend: Ext.grid.column.Column,
    xtype: 'so_gridColumnSizesSum',
    soShow: null, // o, i, q, r, s  //TODO: show in_stock and more
    defaultRenderer: function renderSizesInTable(total, meta, model){
    var f
        // action handler: `_inc_dec_gsize()`
        f = this.soShow
        if(!f || 'q' == f) return ''
+'<div style="background-color:#77FF77;color:#000080;font-weight:bold;text-align:center;">'
+'<br>' + total + '<br>&nbsp;'
+'</div>'

        if('o' == f) return ''
+'<div style="background-color:#F7B7D7;color:#000080;font-weight:bold;text-align:center;">'
+'<br>' + total + '<br>&nbsp;'
+'</div>'

        if('di' == f) return ''
+'<div style="background-color:#C7C7C7;color:#000080;font-weight:bold;text-align:center;">'
+'<br>' + total + '<br>&nbsp;'
+'</div>'

        if('m' == f) return ''
+'<div style="color:#C6205E;font-weight:bold;text-align:center;">'
+'<br>' + total + '<br>&nbsp;'
+'</div>'

//console.warn('render totals:' + model.data.total_ins)
        return ''
+'<div style="margin-top: 24px;padding-top: 2px;background-color:#F7B7D7;color:#000080;font-weight:bold;text-align:center;">'
+ model.data.total_ord + '<br>'
+  '<div style="padding: 2px 0 3px 0;margin: 5px 0 0px 0;background-color:#C7C7C7;">'
+ model.data.total_ins
+  '</div>'
+'</div>'
    }
    //
})

Ext.define('App.shoesupro.view.GridColumnSizes',{
    extend: Ext.grid.column.Column,
    xtype: 'so_gridColumnSizes',
    soShow: null,
    defaultRenderer: function renderSizesInTable(items, cell, model){
    var tb, te, total, i, s, q, f, z
    /*
        [{"n":"43","q":1},{"n":"44","q":1},{"n":"45","q":1},{"n":"46","q":1}]
     */
        if(!items || !items.length) return ''

        f = this.soShow
        z = cell.recordIndex
        s = 'di' == f ? 'so-sizes-docs' : ''
        tb = '<table gsizes class="' + s + '" style="text-align:center;"><tbody><tr>'
        te = '</tr></tbody></table>'


        items = items.sort(function sortSizeNames(va, vb){
        var a, b

            a = parseInt(va.n.replace('[,.]', ''))
            b = parseInt(vb.n.replace('[,.]', ''))

            return  a > b ? 1 : a < b ? -1 : 0
        })

        for(i = 0; i < items.length; ++i){// Size Name
        // pad number without fraction
            s = (s = items[i].n) && (-1 == s.indexOf(',') ? '&nbsp;&nbsp;' + s + '&nbsp;&nbsp;' : s)
tb += '<td z="' + z + '" o="' + f + '" n="-' + items[i].n
   + '" style="width:111px;border: 1px gray solid;color:#000080;font-size:10pt;"><b>' + s + '</b></td>'
        }
        tb += '</tr><tr>'

        if(!f || 'q' == f){// default
            for(total = 0, i = 0; i < items.length; ++i){
total += (q = items[i].q)
tb += '<td z="' + z + '" q="' + f + '" n=' + items[i].n
   +  ' style="background-color:#' + (q >= 0 ? 'C7C7C7' : 'FF0000')
   + ';color:#000080;font-weight:bold;font-size:10pt;">'
   + q + '</td>'
            }

            if(total !== model.data.total_qty){
                model.set('total_qty', total)
            }

            return tb + te
        }

        if('o' == f){// order
            for(total = 0, i = 0; i < items.length; ++i){
total += (q = items[i].o)
tb += '<td z="' + z + '" o="' + f + '" n=' + items[i].n
   +  ' style="background-color:#' + (q >= 0 ? 'F7B7D7' : 'FF0000')
   + ';color:#000080;font-weight:bold;font-size:10pt;">'
   + q + '</td>'
            }

            if(total !== model.data.total_ord){
                model.set('total_ord', total)
            }

            return tb + te
        }

        if('di' == f){// in stock documents (no changes via bindings)
            for(total = 0, i = 0; i < items.length; ++i){
total += (q = items[i].i)
tb += '<td z="' + z + '" i="' + f + '" n=' + items[i].n
   +  ' style="background-color:#' + (q >= 0 ? 'C7C7C7' : 'FF0000')
   + ';color:#000080;font-weight:bold;font-size:10pt;">'
   + q + '</td>'
            }

            if(total !== model.data.total_ins){
                model.set('total_ins', total)
            }

            return tb + te
        }

        if('i' == f){// in stock
            for(total = 0, i = 0; i < items.length; ++i){
total += (q = items[i].o)
tb += '<td z="' + z + '" o="' + f + '" n=' + items[i].n
   +  ' style="background-color:#' + (q >= 0 ? 'F7B7D7' : 'FF0000')
   + ';color:#000080;font-weight:bold;font-size:10pt;">'
   + q + '</td>'
            }

            if(total !== model.data.total_ord){
                model.set('total_ord', total)
            }
            tb += '</tr><tr>'

            for(total = 0, i = 0; i < items.length; ++i){
total += (q = items[i].i)
tb += '<td z="' + z + '" i="' + f + '" n=' + items[i].n
   +  ' style="background-color:#' + (q >= 0 ? 'C7C7C7' : 'FF0000')
   + ';color:#000080;font-weight:bold;font-size:10pt;">'
   + q + '</td>'
            }

            if(total !== model.data.total_ins){
                model.set('total_ins', total)
            }
        }

        return tb + te
    },
    statics:{
        getSizesString: function getOrderedGSizesString(g_sizes, q){
        var n, k, s

            n = g_sizes.sort(function(a, b) { return a.n > b.n ? 1 : a.n < b.n ? -1 : 0 })

            if(!q && (k = n[0])){
                if(k.hasOwnProperty('i') && !k.hasOwnProperty('o')){
                    q = 'i'
                } else if(k.hasOwnProperty('o')){
                    q = 'o'
                } else {
                    q = 'q'// default number field
                }
            }

            s = new Array(n.length + 1)
            for(k = 0; k < n.length; ++k){
                s[k] = n[k].n + '=' + n[k][q]// select number from: o, i, q, r, s
            }
            s[n.length] = ''

            return s.join(';')
        }
    }
})

Ext.define('App.shoesupro.view.GridOrderItems',{
    extend: App.shoesupro.view.GridOrderHist, //Ext.grid.Panel,
    xtype: 'so_gridOrderItems',
    iconCls: "icon-ord-leaf",
    columns:[// initial `App.shoesupro.Model`; reconfigure is done by `metaChange`
        { dataIndex: 'id',  text: l10n.so.clmn.id, width: 28 },
        { dataIndex: 'add', text: l10n.so.clmn.add, format: 'Y/m/d H:i:s l', xtype: "datecolumn" }
    ],
    plugins:[
        { ptype: 'cellediting', clicksToEdit: 2 },
        {
            ptype: 'bufferedrenderer',
            trailingBufferZone: 21,
            leadingBufferZone: 47,
            variableRowHeight: true
        }
       //,{ ptype: 'ux.griddragselector' }
    ],
    storeURL: '/shoesupro/lib/logic/seasn/n',//NOTE: 'n' -- db collection name prefix
    storeModel: App.shoesupro.model.Items,
    bindGZises: true,//cfg
    bindedGZises: false,
    btnSave: null,
    orderId: 0,
    initComponent: function initGridOrderItems(){
    var me = this, undo, save

        l10n._ns = 'so'
        Ext.applyIf(me,{//TODO dynamic auth-z-n selection of available buttons
            dockedItems:[{
                xtype: 'toolbar',
                dock: 'top',
                layout:{ overflowHandler: 'Menu' },
                items:[
                {
                    iconCls: 'so-undo',
                    text: l10n('undo'),
                    handler: me.undoStoreChanges
                }
               ,{
                    iconCls: 'so-save',
                    text: l10n('save'),
                    handler: me.syncStore
                }, '-'
               ,{
                    iconCls: 'doc-add',
                    text: l10n('add_items'),
                    handler: addOrderItems
                }, '-'
               ,{
                    iconCls: 'icon-ins-leaf',
                    text: l10n('add_to_ins'),
                    handler: me.addItemsInStock
                }, '-'
               ,{
                    iconCls: 'so-refresh',
                    text: l10n('refresh'),
                    scope: me,
                    handler: me.refreshGrid
                }, '-'
               ,{
                    iconCls: 'icon-ins',
                    text: l10n('open_season_ins'),
                    handler: openSeasonINS
                },'-'
               ,{
                    iconCls: 'doc-history',
                    text: l10n('view_history'),
                    handler: me.viewHistory
                }
               ,{
                    iconCls: 'doc-export-xls',
                    text: l10n('export_xls'),
                    handler: exportXLS
                }
                ]
            }
            /*,{ TODO: add info bar with calculations, sorting via buttons etc...
                xtype: 'container',
                html: 'more functions'
            }*/
           /*,{
                xtype: 'toolbar',
                dock: 'top',
                layout:{ overflowHandler: 'Menu' },
                items:[
                {
                    iconCls: 'so-commit',
                    text: l10n('commit'),
                    action: 'commit'
                }
                ]
            }*/
            ]
        })
        l10n._ns = ''

        me.on('cellcontextmenu', me.showContextMenu)
        me.on('beforereconfigure', function mkColumnNames(grid, store, columns){
            Ext.each(columns, function(column){
            var name = l10n.so.clmn[column.text]

                name && (column.text = name)
            })
        })
        /* order of event fireing */
        me.on('activate', me.autoSizeColumns)// normal tab switch
        me.on('reconfigure', me.autoSizeColumns)// initial store reconfigure
        me.on('viewready', me.autoSizeColumns)// creating new view, activated, reconfigured

        // load new data in new store for every view, because
        // filters and sorters applied by view to the store, oops
        if(!me.store) me.store = Ext.create(App.shoesupro.Store,{// not inherited
            url: me.storeURL + me.orderId + '+init',
            model: me.storeModel,
            storeId: me.itemId,
            autoLoad: true
        })

        // sync UI with data (autosize, bind actions)
        me.store.on('metachange', me.metachange, me)
        me.store.on('datachanged', datachanged)
        me.store.on('update', datachanged)
        me.store.on('load', load)
        me.store.on('write', write)
        me.store.on('filterchange', write)

        me.callParent(/*GridOrderHist*/)

        undo = me.down('button[iconCls=so-undo]')
        me.btnSave = save = me.down('button[iconCls=so-save]')

        /*Ext.util.Observable.capture(me, function(){
            console.log(arguments)
        })*/
        return

        // UI events
        function datachanged(){
            if(!save) return

            save.disabled && save.enable()
            undo && (undo.disabled && undo.enable())
        }

        function load(){
            if(!save) return console.warn('no load')

            !save.disabled && save.disable()
            undo && (!undo.disabled && undo.disable())

            return undefined
        }

        function write(){
            me.bindedGZises && (me.bindedGZises = false)
            me.autoSizeColumns()
console.log('write')
        }

        // UI handlers
        function addOrderItems(btn, ev){
            me.pasteClipboard(me, btn.text, App.shoesupro.parseOrderItemsToStore)
        }

        function exportXLS(){
console.warn('exportXLS')
        }

        function openSeasonINS(){
        var n, tabs = me.up('tabpanel')

            tabs.add({
                closable: true,
                title: me.title,
                orderId: me.orderId,
                itemId: n = me.orderId + '_' + (new Date).valueOf(),//=`storeId`
                xtype: 'so_gridInStockList'
            })
            tabs.setActiveTab(n)
        }
    },

    // methods

    metachange: function metachange(_, meta){
        meta.columns && this.reconfigure(null, meta.columns)
    },

    viewHistory: function viewHistory(btn){
    var me = btn.up('grid'), tabs, n, t

        if(!(n = me.orderId)){// stat or items grids
            t = me.getView().getSelectionModel().getSelection()[0]
            if(!t || !(n = t.data['#'])) return
        }

        t = l10n.so.no + ' ' + n + ' ' + l10n.so.view_history
        n = 'hn' + n

        tabs = me.up('tabpanel')
        if(!(btn = tabs.items.getByKey(n))){
            tabs.add({
                xtype: 'so_gridOrderHist',
                itemId: n,
                closable: true,
                title: t
            })
        } else {
            btn.store.load({ action: 'read', start: 0 })
        }

        tabs.setActiveTab(n)
    },

    autoSizeColumns: function autoSizeColumns(){
    var grid = this, tbl = this.view

        setTimeout(function crutch_autoSizeColumns(){
            if(grid.rendered && tbl){
                Ext.each(tbl.getGridColumns(), function(clmn){
                    if(clmn.dataIndex == 'g_sizes'){
                        tbl.autoSizeColumn(clmn)
                        // bind handlers into `g_size` table
console.log('bind g_sizes...')
                        if(grid.bindGZises && !grid.bindedGZises){
                            grid.bindedGZises = true
console.log('done')
                            var tds = tbl.getEl().query('table[gsizes] td[n]')
                            for(var i = 0; i < tds.length; ++i){
                                tds[i].onclick = bindGrid// Ext.get(tds[i]).on('click', bindGrid)
                            }
                        }

                        return false// stop iterator here
                    }
                    return undefined
                })
            }

            function bindGrid(ev){// DOM context
                grid._inc_dec_gsize(grid.store, ev, this)
            }
        }, 128)
    },

    _inc_dec_gsize: function _inc_dec_gsize(store, ev, el){
    var delta
       ,n = el.getAttribute('n')
       ,o = el.getAttribute('o'), i = el.getAttribute('i')

        if(n){
            if('i' != o && 'i' != i){// one row change: order, etc.
                if('-' == n[0]){// title click: decrement
                    delta = -1
                    n = n.slice(1)

                    el = el.parentElement// find row below the title
                           .parentElement.querySelectorAll('tr td[n="' + n + '"]')[0]
                } else {// increment
                    delta = +1
                }
                el.innerHTML = delta + parseInt(el.innerHTML, 10)
                setTimeout(_defer_store_change, 0)
            } else if('-' != n[0]){// two rows: order-to-in_stock, obj1-to-obj2_moves, etc.
                if('i' == o){// order: ++inc, in stock: --dec
                    delta = +1
                    el.innerHTML = delta + parseInt(el.innerHTML, 10)
                    i = el.parentElement// find row below 'o'
                           .parentElement.querySelectorAll('tr td[n="' + n + '"]')[1]
                    i && (i.innerHTML = -delta + parseInt(i.innerHTML, 10))
                    o = el
                } else {// in stock: ++inc, order: --dec
                    delta = -1
                    el.innerHTML = -delta + parseInt(el.innerHTML, 10)
                    o = el.parentElement// find row below the title
                           .parentElement.querySelectorAll('tr td[n="' + n + '"]')[0]
                    o && (o.innerHTML = +delta + parseInt(o.innerHTML, 10))
                    i = el
                }
                setTimeout(_defer_store_change_t2, 0)
            }
        }

        return

        function _defer_store_change_t2(){
        var m, q, p, j, s

            m = parseInt(el.getAttribute('z'), 10)
            if(isNaN(m) || m < 0) return// correct row numer
            m = store.getAt(m)
            s = m.data.g_sizes

            if(!m.modified.g_sizes){
                m.modified.g_sizes = Ext.clone(m.data.g_sizes)
                m.modified.total_ins = m.data.total_ins
                m.dirty = true
            //m.modified.total_ins = m.data.total_ins
            //m.dirty = true
            }

            for(j = 0; j < s.length; ++j) if(s[j].n == n){
                break
            }

            p = s[j].o += delta, m.data.totlal_ord += delta
            q = s[j].i += -delta, m.data.totlal_ins += -delta

            if(isNaN(q) || q < 0){
                i.style.backgroundColor = '#FF0000'
                i.style.color = '#FFFFFF'
            } else {
                i.style.backgroundColor = '#D7D7D7'
                i.style.color = '#000080'
            }

            if(isNaN(p) || p < 0){
                o.style.backgroundColor = '#FF0000'
                o.style.color = '#FFFFFF'
            } else {
                o.style.backgroundColor = '#FFE7B7'
                o.style.color = '#000080'
            }
            if(!m.modified.g_sizes){
                m.modified.g_sizes = Ext.clone(m.data.g_sizes)
            }
            m.callStore('afterEdit', ['total_ins'])// rerender; works "no change"
        }

        function _defer_store_change(){
        var i, j, m, s, z, c, q, qty

            z = parseInt(el.getAttribute('z'), 10)
            if(isNaN(z) || z < 0) return// correct row number

            i = el.getAttribute('o') ?
                (qty = 'ord', c = 'FFE7B7', 'o') : /*el.getAttribute('i') ?
                (qty = 'ins', c = 'D7D7D7', 'i') :*/
                (qty = 'qty', c = '77FF77', 'q')

            qty = 'total_' + qty
            m = store.getAt(z)
            s = m.data.g_sizes
            if(!m.modified.g_sizes){
            // Model: set modified, set dirty for being save via writer
                m.modified.g_sizes = Ext.clone(m.data.g_sizes)
                m.modified[qty] = m.data[qty]
                m.dirty = true
            }
            for(j = 0; j < s.length; ++j) if(s[j].n == n){
                q = s[j][i] += delta, m.data[qty] += delta
                break
            }
            if(isNaN(q) || q < 0){
                //if(el.style)
                el.style.backgroundColor = '#FF0000'
                el.style.color = '#FFFFFF'
            } else {
                el.style.backgroundColor = c
                el.style.color = '#000080'
            }
            m.callStore('afterEdit', [ qty ])// rerender; "no change" doesn't work
        }
    },

    showContextMenu: function showContextMenu(view, td, cellIndex, model, tr, rowIndex, e){
    var km, me = this, item = view.headerCt.getHeaderAtIndex(cellIndex)

        if(!(item && (item = item.dataIndex))){
            return
        }
        e.stopEvent()

        if(me.meContextMenu){
            me.meContextMenu.hide()
            me.meContextMenu.destroy()
            me.meContextMenu = null
        }

        me.meContextMenu = Ext.widget({
            xtype: 'menu',
            items: [
            {
                xtype: 'container'
            },
            {
                text: l10n.copyCtrlC,
                iconCls: 'icon-copy',
                handler: function(item, e){
                    if(km){
                        km.destroy()
                    }
                    Ext.Msg.show({
                        title: l10n.copyCtrlC,
                        msg: l10n.copyCtrlC,
                        buttons: Ext.Msg.OK,
                        icon: Ext.Msg.INFO
                    })
                    setTimeout(prepareMenuAndCTRL_C_Copy, 128)
                }
            },
            {
                text: l10n.selectAll,
                iconCls: 'rows-selall',
                handler: function(){
                    me.view.selModel.selectAll()
                }
            }
            ]
        })

        me.meContextMenu.items.items[0].update(l10n.so.clmn.code + item + '<br><br>')
        me.meContextMenu.showBy(td)

        setTimeout(prepareMenuAndCTRL_C_Copy, 128)
        return

        function prepareMenuAndCTRL_C_Copy(){
            view.getSelectionModel().deselectAll(true)// prevent `me.copyClipboard()`
            if(!km){// not a dup call from menu
                me.meCpRef.value = 'g_sizes' == item
                ? App.shoesupro.view.GridColumnSizes.getSizesString(model.get(item))
                : me.meCpRef.value = model.get(item)
            }
//console.log(me.meCpRef.value)
            me.meCpRef.focus()// select() by itself
            km = new Ext.util.KeyMap({
                target: me.meCpRef,
                binding: [{
                    ctrl: true, key: "c"
                   ,fn: function onCellCTRL_C(){
                        if(me.meContextMenu){
                            me.meContextMenu.hide()
                            me.meContextMenu.destroy()
                            me.meContextMenu = null
                        }
                        km.destroy()
                        km = null
                        if(Ext.Msg.isVisible()){
                            Ext.Msg.hide()
                        }
                    }
                }]
            })
        }
    },

    undoStoreChanges: function undoStoreChanges(btn){
    var me = btn.up('grid'), save = me.down('button[iconCls=so-save]')

        me.setLoading(true)
        setTimeout(function crutch(){
            // rejectChanges: useless and too slow as it is now (same as full reload)
            me.store.rejectChanges(true)
            me.setLoading(!true)
            !btn.disabled && btn.disable()
            !save.disabled && save.disable()
            me.view.refresh()
            me.bindedGZises && (me.bindedGZises = false), me.autoSizeColumns()
        }, 128)
    },

    syncStore: function syncStore(btn){
    var me = btn.up('grid')

        me.setLoading(true)
        setTimeout(function crutch(){
            if(!me.store.sync({ callback:
            function(batch){
            var undo = me.down('button[iconCls=so-undo]')

                me.setLoading(!true)
                if(!batch.hasException){
                    !btn.disabled && btn.disable()//save
                    undo && (!undo.disabled && undo.disable())
                }
            }})){
                me.setLoading(!true)
                !btn.disabled && btn.disable()//save
            }
        }, 512)
    },

    pasteClipboard: function pasteClipboard(me, text, callback){
    var cpb = 'grid_paste_buffer'

        Ext.Msg.show({
            title: text,
            buttons: null,
            icon: Ext.Msg.INFO,
            width: 733, height: 233,
            fn: function cleanup_on_cancel(btn){
                if('cancel' == btn){
                    cpb.remove()//selection in chrome
                    cpb.removeEventListener('keydown', on_keydown)
                    cpb.value = null
                    cpb = null
                }
            },
            msg: ''
+'<div style="color: green; overflow:hidden;">' + l10n.so.press + '<b>CTRL+V</b>.<br>' + l10n.so.ord_import
+'  <textarea id="' + cpb + '" style="position:absolute; top:-8px; width:1px;height:1px;">'
+'     copy|paste'
+'  </textarea>'
+'</div><img style="width: 651px;height: 109px;" src="/css/shoesupro/ord_xls.png">'
        })

        cpb = document.getElementById(cpb)

        setTimeout(function select_focus_copy_paste(){
            cpb.value = ''
            cpb.focus()
            cpb.select()
        }, 128)
        return cpb.addEventListener('keydown', on_keydown, true)

        function on_keydown(ev){
            if(ev.ctrlKey && (86 == ev.keyCode)){
                setTimeout(function cleanup_paste(){
                    cpb.remove()//selection in chrome
                    cpb.removeEventListener('keydown', on_keydown)
                    Ext.Msg.hide()
                    if(callback){
                        callback(me.store, me.orderId, cpb.value)
                        me.bindedGZises = false
                        me.autoSizeColumns()
                    }
                    cpb.value = null
                    cpb = null
                }, 16)
            }
        }
    },

    addItemsInStock: function addItemsInStock(btn){
    var me = btn.up('grid')
       //,header = me.headerCt.getGridColumns()
       ,sm = me.getSelectionModel()
       ,models = sm.getSelection()

        btn = l10n.so.in_stock_new + me.title

        if(!models.length){
            return Ext.Msg.show({
                title: btn,
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.ERROR,
                msg: l10n.so.no_data_ins
            })
        }
        //sm = me.store.proxy.reader.metaData
        //!sm.count_i && (sm.count_i = 1)
        return Ext.Msg.show({
            title: btn,
            fn: ins_processModels,
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            width: 377,
            prompt: true, minWidth: 333,
            value: models[0].data.id_mfg + ' ' +
                l10n.so.in_stock_doc + Ext.Date.format(new Date, 'Y-m-d'),
            msg: Ext.String.format(
                l10n.so.in_stock_models, models.length
            )
        })

        function ins_processModels(btn, text){
        var i, ins, t

            if('yes' != btn) return

            ins = new Array(models.length)
            for(i = 0; i < models.length; ++i){
                ins[i] = models[i].data.id_mpcode
            }

            t = me.up('so_tabs')
            t.add({
                closable: true,
                title: me.title + ' ' + l10n.so.in_stock_title + ' ' + l10n.so.no + ' ',
                orderId: me.orderId,// postfix in store url
                soItems: { cmnt: text, id_mpcodes: ins },// array of id_mpcode
                itemId: i = 'i' + me.orderId + '_' + (new Date).valueOf(),// storeId, not a string!!!
                xtype: 'so_gridInStockItems'
            })
            t.setActiveTab(i)
            //sm.deselectAll(true)
        }
    }
})


/* I N   S T O C K */


Ext.define('App.shoesupro.view.GridInStockList',{
    extend: App.shoesupro.view.GridOrderItems,
    xtype: 'so_gridInStockList',
    iconCls: "icon-ins",
    storeURL: '/shoesupro/lib/logic/seasn/i',//NOTE: 'i' -- db collection name prefix
    storeModel: App.shoesupro.model.InStockList,
    bindGZises: false,//cfg
    initComponent: function initGridInStockList(){
    var me = this, s

        l10n._ns = 'so'
        Ext.applyIf(me,{//TODO dynamic auth-z-n selection of available buttons
            dockedItems:[{
                xtype: 'toolbar',
                dock: 'top',
                layout:{ overflowHandler: 'Menu' },
                items:[
                {
                    iconCls: 'icon-ins-leaf',
                    text: l10n('open_season_insd'),
                    //action: 'so_gridInStockItems'
                    handler: openINS
                },'-'
               ,{
                    iconCls: 'so-refresh',
                    text: l10n('refresh'),
                    scope: me,
                    handler: me.refreshGrid
                },'-'
               ,{
                    iconCls: 'doc-history',
                    text: l10n('view_history'),
                    handler: me.viewHistory
                }
               ,{
                    iconCls: 'doc-export-xls',
                    text: l10n('export_xls'),
                    handler: me.exportXLS
                }
               /*,{
                    iconCls: 'so-row-add',
                    text: l10n('addrow'),
                    action: 'addrow'
                }
               ,{
                    iconCls: 'so-row-del',
                    text: l10n('delrow'),
                    action: 'delrow'
                }, '-'
               ,{
                    iconCls: 'doc-add',
                    text: l10n('add_skus'),
                    handler: addItems
                }
               ,{
                    iconCls: 'doc-add',
                    text: l10n('order_sizes'),
                    handler: addItems
                }, '-'*/
                ]
            }
            ]
        })
        l10n._ns = ''

        if(!me.store){// not inherited
            me.on('itemdblclick', openINS)
        }

        me.callParent(/*GridOrderItems*/)
        return

        function openINS(){
        var i, t = me.up('so_tabs')
           ,item = me.view.selModel.getSelection()[0]
           ,n = item && item.data.id

            if(!n) return
            me.view.selModel.select(item)// single select

            t.add({
                closable: true,
                title: me.title + ' ' + l10n.so.in_stock_title + ' ' + l10n.so.no + ' ' + n,
                orderId: me.orderId,// postfix in store url
                soItems: parseInt(n, 10),
                itemId: i = 'i' + me.orderId + '_' + (new Date).valueOf(),// storeId, not a string!!!
                xtype: 'so_gridInStockItems'
            })
            t.setActiveTab(i)
        }
    }
})

Ext.define('App.shoesupro.view.GridInStockItems',{
    extend: App.shoesupro.view.GridInStockList,
    xtype: 'so_gridInStockItems',
    iconCls: "icon-ins-leaf",
    storeModel: App.shoesupro.model.InStockItems,
    bindGZises: true,//cfg
    initComponent: function initGridInStockItems(){
    var me = this, s

        l10n._ns = 'so'
        Ext.applyIf(me,{//TODO dynamic auth-z-n selection of available buttons
            dockedItems:[{
                xtype: 'toolbar',
                dock: 'top',
                layout:{ overflowHandler: 'Menu' },
                items:[
                /*{
                    iconCls: 'so-undo',
                    text: l10n('undo'),
                    handler: me.undoStoreChanges
                }*/
                {
                    iconCls: 'so-save',
                    text: l10n('save'),
                    handler: me.syncStore
                }, '-'
               ,{
                    iconCls: 'so-commit',
                    text: l10n('commit'),
                    handler: me.commitInStock,
                    scope: me
                }, '-'
               /*,{
                    iconCls: 'so-row-add',
                    text: l10n('addrow'),
                    action: 'addrow'
                }
               ,{
                    iconCls: 'so-row-del',
                    text: l10n('delrow'),
                    action: 'delrow'
                }, '-'
               ,{
                    iconCls: 'doc-add',
                    text: l10n('add_skus'),
                    handler: addItems
                }*/
               ,{
                    iconCls: 'doc-add',// NOTE: used in logic: `distribAll()`
                    text: l10n('ins_distr'),
                    scope: me,
                    handler: me.distribAll
                }
                ,{
                    iconCls: 'doc-del',
                    text: l10n('ins_distrz'),
                    scope: me,
                    handler: me.distribAll
                },'-'
               ,{
                    iconCls: 'so-refresh',
                    text: l10n('refresh'),
                    scope: me,
                    handler: me.refreshGrid
                }
                ]
            }
            ]
        })
        l10n._ns = ''

        // bind tab with grid to the document in the DB

        me.on('reconfigure', function(_, __, ___, store){
        var m = store.proxy.reader.metaData
            if(m && (_ = m['#'])){
                if(me.soItems){// initial store reconfigure
                   /*
                    * assign document number here-------\
                    * ref: '/shoesupro/lib/logic/seasn/i5_3'
                    */
                    store.proxy.url += '_' + _
                    me.setTitle(me.title + _)
                    me.soItems = null
                }
            }
            me.setLoading(!true)
        })

        s = me.storeURL + me.orderId
        if('number' == typeof me.soItems){// list ins items from doc#
            s += '_' + me.soItems + '+init',
            me.soItems = 0
        } else {// new doc
        /*
         * Creating a new document with single request via Store is impossible.
         * It craps something while sending data and reading it back to existing
         * items.
         *
         * Thus create doc and configre grid && store via `backend.req()`
         **/
            App.backend.req(s + '+init', me.soItems, function on_insDB(err, json){
                if(err || !json.metaData) return Ext.Msg.show({
                    title: l10n.so.in_stock_new,
                    buttons: Ext.Msg.OK,
                    icon: Ext.Msg.ERROR,
                    msg: l10n.err_crud_proxy + ' (no_meta)'
                })
                me.store.proxy.extraParams['edit'] = json.metaData.edit
                me.store.proxy.reader.metaData = json.metaData
                me.store.model.setFields(json.metaData.fields)
                me.reconfigure(null, json.metaData.columns)

                for(var i = 0; i < json.data.length; ++i){
                    json.data[i] = new me.store.model(json.data[i])
                }
                me.store.totalCount = json.data.length
                me.store.loadRecords(json.data, me.store.addRecordsOptions)

                return undefined
            })
        }
        me.store = new App.shoesupro.Store({
            url: s,
            model: App.shoesupro.model.InStockItems,
            storeId: me.itemId
        })

        me.callParent(/*GridOrderItems*/)// call inherited

        if(!me.soItems){// open existing doc
            me.setLoading(true)
            me.store.load()
        }

        return
    },

    distribAll: function distribAll(btn){
    var i, s, j, f
       ,me = this, item = me.store.getRange(), set = btn.iconCls == "doc-add"

        me.setLoading(true)
        Ext.suspendLayouts()
        for(i = 0; i < item.length; ++i){
            f = false// update flag
            s = item[i].data
            for(j = 0; j < s.g_sizes.length; ++j)
            if(set){// set in stock, zero ord
                s.g_sizes[j].o = 0// virtual field
                s.g_sizes[j].i = s.g_sizes[j].w
                f || (f = true)
            } else if(s.g_sizes[j].i){// zero in stock, set ord
                s.g_sizes[j].i = 0
                s.g_sizes[j].o = s.g_sizes[j].w// virtual field
                f || (f = true)
            }
            f && (item[i].modified.g_sizes = null)// mark
        }
        me.bindedGZises = false
        me.autoSizeColumns()
        Ext.resumeLayouts(true)
        me.setLoading(false)
        me.view.refresh()
    },

    commitInStock: function commitInStock(btn){

    }
})


/*  O B J E C T  */

Ext.define('App.shoesupro.view.AllObjectStat',{
    extend: Ext.container.Container,
    xtype: 'so_allObjectStat',
    layout: 'border',
    title: l10n.so.objects,
    iconCls: 'icon-rem',
    items:[
        { xtype: 'so_gridObjectStat', flex: 1, region: 'center' },

        {// TODO: real chart of season totals
            xtype: 'image', src: App.backendURL + '/css/shoesupro/dummy_chart.png'
           ,height: 122, region: 'south'
        }
    ]
})

App.cfg.modelObjectStat = {
    url: '/shoesupro/lib/logic/objct/stat',
    fields:[
    'add_by',
    'edit_by',
    'name',
    'more',
    'square',
    'whvolume',
    'remote',
    { name: 'add',  type: 'date' },
    { name: 'edit', type: 'date' },
    '#'
    ],
    columns:[
    {
        dataIndex: '#', text: l10n.so.no, width: 44,
        renderer:
        function(n){
            return ''
+'<div style="color:#000080;font-weight:bold;font-size: 1.2em;text-align:center;">'
+'<br>' + n + '<br>&nbsp;'
+'</div>'
        }
    },
    {
        text: l10n.so.clmn.dates_add_edit,
        width: 200,
        renderer:
        function(_, __, model){
        var data = model.data
            return '<div class="so-clmn-dates-add-edit">' +
Ext.Date.format(data.add, 'Y/m/d H:i:s l') + '<br>' +
(data.edit ? Ext.Date.format(data.edit, 'Y/m/d H:i:s l') : l10n('')) + '</div>'
        }
    },
    {
        text: l10n.so.clmn.ce_by,
        renderer:
        function(_, __, model){
        var data = model.data
            return '<div class="so-clmn-padd">' +
data.add_by + '<br>' +
(data.edit_by ? data.edit_by : l10n('')) + '</div>'
        }
    },
    {
        dataIndex: 'name',
        text: l10n.so.orders + ' ' + l10n.so.seasons,
        flex: 1
    },
    {
        text: l10n.so.clmn.totals,
        width: 167,
        renderer:
        function(_, __, model){
        var data = model.data
            return '<table class="x-grid-cell x-grid-td"><tbody><tr><td>' +
l10n.so.total_ord + ':' + '</td><td><b style="color:#C6205E">' +
data.square + '</b></td></tr><tr><td>' +
l10n.so.total_ins + ':' + '</td><td><b style="color:#7D7D7D">' +
data.whvolume + '</b></td></tr></tbody></table>'
        }
    },
    { dataIndex: 'add',     text: l10n.so.clmn.add, hidden: true },
    { dataIndex: 'add_by',  text: l10n.so.clmn.add_by, hidden: true },
    { dataIndex: 'edit',    text: l10n.so.clmn.edit, hidden: true },
    { dataIndex: 'edit_by', text: l10n.so.clmn.edit_by, hidden: true },
    { dataIndex: 'more',    text: l10n.so.clmn.more, hidden: true },
    { dataIndex: 'whvolume',text: l10n.so.clmn.whvolume, hidden: true },
    { dataIndex: 'square',  text: l10n.so.clmn.square, hidden: true }
    ]
}

Ext.define('App.shoesupro.model.ObjectStat',{
    extend: App.model.BaseCRUD,
    fields: App.cfg.modelObjectStat.fields,
    idProperty: '#'// object counter
})

Ext.define('App.shoesupro.view.GridObjectStat',{
    extend: Ext.grid.Panel,
    xtype: 'so_gridObjectStat',

    header: false,
    border: 0,
    viewConfig:{
        emptyText: l10n.emptyTextGrid,
        deferEmptyText: false
        //,getRowClass: function(record){
        //    return record.get('n') ? 'new-bold-row' : ''
        //}
    },
    initComponent: function(){
    var sid, edit, me = this

        l10n._ns = 'so'
        Ext.applyIf(me,{
            columns: App.cfg.modelObjectStat.columns,
            dockedItems:[{
                xtype: 'toolbar',
                dock: 'top',
                layout:{ overflowHandler: 'Menu' },
                items:[
                {
                    iconCls: 'doc-add',
                    text: l10n('add_obj'),
                    scope: me,
                    handler: me.add_editObject
                }
               ,{
                    iconCls: 'doc-edit',
                    text: l10n('edit_obj')
                    //action: 'edit_season'
                },'-'
               ,{
                    iconCls: 'icon-sel',
                    text: l10n('show_models')
                    //action: 'so_gridOrderItems'
                }
               ,{
                    iconCls: 'icon-distr',
                    text: l10n('show_distr')
                    //action: 'so_gridInStockList'
                },'-'
               ,{
                    iconCls: 'so-refresh',
                    text: l10n('refresh'),
                    scope: me,
                    handler: me.refreshGrid
                }/*,'-'
               ,{
                    iconCls: 'doc-history',
                    text: l10n('view_history'),
                    scope: me,
                    handler: me.viewHistory
                }
               ,{
                    iconCls: 'doc-export-xls',
                    text: l10n('export_xls'),
                    scope: me,
                    handler: me.exportXLS
                }*/
                ]
            }]
        })
        l10n._ns = ''

        sid = 'so_object'
        if(!me.store){// not inherited call
            me.store = Ext.StoreManager.lookup(sid) ||
                       Ext.create(App.shoesupro.Store,
            {
                storeId: sid,
                url: App.cfg.modelObjectStat.url,
                autoLoad: true,
                remoteGroup: false,
                remoteSort: false,
                //sortOnLoad: true,
                //sorters:{ direction: 'DESC', property: '#' },
                model: App.shoesupro.model.ObjectStat
            })
        }
        me.on('destroy', function destroyGridObjectStat(){
            Ext.StoreManager.unregister(sid)
        })

        me.on('select', function(){
            edit.disabled && edit.enable()
        })

        //me.on('itemdblclick': openSeason,


        me.callParent()

        edit = me.down('button[iconCls=doc-edit]')
        edit.disable()

        setTimeout(function dev(){
            me.down('button[iconCls=doc-add]').handler.call(me, 1, 3)
            //me.getView().getSelectionModel().select(0)//!!!dev
            //if(!edit.disabled) edit.fireEvent('click')//!!!dev of the items grid
        }, 128)
    },

    //addObject: function addObject(btn){
    //    (new App.shoesupro.view.WinObject).show()
    //    console.log('addObject')
    //},


    add_editObject: function add_editObject(edit, ev){
    var model
       ,store = this.store
       ,win = new App.shoesupro.view.WinObject
       ,formData = win.down('form').getForm()
       ,finish_btn = win.down('button#create')
console.log(arguments)
        if(ev){// button event -- new
            model = new store.model({
                //'#': `idProperty` must be filled by backend
                '#': 0,
                add: new Date,
                whvolume: 0,
                square: 0,
                more: '',
                add_by: App.User.data.name
            })
            finish_btn.setText(l10n.btnAdd)// change inherited defaults
        } else {// edit
            finish_btn.setText(l10n.btnEdit)
            //model = edit
        }
        formData.loadRecord(model)// load data into form

        setTimeout(function ugly_crutch(){
            formData.wasDirty = false
            formData.on('dirtychange',function(){
                finish_btn.disabled && finish_btn.enable()
            })
        }, 128)
        finish_btn.disable()
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
                    store.add([ model ])
                } else {
                    model.callStore('afterEdit')
                }

                return store.sync({
                    success: function(){
                        win.close()
                    },
                    failure: function(){
                    // store must show error message via `handleStoreException()`
                        store.rejectChanges()
                    }
                })
            }
        })
        win.show()
    },

    viewHistory: function viewHistory(btn){
    /*var me = this, tabs, n, t

        if(!(n = me.orderId)){// stat or items grids
            t = me.getView().getSelectionModel().getSelection()[0]
            if(!t || !(n = t.data['#'])) return
        }

        t = l10n.so.no + ' ' + n + ' ' + l10n.so.view_history
        n = 'hn' + n

        tabs = me.up('tabpanel')
        if(!(btn = tabs.items.getByKey(n))){
            tabs.add({
                xtype: 'so_gridOrderHist',
                itemId: n,
                closable: true,
                title: t
            })
        } else {
            btn.store.load({ action: 'read', start: 0 })
        }

        tabs.setActiveTab(n)*/
    },

    refreshGrid: function refreshGrid(){
        this.store.reload({ action: 'read', start: 0 })
    }
})

Ext.apply(Ext.form.field.VTypes,{
    soObjName: function(val){
        return val.length > 2 && !val.replace(/\w*/, '')
    },
    soObjNameMask: /[\w]/,
    soObjNameText: l10n.so['~latin']
})

Ext.define('App.shoesupro.view.FormObject',{
    extend: Ext.form.Panel,
    xtype: 'so_formObject',
    layout: 'vbox',
    border: 0,
    bodyPadding: 4,
    fieldDefaults:{
        allowBlank: false,
        labelAlign: 'left',
        margins: 4
    },
    items:[
    {
        xtype: 'container',
        layout: 'hbox',
        defaults:{
            margins: 4
        },
        items:[
        {
            xtype: 'fieldset',
            layout: 'vbox',
            title: l10n.so.fsetObjectType,
            width: 194,
            items:[
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                margins: 0,
                items:[
                {
                    xtype: 'textfield',
                    cls: 'so-object-id',
                    labelWidth: 24,
                    name: 'name',
                    width: 168,
                    allowBlank: false,
                    disabled: true,
                    listeners:{
                        afterrender: formObject_setInputTips
                    },
                    vtype: 'soObjName',
                    fieldLabel: l10n.so.id
                }
                ]
            },
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                margins: 0,
                items:[
                {
                    xtype: 'image',
                    cls: 'so-season-img',
                    itemId: 'shop',
                    src: App.backendURL + '/css/shoesupro/RoundIcons-Free-Set-56.png',
                    listeners:{
                        afterrender: formObject_setType
                    }
                },
                {
                    xtype: 'image',
                    cls: 'so-season-img',
                    itemId: 'warehouse',
                    src: App.backendURL + '/css/shoesupro/dolly.png',
                    listeners:{
                        afterrender: formObject_setType
                    }
                }
            ]
            }
            ]
        },
        {
            xtype: 'fieldset',
            title: l10n.so.fsetObjectMore,
            //flex: 1,
            width: 377,
            items:[
            {
                xtype: 'textfield',
                cls: 'so-object-more',
                anchor: '100%',
                allowBlank: false,
                disabled: true,
                //itemId: 'name',
                listeners:{
                    afterrender: formObject_setInputTips
                },
                name: 'more'
            },
            {
                xtype: 'container',
                layout: 'hbox',
                items:[
                {
                    xtype: 'fieldcontainer',
                    items:[
                    {
                        xtype: 'displayfield',
                        name: 'add_by',
                        width: 177,
                        labelWidth: 47,
                        fieldLabel: l10n.so.clmn.add_by,
                        renderer: function(){
                            return ''
+ '<div style="border: 1px solid #FF7700;padding: 4px;font-weight: bold;">'
+ App.User.data.name + '</div>'
                        }
                    },
                    {
                        xtype: 'datefield',
                        name: 'add',
                        width: 177,
                        labelWidth: 47,
                        format: "Y-m-d H:i",
                        fieldLabel: l10n.so.clmn.add
                    }
                    ]
                },
                {
                    xtype: 'fieldcontainer',
                    items:[
                    {
                        xtype: 'numberfield',
                        name: 'square',
                        width: 127,
                        labelWidth: 65,
                        minValue: 0,
                        afterBodyEl: '&nbsp;(' + l10n.so.m2 + ')',
                        fieldLabel: l10n.so.clmn.square
                    },
                    {
                        xtype: 'numberfield',
                        name: 'whvolume',
                        width: 127,
                        labelWidth: 65,
                        minValue: 0,
                        afterBodyEl: '&nbsp;(' + l10n.so.m3 + ')',
                        fieldLabel: l10n.so.clmn.whvolume
                    }
                    ]
                }
                ]
            }
            ]
        }
        ]
    }// first row
   ,{
        xtype: 'fieldset',
        title: l10n.so.fsetObjectConfig,
        //flex: 1,
        layout: 'hbox',
        anchor: '100%',
        margins: 4,
        defaults:{
            margins: 4
        },
        width: 577,
        items:[
        {
            xtype: 'checkbox',
            width: 477,
            boxLabel: l10n.so.objRemote,
            //itemId: 'remote',
            name: 'remote'
        }
        ]
        //{
    }
    ],
    initComponent: function initFormObject(){
    var me = this

        me.callParent()
//todo: checkbox: transport, user/role on object management
        return

    },

    setObjectType: function setObjectType(type){
        type.el.addCls('selected')
        if('s' == type.itemId[0]){
            this.down('#warehouse').el.removeCls('selected')
        } else {
            this.down('#shop').el.removeCls('selected')
            type = null
        }
        this.getForm().setValues(type ?
             { name: 'S_..', more: l10n.so.shop } :
             { name: 'W_..', more: l10n.so.warehouse }
        ).updateRecord()

        type = this.query('[xtype=textfield]')
        Ext.Array.each(type, function(cmp){
            cmp.enable()// enable input fields after click on type
        })
        type[0].focus()// focus id input
    }

})

function formObject_setInputTips(cmp){
    Ext.widget('tooltip',{
        target: cmp.getEl(),
        html: l10n.so.tipObject[cmp.name]
    })
}

function formObject_setType(cmp){
    cmp.el.on('click', function(){
        cmp.up('form').setObjectType(cmp)
    })

    Ext.widget('tooltip',{
        target: cmp.getEl(),
        html: l10n.so[cmp.itemId]
    })
}

Ext.define('App.shoesupro.view.WinObject',{
    extend: App.shoesupro.view.WinOrder,
    xtype: 'so_winObject',
    title: l10n.so.objects,
    iconCls: 'icon-rem',
    width: 605,
    //heigth: 222,
    tools:[{
        type: 'help',
        tooltip: l10n.so.tipObject.WinObjects,
        callback: App.getHelpAbstract
    }],
    items:[{ xtype: 'so_formObject' }]
})

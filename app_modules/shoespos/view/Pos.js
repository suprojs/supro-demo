Ext.syncRequire( '/l10n/' + l10n.lang + '_shoespos')// require l10n first time

Ext.define('App.shoespos.view.Pos',
{
    extend: App.view.Window,
    title: l10n.sp.title,
    wmImg: App.backendURL + '/shoespos/pos.png',
    wmTooltip: 'Point of Sale',
    wmId: 'shoespos.view.Pos',
    id: 'shoespos-view-Pos',
    width: 777, height: 577,// initial
    items:[
    {
        xtype: 'tabpanel',
        activeTab: 1,
        items:[
        {// ==== POS action selection ====
            title: l10n.sp.select_action,
            layout: 'hbox',
            margin: '44 0 0 0',
            items:[
            { /*spacer*/ xtype: 'component', width: 123, flex: 1 },
            {
                xtype: 'button',
                text:  '<img height="74" width="68" src="' + App.backendURL +
'/shoespos/css/out.png"/>' +
'<br/><br/>' +
'<b style="font-size: 14pt">' + l10n.sp.selling + '</b><br/>'
                ,height: 123 ,width:123
            },
            { /*spacer unflexible*/ xtype: 'component', width: 123 },
            {
                xtype: 'button',
                text:  '<img height="74" width="68" src="' + App.backendURL +
'/shoespos/css/ret.png"/>' +
'<br/><br/>' +
'<b style="font-size: 14pt">' + l10n.sp.returns + '</b><br/>'
                ,style:'font-size:14pt'
                ,height:123 ,width:123
            },
            { /*spacer*/ xtype: 'component', width: 123, flex: 1 }
            ]
        },
        {// ==== POS action: sell ====
            title: l10n.sp.selling,
            layout: 'border',
            itemId: 'sell',
            items:[
            {
                region: 'west',
                xtype: 'panel',
                title: l10n.sp.sku,
                split: true,
                autoScroll: true,
                minHeight: 150,
                minWidth: 166,
                width: 166,
                tbar:[{ xtype: 'textfield', flex: 1 }],
                tools:[{ type: 'help', tooltip: l10n.sp.sku_help }],
                items:[{ xtype: 'sku_browser' }]
            },
            {
                region: 'center',
                xtype: 'container',
                minHeight: 150,
                minWidth: 260,
                layout:{ type: 'hbox', align: 'stretch' },
                items:[
                    { xtype: 'sku_scale' }
                   ,{ xtype: 'sku_info', width: 220 }
                ]
            },
            {
                region: 'east',
                split: true,
                layout:{ type: 'hbox', align: 'stretch' },
                title: l10n.sp.cart_title,
                items:[
                    { xtype: 'sp_cash_seller' }
                   ,{ xtype: 'cart_view' }
                ]

            },
            {
                region: 'south',//, html:'1232222',
                //title: 'customers/ % with fill form',
                split: true,
                collapsible: true,
                height: '33%',
                minHeight: 20,
                xtype:'sp_customers'
            }
            ]
        },
        {// ==== POS action return back ====
            title: l10n.sp.returns,
            layout: 'border',
            itemId: 'ret',
            items:[
            {
                region: 'west',
                xtype: 'panel',
                title: l10n.sp.sku,
                split: true,
                autoScroll: true,
                minHeight: 150,
                minWidth: 166,
                width: 166,
                tbar:[{ xtype: 'textfield', flex: 1 }],
                tools:[{ type: 'help', tooltip: l10n.sp.sku_help }],
                items:[{ xtype: 'sku_browser' }]
            },
            {
                region: 'center',
                xtype: 'container',
                minHeight: 150,
                minWidth: 260,
                layout:{ type: 'hbox', align: 'stretch' },
                items:[
                    //{ xtype: 'sku_scale', itemId: 'ret' }
                   //,{ xtype: 'sku_info', itemId: 'ret', width: 220 }
                ]
            }
            ]
        }
        ]
    }
    ]
}
)

Ext.define('App.shoespos.SKUBrowser',{
    extend: Ext.view.View,
    xtype: 'sku_browser',
    componentCls: 'sku-browser', // CSS binding
    singleSelect: true,
    overItemCls: 'x-view-over',
    itemSelector: 'div.thumb-wrap',
    enableKeyEvents: true,
    tpl:[
        // '<div class="details">',
            '<tpl for=".">',
                '<div style="min-width:144px;" class="thumb-wrap">',
'<center><b>{pcode}</b></center>',
                    '<div class="thumb">'
+'<img style="width:77px;float:left;padding-right:4px" src="' + App.backendURL
+'/css/shoespos/shoes/{pcode}.jpg"/>'
+'{prodname}<br>'
+'{gend}<br>'
+'<br>'
+'<br>'
+'<br>'
+'<b style="font-size:10pt">1 200 000 р.</b>'
,
                    '</div>',
                '</div>',
            '</tpl>'
        // '</div>'
    ],

    initComponent:
    function initSKUBrowser() {
        this.store = Ext.create('Ext.data.Store', {
            autoLoad: true,
            fields: ['pcode', 'gend', 'prodname', 'g_sizes'],
            proxy: {
                type: 'ajax',
                url : '/shoespos/lib/shoes.json',
                reader: {
                    type: 'json',
                    root: ''
                }
            }
        })

        this.on({
            selectionchange:
            function dataview_keypress_scrolling_fix(sm, selections){
            var selected = selections[0]
                if (selected){
                    sm.view.getNode(selected, true).scrollIntoView()//very fancy...
                }
            }
        })

        this.callParent()
    }
})

Ext.define('App.shoespos.SKUInfo',
{
    extend: Ext.Component,
    xtype: 'sku_info',
    componentCls: 'sku-info',// CSS binding
    width: 233,
    minWidth: 150,

    updateSKU:
    function updateSKU(data){
        data && this.update(
'<div class="sku-details">' +
    '<b>Название: </b>' +
    data.prodname + '<br>' +
    '<b>Артикул: </b>' +
    data.pcode + '<br>' +
    '<b>Размеры, кол-во:</b><br>' +
    data.g_sizes +
    '<img src="' + App.backendURL + '/css/shoespos/shoes/' + data.pcode + '.jpg"/><br>' +
'</div>'
        )
    }
}
)

Ext.define('App.shoespos.SKUScales',
{
    extend: Ext.grid.Panel,
    xtype: 'sku_scale',
    width: 104,
    minWidth: 104,
    store:{
        fields: ['s', 'c']
    },
    columns:[
        {
            text: l10n.sp.scale,  dataIndex: 's', width: 51,
            renderer:
            function(v){
                return '<div style="color:blue;text-align:right;font-weight:bold">' + v + '</div>'
            }
        },
        { text: l10n.sp.count, dataIndex: 'c', width: 51 }
    ]
    ,viewConfig: {
        getRowClass: function getRowClassSKUScales(model){
            return "0" !== model.data.c ? '' : 'row-zero'
        }
    }
}
)

Ext.define('App.shoespos.Cash',
{
    extend: Ext.Container,
    xtype: 'sp_cash_seller',
    width: 234,
    minWidth: 160,
    margin: '4 22 0 4',
    layout:{ type: 'vbox', align: 'stretch' },
    items:[
    {
        xtype: 'fieldset',
        title: 'Цена:',
        padding: 4,
        layout:{ type: 'vbox', align: 'stretch' },
        items:[
        {
            xtype: 'textfield',
            name: 'Cash',
            labelAlign: 'top',
            minHeight: 52,
            fieldStyle: 'font-size:17pt;font-weight:bold;color:blue'
        },
        {
            xtype: 'button',
            iconCls: 'ok',
            width:'100%',
            text: '<b style="font-size: 12pt">Внести  модель в чек</b>'
        }
        ]
    },
        {
        xtype: 'fieldset',
        title: 'Продавец:',
        padding: 4,
        flex: 1,
        layout:{ type: 'vbox', align: 'stretch' },
        items:[
        {
            xtype: 'grid',
            //name: 'Cash',
            labelAlign: 'top',
            hideHeaders: true,
            flex: 1,
            store:
            {
                fields: ['p'],
                data: [
                    { p: 'Вася' },
                    { p: 'Федя' },
                    { p: 'Ваня' }
                ]
            },
            columns:
            {
                items:[
                {
                    width: '100%',
                    dataIndex: 'p'
                }
                ]
            }
            //fieldStyle: 'font-size:17pt;font-weight:bold;color:blue'
        },
        {
            xtype: 'button',
            text:  '<img height="74" width="68" src="' + App.backendURL +
'/shoespos/css/out.png"/>' +
'<br/><br/>' +
'<b style="font-size: 14pt">' + l10n.sp.selling + '</b><br/>'
            ,height: 123 ,width:123
        }
        ]
    }
    ]
}
)
Ext.define('App.shoespos.Cart',
{
    extend: Ext.Container,
    xtype: 'cart_view',
    componentCls: 'cart-view',// CSS binding
    width: 256,
    height: 123,
    minWidth: 160,
    layout: 'vbox',
    /*layout:{
        type: 'table',
        columns: 1,
        tdAttrs:{
            style: 'vertical-align: top;'
        }
    },*/
    items:[
        {//TODO: add `renderSelectors` && `renderTpl`
            xtype: 'box',
            width: 242,
            html: '<pre>'+
'**********************************\n'+
'*           -= VITO =-           *\n'+
'* Address                        *\n'+
'**********************************\n'+
'* Personel: Name Surname\n'+
'* Item\n'+
'----------------------------------</pre>'
        },
        {
            xtype: 'cart_items',
            width: 248,
            maxHeight: 88// 4 items
        },
        {
            xtype: 'box',
            width: 222,

            html: '<pre>'+
'*********************************\n'+
'* Summ: 1 230 000\n'+
'*********************************\n'+
'</pre><b style="font-size:14pt">' + l10n.sp.total + '</b><br>'+
'<b style="font-size:20pt">1 230 000=</b><br>'+
'<b style="font-size:14pt;color:blue">' + '1 300 000=</b>(' + l10n.sp.paid + ')<br>'+
'<b style="font-size:18pt;color:red">70 000=</b>(' +l10n.sp.change + ')'
        }
    ]
}
)

Ext.define('App.shoespos.CartItems',
{
    extend: Ext.grid.Panel,
    xtype: 'cart_items',
    hideHeaders: true,
    store: { fields: ['i'] },
    columns:{
        items:[
    {
        dataIndex: 'i', width: 216,
        renderer:
        function(i){
            return '<div style="color:green;text-align:left;font-weight:bold">' + i + '</div>'
        }
    },
    {
        xtype: 'actioncolumn',
        width: 22,
        items: [{
            icon: App.backendURL + '/css/delete.png'
            ,tooltip: 'delete'
            ,handler: function(gridview, rowIndex, colIndex){
                if(1 == gridview.store.getCount()){
                    var b = Ext.getCmp('pasteSMS').down('toolbar')
                    b.getComponent('addsmsq').disable()
                    b.getComponent('rmsmsq').disable()
                }
                Ext.animateNode(gridview.getNode(rowIndex), 1, 0, {
                    afteranimate: function(){
                        gridview.store.removeAt(rowIndex)
Ext._log("rowIndex, colIndex: " + rowIndex + ", " +colIndex)
                        gridview.refresh()
                    }
                })
            }
        }]
    }
//    { text: l10n.sp.count, dataIndex: 'c', width: 44 }
    ]
    }
}
)

Ext.define('App.shoespos.Customers', {
    extend: Ext.form.Panel,
    xtype: 'sp_customers',
    title: 'Покупатель (выбрать  или внести нового)',
    layout: 'hbox',
    bodyPadding: 4,
                fieldDefaults: {
                allowBlank: false,
                labelAlign: 'top'
                //flex: 1
                //margins: 5
            },
            items: [
                {
                    xtype: 'fieldcontainer',
                    margin: 4,
                    padding: 4,
                    defaults: {
                        labelAlign: 'left'
                    },
                    items: [
                        {
                            xtype: 'textfield',
                            name: 'FirstName',
                            fieldLabel: 'Фамилия'
                        },
                        {
                            xtype: 'textfield',
                            name: 'LastName',
                            fieldLabel: 'Имя'
                        },
                        {
                            xtype: 'datefield',
                            name: 'DOB',
                            fieldLabel: 'Скидка'
                        },
                        {
                            xtype: 'textfield',
                            name: 'LastName',
                            fieldLabel: 'Ещё инфромация'
                        }
                    ]
                },

                {
                    xtype: 'container',
//title: 'Fieldset 1',
//        defaultType: 'textfield',
        defaults: {anchor: '100%'},
        layout: 'anchor',
        margin: 4,
        width: 256,

        // The body area will contain three text fields, arranged
        // horizontally, separated by draggable splitters.
        //layout: 'vbox',
                    items:[
                        {
                            xtype: 'button',

                            iconCls: 'ok',
                            width:'100%',
                            margin: '0 10 10 0',
                            height: 77,
                            text: '<b style="font-size: 14pt">Добавить покупателя</b>'
                        },
                        {
                            xtype: 'button',
                            margin: '0 10 0 0',
                            width:'100%',
                            iconCls: 'cancel',
                            text: '<b style="font-size: 14pt">Очистить форму</b>'
                        }
                    ]
                }
                ]


    /*initComponent: function() {
        var me = this;
        Ext.applyIf(me, {
            fieldDefaults: {
                allowBlank: false,
                labelAlign: 'top',
                flex: 1,
                margins: 5
            },
            defaults: {
                layout: 'hbox',
                margins: '0 10 0 10'
            }
            })}/*
            items: [
                {
                    xtype: 'fieldcontainer',
                    items: [
                        {
                            xtype: 'textfield',
                            name: 'FirstName',
                            fieldLabel: 'First Name'
                        },
                        {
                            xtype: 'textfield',
                            name: 'LastName',
                            fieldLabel: 'Last Name'
                        },
                        {
                            xtype: 'datefield',
                            name: 'DOB',
                            fieldLabel: 'DOB'
                        }
                    ]
                },
                {
                    xtype: 'fieldcontainer',
                    items: [
                        {
                            xtype: 'textfield',
                            name: 'Username',
                            fieldLabel: 'Username'
                        }
                    ]
                }
            ]
        })
    }*/
}
)

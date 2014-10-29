Ext.ns ('App.supromongod.view.SuproMongoDB')    // define ns for class loader
App.cfg['App.supromongod.view.SuproMongoDB'] = {// fast init
    __noctl: true,// view-only stuff uses fast init
    extend: App.view.Window,
    title: l10n.mongo.title,
    wmTooltip: l10n.mongo.modname,
    wmImg: App.backendURL + '/css/supromongod/logo-mongodb.png',
    wmId: 'supromongod.view.SuproMongoDB',
    id: 'supromongod-view-SuproMongoDB',
    requires: ['App.supromongod.view.ControlTools'],
    width: 777, height: 477,// initial
    layout: 'fit',
    bodyStyle:
'font-family: "Lucida Console" monospace; font-size: 10pt;' +
'background-color: black; color: #00FF00;',
    autoScroll: true,
    initComponent: function initSuproMongoDBComponent(){
        this.items = [
        {
            xtype: 'component',
            style: 'white-space: pre-wrap',
            html: '<a target="_blank" href="https://github.com/suprojs/supromongod">https://github.com/suprojs/supromongod</a>',
            itemId:'log'
        }
        ]
        this.dockedItems = [
        {
            xtype: 'toolbar',
            dock: 'top',
            items:['-',
            {
                xtype: 'component',
                html: l10n.mongo.status,
                itemId: 'status'
            },'->','-',
            {
                text: 'mongo-edit',
                iconCls: 'sm-me',
                tooltip: 'run it manually by script <b>etc/_mongo_edit.[sh,cmd]</b>',
                href: 'http://localhost:2764/'
            },'-',
            {
                text: 'admin web console',
                iconCls: 'sm-ac',
                tooltip: 'enabled by <b>--rest --httpinterface</b> options',
                href: 'http://localhost:' + (
                    App.User.modules.extjs.mongodb_port + 1000
                ) + '/'
            },'-',
            {
                text: l10n.mongo.refreshLog
               ,iconCls: 'sm-rl'
               ,handler: function(toolbar){
                    App.backend.req('/supromongod/lib/api/log',
                    function(err, json){
                        if(!err && 'string' == typeof json){// expecting text
                            err = toolbar.up('panel')
                            err.down('#log').update(json)
                            err.scrollBy(0, 1 << 22, false)
                            return
                        }
                        // json = { success: false, err: "foo" }
                        Ext.Msg.show({
                            title: l10n.errun_title,
                            buttons: Ext.Msg.OK,
                            icon: Ext.Msg.ERROR,
                            msg: l10n.errapi + '<br><b>' + json.err + '</b>'
                        })
                    })
                }
            },
            {
                text: l10n.stsClean
               ,iconCls: 'sm-cl'
               ,handler: function(toolbar){
                    toolbar.up('panel').down('#log').update('')
                }
            }
            ]
        },
            Ext.create('App.supromongod.view.ControlTools')
        ]
        this.callParent()

        this.on('destroy', function(){
           App.backend.req('/supromongod/lib/dev')
        })
    }
}

Ext.syncRequire( '/l10n/' + l10n.lang + '_supromongod')// require l10n first time

App.view.items_Shortcuts = Ext.Array.push(App.view.items_Shortcuts || [ ],[
{
    text:
'<img height="76" width="76" src="' + App.backendURL +
'/css/supromongod/logo-mongodb-shortcut.png"/>' +
'<br/>' + l10n.mongo.modname
   ,height: 110 ,minWidth: 92
   ,tooltip: l10n.mongo.tooltip
   ,handler:
    function supromongod(btn){
    var tb = Ext.getCmp('wm').items.getByKey('supromongod.view.SuproMongoDB')
        if(tb){
            tb.toggle(true)
        } else {
            App.create('supromongod.view.SuproMongoDB', btn)
        }
    }
}
])

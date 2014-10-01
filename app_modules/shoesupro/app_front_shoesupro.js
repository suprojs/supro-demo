Ext.ns('App.shoesupro.controller')// needed namespace for bunch of ctl stuff
Ext.syncRequire( '/l10n/' + l10n.lang + '_shoesupro')// require l10n first time

App.view.items_Shortcuts = Ext.Array.push(App.view.items_Shortcuts || [],[
{
    text:
'<img height="74" width="68" src="' + App.backendURL +
'/css/shoesupro/fashion.png"/>' +
'<br/><br/>' + l10n.so.modname +
'<br/>'
   ,height: 110 ,minWidth: 92
   ,tooltip: l10n.so.tooltip
   ,handler:
    function launch_pos(btn){
    var tb = Ext.getCmp('wm').items.getByKey('shoesupro.view.Shoes')
        if(tb){
            tb.toggle(true)
        } else {
            App.create('shoesupro.controller.Shoes', btn)
        }
    }
}
])

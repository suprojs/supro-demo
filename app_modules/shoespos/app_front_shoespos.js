Ext.syncRequire( '/l10n/' + l10n.lang + '_shoespos')// require l10n first time

App.view.items_Shortcuts = Ext.Array.push(App.view.items_Shortcuts || [],[
{
    text:
'<img height="74" width="68" src="' + App.backendURL +
'/shoespos/pos.png"/>' +
'<br/><br/>' + l10n.sp.title +
'<br/>'
   ,height:110 ,minWidth:92
   ,tooltip: 'POS'
   ,handler:
    function launch_pos(btn){
    var tb = Ext.getCmp('wm').items.getByKey('shoespos.view.Pos')
        if(tb){
            tb.toggle(true)
        } else {
            App.create('shoespos.controller.Pos', btn)
        }
    }
}
])

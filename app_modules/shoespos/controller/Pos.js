(// support reloading for development
function(override){
var id = 'App.shoespos.controller.Pos'
   ,cfg = {
    extend: Ext.app.Controller,
    __name: id,
    /*models:[
        'chatUser'
    ],*/
    views:[
        'App.shoespos.view.Pos'
    ],
    /*refs:[
        { ref: 'Chat', selector: '[wmId=Chat]' }
    ],*/
    pos: null,// dev tools: App.getApplication().getController('App.shoespos.controller.Pos').pos
    init:
    function controllerPOSInit(){
    var me = this
       ,pos = new App.shoespos.view.Pos
       ,sku_browser_sell = pos.down('panel[itemId=sell] sku_browser')
       ,sku_info_sell = pos.down('panel[itemId=sell] sku_info')
       ,sku_scale_sell = pos.down('panel[itemId=sell] sku_scale')
       ,sku_input_sell = pos.down('panel[itemId=sell] textfield')
       ,cart_items = pos.down('cart_items')

       sku_input_sell.on({ change: function(f, v){
            var store = sku_browser_sell.store
            //dataview = this.down('dataview');

            store.suspendEvents();
            store.clearFilter();
            //dataview.getSelectionModel().clearSelections();
            store.resumeEvents();
    //        if (1<newValue.length) {
            store.filter({
                property: 'pcode',
                anyMatch: true,
                value   : v
            });

        }})



        me.pos = pos
        // setup POS
        sku_browser_sell.on({
            selectionchange: updateSellSKU
        })

        cart_items.store.add({i:'Туфли  1374_k45 .... =1 230 000'} )

        // init view
        pos.on({
            destroy: destroyPOS
        })

        pos.maximize()
        return

        function updateSellSKU(sm, models){
        var model = models.length && models[0].data
           ,items, data, d, i, n

            if(!model) return

            sku_info_sell.updateSKU(model)

            items = model.g_sizes.split(',')
            data = new Array(items.length)
            for(n = 0; n < items.length; ++n){
                i = items[n]
                d = i.indexOf('-')
                data[n] = { s: i.slice(0, d), c: i.slice(d + 1) }
            }
            sku_scale_sell.store.loadData(data)
        }

        function destroyPOS(){
            me.application.eventbus.unlisten(me.id)
            me.application.controllers.removeAtKey(me.id)
        }
    }
}
if(override) cfg.override = id
/* Notice: can not do it in `App.create()`. For some reason `Ext.define()`
 * fails to define controller. Also views reloaded from file and redefined
 * work OK. When redefined in run time something goes wrong and view
 * Class after destroying of an instance fails to create new ones...
 *
 * Thus there are classes with run time development reloading for
 * - controllers (this one),
 * - slow view:
 *   Ext.define('App.view.Chat',...)
 * - and fast view definitions (config only):
 *   App.cfg['App.view.Userman'] = { ... }
 **/
Ext.define(id, cfg)

})(App.shoespos && App.shoespos.controller.Pos)

Ext.define('App.shoesupro.store.TreeMainMenu',{
    extend: Ext.data.TreeStore,
    proxy: {
        type: 'ajax',
        url: App.backendURL + '/shoesupro/store/TreeMainMenu.json',
        reader: { type: 'json' }
    },
    autoLoad: true
});

Ext.define('App.shoesupro.view.TabPanel',{
    extend: Ext.tab.Panel,
    xtype: 'so_tabs',
    requires:[
        'Ext.uxo.TabReorderer',// with fixes
        'Ext.ux.TabCloseMenu'// TODO: l10n
    ],

    margins: '1 1 1 1',
    plugins:[
        { xclass: 'Ext.uxo.TabReorderer' },
        'tabclosemenu'
    ],

    items:[{ xtype: 'container', layout: 'fit', closable: false, reorderable: false }],

    updateFirstTab: function(item){
    var me = this,
        body = me.items.getAt(0),
        tab = me.tabBar.items.getAt(0)

        item.title && tab.setText(item.title)
        item.iconCls && tab.setIconCls(item.iconCls)

        body.removeAll(true)
        body.add(item)
        me.setActiveTab(0)
    }
})

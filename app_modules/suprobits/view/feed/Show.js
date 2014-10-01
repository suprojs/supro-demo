Ext.define('FV.view.feed.Show', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.feedshow',

    requires: [
        'FV.view.article.Grid',
        'FV.view.article.Preview'
    ],

    closable: false,
    /*layout: {
        type: 'vbox',
        align: 'stretch'
    },*/

	layout: {
		type: 'border',
//                padding: 5
    }, 
    initComponent: function() {
        Ext.apply(this, {
            items: [{
                xtype: 'articlegrid',
                region: 'center',
				flex: 1,
				minHeight: 20,
				minWidth: 150,
            },{
                xtype: 'articlepreview',
				layout: 'fit',
				region: 'south',
				border: false,
				split: true,
				flex: 2,
				minHeight: 150,
                cls: 'articlepreview',
                height: 500
            }]
        });

        this.callParent(arguments);
    }
});

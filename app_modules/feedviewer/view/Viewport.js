Ext.define('FV.view.Viewport', {
    id: 'FV.view',
    title: 'FV.view.Viewport: An MVC application version of the Feed Viewer ExtJS example.',
    extend: 'App.view.Window',
    closeAction: 'hide',
    width: 777,
    height: 555,     
    stateful: true,
    stateId: 'fvsb',

    requires: [
        'FV.view.Viewer',
        'FV.view.feed.List',
        'Ext.layout.container.Border'
    ],

    layout: 'border',

    items: [{
        region: 'center',
        xtype: 'viewer'
    }, {
        region: 'west',
        width: 225,
		collapsible: true,
		floatable: false,
		split: true, 
        xtype: 'feedlist'
    }]
});

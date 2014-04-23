/**
 * Main application Viewport
 * Uses a {@link Ext.layout.container.Border} layout for ccontent organization
 */
 
Ext.define('CarTracker.view.Viewport', {
    id: 'CarTracker.view',
    title: 'CarTracker.view.Viewport',
    extend: 'App.view.Window',
    closeAction: 'hide',
    width: 777,
    height: 555,
    stateful: true,
    stateId: 'edct',
    requires:[
        'Ext.layout.container.Border',
        'CarTracker.view.layout.North',
        'CarTracker.view.layout.West',
        'CarTracker.view.layout.Center'
    ],
    layout: {
        type: 'border'
    },
    items: [
        { xtype: 'layout.north' },
        { xtype: 'layout.west' },
        { xtype: 'layout.center' }
    ]
});

/**
 * "Header" for the application (logo, title, etc.)
 */
Ext.define('CarTracker.view.layout.North', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.layout.north',
    region: 'north',
    bodyPadding: 5,
    html: '<img src="' + App.backendURL +
    '/resources/images/car.png" /><h1>Car Tracker</h1>' +// fix `nw`
    '&nbsp;<a target="blank" href="http://existdissolve.com/category/javascript/ext/extjs-4-2-app-walkthrough/">ExtJS 4.2 App Walkthrough</a>',
    cls: 'header',                  
    initComponent: function(){
        var me = this;
        Ext.applyIf(me,{
            
        });
        me.callParent( arguments );
    } 
});
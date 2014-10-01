Ext.ns('App.view')
Ext.ns('CarTracker')

CarTracker.LoggedInUser = { inRole: function(){ return true } }
App.view.items_Shortcuts = Ext.Array.push(App.view.items_Shortcuts || [], [
{
    text:
'<img height="64" width="128" src="' + App.backendURL +
'/resources/images/car.png"/>' +
'<br/>existdissolve.com<br/>' +
'CarTracker<br/>'
   ,height: 110
   ,tooltip: 'existdissolve.com "ExtJS 4.2. App Walkthrough"'
   ,handler: function open_CarTracker(btn){
        if(CarTracker.getApplication){
            var v = Ext.getCmp('CarTracker.view')
            v && v.show()// multiple launch but one app
        } else {
            App.create('CarTracker.app.Application', btn)
        }
    }
}
])

Ext.Loader.setPath('CarTracker', App.backendURL + '/CarTracker')
Ext.Loader.setPath('Ext.ux.grid.plugin', App.backendURL + '/CarTracker/ux/grid/plugin/')

/**
 * @class CarTracker
 * @singleton
 */

Ext.util.Format.yesNo = function( v ) {
    return v ? 'Yes' : 'No';
};

//Ext.application({                         // default if SPA
//Ext.define('CarTracker.app.Application',{ // slow initial loading
App.cfg['CarTracker.app.Application'] = {   // fast init
    extend: 'Ext.app.Application',
    appFolder: Ext.Loader.getPath('CarTracker'),
    name: 'CarTracker',
    views: [
        'Viewport'
    ],
    controllers: [
        'App',
        'Options',
        'Staff',
        'Cars',
        'Security',
        'Reports',
        'Workflows',
        'Dashboard'
    ],
    requires: [
        'Ext.util.History',
        'Ext.util.Point',
        'CarTracker.domain.Proxy',
        'CarTracker.overrides.grid.RowEditor'
    ],
    /**
     * launch is called immediately upon availability of our app
     */
    launch: function( args ) {
        // "this" = Ext.app.Application
        var me = this;

        Ext.globalEvents.fireEvent( 'beforeviewportrender' );
    }
}

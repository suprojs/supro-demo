Ext.ns('App.view')
Ext.ns('CarTracker')

CarTracker.LoggedInUser = { inRole: function(){ return true } }
App.view.items_Shortcuts = Ext.Array.push(App.view.items_Shortcuts || [], [
{
    text:
'<img height="68" width="128" src="' + (App.cfg.backend.url || '') +
'/resources/images/car.png"/>' +
'<br/>existdissolve.com<br/>' +
'CarTracker<br/>'
   ,height:110 ,minWidth:92
   ,tooltip: 'existdissolve.com "ExtJS 4.2. App Walkthrough"</a>'
   ,handler: function open_CarTracker(){
        if(CarTracker.getApplication){
            var v = Ext.getCmp('CarTracker.view')
            v && v.show()// multiple launch but one app
        } else {
            Ext.application('CarTracker.app.Application')
        }
    }
}
])

Ext.Loader.setPath('CarTracker', (App.cfg.backend.url || '') + '/CarTracker')

// end of app module customization
/**
 * @class CarTracker
 * @singleton
 */

Ext.util.Format.yesNo = function( v ) {
    return v ? 'Yes' : 'No';
};

//Ext.application({
Ext.define('CarTracker.app.Application', {
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
});

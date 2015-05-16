Ext.ns('FV')
App.view.items_ShortcutsOther = Ext.Array.push(App.view.items_ShortcutsOther || [],[
{
    text:
'<img height="64" width="64" src="' + App.backendURL +
'/css/FV/images/rss.gif"/>' +
'<br/><br/>' +
'SUPRO bits<br/>'
   ,height:110 ,minWidth:92
   ,tooltip: 'An MVC application version of the Feed Viewer ExtJS example.'
   ,handler: function open_FV(btn){
        if(FV.getApplication){
            var v = Ext.getCmp('FV.view')
            v && v.show()// multiple clicking
        } else {
            App.create('FV.app.Application', btn)
        }
    }
}
])

Ext.apply(l10n, {
	 mainTitle: 'SUPro: документы движения'
	,mainAdd: 'Добавить'
	,mainDel: 'Убрать'
	,docsAll: 'Все типы'
	,docsIncs: 'Приход'
	,docsMovi: 'Перемещение'
	,docsSelr: 'Продажа'
	,docType: 'Тип документа движения'
	,docDate: 'Дата и время создания'
	,docOpenAll: 'Раскрыть все'
	,docViewInTab: 'Смотреть в новом табе'
	,docGoToLink: 'Перейти по ссылке документа'
})

//Ext.application({                 // default if SPA
//Ext.define('FV.app.Application',{ // slow initial loading
App.cfg['FV.app.Application'] = {   // fast init
    extend: 'Ext.app.Application',
    name: 'FV'
	,appFolder: App.backendURL + '/FV'
    ,autoCreateViewport: true
    ,controllers: [
        'Articles'
       ,'Feeds'
    ]
}

Ext.ns('App.view')
App.view.items_Shortcuts = Ext.Array.push(App.view.items_Shortcuts || [], [
{
    text:
'<img height="64" width="64" src="' + (App.cfg.backend.url || '') +
'/css/FV/images/rss.gif"/>' +
'<br/><br/>' +
'SUPRO bits<br/>'
   ,height:110 ,minWidth:92
   ,tooltip: 'An MVC application version of the Feed Viewer ExtJS example.'
   ,handler: function open_FV(){
        if(FV.getApplication){
            var v = Ext.getCmp('FV.view')
            v && v.show()// multiple clicking
        } else {
            Ext.application('FV.app.Application')
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

//Ext.application({
Ext.define('FV.app.Application', {
    extend: 'Ext.app.Application', 
    name: 'FV'
	,appFolder: (App.cfg.backend.url || '') + '/FV'
    ,autoCreateViewport: true
    ,controllers: [
        'Articles'
       ,'Feeds'
    ]
})

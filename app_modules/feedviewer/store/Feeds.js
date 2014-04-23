Ext.define('FV.store.Feeds', {
    extend: 'Ext.data.Store',

    model: 'FV.model.Feed',

    data: [
        {name: l10n.docsAll, url: 'ALL'},
        {name: l10n.docsIncs, url: 'INCS'},
		{name: l10n.docsMovi, url: 'MOVI'},
        {name: l10n.docsSelr,  url: 'SELR'}
    ]
});

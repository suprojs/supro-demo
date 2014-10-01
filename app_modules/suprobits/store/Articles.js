Ext.define('FV.store.Articles', {
    extend: 'Ext.data.Store',

    requires: ['Ext.data.reader.Json'],

    model: 'FV.model.Article',

    proxy: {
        type: 'ajax',
        url: App.backendURL + '/FV/api/movesglob.json',
        reader: {
            type: 'json',
			root: 'data'
        }
    }

    /*sortInfo: {
        property: 'pubDate',
        direction: 'DESC'
    }*/
});

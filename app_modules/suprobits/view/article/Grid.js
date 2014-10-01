Ext.define('FV.view.article.Grid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.articlegrid',

    cls: 'feed-grid',
    disabled: true,

    requires: ['Ext.ux.PreviewPlugin', 'Ext.toolbar.Toolbar'],
    
    border: false,
    
    initComponent: function() {
        Ext.apply(this, {
            store: 'Articles',

            viewConfig: {
                /*plugins: [{
                    pluginId: 'preview',
                    ptype: 'preview',
                    bodyField: 'description',
                    previewExpanded: true
                }]*/
            },

            columns: [{
                text: l10n.docDate,
                dataIndex: 'pubDate',
                renderer: this.formatDate,
                width: 200
            }, {
                text: 'Author',
                dataIndex: 'author',
                //hidden: true,
                renderer: this.formatAuthor,
                width: 200
            }, {
                text: l10n.docType,
                dataIndex: 'title',
                flex: 1,
                renderer: this.formatTitle
            }, {
                text: 'Количество план/факт',
                //dataIndex: 'title',
                flex: 1,
                renderer: function(){
                    return 'План: 3290<br>Факт: 1234'
                }
            }],
            dockedItems:[{
                xtype: 'toolbar',
                dock: 'top',
                items: [{
                    iconCls: 'open-all',
                    text: l10n.docOpenAll,
                    action: 'openall'
                }]
            }]
        });

        this.callParent(arguments);
    },

    /**
     * Title renderer
     * @private
     */
    formatTitle: function(value, p, record) {
        return Ext.String.format('<b>Осень-Зима 2014-2015</b><br>Поставка: <b>#30</b>', value, record.get('author') || "Unknown");
    },

    formatAuthor: function(value, p, record) {
        return '<div class="so-clmn-padd">'+
               'olecom<br>manag' + '</div>'
    },

    /**
     * Date renderer
     * @private
     */
    formatDate: function(date) {
        if (!date) {
            return ''
        }
        var d = Ext.Date.add(date, 'd', -6);
        
        
        return '<div class="so-clmn-dates-add-edit">' +
                Ext.Date.format(date, 'Y/m/d H:i:s l') + '<br>'+
                Ext.Date.format(d, 'Y/m/d H:i:s l') + '</div>'

        var now = new Date(),
            d = Ext.Date.clearTime(now, true),
            notime = Ext.Date.clearTime(date, true).getTime();

        if (notime === d.getTime()) {
            return Ext.Date.format(date, 'H:i:s');
        }

        d = Ext.Date.add(d, 'd', -6);
        if (d.getTime() <= notime) {
            return Ext.Date.format(date, 'l H:i:s');
        }
        return Ext.Date.format(date, 'Y/m/d H:i:s ');
    }
});

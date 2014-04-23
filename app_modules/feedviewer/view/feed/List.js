Ext.define('FV.view.feed.List', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.feedlist',

    requires: ['Ext.toolbar.Toolbar'],

    title: l10n.mainTitle,
    collapsible: true,
    animCollapse: true,
    margins: '1 0 1 1',
    layout: 'fit',

    initComponent: function() {
        Ext.apply(this, {
            items: [{
                xtype: 'dataview',
                trackOver: true,
                store: this.store,
                cls: 'feed-list',
                itemSelector: '.feed-list-item',
                overItemCls: 'feed-list-item-hover',
                tpl: '<tpl for="."><div class="feed-list-item">{name}</div></tpl>',
                listeners: {
                    selectionchange: this.onSelectionChange,
                    scope: this
                }
            }],

            dockedItems: [{
                xtype: 'toolbar',
                items: [{
                    iconCls: 'feed-add',
                    text: l10n.mainAdd,
                    action: 'add'
                }, {
                    iconCls: 'feed-remove',
                    text: l10n.mainDel,
                    disabled: true,
                    action: 'remove'
                }]
            }]
        });

        this.callParent(arguments);
    },

    onSelectionChange: function(selmodel, selection) {
        var selected = selection[0],
            button = this.down('button[action=remove]');
        if (selected) {
            button.enable();
        }
        else {
            button.disable();
        }
    }
});

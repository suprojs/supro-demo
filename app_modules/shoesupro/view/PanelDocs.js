/*
 * 'App.shoesupro.view.PanelDocs'
 * 'Docs.view.ThumbList'
 */

Ext.define('App.shoesupro.view.PanelDocs',{
    extend: Ext.panel.Panel,
    xtype: 'so_panelDocs',
    title: l10n.so.docs,
    autoScroll: true,
    header: false,
    cls: 'panel-docs',
    iconCls: 'doc-help',
    initComponent: function() {
        var dhurl = App.backendURL + '/css/shoesupro/doc-screens/'
        /**
         * From 'jsduck' '5.1.0'
         */
        this.items = [
            { xtype: 'container', html: '<b class="eg">Documentation / Help</b>' },
            Ext.create('Docs.view.ThumbList', {
                itemTpl: [
                    '<dd ext:url="#!/doc-help/{name}">',
                        '<div class="dhthumb"><img src="' + dhurl + '{icon}"/></div>',
                        '<div><h4>{title}',
                            '<tpl if="status === \'new\'">',
                                '<span class="new"> (' + l10n.so.dhnew  + ')</span>',
                            '</tpl>',
                            '<tpl if="status === \'updated\'">',
                                '<span class="updated"> (' + l10n.so.dhupdate  + ')</span>',
                            '</tpl>',
                            '<tpl if="status === \'experimental\'">',
                                '<span class="exp"> (' + l10n.so.dhexperiment  + ')</span>',
                            '</tpl>',
                        '</h4><p>{description}</p></div>',
                    '</dd>'
                ]
            })
        ];

        this.callParent(arguments);
    }
})


/**
 * From 'jsduck' '5.1.0'
 * View showing a list of clickable items with thumbnails.
 */
Ext.define('Docs.view.ThumbList', {
    extend: Ext.view.View,
    alias: 'widget.thumblist',
    cls: 'dhthumb-list',
    itemSelector: 'dl',
    urlField: 'url',
    itemTpl: [],

    initComponent: function() {
        this.addEvents(
            'urlclick'
        );

        this.store = Ext.create('Ext.data.JsonStore',{
            autoLoad: true,
            fields: ['id', 'title', 'items' ],
            proxy: { type: 'ajax', url: App.backendURL + '/shoesupro/doc-help.json' }
        });

        // Place itemTpl inside main template
        this.tpl = new Ext.XTemplate(Ext.Array.flatten([
            '<div>',
                '<tpl for=".">',
                '<div class="collapsed"><a name="{id}"></a><h2><div>{title}</div></h2>',
                '<dl>',
                    '<tpl for="items">',
                        this.itemTpl,
                    '</tpl>',
                '<div style="clear:left"></div></dl></div>',
                '</tpl>',
            '</div>'
        ]));
        // Hide itemTpl and data configs from parent class
        this.itemTpl = undefined;
        this.data = undefined;

        this.on("viewready", function() {
            this.initHover();
        }, this);

        /*TODO item click -- url -- new tab documentation
        Ext.util.Observable.capture(this, function(){
            console.log(arguments);
        });*/

        this.on({
            beforeselect: function preventSelection(){
                return false
            }
        })

        this.callParent(arguments);
    },

    initHover: function() {
        this.getEl().on('mouseover', function(event, el) {
            Ext.get(el).addCls('over');
        }, this, {
            delegate: 'dd'
        });

        this.getEl().on('mouseout', function(event, el) {
            Ext.get(el).removeCls('over');
        }, this, {
            delegate: 'dd'
        });
    },

    onContainerClick: function(e) {
        var group = e.getTarget('h2', 3, true);

        if (group) {
            group.up('div').toggleCls('collapsed');
        }
    },
    onItemClick: function(record, item, index, e){
        var t = e.getTarget('dd', 5, true);

        if (t && !e.getTarget('a', 2)) {
            var url = t.getAttributeNS('ext', this.urlField);
            this.fireEvent('urlclick', url);
        }

        return this.callParent(arguments);
    }
});

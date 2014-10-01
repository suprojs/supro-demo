doc = {
  "_id": new ObjectID("53df77df9bfa430000000004")
, add: new Date("Mon Aug 04 2014 03:00:00 GMT+0300 (Калининградское время (зима))")
, "add_by": "default login"
, edit: null
, "edit_by": ""
, name: "Осень-зима 2014/2015"
, "#": 31
, "total_plan": 12345
, "total_done": 0
, eur: 15000
, dlr: 12000
, fem: 120
, mal: 130
, id: 0
, fields: [
    {
      name: "add"
    , type: "date"
    }
  , {
      name: "add_by"
    , type: "string"
    }
  , {
      name: "edit"
    , type: "date"
    }
  , {
      name: "edit_by"
    , type: "string"
    }
  , {
      name: "id"
    , type: "int"
    }
  , "id_mpcode"
  , "pcode"
  , {
      name: "total_qty"
    , type: "int"
    }
  , "id_mfg"
  , {
      name: "id_in"
    , type: "int"
    }
  , "gend"
  , "prodname"
  , "g_color"
  , "g_material"
  , "g_sizes_set"
  , "g_sizes"
  ]
, columns: [
    {
      dataIndex: "id"
    , text: "id"
    , width: 28
    }
  , {
      dataIndex: "add"
    , text: "add"
    , format: "Y/m/d H:i:s l"
    , xtype: "datecolumn"
    , width: 187
    , tdCls: "so-clmn-add"
    }
  , {
      dataIndex: "id_mpcode"
    , text: "id_mpcode"
    , width: 167
    , xtype: "so_gridColumnSKU"
    }
  , {
      dataIndex: "id_in"
    , text: "id_in"
    , hidden: true
    , width: 28
    }
  , {
      dataIndex: "id_mfg"
    , text: "id_mfg"
    , xtype: "so_gridColumnTM"
    , width: 64
    }
  , {
      dataIndex: "g_sizes"
    , text: "g_sizes"
    , xtype: "so_gridColumnSizes"
    }
  , {
      dataIndex: "total_qty"
    , text: "total_qty"
    , xtype: "so_gridColumnSizesSum"
    , width: 44
    }
  , {
      dataIndex: "pcode"
    , text: "pcode"
    , xtype: "so_gridColumnTxt"
    }
  , {
      dataIndex: "gend"
    , text: "gend"
    , width: 44
    }
  , {
      dataIndex: "prodname"
    , text: "prodname"
    , xtype: "so_gridColumnTxt"
    , editor: "textfield"
    }
  , {
      dataIndex: "g_color"
    , text: "g_color"
    }
  , {
      dataIndex: "g_material"
    , text: "g_material"
    }
  , {
      dataIndex: "g_sizes_set"
    , text: "g_sizes_set"
    }
  , {
      dataIndex: "add_by"
    , text: "add_by"
    , hidden: true
    }
  , {
      dataIndex: "edit"
    , text: "edit"
    , hidden: true
    }
  , {
      dataIndex: "edit_by"
    , text: "edit_by"
    , hidden: true
    }
  ]
};
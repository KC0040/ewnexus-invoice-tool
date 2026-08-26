/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const col = app.findCollectionByNameOrId("pbc_2289985756")

  const textFields = [
    { id: "text_invoice_font",         name: "invoice_font" },
    { id: "text_invoice_title_label",  name: "invoice_title_label" },
    { id: "text_invoice_num_prefix",   name: "invoice_number_prefix" },
    { id: "text_invoice_footer_msg",   name: "invoice_footer_msg" },
    { id: "text_invoice_date_fmt",     name: "invoice_date_format" },
    { id: "text_invoice_hidden_blk",   name: "invoice_hidden_blocks" },
  ]
  textFields.forEach((f, i) => col.fields.addAt(130 + i, new Field({
    "hidden": false, "id": f.id, "name": f.name, "presentable": false,
    "required": false, "system": false, "type": "text"
  })))

  col.fields.addAt(140, new Field({
    "hidden": false, "id": "file_header_banner", "name": "invoice_header_banner",
    "presentable": false, "required": false, "system": false,
    "type": "file", "maxSelect": 1, "maxSize": 5242880,
    "mimeTypes": ["image/jpeg", "image/png", "image/webp"]
  }))

  return app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("pbc_2289985756")
  const ids = ["text_invoice_font","text_invoice_title_label","text_invoice_num_prefix",
               "text_invoice_footer_msg","text_invoice_date_fmt","text_invoice_hidden_blk","file_header_banner"]
  ids.forEach(id => col.fields.removeById(id))
  return app.save(col)
})

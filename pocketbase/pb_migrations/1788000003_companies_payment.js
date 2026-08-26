/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const col = app.findCollectionByNameOrId("pbc_2289985756")

  const fields = [
    { id: "text_zelle_email",    name: "zelle_email",        type: "text" },
    { id: "text_zelle_phone",    name: "zelle_phone",        type: "text" },
    { id: "text_ach_bank",       name: "ach_bank_name",      type: "text" },
    { id: "text_ach_routing",    name: "ach_routing",        type: "text" },
    { id: "text_ach_account",    name: "ach_account",        type: "text" },
    { id: "text_invoice_color",  name: "invoice_color",      type: "text" },
    { id: "text_block_order",    name: "invoice_block_order",type: "text" },
  ]
  fields.forEach((f, i) => col.fields.addAt(110 + i, new Field({
    "hidden": false, "id": f.id, "name": f.name, "presentable": false,
    "required": false, "system": false, "type": f.type
  })))

  col.fields.addAt(120, new Field({
    "hidden": false, "id": "file_zelle_qr", "name": "zelle_qr",
    "presentable": false, "required": false, "system": false,
    "type": "file", "maxSelect": 1, "maxSize": 5242880,
    "mimeTypes": ["image/jpeg", "image/png", "image/gif", "image/webp"]
  }))

  return app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("pbc_2289985756")
  const ids = ["text_zelle_email","text_zelle_phone","text_ach_bank","text_ach_routing","text_ach_account","text_invoice_color","text_block_order","file_zelle_qr"]
  ids.forEach(id => col.fields.removeById(id))
  return app.save(col)
})

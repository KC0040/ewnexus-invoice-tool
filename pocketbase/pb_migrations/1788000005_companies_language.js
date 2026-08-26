/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const col = app.findCollectionByNameOrId("pbc_2289985756")
  const fields = [
    { id: "text_invoice_lang", name: "invoice_language" },
    { id: "text_app_lang",     name: "app_language" },
  ]
  fields.forEach((f, i) => col.fields.addAt(150 + i, new Field({
    "hidden": false, "id": f.id, "name": f.name, "presentable": false,
    "required": false, "system": false, "type": "text"
  })))
  return app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("pbc_2289985756")
  col.fields.removeById("text_invoice_lang")
  col.fields.removeById("text_app_lang")
  return app.save(col)
})

/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const col = app.findCollectionByNameOrId("pbc_2289985756")
  col.fields.addAt(160, new Field({
    "hidden": false,
    "id": "text_invoice_visual_template",
    "name": "invoice_visual_template",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "text"
  }))
  return app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("pbc_2289985756")
  col.fields.removeById("text_invoice_visual_template")
  return app.save(col)
})

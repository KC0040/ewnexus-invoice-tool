/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const col = app.findCollectionByNameOrId("pbc_2289985756")
  if (!col.fields.getByName("invoice_visual_template")) {
    col.fields.addAt(999, new Field({
      "hidden": false,
      "id": "text_invoice_visual_template",
      "name": "invoice_visual_template",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "text"
    }))
    return app.save(col)
  }
}, (app) => {
  const col = app.findCollectionByNameOrId("pbc_2289985756")
  const f = col.fields.getByName("invoice_visual_template")
  if (f) {
    col.fields.removeById(f.id)
    return app.save(col)
  }
})

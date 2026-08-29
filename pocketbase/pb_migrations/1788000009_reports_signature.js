/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const col = app.findCollectionByNameOrId("pbc_1615648943")
  col.fields.addAt(20, new Field({
    "hidden": false,
    "id": "text_signature_data",
    "name": "signature_data",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "text"
  }))
  return app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("pbc_1615648943")
  col.fields.removeById("text_signature_data")
  return app.save(col)
})

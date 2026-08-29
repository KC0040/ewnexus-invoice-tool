/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const col = app.findCollectionByNameOrId("pbc_1615648943")
  if (!col.fields.getByName("signature_data")) {
    col.fields.addAt(999, new Field({
      "hidden": false,
      "id": "text_signature_data",
      "name": "signature_data",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "text"
    }))
    return app.save(col)
  }
}, (app) => {
  const col = app.findCollectionByNameOrId("pbc_1615648943")
  const f = col.fields.getByName("signature_data")
  if (f) {
    col.fields.removeById(f.id)
    return app.save(col)
  }
})

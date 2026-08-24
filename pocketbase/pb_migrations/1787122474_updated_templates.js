/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_184785686")

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "json3952938413",
    "maxSize": 0,
    "name": "asset_field_schema",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_184785686")

  // remove field
  collection.fields.removeById("json3952938413")

  return app.save(collection)
})

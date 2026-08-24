/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3190233272")

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "json298339036",
    "maxSize": 0,
    "name": "asset_details",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3190233272")

  // remove field
  collection.fields.removeById("json298339036")

  return app.save(collection)
})

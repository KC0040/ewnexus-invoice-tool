/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1615648943")

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "json_bpu01234567890",
    "maxSize": 0,
    "name": "before_photo_urls",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "json_apu01234567890",
    "maxSize": 0,
    "name": "after_photo_urls",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1615648943")

  // remove field
  collection.fields.removeById("json_bpu01234567890")

  // remove field
  collection.fields.removeById("json_apu01234567890")

  return app.save(collection)
})

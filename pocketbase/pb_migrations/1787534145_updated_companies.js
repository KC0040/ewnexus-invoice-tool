/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2289985756")

  // add field
  collection.fields.addAt(17, new Field({
    "hidden": false,
    "id": "bool_gallery_enabled",
    "name": "gallery_enabled",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(18, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text_website_url",
    "max": 0,
    "min": 0,
    "name": "website_url",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2289985756")

  // remove field
  collection.fields.removeById("bool_gallery_enabled")

  // remove field
  collection.fields.removeById("text_website_url")

  return app.save(collection)
})

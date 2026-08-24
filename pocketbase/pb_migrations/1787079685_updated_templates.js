/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_184785686")

  // add field
  collection.fields.addAt(5, new Field({
    "convertURLs": false,
    "hidden": false,
    "id": "editor4093379387",
    "maxSize": 0,
    "name": "default_terms_draft",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "editor"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_184785686")

  // remove field
  collection.fields.removeById("editor4093379387")

  return app.save(collection)
})

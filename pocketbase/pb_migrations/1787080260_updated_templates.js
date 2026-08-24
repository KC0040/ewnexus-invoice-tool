/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_184785686")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "bool1392095006",
    "name": "included_in_base",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_184785686")

  // remove field
  collection.fields.removeById("bool1392095006")

  return app.save(collection)
})

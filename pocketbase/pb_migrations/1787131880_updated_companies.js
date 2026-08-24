/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2289985756")

  // update field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "[a-zA-Z0-9_]{50}",
    "hidden": true,
    "id": "text2504183744",
    "max": 0,
    "min": 0,
    "name": "tokenKey",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": true,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2289985756")

  // update field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "hidden": true,
    "id": "text2504183744",
    "max": 0,
    "min": 0,
    "name": "tokenKey",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": true,
    "type": "text"
  }))

  return app.save(collection)
})

/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2289985756")

  // add field
  collection.fields.addAt(13, new Field({
    "convertURLs": false,
    "hidden": false,
    "id": "editor2474376088",
    "maxSize": 0,
    "name": "terms_of_service",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "editor"
  }))

  // update field
  collection.fields.addAt(1, new Field({
    "cost": 10,
    "hidden": true,
    "id": "password901924565",
    "max": 0,
    "min": 0,
    "name": "password",
    "pattern": "",
    "presentable": false,
    "required": true,
    "system": true,
    "type": "password"
  }))

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
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2289985756")

  // remove field
  collection.fields.removeById("editor2474376088")

  // update field
  collection.fields.addAt(8, new Field({
    "cost": 0,
    "hidden": true,
    "id": "password901924565",
    "max": 0,
    "min": 8,
    "name": "password",
    "pattern": "",
    "presentable": false,
    "required": true,
    "system": true,
    "type": "password"
  }))

  // update field
  collection.fields.addAt(9, new Field({
    "autogeneratePattern": "[a-zA-Z0-9]{50}",
    "hidden": true,
    "id": "text2504183744",
    "max": 60,
    "min": 30,
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

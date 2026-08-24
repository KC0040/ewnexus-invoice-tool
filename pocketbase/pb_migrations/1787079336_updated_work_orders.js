/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3190233272")

  // update field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "date1398638146",
    "max": "",
    "min": "",
    "name": "work_date",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3190233272")

  // update field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "date1398638146",
    "max": "",
    "min": "",
    "name": "work_date",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
})

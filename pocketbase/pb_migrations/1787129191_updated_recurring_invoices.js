/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2495483502")

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "date2502384312",
    "max": "",
    "min": "",
    "name": "start_date",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "number2241708415",
    "max": null,
    "min": 0,
    "name": "periods_elapsed",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2495483502")

  // remove field
  collection.fields.removeById("date2502384312")

  // remove field
  collection.fields.removeById("number2241708415")

  return app.save(collection)
})

/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3190233272")

  // update field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "select1580793482",
    "maxSelect": 1,
    "name": "payment_status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "estimate",
      "cash",
      "zelle",
      "card",
      "unpaid",
      "void"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3190233272")

  // update field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "select1580793482",
    "maxSelect": 1,
    "name": "payment_status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "cash",
      "zelle",
      "card",
      "unpaid",
      "void"
    ]
  }))

  return app.save(collection)
})

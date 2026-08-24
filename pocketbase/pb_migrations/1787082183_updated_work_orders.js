/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3190233272")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "number3262847721",
    "max": null,
    "min": null,
    "name": "tax_amount",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

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
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3190233272")

  // remove field
  collection.fields.removeById("number3262847721")

  // update field
  collection.fields.addAt(7, new Field({
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
      "unpaid"
    ]
  }))

  return app.save(collection)
})

/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3190233272")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number3097235076",
    "max": null,
    "min": null,
    "name": "subtotal",
    "onlyInt": false,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2558321696",
    "hidden": false,
    "id": "relation2432080519",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "discount_applied",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3190233272")

  // remove field
  collection.fields.removeById("number3097235076")

  // remove field
  collection.fields.removeById("relation2432080519")

  return app.save(collection)
})

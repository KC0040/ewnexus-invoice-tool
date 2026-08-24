/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2289985756")

  // add field
  collection.fields.addAt(14, new Field({
    "hidden": false,
    "id": "number2397022437",
    "max": null,
    "min": null,
    "name": "sales_tax_rate",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2289985756")

  // remove field
  collection.fields.removeById("number2397022437")

  return app.save(collection)
})

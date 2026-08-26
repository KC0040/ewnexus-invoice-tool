/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2289985756")

  collection.fields.addAt(99, new Field({
    "hidden": false,
    "id": "number_trial_invoices_left",
    "name": "trial_invoices_left",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number",
    "min": 0,
    "max": null,
    "onlyInt": true
  }))

  collection.fields.addAt(100, new Field({
    "hidden": false,
    "id": "bool_is_paid",
    "name": "is_paid",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2289985756")
  collection.fields.removeById("number_trial_invoices_left")
  collection.fields.removeById("bool_is_paid")
  return app.save(collection)
})

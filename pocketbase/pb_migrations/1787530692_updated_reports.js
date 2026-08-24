/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1615648943")

  // add field
  collection.fields.addAt(15, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text_objective",
    "max": 0,
    "min": 0,
    "name": "objective",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(16, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text_findings",
    "max": 0,
    "min": 0,
    "name": "findings",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(17, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text_materials",
    "max": 0,
    "min": 0,
    "name": "materials_used",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(18, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text_recs",
    "max": 0,
    "min": 0,
    "name": "recommendations",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1615648943")

  // remove field
  collection.fields.removeById("text_objective")

  // remove field
  collection.fields.removeById("text_findings")

  // remove field
  collection.fields.removeById("text_materials")

  // remove field
  collection.fields.removeById("text_recs")

  return app.save(collection)
})

/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1615648943")

  // add field
  collection.fields.addAt(10, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text_rg",
    "max": 0,
    "min": 0,
    "name": "report_groups",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text_summary",
    "max": 0,
    "min": 0,
    "name": "summary",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text_wstart",
    "max": 0,
    "min": 0,
    "name": "work_start",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text_wend",
    "max": 0,
    "min": 0,
    "name": "work_end",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text_sig",
    "max": 0,
    "min": 0,
    "name": "signature",
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
  collection.fields.removeById("text_rg")

  // remove field
  collection.fields.removeById("text_summary")

  // remove field
  collection.fields.removeById("text_wstart")

  // remove field
  collection.fields.removeById("text_wend")

  // remove field
  collection.fields.removeById("text_sig")

  return app.save(collection)
})

/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.id != \"\" && company = @request.auth.id",
    "deleteRule": "company = @request.auth.id",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_2289985756",
        "hidden": false,
        "id": "relation1337919823",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "company",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1649698246",
        "max": 0,
        "min": 0,
        "name": "bundle_name",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "number3402113753",
        "max": null,
        "min": null,
        "name": "price",
        "onlyInt": false,
        "presentable": false,
        "required": true,
        "system": false,
        "type": "number"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1843675174",
        "max": 0,
        "min": 0,
        "name": "description",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_2706913755",
        "hidden": false,
        "id": "relation3776899405",
        "maxSelect": 50,
        "minSelect": 0,
        "name": "items",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      }
    ],
    "id": "pbc_1240745330",
    "indexes": [],
    "listRule": "company = @request.auth.id",
    "name": "bundles",
    "system": false,
    "type": "base",
    "updateRule": "company = @request.auth.id",
    "viewRule": "company = @request.auth.id"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1240745330");

  return app.delete(collection);
})

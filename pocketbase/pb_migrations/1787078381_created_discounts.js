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
        "id": "text3231808444",
        "max": 0,
        "min": 0,
        "name": "discount_name",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "select308040339",
        "maxSelect": 1,
        "name": "discount_type",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "percentage",
          "flat_amount"
        ]
      },
      {
        "hidden": false,
        "id": "number494360628",
        "max": null,
        "min": null,
        "name": "value",
        "onlyInt": false,
        "presentable": false,
        "required": true,
        "system": false,
        "type": "number"
      }
    ],
    "id": "pbc_2558321696",
    "indexes": [],
    "listRule": "company = @request.auth.id",
    "name": "discounts",
    "system": false,
    "type": "base",
    "updateRule": "company = @request.auth.id",
    "viewRule": "company = @request.auth.id"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2558321696");

  return app.delete(collection);
})

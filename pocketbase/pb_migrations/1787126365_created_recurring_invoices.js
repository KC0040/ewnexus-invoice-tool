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
        "cascadeDelete": false,
        "collectionId": "pbc_108570809",
        "hidden": false,
        "id": "relation2168032777",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "customer",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "json513461966",
        "maxSize": 0,
        "name": "line_items",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "number1186288468",
        "max": null,
        "min": null,
        "name": "total_amount",
        "onlyInt": false,
        "presentable": false,
        "required": true,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "select645904403",
        "maxSelect": 1,
        "name": "frequency",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "weekly",
          "biweekly",
          "monthly",
          "quarterly",
          "yearly"
        ]
      },
      {
        "hidden": false,
        "id": "date242885808",
        "max": "",
        "min": "",
        "name": "next_run_date",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "date"
      },
      {
        "hidden": false,
        "id": "bool1260321794",
        "name": "active",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      }
    ],
    "id": "pbc_2495483502",
    "indexes": [],
    "listRule": "company = @request.auth.id",
    "name": "recurring_invoices",
    "system": false,
    "type": "base",
    "updateRule": "company = @request.auth.id",
    "viewRule": "company = @request.auth.id"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2495483502");

  return app.delete(collection);
})

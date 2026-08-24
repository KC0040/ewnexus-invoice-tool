/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3190233272")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && company = @request.auth.id",
    "deleteRule": "company = @request.auth.id",
    "listRule": "company = @request.auth.id",
    "updateRule": "company = @request.auth.id",
    "viewRule": "company = @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3190233272")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})

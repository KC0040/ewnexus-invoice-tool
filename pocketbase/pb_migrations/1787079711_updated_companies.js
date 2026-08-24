/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2289985756")

  // update collection data
  unmarshal({
    "updateRule": "id = @request.auth.id",
    "viewRule": "id = @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2289985756")

  // update collection data
  unmarshal({
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})

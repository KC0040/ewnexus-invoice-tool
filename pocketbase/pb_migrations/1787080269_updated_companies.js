/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2289985756")

  // update collection data
  unmarshal({
    "updateRule": "id = @request.auth.id && (subscription_tier = \"premium\" || @request.body.template.included_in_base = true || @request.body.template:isset = false)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2289985756")

  // update collection data
  unmarshal({
    "updateRule": "id = @request.auth.id"
  }, collection)

  return app.save(collection)
})

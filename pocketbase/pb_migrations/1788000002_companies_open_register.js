/// <reference path="../pb_data/types.d.ts" />
// Allow unauthenticated self-registration for companies collection
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2289985756")
  collection.createRule = ""  // empty string = anyone can create
  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2289985756")
  collection.createRule = null  // revert to admin-only
  return app.save(collection)
})

/// <reference path="../pb_data/types.d.ts" />
// Allow authenticated users to list and view templates (was admin-only, caused 404 on login)
migrate((app) => {
  const col = app.findCollectionByNameOrId("templates")
  col.listRule = "@request.auth.id != ''"
  col.viewRule = "@request.auth.id != ''"
  return app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("templates")
  col.listRule = null
  col.viewRule = null
  return app.save(col)
})

/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const col = app.findCollectionByNameOrId("pbc_2289985756")

  col.fields.addAt(150, new Field({
    "hidden": false,
    "id": "select_subscription_tier",
    "name": "subscription_tier",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "maxSelect": 1,
    "values": ["free", "base", "pro"]
  }))

  col.fields.addAt(151, new Field({
    "hidden": false,
    "id": "date_tier_expires_at",
    "name": "tier_expires_at",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  col.fields.addAt(152, new Field({
    "hidden": false,
    "id": "text_tier_payment_ref",
    "name": "tier_payment_ref",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("pbc_2289985756")
  col.fields.removeById("select_subscription_tier")
  col.fields.removeById("date_tier_expires_at")
  col.fields.removeById("text_tier_payment_ref")
  return app.save(col)
})

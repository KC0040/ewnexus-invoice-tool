/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const col = app.findCollectionByNameOrId("pbc_2289985756")

  // subscription_tier may already exist as a SELECT with wrong values — replace with TEXT
  const existingTier = col.fields.getByName("subscription_tier")
  if (existingTier) {
    col.fields.removeById(existingTier.id)
  }
  col.fields.addAt(999, new Field({
    "hidden": false,
    "id": "text_sub_tier",
    "name": "subscription_tier",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // tier_expires_at
  if (!col.fields.getByName("tier_expires_at")) {
    col.fields.addAt(999, new Field({
      "hidden": false,
      "id": "date_tier_expires_at",
      "name": "tier_expires_at",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "date"
    }))
  }

  // tier_payment_ref
  if (!col.fields.getByName("tier_payment_ref")) {
    col.fields.addAt(999, new Field({
      "hidden": false,
      "id": "text_tier_payment_ref",
      "name": "tier_payment_ref",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "text"
    }))
  }

  return app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("pbc_2289985756")
  const t = col.fields.getByName("tier_expires_at")
  if (t) col.fields.removeById(t.id)
  const p = col.fields.getByName("tier_payment_ref")
  if (p) col.fields.removeById(p.id)
  return app.save(col)
})

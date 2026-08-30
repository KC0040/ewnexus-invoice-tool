migrate((app) => {
  const col = app.findCollectionByNameOrId("pbc_2289985756")
  if (!col.fields.getByName("invoice_presets")) {
    col.fields.addAt(999, new Field({
      "id": "text_invoice_presets",
      "name": "invoice_presets",
      "type": "text",
      "required": false,
      "system": false
    }))
    return app.save(col)
  }
}, (app) => {
  const col = app.findCollectionByNameOrId("pbc_2289985756")
  const f = col.fields.getByName("invoice_presets")
  if (f) { col.fields.removeById(f.id) }
  return app.save(col)
})

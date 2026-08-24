/// <reference path="../pb_data/types.d.ts" />

// GET /api/r2-presign?kind=before&work_order_id=xxx&filename=photo.jpg
// Returns presigned PUT URL for direct browser-to-R2 upload (Premium only).
routerAdd("GET", "/api/r2-presign", (e) => {
  const auth = e.requestInfo().auth
  if (!auth) return e.json(401, {error: "auth required"})

  let company
  try { company = $app.findRecordById("companies", auth.id) } catch(_) {
    return e.json(404, {error: "company not found"})
  }
  if (company.get("subscription_tier") !== "premium") {
    return e.json(403, {error: "Premium plan required for photo storage"})
  }

  const kind       = e.request.url.query().Get("kind") || "before"
  const workOrderId = e.request.url.query().Get("work_order_id") || "unknown"
  const filename   = e.request.url.query().Get("filename") || "photo.jpg"
  const ext        = filename.split(".").pop().toLowerCase()
  const contentType = ext === "png" ? "image/png" : "image/jpeg"
  const key = `invoice-photos/${auth.id}/${workOrderId}/${kind}/${new Date().getTime()}.${ext}`

  // Call local presign server (Python, port 8092)
  const res = $http.send({
    method:  "POST",
    url:     "http://127.0.0.1:8092",
    headers: {"Content-Type": "application/json"},
    body:    JSON.stringify({key, content_type: contentType}),
    timeout: 10,
  })

  if (res.statusCode !== 200) {
    return e.json(500, {error: "presign service unavailable"})
  }

  const data = JSON.parse(res.raw)
  return e.json(200, {
    presigned_url: data.presigned_url,
    public_url:    data.public_url,
    key:           key,
  })
}, $apis.requireAuth())

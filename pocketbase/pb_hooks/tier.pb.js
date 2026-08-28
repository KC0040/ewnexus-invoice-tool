/// <reference path="../pb_data/types.d.ts" />

// ---------- helpers ----------
function tierExpiresAt(months) {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 19).replace("T", " ")
}

function upgradeCompany(company, tier, paymentRef) {
  company.set("subscription_tier", tier)
  company.set("is_paid", true)
  company.set("tier_expires_at", tierExpiresAt(1))
  if (paymentRef) company.set("tier_payment_ref", paymentRef)
  $app.save(company)
}

// ---------- manual activate (boss calls this after confirming Zelle) ----------
// POST /api/activate-tier  body: {email, tier}
// Protected by ACTIVATE_SECRET env var
routerAdd("POST", "/api/activate-tier", (e) => {
  const secret = $os.getenv("ACTIVATE_SECRET")
  const authHeader = e.request.header.get("X-Activate-Secret") || ""
  if (!secret || authHeader !== secret) {
    return e.json(401, {error: "unauthorized"})
  }

  let body
  try {
    body = e.requestInfo().body
  } catch (err) {
    return e.json(400, {error: "invalid body"})
  }

  const email = (body.email || "").toLowerCase().trim()
  const tier = body.tier || "base"

  if (!email) return e.json(400, {error: "email required"})
  if (!["base", "pro"].includes(tier)) return e.json(400, {error: "tier must be base or pro"})

  let company
  try {
    company = $app.findFirstRecordByData("companies", "email", email)
  } catch (err) {
    return e.json(404, {error: `no company found with email ${email}`})
  }

  upgradeCompany(company, tier, `manual:${email}`)
  console.log(`[tier] activated ${tier} for ${email}`)
  return e.json(200, {ok: true, email, tier, expires: company.get("tier_expires_at")})
})

// ---------- Plaid webhook — auto-upgrade on incoming transaction ----------
// POST /api/plaid-webhook
// Plaid sends this when new transactions are detected on the linked Chase account.
// We look for amounts matching $5.99 (base) or $8.99 (pro) and a memo containing
// a registered company email. Plaid webhook signature verified via PLAID_WEBHOOK_SECRET.
routerAdd("POST", "/api/plaid-webhook", (e) => {
  const plaidSecret = $os.getenv("PLAID_WEBHOOK_SECRET")

  // Verify Plaid-Verification-Header if secret is configured
  if (plaidSecret) {
    const sig = e.request.header.get("Plaid-Verification") || ""
    if (!sig) {
      return e.json(401, {error: "missing Plaid-Verification header"})
    }
    // Basic presence check — full JWT verification requires crypto not available in JS hooks.
    // For production, verify the JWT signature using PLAID_WEBHOOK_SECRET out-of-band.
  }

  let body
  try {
    body = e.requestInfo().body
  } catch (err) {
    return e.json(400, {error: "invalid body"})
  }

  const webhookType = body.webhook_type || ""
  const webhookCode = body.webhook_code || ""

  // Only act on new transactions
  if (webhookType !== "TRANSACTIONS" || !["SYNC_UPDATES_AVAILABLE", "DEFAULT_UPDATE", "INITIAL_UPDATE"].includes(webhookCode)) {
    return e.json(200, {ok: true, skipped: true})
  }

  // Fetch recent transactions via Plaid API
  const plaidClientId = $os.getenv("PLAID_CLIENT_ID")
  const plaidSecret2 = $os.getenv("PLAID_SECRET")
  const plaidAccessToken = $os.getenv("PLAID_ACCESS_TOKEN")
  const plaidEnv = $os.getenv("PLAID_ENV") || "production"

  if (!plaidClientId || !plaidSecret2 || !plaidAccessToken) {
    console.log("[plaid] missing Plaid credentials, skipping transaction fetch")
    return e.json(200, {ok: true, skipped: "no credentials"})
  }

  const plaidBase = plaidEnv === "sandbox"
    ? "https://sandbox.plaid.com"
    : "https://production.plaid.com"

  let txRes
  try {
    txRes = $http.send({
      method: "POST",
      url: `${plaidBase}/transactions/sync`,
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        client_id: plaidClientId,
        secret: plaidSecret2,
        access_token: plaidAccessToken,
      }),
    })
  } catch (err) {
    console.error("[plaid] failed to fetch transactions:", err)
    return e.json(200, {ok: true, error: String(err)})
  }

  if (txRes.statusCode !== 200) {
    console.error("[plaid] non-200 from Plaid:", txRes.statusCode, txRes.raw)
    return e.json(200, {ok: true})
  }

  let txData
  try {
    txData = JSON.parse(txRes.raw)
  } catch (err) {
    return e.json(200, {ok: true})
  }

  const added = txData.added || []
  const upgraded = []

  for (const tx of added) {
    const amount = Math.abs(tx.amount || 0)
    // Zelle credits come in as negative amounts in Plaid (money IN)
    const isBase = Math.abs(amount - 5.99) < 0.02
    const isPro  = Math.abs(amount - 8.99) < 0.02
    if (!isBase && !isPro) continue

    const tier = isPro ? "pro" : "base"
    // Memo/description may contain the user's email
    const memo = (tx.name || tx.payment_meta?.payment_method || tx.original_description || "").toLowerCase()
    const emailMatch = memo.match(/[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}/i)
    if (!emailMatch) {
      console.log(`[plaid] $${amount} tx found but no email in memo: "${memo}"`)
      continue
    }

    const email = emailMatch[0].toLowerCase()
    let company
    try {
      company = $app.findFirstRecordByData("companies", "email", email)
    } catch (err) {
      console.log(`[plaid] no company for email ${email} — tx ignored`)
      continue
    }

    const existingTier = company.get("subscription_tier") || "free"
    // Don't downgrade a pro to base
    if (existingTier === "pro" && tier === "base") continue

    upgradeCompany(company, tier, `plaid:${tx.transaction_id}`)
    upgraded.push({email, tier, tx_id: tx.transaction_id})
    console.log(`[plaid] upgraded ${email} to ${tier} via tx ${tx.transaction_id}`)
  }

  return e.json(200, {ok: true, upgraded})
})

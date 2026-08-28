/// <reference path="../pb_data/types.d.ts" />

// 送invoice通知給客戶。前端"Save & Send"存完work_order後會呼叫這支API。
// Email：用PocketBase內建mailer，要在 /_/ 後台 Settings > Mail 設定SMTP才會真的寄出。
// SMS：用Twilio REST API，要設 TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER
//      這三個環境變數才會真的發。
// 兩邊都是「沒設定就只記log，不寄不發」的dry-run模式——所以現在就能安全測試整條路徑，
// 之後老闆把SMTP或Twilio設定填上去，不用改任何程式碼就會自動變成真的送。
routerAdd("POST", "/api/send-invoice/{id}", (e) => {
  const auth = e.requestInfo().auth
  if (!auth) {
    return e.json(401, {"error": "auth required"})
  }

  const workOrderId = e.request.pathValue("id")
  let wo
  try {
    wo = $app.findRecordById("work_orders", workOrderId)
  } catch (err) {
    return e.json(404, {"error": "work order not found"})
  }

  if (!e.requestInfo().hasSuperuserAuth() && wo.get("company") !== auth.id) {
    return e.json(403, {"error": "not your invoice"})
  }

  let customer
  try {
    customer = $app.findRecordById("customers", wo.get("customer"))
  } catch (err) {
    return e.json(404, {"error": "customer not found"})
  }

  let company
  try {
    company = $app.findRecordById("companies", wo.get("company"))
  } catch (err) {
    return e.json(404, {"error": "company not found"})
  }

  const total = wo.get("total_amount")
  const companyName = company.get("company_name") || "Your contractor"
  const subject = `Invoice from ${companyName} — $${total}`
  const bodyText = `Hi ${customer.get("customer_name")},\n\n${companyName} has sent you an invoice for $${total}.\n\nThank you for your business.`

  const result = {emailed: false, texted: false, email_dry_run: true, sms_dry_run: true}

  // ---- Email ----
  const customerEmail = customer.get("email")
  if (customerEmail) {
    if ($app.settings().smtp.enabled) {
      try {
        const message = new MailerMessage({
          from: {address: $app.settings().meta.senderAddress, name: $app.settings().meta.senderName},
          to: [{address: customerEmail}],
          subject: subject,
          html: bodyText.replace(/\n/g, "<br>"),
        })
        $app.newMailClient().send(message)
        result.emailed = true
        result.email_dry_run = false
      } catch (err) {
        result.email_error = String(err)
      }
    } else {
      console.log(`[DRY RUN] would email ${customerEmail}: ${subject}`)
    }
  } else {
    result.email_skipped_reason = "customer has no email on file"
  }

  // ---- SMS (Pro tier only — Twilio costs per message) ----
  const companyTier = company.get("subscription_tier") || "free"
  if (companyTier !== "pro") {
    result.sms_skipped_reason = "SMS requires Pro plan"
    return e.json(200, result)
  }
  const customerPhone = customer.get("phone")
  const twilioSid = $os.getenv("TWILIO_ACCOUNT_SID")
  const twilioToken = $os.getenv("TWILIO_AUTH_TOKEN")
  const twilioFrom = $os.getenv("TWILIO_FROM_NUMBER")
  if (customerPhone) {
    if (twilioSid && twilioToken && twilioFrom) {
      try {
        const smsBody = `${companyName}: Invoice for $${total}. Thank you!`
        const res = $http.send({
          method: "POST",
          url: `https://${twilioSid}:${twilioToken}@api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
          headers: {"Content-Type": "application/x-www-form-urlencoded"},
          body: `To=${encodeURIComponent(customerPhone)}&From=${encodeURIComponent(twilioFrom)}&Body=${encodeURIComponent(smsBody)}`,
        })
        result.texted = res.statusCode < 300
        result.sms_dry_run = false
        result.sms_status_code = res.statusCode
      } catch (err) {
        result.sms_error = String(err)
      }
    } else {
      console.log(`[DRY RUN] would SMS ${customerPhone}: Invoice for $${total}`)
    }
  } else {
    result.sms_skipped_reason = "customer has no phone on file"
  }

  return e.json(200, result)
}, $apis.requireAuth())

// Gallery update notification to EWNexus Telegram
// Called by frontend when worker submits report with gallery-marked groups.
// Requires env var: EWNEXUS_TG_TOKEN and EWNEXUS_TG_CHAT_ID
routerAdd("POST", "/api/notify-gallery", (e) => {
  const auth = e.requestInfo().auth
  if (!auth) return e.json(401, {"error": "auth required"})

  const body = e.requestInfo().body
  const message = body.message || "Gallery update ready"

  const tgToken = $os.getenv("EWNEXUS_TG_TOKEN")
  const tgChatId = $os.getenv("EWNEXUS_TG_CHAT_ID")

  if (!tgToken || !tgChatId) {
    $app.logger().info("[GALLERY] DRY RUN — EWNEXUS_TG_TOKEN not set", "message", message)
    return e.json(200, {sent: false, reason: "Telegram not configured (dry-run)"})
  }

  const tgUrl = `https://api.telegram.org/bot${tgToken}/sendMessage`
  const payload = JSON.stringify({chat_id: tgChatId, text: message, parse_mode: "HTML"})

  const res = $http.send({
    url: tgUrl,
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: payload,
    timeout: 10,
  })

  if (res.statusCode === 200) {
    return e.json(200, {sent: true})
  } else {
    $app.logger().error("[GALLERY] Telegram send failed", "status", res.statusCode)
    return e.json(200, {sent: false, reason: `HTTP ${res.statusCode}`})
  }
}, $apis.requireAuth())

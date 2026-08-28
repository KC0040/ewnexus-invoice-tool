/// <reference path="../pb_data/types.d.ts" />

// Set subscription_tier = 'free' and trial_invoices_left = 5 on new company registration
onRecordCreate((e) => {
  if (!e.record.get("subscription_tier")) {
    e.record.set("subscription_tier", "free")
  }
  if (e.record.get("trial_invoices_left") === null || e.record.get("trial_invoices_left") === 0) {
    e.record.set("trial_invoices_left", 5)
  }
  e.next()
}, "companies")

// Decrement trial counter when a work order is finalized (status → completed/invoiced)
onRecordUpdate((e) => {
  const newStatus = e.record.get("status")
  const oldStatus = e.record.original().get("status")
  const finalStatuses = ["completed", "invoiced", "paid"]
  const wasNotFinal = !finalStatuses.includes(oldStatus)
  const isNowFinal = finalStatuses.includes(newStatus)

  if (wasNotFinal && isNowFinal) {
    try {
      const companyId = e.record.get("company")
      const company = $app.findRecordById("companies", companyId)
      const tier = company.get("subscription_tier") || "free"
      if (tier !== "free") { e.next(); return }

      const left = company.get("trial_invoices_left") ?? 0
      if (left <= 0) {
        throw new BadRequestError("Trial limit reached. Please upgrade to continue.")
      }
      company.set("trial_invoices_left", left - 1)
      $app.save(company)
    } catch (err) {
      if (err.message && err.message.includes("Trial limit")) throw err
    }
  }
  e.next()
}, "work_orders")

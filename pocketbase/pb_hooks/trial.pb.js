// Set trial_invoices_left = 5 on new company registration
onRecordCreate((e) => {
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
      const isPaid = company.get("is_paid")
      if (isPaid) { e.next(); return }

      const left = company.get("trial_invoices_left") ?? 0
      if (left <= 0) {
        throw new BadRequestError("Trial limit reached. Please upgrade to continue.")
      }
      company.set("trial_invoices_left", left - 1)
      $app.save(company)
    } catch (err) {
      if (err.message && err.message.includes("Trial limit")) throw err
      // ignore lookup errors, don't block
    }
  }
  e.next()
}, "work_orders")

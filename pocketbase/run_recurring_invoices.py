#!/usr/bin/env python3
"""
每天由cron呼叫一次：檢查全公司(跨所有worker帳號)的recurring_invoices，
把next_run_date <= 今天的都補到今天(可能一次補好幾期，比如機器關了幾天)。

用admin token(bypass所有collection的API rule)，因為要一次處理所有公司的帳號，
不能像人工測試那樣一次只認一個worker_token。

跟人工測試用的generate_next_invoice.py共用同一套「錨點日期」算法，
不是重寫一份——避免兩邊邏輯不同步。
"""
import sys
import json
import calendar
import urllib.request
import urllib.parse
from datetime import datetime, timezone, timedelta

PB = "http://127.0.0.1:8090"
ADMIN_EMAIL = "admin@ewnexus.com"
ADMIN_PASSWORD = "TempPass2026Invoice!"
LOG = "/mnt/work/CEO/projects/ewnexus-invoice-tool/pocketbase/recurring_cron.log"

FREQUENCY_MONTHS = {"monthly": 1, "quarterly": 3, "yearly": 12}
FREQUENCY_DAYS = {"weekly": 7, "biweekly": 14}


def api(method, path, token=None, body=None):
    req = urllib.request.Request(PB + path, method=method)
    if token:
        req.add_header("Authorization", token)
    if body is not None:
        req.add_header("Content-Type", "application/json")
        req.data = json.dumps(body).encode()
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())


def admin_login():
    res = api("POST", "/api/collections/_superusers/auth-with-password", body={
        "identity": ADMIN_EMAIL, "password": ADMIN_PASSWORD
    })
    if "token" not in res:
        raise RuntimeError(f"admin登入失敗: {res}")
    return res["token"]


def add_months(dt, months):
    total = dt.month - 1 + months
    year = dt.year + total // 12
    month = total % 12 + 1
    day = min(dt.day, calendar.monthrange(year, month)[1])
    return dt.replace(year=year, month=month, day=day)


def compute_next_date(start_date, frequency, periods_elapsed):
    if frequency in FREQUENCY_MONTHS:
        return add_months(start_date, FREQUENCY_MONTHS[frequency] * periods_elapsed)
    days = FREQUENCY_DAYS.get(frequency, 7)
    return start_date + timedelta(days=days * periods_elapsed)


def generate_one(rec, token):
    """幫一筆到期的recurring_invoice產生一張新invoice，並把next_run_date往後推一期。"""
    work_date = rec["next_run_date"][:10]
    wo_body = {
        "company": rec["company"],
        "customer": rec["customer"],
        "line_items": rec["line_items"],
        "subtotal": rec["total_amount"],
        "total_amount": rec["total_amount"],
        "payment_status": "unpaid",
        "work_date": work_date + " 00:00:00",
    }
    wo = api("POST", "/api/collections/work_orders/records", token, wo_body)
    if "id" not in wo:
        raise RuntimeError(f"產生work_order失敗 recurring_id={rec['id']}: {wo}")

    start_date_str = (rec.get("start_date") or rec["next_run_date"])[:10]
    start_date = datetime.fromisoformat(start_date_str)
    periods_elapsed = (rec.get("periods_elapsed") or 0) + 1
    new_next = compute_next_date(start_date, rec["frequency"], periods_elapsed)

    update_body = {
        "next_run_date": new_next.strftime("%Y-%m-%d 00:00:00"),
        "periods_elapsed": periods_elapsed,
    }
    if not rec.get("start_date"):
        update_body["start_date"] = start_date_str + " 00:00:00"
    updated = api("PATCH", f"/api/collections/recurring_invoices/records/{rec['id']}", token, update_body)
    send_result = api("POST", f"/api/send-invoice/{wo['id']}", token)
    return wo, updated, send_result


def run_due_recurring_invoices(dry_run=False):
    token = admin_login()
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    all_recs = api("GET", "/api/collections/recurring_invoices/records?perPage=500&filter=" +
                    urllib.parse.quote(f'active=true && next_run_date<="{today_str} 23:59:59"'), token)
    results = []
    for rec in all_recs.get("items", []):
        rid = rec["id"]
        safety_counter = 0
        while rec["next_run_date"][:10] <= today_str and safety_counter < 24:
            safety_counter += 1
            if dry_run:
                results.append({"recurring_id": rid, "would_generate_for": rec["next_run_date"][:10], "dry_run": True})
                break
            wo, updated_rec, send_result = generate_one(rec, token)
            results.append({
                "recurring_id": rid, "work_order_id": wo["id"],
                "amount": wo["total_amount"], "work_date": wo["work_date"][:10],
                "new_next_run_date": updated_rec["next_run_date"][:10],
                "send_result": send_result,
            })
            rec = updated_rec
            rec["line_items"] = rec.get("line_items") or []
    return results


if __name__ == "__main__":
    dry = "--dry-run" in sys.argv
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    try:
        results = run_due_recurring_invoices(dry_run=dry)
        with open(LOG, "a") as f:
            f.write(f"[{ts}] {'DRY-RUN ' if dry else ''}processed {len(results)} due recurring invoice(s)\n")
            for r in results:
                f.write(f"  {json.dumps(r)}\n")
        print(f"Processed {len(results)} due recurring invoice(s).")
        for r in results:
            print(" ", r)
    except Exception as e:
        with open(LOG, "a") as f:
            f.write(f"[{ts}] ERROR: {e}\n")
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)

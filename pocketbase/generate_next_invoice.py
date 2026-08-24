#!/usr/bin/env python3
"""
從 recurring_invoices 產生「下一筆」invoice。
月/季/年用「錨點日」(start_date的day) + periods_elapsed 算下一個日期，
不是疊加上一筆日期 —— 這樣卡到月底(1/31之類)被砍到28/29/30號後，
下個月還能自動跳回錨點日，不會永久卡在被砍過的日期。
週/兩週用天數疊加，沒有月底問題所以不需要錨點邏輯。
"""
import sys
import json
import calendar
import urllib.request
from datetime import datetime, timedelta

PB = "http://127.0.0.1:8090"

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


def add_months(dt, months):
    """加N個月，月底天數不夠(比如1/31+1個月)就砍到當月最後一天。"""
    total = dt.month - 1 + months
    year = dt.year + total // 12
    month = total % 12 + 1
    day = min(dt.day, calendar.monthrange(year, month)[1])
    return dt.replace(year=year, month=month, day=day)


def compute_next_date(start_date, frequency, periods_elapsed):
    """永遠從錨點(start_date)算第N期，不是從上一筆疊加，避免月底砍過的日期累積漂移。"""
    if frequency in FREQUENCY_MONTHS:
        return add_months(start_date, FREQUENCY_MONTHS[frequency] * periods_elapsed)
    days = FREQUENCY_DAYS.get(frequency, 7)
    return start_date + timedelta(days=days * periods_elapsed)


def generate_next_invoice(recurring_id, worker_token, override_date=None):
    """給一筆recurring_invoices記錄的id，產生一張新work_order，並把next_run_date往後推。
    override_date (YYYY-MM-DD)：工人手動微調過的日期，有給就蓋過系統算出來的建議值
    （系統只負責算建議日期，不自動改；微調永遠是工人手動做的）。
    """
    rec = api("GET", f"/api/collections/recurring_invoices/records/{recurring_id}", worker_token)
    if "id" not in rec:
        print("ERROR: 找不到這筆recurring_invoice:", rec)
        return None

    work_date = override_date if override_date else rec["next_run_date"][:10]
    wo_body = {
        "company": rec["company"],
        "customer": rec["customer"],
        "line_items": rec["line_items"],
        "subtotal": rec["total_amount"],
        "total_amount": rec["total_amount"],
        "payment_status": "unpaid",
        "work_date": work_date + " 00:00:00",
    }
    wo = api("POST", "/api/collections/work_orders/records", worker_token, wo_body)
    if "id" not in wo:
        print("ERROR: 產生work_order失敗:", wo)
        return None
    print(f"✅ 產生新invoice: {wo['id']}, 日期 {work_date}, 金額 ${wo['total_amount']}")

    # 第一次跑且還沒有start_date的舊資料，用目前的next_run_date補一個錨點
    start_date_str = rec.get("start_date") or rec["next_run_date"]
    start_date = datetime.fromisoformat(start_date_str[:10])
    periods_elapsed = rec.get("periods_elapsed", 0) + 1
    new_next = compute_next_date(start_date, rec["frequency"], periods_elapsed)

    update_body = {
        "next_run_date": new_next.strftime("%Y-%m-%d 00:00:00"),
        "periods_elapsed": periods_elapsed,
    }
    if not rec.get("start_date"):
        update_body["start_date"] = start_date_str[:10] + " 00:00:00"

    updated = api("PATCH", f"/api/collections/recurring_invoices/records/{recurring_id}", worker_token, update_body)
    print(f"✅ next_run_date 更新: {rec['next_run_date']} -> {updated.get('next_run_date')} (第{periods_elapsed}期)")
    return wo


def generate_batch(recurring_id, worker_token, count):
    """一次預先產生N筆未來日期的invoice，不用等排程一筆一筆觸發。"""
    results = []
    for i in range(count):
        wo = generate_next_invoice(recurring_id, worker_token)
        if wo is None:
            print(f"第{i+1}筆失敗，中止批次")
            break
        results.append(wo)
    print(f"\n批次完成：共產生 {len(results)}/{count} 筆")
    return results


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("用法: generate_next_invoice.py <recurring_invoice_id> <worker_token> [批次筆數，預設1]")
        sys.exit(1)
    count = int(sys.argv[3]) if len(sys.argv) > 3 else 1
    if count > 1:
        generate_batch(sys.argv[1], sys.argv[2], count)
    else:
        generate_next_invoice(sys.argv[1], sys.argv[2])

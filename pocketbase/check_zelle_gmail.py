"""
Zelle payment detector via Gmail IMAP.
Checks eastwestnexus@gmail.com for incoming Chase/Zelle payment emails
and auto-activates the matching company's subscription tier.

Required env vars:
  GMAIL_USER         = eastwestnexus@gmail.com
  GMAIL_APP_PASSWORD = (Gmail App Password — generate at myaccount.google.com/apppasswords)
  PB_URL             = http://localhost:8090  (internal, same container)
  PB_ADMIN_EMAIL     = admin@ewnexus.com
  PB_ADMIN_PASSWORD  = InvoiceAdmin2026!
"""

import imaplib, email, re, os, json, urllib.request, urllib.parse, urllib.error
from datetime import datetime, timedelta, timezone

GMAIL_USER     = os.getenv("GMAIL_USER", "")
GMAIL_APP_PASS = os.getenv("GMAIL_APP_PASSWORD", "")
PB_URL         = os.getenv("PB_URL", "http://localhost:8090")
ADMIN_EMAIL    = os.getenv("PB_ADMIN_EMAIL", "")
ADMIN_PASS     = os.getenv("PB_ADMIN_PASSWORD", "")

PRICE_BASE = 5.99
PRICE_PRO  = 8.99
TOLERANCE  = 0.10

ZELLE_SUBJECTS = [
    "you received money", "you've received money", "payment received",
    "zelle payment received", "chase: you received", "you received a zelle",
    "you received $", "money has been sent",
]

def pb_request(path, method="GET", body=None, token=None):
    url = PB_URL + path
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read())

def get_admin_token():
    r = pb_request("/api/collections/_superusers/auth-with-password", "POST",
                   {"identity": ADMIN_EMAIL, "password": ADMIN_PASS})
    return r.get("token")

def activate_company(email_addr, tier, ref, admin_token):
    enc = urllib.parse.quote(f"email='{email_addr}'")
    r = pb_request(f"/api/collections/companies/records?filter={enc}", token=admin_token)
    items = r.get("items", [])
    if not items:
        print(f"[zelle] no company found for {email_addr}")
        return False
    company = items[0]
    current_tier = company.get("subscription_tier", "")
    if current_tier == "pro" and tier == "base":
        print(f"[zelle] {email_addr} already Pro, skip base upgrade")
        return False
    exp = (datetime.now(timezone.utc) + timedelta(days=31)).strftime("%Y-%m-%d %H:%M:%S")
    result = pb_request(
        f"/api/collections/companies/records/{company['id']}",
        "PATCH",
        {"subscription_tier": tier, "is_paid": True,
         "tier_expires_at": exp, "tier_payment_ref": ref},
        token=admin_token
    )
    if result.get("id"):
        print(f"[zelle] activated {tier} for {email_addr} (ref: {ref})")
        return True
    print(f"[zelle] PATCH failed: {result}")
    return False

def parse_amount(text):
    for m in re.findall(r'\$\s*([\d,]+(?:\.\d{1,2})?)', text):
        try:
            val = float(m.replace(",", ""))
            if abs(val - PRICE_BASE) <= TOLERANCE:
                return val, "base"
            if abs(val - PRICE_PRO) <= TOLERANCE:
                return val, "pro"
        except ValueError:
            pass
    return None, None

def parse_sender_email(body):
    EXCLUDE = {"chase.com","zelle.com","earlywarning.com","ewnexus.com",
               "gmail.com","yahoo.com","hotmail.com","outlook.com","icloud.com"}
    for m in re.findall(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', body):
        domain = m.split("@")[-1].lower()
        if domain not in EXCLUDE:
            return m.lower()
    return None

def check_gmail():
    if not GMAIL_USER or not GMAIL_APP_PASS:
        print("[zelle] GMAIL_USER or GMAIL_APP_PASSWORD not set — skipping")
        return
    admin_token = get_admin_token()
    if not admin_token:
        print("[zelle] failed to get PocketBase admin token")
        return
    try:
        mail = imaplib.IMAP4_SSL("imap.gmail.com", 993)
        mail.login(GMAIL_USER, GMAIL_APP_PASS)
        mail.select("INBOX")
    except Exception as ex:
        print(f"[zelle] IMAP login failed: {ex}")
        return

    since = (datetime.now() - timedelta(days=7)).strftime("%d-%b-%Y")
    _, msg_ids = mail.search(None, f"(UNSEEN SINCE {since})")
    ids = msg_ids[0].split()
    print(f"[zelle] {len(ids)} unseen emails to check")

    for mid in ids:
        _, data = mail.fetch(mid, "(RFC822)")
        msg = email.message_from_bytes(data[0][1])
        subject = str(msg.get("Subject", "")).lower()
        if not any(kw in subject for kw in ZELLE_SUBJECTS):
            continue

        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    body += part.get_payload(decode=True).decode(errors="ignore")
        else:
            body = msg.get_payload(decode=True).decode(errors="ignore")

        full = subject + " " + body
        amount, tier = parse_amount(full)
        if not tier:
            print(f"[zelle] Zelle email found but amount not $5.99/$8.99 — subject: {subject[:60]}")
            continue

        company_email = parse_sender_email(body)
        if not company_email:
            print(f"[zelle] no company email found in body, skipping mid={mid}")
            mail.store(mid, "+FLAGS", "\\Seen")
            continue

        ref = f"zelle:gmail:{mid.decode() if isinstance(mid, bytes) else mid}"
        ok = activate_company(company_email, tier, ref, admin_token)
        if ok:
            mail.store(mid, "+FLAGS", "\\Seen")

    mail.logout()

if __name__ == "__main__":
    print(f"[zelle] {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} — checking Gmail")
    check_gmail()
    print("[zelle] done")

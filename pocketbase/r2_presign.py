#!/usr/bin/env python3
"""
Lightweight presigned URL server for Cloudflare R2.
Runs on port 8092, called by PocketBase hook.
Returns a presigned PUT URL valid for 15 minutes.
"""
import hmac, hashlib, datetime, os, json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlencode, quote

ACCESS_KEY = os.environ.get("R2_ACCESS_KEY_ID", "a85a5f2033e63caf08ffe1a43839fd22")
SECRET_KEY = os.environ.get("R2_SECRET_ACCESS_KEY", "311c078f4588b35b3325e1c9b599c0350a809c5c97f17a5087b20791aad9ed30")
ENDPOINT   = os.environ.get("R2_ENDPOINT", "https://bf9d8f64db94d0f9e024987c79b37659.r2.cloudflarestorage.com")
BUCKET     = os.environ.get("R2_BUCKET", "aegisrim-assets")
REGION     = "auto"
SERVICE    = "s3"

def sign(key, msg):
    return hmac.new(key, msg.encode(), hashlib.sha256).digest()

def get_signing_key(secret, date, region, service):
    return sign(sign(sign(sign(("AWS4" + secret).encode(), date), region), service), "aws4_request")

def presign_put(key, content_type="image/jpeg", expires=900):
    now = datetime.datetime.utcnow()
    date_str  = now.strftime("%Y%m%d")
    datetime_str = now.strftime("%Y%m%dT%H%M%SZ")
    host = ENDPOINT.replace("https://", "")

    credential_scope = f"{date_str}/{REGION}/{SERVICE}/aws4_request"
    credential = f"{ACCESS_KEY}/{credential_scope}"

    params = {
        "X-Amz-Algorithm":     "AWS4-HMAC-SHA256",
        "X-Amz-Credential":    credential,
        "X-Amz-Date":          datetime_str,
        "X-Amz-Expires":       str(expires),
        "X-Amz-SignedHeaders": "host",
    }
    canonical_qs = "&".join(f"{quote(k, safe='')}={quote(str(v), safe='')}" for k, v in sorted(params.items()))

    canonical_request = "\n".join([
        "PUT",
        f"/{BUCKET}/{key}",
        canonical_qs,
        f"host:{host}\n",
        "host",
        "UNSIGNED-PAYLOAD"
    ])

    string_to_sign = "\n".join([
        "AWS4-HMAC-SHA256",
        datetime_str,
        credential_scope,
        hashlib.sha256(canonical_request.encode()).hexdigest()
    ])

    signing_key = get_signing_key(SECRET_KEY, date_str, REGION, SERVICE)
    signature = hmac.new(signing_key, string_to_sign.encode(), hashlib.sha256).hexdigest()

    presigned = f"{ENDPOINT}/{BUCKET}/{key}?{canonical_qs}&X-Amz-Signature={signature}"
    public_url = f"{ENDPOINT}/{BUCKET}/{key}"
    return presigned, public_url

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args): pass  # quiet

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length)) if length else {}
        key = body.get("key", "test/unnamed.jpg")
        content_type = body.get("content_type", "image/jpeg")
        try:
            presigned, public_url = presign_put(key, content_type)
            resp = json.dumps({"presigned_url": presigned, "public_url": public_url}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(resp)
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'{"status":"ok"}')

if __name__ == "__main__":
    port = int(os.environ.get("PRESIGN_PORT", 8092))
    print(f"R2 presign server on port {port}")
    HTTPServer(("127.0.0.1", port), Handler).serve_forever()

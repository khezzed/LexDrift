# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import hashlib
import json

class Probe(gl.Contract):
    last_url: str
    last_status: str
    last_digest: str
    last_size: u256
    probe_records: TreeMap[str, str]

    def __init__(self):
        self.last_url = ""
        self.last_status = "INITIALIZED"
        self.last_digest = ""
        self.last_size = u256(0)

    @gl.public.write
    def probe_url(self, target_url: str) -> str:
        self.last_url = target_url

        def fetch_task() -> str:
            try:
                resp = gl.nondet.web.get(target_url)
                http_status = int(getattr(resp, "status", getattr(resp, "status_code", 0)))
                raw_body = resp.body if hasattr(resp, "body") and resp.body is not None else b""
                if isinstance(raw_body, str):
                    body_bytes = raw_body.encode("utf-8")
                else:
                    body_bytes = bytes(raw_body)

                size = len(body_bytes)
                digest = hashlib.sha256(body_bytes).hexdigest()
                sample = body_bytes[:160].decode("utf-8", errors="replace")

                data = {
                    "http_status": http_status,
                    "byte_size": size,
                    "sha256": digest,
                    "sample": sample
                }
                return json.dumps(data)
            except Exception as e:
                err_data = {
                    "http_status": 0,
                    "byte_size": 0,
                    "sha256": "ERROR",
                    "error": str(e)[:200]
                }
                return json.dumps(err_data)

        # Non-deterministic web fetch evaluated under strict equality consensus
        result_json = gl.eq_principle.strict_eq(fetch_task)
        res = json.loads(result_json)
        self.last_status = str(res.get("http_status", 0))
        self.last_digest = str(res.get("sha256", ""))
        self.last_size = u256(res.get("byte_size", 0))
        self.probe_records[target_url] = result_json
        return result_json

    @gl.public.view
    def get_probe_record(self, url: str) -> str:
        if url in self.probe_records:
            return self.probe_records[url]
        return ""

    @gl.public.view
    def get_last_probe(self) -> str:
        return json.dumps({
            "url": self.last_url,
            "status": self.last_status,
            "digest": self.last_digest,
            "size": int(self.last_size)
        })

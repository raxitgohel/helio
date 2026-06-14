"""Tiny static dev server that disables caching.

Python's stock http.server sends Last-Modified but no Cache-Control, so browsers
heuristically cache ES modules and reloads can serve stale JS. During dev we want
every reload to fetch fresh code, so we force no-store.

Usage: python devserver.py [port] [directory]
"""
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8137
DIRECTORY = sys.argv[2] if len(sys.argv) > 2 else "."


class NoCacheHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    print(f"Helio dev server (no-cache) on http://127.0.0.1:{PORT} serving {DIRECTORY}")
    ThreadingHTTPServer(("127.0.0.1", PORT), NoCacheHandler).serve_forever()

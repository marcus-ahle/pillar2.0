"""Local preview server for the Pillar prototype.

Same as `python3 -m http.server`, but tells the browser never to cache,
so edits to pages, styles and data show up on a normal refresh, and serves
pages at clean URLs (/hockey → hockey.html) like the Node server and Netlify.
This static preview has no content API, so pages use the bundled data.js.

Run from this folder:  python3 serve.py   (then open http://localhost:4173)
"""
import http.server
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4173


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        local = super().translate_path(path)
        if not os.path.exists(local) and os.path.exists(local + ".html"):
            return local + ".html"
        return local

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    with http.server.ThreadingHTTPServer(("", PORT), NoCacheHandler) as httpd:
        print(f"Pillar prototype running at http://localhost:{PORT}  (Ctrl+C to stop)")
        httpd.serve_forever()

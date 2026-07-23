"""
OSRS Board Game — Start Script
Runs an HTTP server and opens the game in the browser.
Usage: python start_game.py
"""

import http.server
import socketserver
import webbrowser
import threading
import os
import sys

PORT = 8080
DIR = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

    def log_message(self, format, *args):
        print(f"  {args[0]}")

def main():
    os.chdir(DIR)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}/index.html"
        print(f"\n  🏰 OSRS Board Game")
        print(f"  Server: {url}")
        print(f"  Press Ctrl+C to stop\n")

        # Open browser after a tiny delay
        threading.Timer(0.5, lambda: webbrowser.open(url)).start()

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n  Server stopped.\n")
            httpd.shutdown()

if __name__ == "__main__":
    main()

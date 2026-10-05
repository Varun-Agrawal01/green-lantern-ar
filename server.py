#!/usr/bin/env python3
"""
Lightweight HTTP Server for Green Lantern AR Web App.
Ensures correct MIME types and headers for WebGL, AudioContext, and MediaPipe CDN assets.
"""

import http.server
import socketserver
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class LanternHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and cross-origin resource access
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

def main():
    os.chdir(DIRECTORY)
    # Allow port reuse immediately upon restart
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), LanternHTTPRequestHandler) as httpd:
        print(f"================================================================")
        print(f"  GREEN LANTERN AR: SECTOR 2814 ONLINE")
        print(f"  Local URL: http://localhost:{PORT}")
        print(f"  Directory: {DIRECTORY}")
        print(f"================================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down Green Lantern server.")
            sys.exit(0)

if __name__ == '__main__':
    main()

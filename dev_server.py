import http.server
import socketserver
import argparse


parser = argparse.ArgumentParser()
parser.add_argument('--host', help='specify host (default: localhost)')
parser.add_argument('--port', help='specify port (default: 8000)',
                    type=int)
args = parser.parse_args()

host = args.host or 'localhost'
port = args.port or 8000

Handler = http.server.SimpleHTTPRequestHandler

httpd = socketserver.TCPServer((host, port), Handler)

print('Serving ruzsa at http://' + host + ':' + str(port) + '/dist')
httpd.serve_forever()

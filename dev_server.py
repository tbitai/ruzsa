import http.server
import socketserver


HOST = 'localhost'
PORT = 8000

Handler = http.server.SimpleHTTPRequestHandler

httpd = socketserver.TCPServer((HOST, PORT), Handler)

print('Serving ruzsa at http://' + HOST + ':' + str(PORT) + '/dist')
httpd.serve_forever()

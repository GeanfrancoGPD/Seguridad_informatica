# 📦 Comandos Básicos de Docker y Red

## 🐳 Docker – Comandos Generales

### Ver versión e información

```bash
docker --version
docker info
```

# Listar imágenes

```js
 docker images
```

# Descargar una imagen

```js
docker pull ubuntu
```

# Eliminar una imagen

```js
docker rmi ubuntu
```

Construir una imagen desde Dockerfile
docker build -t mi_imagen .

▶️ Docker – Contenedores
Listar contenedores
docker ps # en ejecución
docker ps -a # todos

Crear y ejecutar un contenedor
docker run ubuntu
docker run -it ubuntu /bin/bash
docker run -d -p 8080:80 nginx

Iniciar / detener / reiniciar
docker start <id_contenedor>
docker stop <id_contenedor>
docker restart <id_contenedor>

Eliminar contenedores
docker rm <id_contenedor>
docker rm -f <id_contenedor>

Ver logs
docker logs <id_contenedor>

Ejecutar comando dentro del contenedor
docker exec -it <id_contenedor> bash

💾 Docker – Volúmenes
Listar volúmenes
docker volume ls

Crear volumen
docker volume create mi_volumen

Usar volumen en un contenedor
docker run -v mi_volumen:/data ubuntu

Eliminar volumen
docker volume rm mi_volumen

🌐 Docker – Redes (Networking)
Listar redes
docker network ls

Crear una red
docker network create mi_red

Inspeccionar una red
docker network inspect mi_red

Conectar un contenedor a una red
docker network connect mi_red contenedor1

Desconectar contenedor de una red
docker network disconnect mi_red contenedor1

Ejecutar contenedor en una red específica
docker run --network mi_red nginx

Eliminar red
docker network rm mi_red

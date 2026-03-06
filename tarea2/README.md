## Los que falta agregar al compose

```js
servidor_back:
    build:
      context: ./servidor/backend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3001"
    environment:
      DB_HOST: envios_db
      LDAP_URL: ldap://openldap:389
    depends_on:
      - envios_db
    networks:
      - red_apps
      - red_db
      - red_publica

despachador:
    build:
      context: ./despachador
      dockerfile: Dockerfile.dev
    tty: true
    stdin_open: true
    networks:
      - red_apps

  atencion_cliente:
    build:
      context: ./atencion_cliente
      dockerfile: Dockerfile.dev
    tty: true
    stdin_open: true
    networks:
      - red_apps
      - red_ldap

  admin_dashboard:
    build:
      context: ./admin
      dockerfile: Dockerfile.dev
    tty: true
    stdin_open: true
    networks:
      - red_apps
      - red_ldap

```

# Comandos de docker

### Para iniciar los contenedores

```js
Docker-compose up -d build

```

### Para ver los logs de un contenedor

```js
Docker-compose logs <nombre_contenedor>

```

### Para entrar a un contenedor

```js
Docker-compose exec <nombre_contenedor> bash

O

Docker-compose attach <nombre_contenedor>

```

### Para detener los contenedores

```js
Docker-compose down

```

## Config del ldap

para meterse al contenedor del ldap:

```js
docker-compose exec tarea2-ldap-1 bash
```

Para ver a los usuarios creados:

```python
ldapsearch -x -H ldap://localhost -D "cn=admin,dc=envios,dc=local" -w admin -b "dc=envios,dc=local" "(objectClass=inetOrgPerson)"
```

Ejemplo para probar usuario:

```python
ldapwhoami -x -H ldap://localhost -D "uid=Geanfranco,ou=employees,dc=envios,dc=local" -w Mango123
```

Ejemplo de archivo ldif para crear un usuario:

```python
dn: uid=Geanfranco,ou=employees,dc=envios,dc=local
objectClass: inetOrgPerson
uid: Geanfranco
sn: Piccioni cn:
Geanfranco Piccioni
userPassword: Mango123

dn: uid=Andres,ou=employees,dc=envios,dc=local
objectClass: inetOrgPerson
uid: Andres
sn: Nava
cn: Andres Nava
userPassword: Pera123
```

Ejemplo de archivo ldif para crear un grupo o roles:

```python
dn: cn=Administradores,ou=roles,dc=envios,dc=local
objectClass: top
objectClass: groupOfNames
cn: Administradores
member: uid=Geanfranco,ou=employees,dc=envios,dc=local

dn: cn=Empleados,ou=roles,dc=envios,dc=local
objectClass: top
objectClass: groupOfNames
cn: Empleados
member: uid=Geanfranco,ou=employees,dc=envios,dc=local
member: uid=Andres,ou=employees,dc=envios,dc=local

```

Ejemplo de la base o estructura del ldap:

```python
dn: dc=envios,dc=local
objectClass: top
objectClass: dcObject
objectClass: organization
o: Envios
dc: envios

dn: ou=employees,dc=envios,dc=local
objectClass: top
objectClass: organizationalUnit
ou: employees

dn: ou=roles,dc=envios,dc=local
objectClass: top
objectClass: organizationalUnit
ou: roles
```

## Certificados ssl

Para generar los certificados ssl, se puede usar el siguiente comando:

```js
openssl req -x509 -nodes -days 365 \
-newkey rsa:2048 \
-keyout server.key \
-out server.crt
```

Pidendo información como el país, estado, localidad, organización(ejemplo de la organización
: empleados.local), unidad organizativa, nombre común y correo electrónico. Se pueden dejar en blanco o poner cualquier valor.

Luego, se deben copiar los archivos server.key y server.crt al directorio proxy/certs/ para que el proxy pueda usarlos.

Tambien se puede usar este comando para generar un certificado autofirmado:

```js
docker run --rm -v ${PWD}:/certs alpine sh -c "apk add --no-cache openssl && openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /certs/server.key -out /certs/server.crt -subj '/C=ES/ST=LaRioja/L=Logrono/O=EmpresaEnvios/CN=empleados.local'"
```

## Para hashear las contraseñas

```js
docker exec -it ldap-envios slappasswd -s Mango123
docker exec -it ldap-envios slappasswd -s Pera123
```

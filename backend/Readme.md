# Proyecto de Gestión de Guardarropa

Este proyecto es un sistema integral de gestión de guardarropa y clientes VIP.

## Requisitos

- Node.js
- npm

## Instalación

1. Clona el repositorio:
    ```sh
    git clone <URL_DEL_REPOSITORIO>
    cd <NOMBRE_DEL_REPOSITORIO>
    ```

2. Instala las dependencias:
    ```sh
    npm install
    ```

3. Configura el archivo `.env`:
    - Copia el archivo `.env_example` y renómbralo a `.env`:
        ```sh
        cp backend/.env_example backend/.env
        ```

    - Abre el archivo `.env` y completa las variables necesarias. Puedes generar claves secretas utilizando [esta web](https://fgarcia93mdz.github.io/Generate_token_secret/).

## Ejecución

1. Inicia el servidor:
    ```sh
    npm start
    ```

## Variables de Entorno

A continuación se detallan las variables de entorno que debes configurar en el archivo `.env`:

```env
# Claves secretas
TOKEN_SECRET = ""
SESSION_SECRET = ""

# Puertos
PORT_DEV = 9090
PORT_PROD = 3000

# Host
NAME_HOST = "localhost"
NAME_HOST_PROD = ""

# Entorno
NODE_ENV = ""

# Configuración de STMP de mailer para el envío de mails del sistema
MAILER_USER = ""
MAILER_PASS = ""
MAILER_ALIAS = ""

# URL de inicio de sesión
LOGIN_URL = "#"

# URL para Socket
URL_SOCKET_LOCAL_FRONT = "http://localhost:5173"
URL_SOCKET_PRODUCT_FRONT = "https://publicidadtd.com.ar"

# Configuración de la base de datos
USER_NAME= ""
PASSWORD= ""
HOST= "127.0.0.1"
DATABASE= ""
DIALECT= "mysql"
SECRET_KEY= ""

# Configuración de la base de datos en producción
USER_NAME_PROD= ""
PASSWORD_PROD= ""
HOST_PROD= "127.0.0.1"
DATABASE_PROD= ""
DIALECT_PROD= "mysql"
SECRET_KEY_PROD= ""

# Swagger
AUTH_USERNAME="admin"
AUTH_PASSWORD="$2a$12$qgxRDoeVoasuccaw.qqna.lOUdBM0aILznID3MrSePHvy1SZO3Op."
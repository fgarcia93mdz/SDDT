# 🔥 SDDT - Sistema de Detección Temprana

## Descripción
**SDDT** es un sistema diseñado para la detección temprana de incendios. Utiliza una **cámara IP** y un **modelo de detección basado en YOLO** para identificar posibles incendios en tiempo real. Cuando se detecta un incendio, el sistema alerta al cliente mediante **correo electrónico** y un **mensaje de Telegram**, incluyendo una imagen y un video del incidente.

## Características
- 📡 **Detección en Tiempo Real**: Utiliza un modelo de YOLO para detectar incendios en tiempo real.
- 📧 **Alertas Automáticas**: Envía alertas automáticas por correo electrónico y Telegram cuando se detecta un incendio.
- 🎥 **Grabación de Video**: Graba un video de 15 segundos del incidente y lo envía al cliente.
- 🖥️ **Interfaz de Visualización**: Muestra el video en vivo y abre una ventana con la imagen del incendio cuando se detecta.

## Requisitos
- Python 3.6 o superior
- OpenCV
- smtplib
- telegram
- asyncio
- ultralytics (YOLO)

## Instalación
1. Clona este repositorio:
   ```sh
   git clone https://github.com/fgarcia93mdz/SDDT.git
2. Navega al directorio del proyecto:
   ```sh
   cd SDDT
3. Instala las dependencias:
   ```sh
   pip install -r requirements.txt     

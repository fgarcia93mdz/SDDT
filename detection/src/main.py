import sys
import os
import asyncio
import yaml

# Agregar el directorio raíz del proyecto al PYTHONPATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from email_service import EmailService
from telegram_service import TelegramService
from fire_detection import FireDetection
from src.database import SessionLocal, Camera

def main():
    config_path = 'config/config.yaml'
    with open(config_path, 'r') as file:
        config = yaml.safe_load(file)

    # Obtener la configuración de la base de datos
    db = SessionLocal()
    try:
        camera_id = 1  # Ajusta el ID de la cámara según sea necesario
        camera = db.query(Camera).filter(Camera.id == camera_id).first()
        if not camera:
            raise ValueError(f"No se encontró la cámara con ID {camera_id}")

        email_service = EmailService(config_path)
        telegram_service = TelegramService(config_path)
        fire_detection = FireDetection(camera_id=camera_id, encryption_key=config['encryption_key'], mode=config['mode'])

        image_path = fire_detection.detect_fire()
        if image_path:
            client_data = fire_detection.client_data
            subject = f"Alerta de Incendio"
            body = f"""
            🚨 *Alerta de Incendio* 🚨
            
            Hola, {client_data['name']}, se ha detectado fuego en el video.
            
            ⚠️ Llame a los servicios de emergencia e indique la ubicación:
            {client_data['emergency_contacts']} - Ubicación: {client_data['location']}
               
            Este mensaje ha sido generado automáticamente por el sistema de detección de incendios.
            
            Saludos,
            Sistema de Detección de Incendios
            """
            email_service.send_email(subject, body, client_data['email'], image_path)
            telegram_message = f"""
            🚨 *Alerta de Incendio* 🚨
            
            Hola, {client_data['name']}, se ha detectado fuego en el video.
            
            ⚠️ Llame a los servicios de emergencia e indique la ubicación:
            {client_data['emergency_contacts']} - Ubicación: {client_data['location']}
            
            Este mensaje ha sido generado automáticamente por el sistema de detección de incendios.
            
            Saludos,
            *Sistema de Detección de Incendios*
            """
            asyncio.run(telegram_service.send_telegram_message(telegram_message, client_data['telegram_id'], image_path))
            
            # Eliminar la imagen después de enviarla
            try:
                os.remove(image_path)
                print(f"Imagen {image_path} eliminada correctamente.")
            except Exception as e:
                print(f"Error al eliminar la imagen {image_path}: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
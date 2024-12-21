import sys
import os
import asyncio
import yaml
from email_service import EmailService
from telegram_service import TelegramService
from fire_detection import FireDetection
from src.database import SessionLocal, Client

# Agregar el directorio raíz del proyecto al PYTHONPATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def main():
    config_path = 'config/config.yaml'
    with open(config_path, 'r') as file:
        config = yaml.safe_load(file)

    # Obtener la configuración de la base de datos
    db = SessionLocal()
    try:
        client = db.query(Client).filter(Client.id == 1).first()  # Ajusta el ID del cliente según sea necesario
        if not client:
            raise ValueError("No se encontró el cliente con ID 1")

        email_service = EmailService(config_path)
        telegram_service = TelegramService(config_path)
        fire_detection = FireDetection(camera_id=1)  # Ajusta el ID de la cámara según sea necesario

        image_path = fire_detection.detect_fire()
        if image_path:
            client_data = fire_detection.client_data
            subject = f"Alerta de Incendio para {client_data['name']}"
            body = f"""
            Alerta de Incendio para {client_data['name']}
            
            Se ha detectado fuego en el video.
            Por favor, tome las medidas necesarias de inmediato.
            
            ⚠️ Llame a los servicios de emergencia:
            {client_data['emergency_contacts']}
            
            Este mensaje ha sido generado automáticamente por el sistema de detección de incendios.
            
            Saludos,
            Sistema de Detección de Incendios
            """
            email_service.send_email(subject, body, client_data['email'], image_path)
            telegram_message = f"""
            🚨 *Alerta de Incendio* 🚨
            
            Se ha detectado fuego en el video.
            
            ⚠️ Llame a los servicios de emergencia:
            {client_data['emergency_contacts']}
            
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
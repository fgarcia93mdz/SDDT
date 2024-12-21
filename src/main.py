import asyncio
import os
from email_service import EmailService
from telegram_service import TelegramService
from detection import FireDetection

def main():
    config_path = 'config/config.yaml'
    email_service = EmailService(config_path)
    telegram_service = TelegramService(config_path)
    fire_detection = FireDetection(config_path)

    image_path = fire_detection.detect_fire()
    if image_path:
        subject = "Alerta de Incendio"
        body = """
        Alerta de Incendio para Logistica Norte
        
        Se ha detectado fuego en el video.
        Por favor, tome las medidas necesarias de inmediato.
        
        ⚠️ Llame a los servicios de emergencia:
        Bomberos: 123, Policía: 456, Ambulancia: 789
        
        Este mensaje ha sido generado automáticamente por el sistema de detección de incendios.
        
        Saludos,
        Sistema de Detección de Incendios
        """
        email_service.send_email(subject, body, image_path)
        telegram_message = """
        🚨 *Alerta de Incendio* 🚨
        
        Se ha detectado fuego en el video.
        
        ⚠️ Llame a los servicios de emergencia:
        Bomberos: 123, Policía: 456, Ambulancia: 789
        
        Este mensaje ha sido generado automáticamente por el sistema de detección de incendios.
        
        Saludos,
        *Sistema de Detección de Incendios*
        """
        asyncio.run(telegram_service.send_telegram_message(telegram_message, image_path))
        
        # Eliminar la imagen después de enviarla
        try:
            os.remove(image_path)
            print(f"Imagen {image_path} eliminada correctamente.")
        except Exception as e:
            print(f"Error al eliminar la imagen {image_path}: {e}")

if __name__ == "__main__":
    main()
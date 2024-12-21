import sys
import os

# Agregar el directorio raíz del proyecto al PYTHONPATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.database import SessionLocal, Client, Camera, AlertHistory

def test_db():
    # Crear una nueva sesión
    db = SessionLocal()

    try:
        # Crear un nuevo cliente
        client = Client(
            name="Logistica Norte",
            email="contacto@logisticanorte.com",
            telegram_id="123456789",
            location="Av. Siempre Viva 123",
            emergency_contacts="Bomberos: 123, Policía: 456, Ambulancia: 789"
        )
        db.add(client)
        db.commit()
        db.refresh(client)
        print(f"Cliente agregado: {client}")

        # Crear una nueva cámara
        camera = Camera(
            name="Cámara Principal",
            ip="rtsp://admin:Alem449P1@192.168.1.93:554/stream",
            number="001",
            client_id=client.id
        )
        camera.ip = camera.ip_encrypted  # Encriptar la IP antes de guardar
        db.add(camera)
        db.commit()
        db.refresh(camera)
        print(f"Cámara agregada: {camera}")

        # Leer los datos del cliente
        client_from_db = db.query(Client).filter(Client.id == client.id).first()
        print(f"Cliente desde la base de datos: {client_from_db}")

        # Leer los datos de la cámara
        camera_from_db = db.query(Camera).filter(Camera.id == camera.id).first()
        camera_from_db.ip = camera_from_db.ip_encrypted  # Desencriptar la IP
        print(f"Cámara desde la base de datos: {camera_from_db}")

        # Actualizar los datos del cliente
        client_from_db.name = "Logistica Sur"
        db.commit()
        print(f"Cliente actualizado: {client_from_db}")

        # Eliminar la cámara
        db.delete(camera_from_db)
        db.commit()
        print(f"Cámara eliminada: {camera_from_db}")

    finally:
        db.close()

if __name__ == "__main__":
    test_db()
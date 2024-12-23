import sys
import os

# Agregar el directorio raíz del proyecto al PYTHONPATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.database import Base, engine, SessionLocal, Client, Camera, AlertHistory

def init_db():
    # Crear las tablas
    Base.metadata.create_all(bind=engine)

    # Agregar datos iniciales si es necesario
    db = SessionLocal()
    try:
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

        camera = Camera(
            name="Cámara Principal",
            ip="rtsp://admin:password@Ip:Port/stream",
            number="001",
            client_id=client.id
        )
        db.add(camera)
        db.commit()
        db.refresh(camera)
        print(f"Cámara agregada: {camera}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
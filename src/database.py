from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import yaml
from datetime import datetime
import pymysql
from cryptography.fernet import Fernet

# Usar PyMySQL como reemplazo de MySQLdb
pymysql.install_as_MySQLdb()

# Cargar configuraciones desde el archivo config.yaml
with open('config/config.yaml', 'r') as file:
    config = yaml.safe_load(file)

db_config = config['database']
DATABASE_URL = f"{db_config['dialect']}://{db_config['user']}:{db_config['password']}@{db_config['host']}/{db_config['database']}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Usar la clave de encriptación generada
key = b'zVWeTaeSuIKIRocTBmR9U5BTju5I3fG4IA7BQGCZUsk='  # Reemplaza esto con tu clave generada
cipher_suite = Fernet(key)

class Client(Base):
    __tablename__ = "clients"
    __table_args__ = {'schema': 'sddt'}  # Especificar el esquema

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    email = Column(String(100), index=True)
    telegram_id = Column(String(100), index=True)
    location = Column(String(200), index=True)
    emergency_contacts = Column(String(200), index=True)
    cameras = relationship("Camera", back_populates="client")

class Camera(Base):
    __tablename__ = "cameras"
    __table_args__ = {'schema': 'sddt'}  # Especificar el esquema

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    ip = Column(String(500), index=True)  # Aumentar la longitud de la columna ip
    number = Column(String(50), index=True)
    client_id = Column(Integer, ForeignKey('sddt.clients.id'))
    client = relationship("Client", back_populates="cameras")

    @property
    def ip_encrypted(self):
        return cipher_suite.encrypt(self.ip.encode()).decode()

    @ip_encrypted.setter
    def ip_encrypted(self, value):
        self.ip = cipher_suite.decrypt(value.encode()).decode()

class AlertHistory(Base):
    __tablename__ = "alert_history"
    __table_args__ = {'schema': 'sddt'}  # Especificar el esquema

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey('sddt.cameras.id'))
    timestamp = Column(DateTime, default=datetime.utcnow)
    alert_type = Column(String(50), index=True)
    camera = relationship("Camera")

Base.metadata.create_all(bind=engine)
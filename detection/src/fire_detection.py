from ultralytics import YOLO
import cv2
import math
from cryptography.fernet import Fernet
from src.database import SessionLocal, Camera, Client, AlertHistory
from datetime import datetime

class FireDetection:
    def __init__(self, camera_id, encryption_key, mode='development'):
        self.camera_id = camera_id
        self.encryption_key = encryption_key
        self.mode = mode  # Definir la variable mode
        self.model = YOLO('models/BestModel.pt')
        self.classnames = ['Fire', 'Smoke']
        self.colors = {'Fire': (0, 0, 255), 'Smoke': (255, 0, 0)}
        self.sample_video_path = 'assets/samples/firevideo3.mp4'

        # Desencriptar la URL de la cámara y obtener los datos del cliente desde la base de datos
        self.camera_url, self.client_data = self.get_camera_and_client_data(self.camera_id)

    def get_camera_and_client_data(self, camera_id):
        db = SessionLocal()
        try:
            camera = db.query(Camera).filter(Camera.id == camera_id).first()
            if camera:
                client = db.query(Client).filter(Client.id == camera.client_id).first()
                if client:
                    client_data = {
                        'name': client.name,
                        'email': client.email,
                        'telegram_id': client.telegram_id,
                        'location': client.location,
                        'emergency_contacts': client.emergency_contacts
                    }
                    # Desencriptar la IP de la cámara
                    decrypted_ip = Fernet(self.encryption_key).decrypt(camera.ip.encode()).decode()
                    return decrypted_ip, client_data
                else:
                    raise ValueError(f"No se encontró el cliente con ID {camera.client_id}")
            else:
                raise ValueError(f"No se encontró la cámara con ID {camera_id}")
        finally:
            db.close()

    def detect_fire(self):
        cap = cv2.VideoCapture(self.sample_video_path if self.mode == 'development' else self.camera_url)

        if not cap.isOpened():
            print("Error: Cannot open video stream.")
            return

        while True:
            ret, frame = cap.read()
            if not ret:
                print("End of video stream or cannot read frame.")
                break

            cv2.imshow('Camera Stream', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

            blurred = cv2.GaussianBlur(frame, (5, 5), 0)
            h, w = frame.shape[:2]
            aspect_ratio = w / h
            frame = cv2.resize(blurred, (1280, int(1280 / aspect_ratio)))

            results = self.model(frame)
            for result in results:
                for box in result.boxes:
                    confidence = box.conf[0]
                    confidence = math.ceil(confidence * 100)
                    class_id = int(box.cls[0])

                    if confidence > 50:
                        x1, y1, x2, y2 = box.xyxy[0]
                        x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                        class_name = self.classnames[class_id]
                        box_color = self.colors[class_name]

                        cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, thickness=2)
                        label = f'{class_name} {confidence}%'
                        font = cv2.FONT_HERSHEY_TRIPLEX
                        font_scale = 0.6
                        font_thickness = 1
                        text_size = cv2.getTextSize(label, font, font_scale, font_thickness)[0]
                        text_x = x1
                        text_y = y1 - 10 if y1 - 10 > 10 else y1 + 10
                        cv2.rectangle(frame, (text_x, text_y - text_size[1] - 5), 
                                      (text_x + text_size[0] + 5, text_y + 5), box_color, -1)
                        cv2.putText(frame, label, (text_x, text_y), font, font_scale, 
                                    (255, 255, 255), thickness=font_thickness, lineType=cv2.LINE_AA)

                        image_path = 'incendio.jpg'
                        cv2.imwrite(image_path, frame)
                        cv2.imshow('Incendio Detectado', frame)
                        cv2.waitKey(5000)

                        # Almacenar la alerta en la base de datos
                        self.save_alert_to_db()

                        return image_path

        cap.release()
        cv2.destroyAllWindows()

    def save_alert_to_db(self):
        db = SessionLocal()
        try:
            alert = AlertHistory(
                camera_id=self.camera_id,
                timestamp=datetime.utcnow(),
                alert_type='Fire'
            )
            db.add(alert)
            db.commit()
            print("Alerta almacenada en la base de datos.")
        except Exception as e:
            db.rollback()
            print(f"Error al almacenar la alerta en la base de datos: {e}")
        finally:
            db.close()
from ultralytics import YOLO
import cv2
import math
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import telegram
import asyncio
import os

# Configuración del correo electrónico
smtp_server = 'smtp.gmail.com'
smtp_port = 587
smtp_user = '...'
smtp_password = '...'
to_email = '....'

# Configuración de Telegram
bot_token = '...'
chat_id = '...'

def send_email(subject, body, image_path):
    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'plain'))

    with open(image_path, 'rb') as f:
        img_data = f.read()
    image = MIMEImage(img_data, name='incendio.jpg')
    msg.attach(image)

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        text = msg.as_string()
        server.sendmail(smtp_user, to_email, text)
        server.quit()
        print("Email sent successfully")
    except Exception as e:
        print(f"Failed to send email: {e}")

async def send_telegram_message(message, image_path, video_path):
    bot = telegram.Bot(token=bot_token)
    try:
        await bot.send_message(chat_id=chat_id, text=message)
        with open(image_path, 'rb') as f:
            await bot.send_photo(chat_id=chat_id, photo=f)
        with open(video_path, 'rb') as f:
            await bot.send_video(chat_id=chat_id, video=f)
        print("Telegram message sent")
    except Exception as e:
        print(f"Failed to send Telegram message: {e}")

# URL de la cámara IP y su identificador
camera_url = 'rtsp://admin:Alem449P1@192.168.1.93:554/stream'
camera_id = 'Cámara 1 - Almacén'
client_name = 'Logistica Norte'
emergency_numbers = 'Bomberos: 123, Policía: 456, Ambulancia: 789'

cap = cv2.VideoCapture(camera_url)

if not cap.isOpened():
    print("Error: Cannot open video stream.")
    exit()

model = YOLO('BestModel.pt')
classnames = ['Fire', 'Smoke']
colors = {'Fire': (0, 0, 255),
          'Smoke': (255, 0, 0)}

email_sent = False
telegram_sent = False

while True:
    ret, frame = cap.read()
    if not ret:
        print("End of video stream or cannot read frame.")
        break

    # Mostrar el video en vivo
    cv2.imshow('Camera Stream', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

    # Preprocesamiento: suavizar la imagen
    blurred = cv2.GaussianBlur(frame, (5, 5), 0)

    h, w = frame.shape[:2]
    aspect_ratio = w / h
    frame = cv2.resize(blurred, (1280, int(1280 / aspect_ratio)))  # Aumentar la resolución

    results = model(frame)

    for result in results:
        for box in result.boxes:
            confidence = box.conf[0]
            confidence = math.ceil(confidence * 100)
            class_id = int(box.cls[0])
            
            if confidence > 50 and not email_sent and not telegram_sent:  # Ajusta el umbral de confianza según sea necesario
                x1, y1, x2, y2 = box.xyxy[0]
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                class_name = classnames[class_id]
                box_color = colors[class_name]

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

                # Guardar la imagen del incendio
                image_path = 'incendio.jpg'
                cv2.imwrite(image_path, frame)

                # Mostrar la imagen del incendio en una nueva ventana
                cv2.imshow('Incendio Detectado', frame)
                cv2.waitKey(5000)  # Mostrar la ventana durante 5 segundos

                # Enviar correo electrónico si se detecta fuego con más de un 50% de confianza
                if class_name == 'Fire':
                    alert_class = 'fuego' if class_name == 'Fire' else 'humo'
                    subject = f"Alerta de Incendio - {camera_id}"
                    body = f"""
                    Alerta de Incendio para {client_name}
                    
                    Se ha detectado fuego en el video con una confianza del {confidence}%.
                    Por favor, tome las medidas necesarias de inmediato.
                    
                    Detalles de la detección:
                    - Confianza: {confidence}%
                    - Clase detectada: {alert_class}
                    - Coordenadas de la caja delimitadora: ({x1}, {y1}), ({x2}, {y2})
                    - Ubicación de la cámara: {camera_id}
                    
                    ⚠️ Llame a los servicios de emergencia:
                    {emergency_numbers}
                    
                    Este mensaje ha sido generado automáticamente por el sistema de detección de incendios.
                    
                    Saludos,
                    Sistema de Detección de Incendios
                    """
                    send_email(subject, body, image_path)
                    email_sent = True  # Marcar que el correo electrónico ha sido enviado

                    # Grabar video de 15 segundos en formato MP4
                    video_path = 'incendio.mp4'
                    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                    out = cv2.VideoWriter(video_path, fourcc, 20.0, (frame.shape[1], frame.shape[0]))

                    for _ in range(300):  # 15 segundos a 20 fps
                        ret, frame = cap.read()
                        if not ret:
                            print("Error: No se pudo leer el frame del video.")
                            break
                        out.write(frame)

                    out.release()
                    print(f"Video guardado en {video_path}")

                    # Verificar si el archivo de video existe
                    if os.path.exists(video_path):
                        print(f"El archivo de video {video_path} se ha creado correctamente.")
                    else:
                        print(f"Error: El archivo de video {video_path} no se ha creado.")

                    # Enviar mensaje de Telegram con el video
                    telegram_message = f"""
                    🚨 *Alerta de Incendio* 🚨
                    
                    Se ha detectado fuego en el video con una confianza del *{confidence}%*.
                    
                    🔍 *Detalles de la detección*:
                    - Confianza: {confidence}%
                    - Clase detectada: {alert_class}
                    - Ubicación de la cámara: {camera_id}
                    
                    ⚠️ Llame a los servicios de emergencia:
                    {emergency_numbers}
                    
                    Este mensaje ha sido generado automáticamente por el sistema de detección de incendios.
                    
                    Saludos,
                    *Sistema de Detección de Incendios*
                    """
                    asyncio.run(send_telegram_message(telegram_message, image_path, video_path))
                    telegram_sent = True  # Marcar que el mensaje de Telegram ha sido enviado

cap.release()
cv2.destroyAllWindows()
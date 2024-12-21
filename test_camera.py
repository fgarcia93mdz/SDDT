import cv2
import telegram
import asyncio

# Configuración de Telegram
bot_token = '8112671239:AAGwFghCO31P0SxAKFk9vEn4X_HpbdKN4Uo'
chat_id = '7949936711'  # Reemplaza 'your_chat_id' con el ID obtenido

async def send_telegram_message(message):
    bot = telegram.Bot(token=bot_token)
    try:
        await bot.send_message(chat_id=chat_id, text=message)
        print("Telegram message sent")
    except Exception as e:
        print(f"Failed to send Telegram message: {e}")

# URL de la cámara IP
camera_url = 'rtsp://admin:Alem449P1@192.168.1.93:554/stream'

cap = cv2.VideoCapture(camera_url)

if not cap.isOpened():
    print("Error: Cannot open video stream.")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        print("End of video stream or cannot read frame.")
        break

    cv2.imshow('Camera Stream', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Enviar mensaje de prueba de Telegram
telegram_message = "Este es un mensaje de prueba desde tu bot de Telegram."
asyncio.run(send_telegram_message(telegram_message))

cap.release()
cv2.destroyAllWindows()
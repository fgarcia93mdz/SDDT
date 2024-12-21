import cv2
import telegram
import asyncio
import os
import unittest
import yaml

# Cargar configuraciones desde el archivo config.yaml
with open('config/config.yaml', 'r') as file:
    config = yaml.safe_load(file)

# Configuración de Telegram
bot_token = config['telegram']['bot_token']
chat_id = config['telegram']['chat_id']

async def send_telegram_message(message):
    bot = telegram.Bot(token=bot_token)
    try:
        await bot.send_message(chat_id=chat_id, text=message)
        print("Telegram message sent")
    except Exception as e:
        print(f"Failed to send Telegram message: {e}")

class TestDetection(unittest.TestCase):
    def setUp(self):
        # URL de la cámara IP
        self.camera_url = config['camera']['url']
        self.cap = cv2.VideoCapture(self.camera_url)
        if not self.cap.isOpened():
            self.fail("Error: Cannot open video stream.")

    def test_camera_stream(self):
        ret, frame = self.cap.read()
        self.assertTrue(ret, "End of video stream or cannot read frame.")
        cv2.imshow('Camera Stream', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            return

    def test_send_telegram_message(self):
        telegram_message = "Este es un mensaje de prueba desde tu bot de Telegram."
        asyncio.run(send_telegram_message(telegram_message))

    def tearDown(self):
        self.cap.release()
        cv2.destroyAllWindows()

if __name__ == '__main__':
    unittest.main()
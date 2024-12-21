import telegram
import asyncio
import unittest
import yaml

# Cargar configuraciones desde el archivo config.yaml
with open('config/config.yaml', 'r') as file:
    config = yaml.safe_load(file)

# Configuración de Telegram
bot_token = config['telegram']['bot_token']
chat_id = config['telegram']['chat_id']

async def send_test_message():
    bot = telegram.Bot(token=bot_token)
    try:
        message = "Este es un mensaje de prueba desde tu bot de Telegram."
        await bot.send_message(chat_id=chat_id, text=message)
        print("Mensaje de prueba enviado con éxito.")
    except Exception as e:
        print(f"Error al enviar el mensaje de prueba: {e}")

class TestTelegramService(unittest.TestCase):
    def test_send_telegram_message(self):
        asyncio.run(send_test_message())

if __name__ == '__main__':
    unittest.main()
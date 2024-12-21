import telegram
import asyncio

# Configuración de Telegram
bot_token = '8112671239:AAGwFghCO31P0SxAKFk9vEn4X_HpbdKN4Uo'
chat_id = '7949936711'  # Reemplaza 'your_chat_id' con el ID obtenido

bot = telegram.Bot(token=bot_token)

async def send_test_message():
    try:
        message = "Este es un mensaje de prueba desde tu bot de Telegram."
        await bot.send_message(chat_id=chat_id, text=message)
        print("Mensaje de prueba enviado con éxito.")
    except Exception as e:
        print(f"Error al enviar el mensaje de prueba: {e}")

# Ejecuta la función asincrónica
asyncio.run(send_test_message())
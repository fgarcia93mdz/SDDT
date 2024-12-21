import telegram
import asyncio

# Reemplaza 'your_bot_token' con el token de tu bot
bot_token = '8112671239:AAGwFghCO31P0SxAKFk9vEn4X_HpbdKN4Uo'
bot = telegram.Bot(token=bot_token)

async def get_chat_id():
    try:
        # Obtén las actualizaciones recientes
        updates = await bot.get_updates()

        if not updates:
            print("No hay actualizaciones recientes.")
            return

        # Imprime el chat_id del primer mensaje recibido
        for update in updates:
            if update.message:
                print(f"chat_id: {update.message.chat.id}")
                break
            else:
                print("No se encontraron mensajes en las actualizaciones.")
    except Exception as e:
        print(f"Error al obtener actualizaciones: {e}")

# Ejecuta la función asincrónica
asyncio.run(get_chat_id())
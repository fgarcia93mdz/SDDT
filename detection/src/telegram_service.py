import telegram
import yaml
import asyncio

class TelegramService:
    def __init__(self, config_path):
        with open(config_path, 'r') as file:
            config = yaml.safe_load(file)
        self.bot_token = config['telegram']['bot_token']
        self.bot = telegram.Bot(token=self.bot_token)
        self.default_chat_id = config['telegram']['chat_id']  # Chat ID por defecto

    async def send_telegram_message(self, message, chat_id, image_path):
        try:
            print(f"Sending Telegram message to chat_id: {chat_id}")
            await self.bot.send_message(chat_id=chat_id, text=message)
            with open(image_path, 'rb') as f:
                await self.bot.send_photo(chat_id=chat_id, photo=f)
            print("Telegram message sent")
        except Exception as e:
            print(f"Failed to send Telegram message: {e}")

# Agregar una función para verificar el chat_id
async def verify_chat_id(config_path):
    with open(config_path, 'r') as file:
        config = yaml.safe_load(file)
    bot_token = config['telegram']['bot_token']
    bot = telegram.Bot(token=bot_token)
    updates = await bot.get_updates()
    if not updates:
        print("No updates found.")
    else:
        print(f"Found {len(updates)} updates.")
    for update in updates:
        print(f"Chat ID: {update.message.chat.id}, Chat Title: {update.message.chat.title}")

if __name__ == "__main__":
    config_path = 'config/config.yaml'
    asyncio.run(verify_chat_id(config_path))
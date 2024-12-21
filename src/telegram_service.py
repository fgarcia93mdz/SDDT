import telegram
import yaml
import asyncio

class TelegramService:
    def __init__(self, config_path):
        with open(config_path, 'r') as file:
            config = yaml.safe_load(file)
        self.bot_token = config['telegram']['bot_token']
        self.bot = telegram.Bot(token=self.bot_token)
        self.chat_id = config['telegram']['chat_id']

    async def send_telegram_message(self, message, chat_id, image_path):
        try:
            await self.bot.send_message(chat_id=chat_id, text=message)
            with open(image_path, 'rb') as f:
                await self.bot.send_photo(chat_id=chat_id, photo=f)
            print("Telegram message sent")
        except Exception as e:
            print(f"Failed to send Telegram message: {e}")
import logging
import os
from dotenv import load_dotenv

from telegram import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    ReplyKeyboardMarkup,
    Update,
    WebAppInfo,
)
from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler, filters

load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")
if not BOT_TOKEN:
    raise RuntimeError("BOT_TOKEN environment variable is required. Create a .env file.")

LAUNCH_BUTTON_TEXT = "🚀 Запуск"
KARAKULI_WEBAPP_URL = "https://publ21.github.io/karakuli/"
PLAYER_WEBAPP_URL = "https://publ21.github.io/aeroos-winamp/webamp.html"


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    keyboard = ReplyKeyboardMarkup([[LAUNCH_BUTTON_TEXT]], resize_keyboard=True)
    await update.message.reply_text(
        "Добро пожаловать в AeroOS! Нажмите кнопку ниже для запуска.",
        reply_markup=keyboard,
    )


async def on_launch(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text("Привет! 👋")
    inline_keyboard = InlineKeyboardMarkup(
        [
            [
                InlineKeyboardButton(
                    text="🎨 Каракули",
                    web_app=WebAppInfo(url=KARAKULI_WEBAPP_URL),
                )
            ],
            [
                InlineKeyboardButton(
                    text="🎵 Winamp",
                    web_app=WebAppInfo(url=PLAYER_WEBAPP_URL),
                )
            ],
        ]
    )
    await update.message.reply_text("📱 Доступные приложения:", reply_markup=inline_keyboard)


async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    logging.getLogger(__name__).error(
        "Exception while handling an update",
        exc_info=context.error,
    )


def main() -> None:
    logging.basicConfig(
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        level=logging.INFO,
    )

    application = Application.builder().token(BOT_TOKEN).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(
        MessageHandler(filters.TEXT & filters.Regex(f"^{LAUNCH_BUTTON_TEXT}$"), on_launch)
    )
    application.add_error_handler(error_handler)

    application.run_polling(allowed_updates=Update.ALL_TYPES, drop_pending_updates=True)


if __name__ == "__main__":
    main()

// src/utils/telegram.ts
import axios from "axios";

// Lấy token từ biến môi trường
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: "HTML" | "MarkdownV2" | "Markdown";
}

/**
 * Gửi tin nhắn qua Telegram Bot API
 */
export async function sendTelegramMessage(
  message: TelegramMessage
): Promise<boolean> {
  try {
    if (!TELEGRAM_BOT_TOKEN) {
      console.error("TELEGRAM_BOT_TOKEN chưa được cấu hình");
      return false;
    }

    // Thêm parse_mode mặc định nếu không có
    const finalMessage = {
      ...message,
      parse_mode: message.parse_mode || "HTML",
    };

    const response = await axios.post(
      `${TELEGRAM_API_URL}/sendMessage`,
      finalMessage
    );

    if (response.status !== 200 || !response.data.ok) {
      console.error("Telegram API error:", response.data);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Không thể gửi tin nhắn Telegram:", error);
    return false;
  }
}

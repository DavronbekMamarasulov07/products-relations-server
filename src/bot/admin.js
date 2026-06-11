import { User } from "../models/user.model.js";

/**
 * .env dagi ADMIN_TELEGRAM_IDS — vergul bilan ajratilgan telegram ID lar ro'yxati.
 * Masalan: ADMIN_TELEGRAM_IDS=123456789,987654321
 * Bu "bir nechta adminni boshqarish" talabini bajaradi.
 */
export const getAdminIds = () =>
  (process.env.ADMIN_TELEGRAM_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .map(Number);

/**
 * Foydalanuvchi admin ekanligini tekshiradi.
 * Admin bo'lishi mumkin: 1) .env ro'yxatida bo'lsa, yoki
 *                        2) DB dagi user.role === "admin" bo'lsa.
 */
export const isAdmin = async (telegramId) => {
  if (!telegramId) return false;

  if (getAdminIds().includes(Number(telegramId))) return true;

  const user = await User.findOne({ telegramId });
  return user?.role === "admin";
};

/**
 * Telegraf middleware — faqat adminlarni o'tkazadi.
 */
export const adminOnly = async (ctx, next) => {
  if (await isAdmin(ctx.from?.id)) return next();
  return ctx.reply("⛔ Bu buyruq faqat adminlar uchun.");
};

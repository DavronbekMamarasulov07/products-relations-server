import { getAdminIds } from "./admin.js";
import { User } from "../models/user.model.js";

let botInstance = null;

// server.js bot yaratgandan keyin bu yerga bot obyektini beradi
export const setBotInstance = (bot) => {
  botInstance = bot;
};

// Barcha adminlarga (env + DB role:admin) xabar yuboradi
export const notifyAdmins = async (text) => {
  if (!botInstance) return;

  try {
    const envAdmins = getAdminIds();
    const dbAdmins = await User.find({
      role: "admin",
      telegramId: { $ne: null },
    }).select("telegramId");

    const ids = new Set([
      ...envAdmins,
      ...dbAdmins.map((u) => u.telegramId).filter(Boolean),
    ]);

    await Promise.allSettled(
      [...ids].map((id) =>
        botInstance.telegram.sendMessage(id, text, { parse_mode: "HTML" })
      )
    );
  } catch (error) {
    console.error("notifyAdmins error:", error.message);
  }
};

// Ro'yxatdan o'tgan foydalanuvchi haqida xabar
export const notifyNewUser = (user) =>
  notifyAdmins(
    `🆕 <b>Yangi foydalanuvchi ro'yxatdan o'tdi!</b>\n\n` +
      `👤 ${user.firstName} ${user.lastName}\n` +
      `📧 ${user.email}`
  );

// Yangi mahsulot (buyurtma o'rnida) haqida xabar
export const notifyNewProduct = (product) =>
  notifyAdmins(
    `🆕 <b>Yangi mahsulot qo'shildi!</b>\n\n` +
      `🛍 ${product.title}\n` +
      `💰 ${product.price}`
  );

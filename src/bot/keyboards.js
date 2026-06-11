import { Markup } from "telegraf";

// Oddiy foydalanuvchi uchun reply keyboard
export const userKeyboard = Markup.keyboard([
  ["🛍 Mahsulotlar", "👤 Profil"],
  ["🔗 Akkauntni ulash", "ℹ️ Yordam"],
]).resize();

// Admin uchun reply keyboard
export const adminKeyboard = Markup.keyboard([
  ["🛍 Mahsulotlar", "👤 Profil"],
  ["📊 Statistika", "👥 Foydalanuvchilar"],
  ["📢 Xabar yuborish", "ℹ️ Yordam"],
]).resize();

// Admin panel inline keyboard
export const adminPanelInline = Markup.inlineKeyboard([
  [
    Markup.button.callback("📊 Statistika", "admin_stats"),
    Markup.button.callback("👥 Foydalanuvchilar", "admin_users"),
  ],
  [Markup.button.callback("📢 Broadcast", "admin_broadcast")],
]);

// Mahsulotlar ro'yxatini kategoriya bo'yicha ko'rish uchun inline tugma
export const categoriesInline = (categories) =>
  Markup.inlineKeyboard(
    categories.map((c) => [
      Markup.button.callback(`📂 ${c.name}`, `cat_${c._id}`),
    ])
  );

import { Scenes } from "telegraf";
import { User } from "../../models/user.model.js";

/**
 * Broadcast WIZARD sahnasi (faqat admin uchun).
 * Admin yuborgan matnni ulangan barcha foydalanuvchilarga jo'natadi.
 */
export const broadcastScene = new Scenes.WizardScene(
  "broadcast",
  // 1-qadam: matn so'rash
  (ctx) => {
    ctx.reply("📢 Yubormoqchi bo'lgan xabaringizni yozing (/cancel — bekor qilish):");
    return ctx.wizard.next();
  },
  // 2-qadam: barcha foydalanuvchilarga yuborish
  async (ctx) => {
    const text = ctx.message?.text;

    if (!text || text === "/cancel") {
      ctx.reply("❌ Broadcast bekor qilindi.");
      return ctx.scene.leave();
    }

    try {
      const users = await User.find({ telegramId: { $ne: null } }).select(
        "telegramId"
      );

      let sent = 0;
      let failed = 0;

      for (const u of users) {
        try {
          await ctx.telegram.sendMessage(
            u.telegramId,
            `📢 <b>Admin xabari:</b>\n\n${text}`,
            { parse_mode: "HTML" }
          );
          sent++;
        } catch {
          failed++;
        }
      }

      ctx.reply(
        `✅ Broadcast yakunlandi.\n\n📨 Yuborildi: ${sent}\n⚠️ Xatolik: ${failed}`
      );
    } catch (error) {
      console.error("broadcast error:", error.message);
      ctx.reply("⚠️ Broadcast vaqtida xatolik yuz berdi.");
    }

    return ctx.scene.leave();
  }
);

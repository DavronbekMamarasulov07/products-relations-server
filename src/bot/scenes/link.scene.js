import { Scenes } from "telegraf";
import bcrypt from "bcrypt";
import { User } from "../../models/user.model.js";

/**
 * Akkauntni ulash WIZARD sahnasi.
 * Foydalanuvchi web orqali ro'yxatdan o'tgan akkauntini email + parol
 * orqali Telegram profiliga bog'laydi. Shundan keyin /info ishlaydi.
 */
export const linkScene = new Scenes.WizardScene(
  "link-account",
  // 1-qadam: emailni so'rash
  (ctx) => {
    ctx.reply("📧 Akkaunt email manzilingizni yuboring:");
    return ctx.wizard.next();
  },
  // 2-qadam: emailni saqlash, parol so'rash
  (ctx) => {
    const email = ctx.message?.text?.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      ctx.reply("❌ Email noto'g'ri. Qaytadan yuboring:");
      return;
    }
    ctx.wizard.state.email = email;
    ctx.reply("🔑 Parolingizni yuboring:");
    return ctx.wizard.next();
  },
  // 3-qadam: tekshirish va ulash
  async (ctx) => {
    const password = ctx.message?.text;
    if (!password) {
      ctx.reply("❌ Parol yuborilmadi. Qaytadan /link buyrug'ini bosing.");
      return ctx.scene.leave();
    }

    try {
      const user = await User.findOne({ email: ctx.wizard.state.email });
      if (!user) {
        ctx.reply("❌ Bunday email topilmadi. /link bilan qaytadan urinib ko'ring.");
        return ctx.scene.leave();
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        ctx.reply("❌ Parol noto'g'ri. /link bilan qaytadan urinib ko'ring.");
        return ctx.scene.leave();
      }

      // Boshqa profilga ulangan bo'lsa tekshirish
      const taken = await User.findOne({ telegramId: ctx.from.id });
      if (taken && taken.id !== user.id) {
        taken.telegramId = undefined;
        await taken.save();
      }

      user.telegramId = ctx.from.id;
      user.telegramUsername = ctx.from.username;
      await user.save();

      ctx.reply(
        `✅ Akkaunt muvaffaqiyatli ulandi!\n\n` +
          `Endi /info buyrug'i bilan profilingizni ko'rishingiz mumkin.`
      );
    } catch (error) {
      console.error("link scene error:", error.message);
      ctx.reply("⚠️ Xatolik yuz berdi. Keyinroq urinib ko'ring.");
    }

    return ctx.scene.leave();
  }
);

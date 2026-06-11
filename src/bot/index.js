import { Telegraf, Scenes, session } from "telegraf";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { isAdmin, adminOnly } from "./admin.js";
import {
  userKeyboard,
  adminKeyboard,
  adminPanelInline,
  categoriesInline,
} from "./keyboards.js";
import { linkScene } from "./scenes/link.scene.js";
import { broadcastScene } from "./scenes/broadcast.scene.js";
import { setBotInstance } from "./notifier.js";

let bot = null;

// Foydalanuvchiga mos keyboardni qaytaradi
const keyboardFor = async (telegramId) =>
  (await isAdmin(telegramId)) ? adminKeyboard : userKeyboard;

// Mahsulotlar ro'yxati matnini tayyorlaydi
const productsText = async (filter = {}) => {
  const products = await Product.find(filter).populate("category", "name");
  if (!products.length) return "🛍 Hozircha mahsulotlar yo'q.";

  return (
    "🛍 <b>Mahsulotlar ro'yxati:</b>\n\n" +
    products
      .map(
        (p, i) =>
          `${i + 1}. <b>${p.title}</b> — ${p.price} so'm` +
          (p.category ? ` (${p.category.name})` : "")
      )
      .join("\n")
  );
};

// Profil matni
const profileText = (user) =>
  `👤 <b>Profilingiz:</b>\n\n` +
  `Ism: ${user.firstName} ${user.lastName}\n` +
  `📧 Email: ${user.email}\n` +
  `🔖 Role: ${user.role}\n` +
  `🆔 Telegram: @${user.telegramUsername || "—"}`;

export const createBot = () => {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    console.warn("⚠️ BOT_TOKEN topilmadi — Telegram bot ishga tushmaydi.");
    return null;
  }

  bot = new Telegraf(token);

  // Sahnalar (wizard / scenes)
  const stage = new Scenes.Stage([linkScene, broadcastScene]);
  bot.use(session());
  bot.use(stage.middleware());

  // ───────── FOYDALANUVCHI BUYRUQLARI ─────────

  bot.start(async (ctx) => {
    await ctx.reply(
      `👋 Assalomu alaykum, <b>${ctx.from.first_name}</b>!\n\n` +
        `Bu — Products & Categories boti.\n` +
        `Quyidagi tugmalar yoki /help buyrug'idan foydalaning.`,
      { parse_mode: "HTML", ...(await keyboardFor(ctx.from.id)) }
    );
  });

  bot.help((ctx) =>
    ctx.reply(
      `📖 <b>Mavjud buyruqlar:</b>\n\n` +
        `/start — Botni ishga tushirish\n` +
        `/help — Yordam\n` +
        `/info — Profilingiz\n` +
        `/products — Mahsulotlar ro'yxati\n` +
        `/link — Web akkauntni ulash\n\n` +
        `<b>Admin uchun:</b>\n` +
        `/admin — Admin panel\n` +
        `/stats — Statistika\n` +
        `/users — Foydalanuvchilar\n` +
        `/broadcast — Hammaga xabar`,
      { parse_mode: "HTML" }
    )
  );

  bot.command("info", async (ctx) => {
    const user = await User.findOne({ telegramId: ctx.from.id });
    if (!user) {
      return ctx.reply(
        "❌ Akkauntingiz ulanmagan. /link buyrug'i bilan akkauntni ulang."
      );
    }
    ctx.reply(profileText(user), { parse_mode: "HTML" });
  });

  bot.command(["products", "items"], async (ctx) => {
    const categories = await Category.find();
    await ctx.reply(await productsText(), {
      parse_mode: "HTML",
      ...(categories.length ? categoriesInline(categories) : {}),
    });
  });

  bot.command("link", (ctx) => ctx.scene.enter("link-account"));

  // ───────── ADMIN BUYRUQLARI ─────────

  bot.command("admin", adminOnly, (ctx) =>
    ctx.reply("🛠 <b>Admin panel</b>", {
      parse_mode: "HTML",
      ...adminPanelInline,
    })
  );

  const sendStats = async (ctx) => {
    const [users, products, categories, linked] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Category.countDocuments(),
      User.countDocuments({ telegramId: { $ne: null } }),
    ]);
    return ctx.reply(
      `📊 <b>Statistika:</b>\n\n` +
        `👥 Foydalanuvchilar: ${users}\n` +
        `🔗 Telegramga ulangan: ${linked}\n` +
        `📂 Kategoriyalar: ${categories}\n` +
        `🛍 Mahsulotlar: ${products}`,
      { parse_mode: "HTML" }
    );
  };

  const sendUsers = async (ctx) => {
    const users = await User.find().sort({ createdAt: -1 }).limit(30);
    if (!users.length) return ctx.reply("👥 Foydalanuvchilar yo'q.");

    const text =
      "👥 <b>Foydalanuvchilar (oxirgi 30 ta):</b>\n\n" +
      users
        .map(
          (u, i) =>
            `${i + 1}. ${u.firstName} ${u.lastName} — ${u.email}` +
            (u.role === "admin" ? " 👑" : "")
        )
        .join("\n");
    return ctx.reply(text, { parse_mode: "HTML" });
  };

  bot.command("stats", adminOnly, sendStats);
  bot.command("users", adminOnly, sendUsers);
  bot.command("broadcast", adminOnly, (ctx) => ctx.scene.enter("broadcast"));

  // ───────── INLINE TUGMA HANDLERLARI ─────────

  bot.action("admin_stats", async (ctx) => {
    await ctx.answerCbQuery();
    if (!(await isAdmin(ctx.from.id))) return;
    await sendStats(ctx);
  });

  bot.action("admin_users", async (ctx) => {
    await ctx.answerCbQuery();
    if (!(await isAdmin(ctx.from.id))) return;
    await sendUsers(ctx);
  });

  bot.action("admin_broadcast", async (ctx) => {
    await ctx.answerCbQuery();
    if (!(await isAdmin(ctx.from.id))) return;
    await ctx.scene.enter("broadcast");
  });

  // Kategoriya bo'yicha mahsulotlarni ko'rsatish
  bot.action(/^cat_(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const categoryId = ctx.match[1];
    await ctx.reply(await productsText({ category: categoryId }), {
      parse_mode: "HTML",
    });
  });

  // ───────── REPLY KEYBOARD TUGMALARI ─────────

  bot.hears("🛍 Mahsulotlar", async (ctx) => {
    const categories = await Category.find();
    await ctx.reply(await productsText(), {
      parse_mode: "HTML",
      ...(categories.length ? categoriesInline(categories) : {}),
    });
  });

  bot.hears("👤 Profil", async (ctx) => {
    const user = await User.findOne({ telegramId: ctx.from.id });
    if (!user)
      return ctx.reply("❌ Akkauntingiz ulanmagan. /link bilan ulang.");
    ctx.reply(profileText(user), { parse_mode: "HTML" });
  });

  bot.hears("🔗 Akkauntni ulash", (ctx) => ctx.scene.enter("link-account"));
  bot.hears("ℹ️ Yordam", (ctx) =>
    ctx.reply("Yordam uchun /help buyrug'ini yuboring.")
  );
  bot.hears("📊 Statistika", adminOnly, sendStats);
  bot.hears("👥 Foydalanuvchilar", adminOnly, sendUsers);
  bot.hears("📢 Xabar yuborish", adminOnly, (ctx) =>
    ctx.scene.enter("broadcast")
  );

  // Xatoliklarni ushlash
  bot.catch((err, ctx) => {
    console.error(`Bot error (${ctx.updateType}):`, err.message);
  });

  setBotInstance(bot);
  return bot;
};

/**
 * Botni ishga tushiradi.
 * Production'da (WEBHOOK_DOMAIN bo'lsa) webhook, aks holda polling.
 * Webhook callback'ni express'ga ulash uchun bot obyektini qaytaradi.
 */
export const launchBot = async (app) => {
  const instance = createBot();
  if (!instance) return null;

  const domain = process.env.WEBHOOK_DOMAIN;

  if (domain) {
    const path = `/telegraf/${instance.secretPathComponent()}`;
    app.use(await instance.createWebhook({ domain, path }));
    console.log(`🤖 Telegram bot WEBHOOK rejimida: ${domain}${path}`);
  } else {
    instance.launch();
    console.log("🤖 Telegram bot POLLING rejimida ishga tushdi");
  }

  // Graceful stop
  process.once("SIGINT", () => instance.stop("SIGINT"));
  process.once("SIGTERM", () => instance.stop("SIGTERM"));

  return instance;
};

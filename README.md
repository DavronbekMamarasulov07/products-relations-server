# Products Relations Server 🚀

**Node.js + Express + MongoDB** asosidagi REST API va **Telegraf.js Telegram bot**
bitta processda ishlaydi.

- 🔐 JWT + bcrypt autentifikatsiya
- 📂 Categories & 🛍 Products (relation: `Product.category → Category`)
- 🤖 Telegram bot (Telegraf.js) — foydalanuvchi + admin panel
- 🔔 Ro'yxatdan o'tish / mahsulot qo'shilganda adminga avtomatik xabar
- 🌐 CORS (faqat ruxsat etilgan domen)

---

## ⚙️ Requirements

- Node.js v18+
- MongoDB (lokal yoki **MongoDB Atlas**)
- Telegram bot token ([@BotFather](https://t.me/BotFather))

---

## 📦 Local ishga tushirish

```bash
# 1. Repozitoriyani klonlash
git clone https://github.com/DavronbekMamarasulov07/products-relations-server.git
cd products-relations-server

# 2. Paketlarni o'rnatish
npm install

# 3. .env faylini yaratish
cp .env.example .env
# .env ichidagi qiymatlarni to'ldiring (MONGO_URI, JWT_SECRET, BOT_TOKEN, ...)

# 4. Development rejimida ishga tushirish
npm run dev

# yoki production
npm start
```

Server: `http://localhost:4200`

---

## 🔑 Environment variables

| Nomi | Izoh |
|------|------|
| `PORT` | Server porti (default 4200) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | JWT imzo kaliti |
| `CORS_ORIGIN` | Ruxsat etilgan frontend domeni (vergul bilan bir nechta) |
| `BOT_TOKEN` | @BotFather token |
| `ADMIN_TELEGRAM_IDS` | Admin telegram ID(lar)i (vergul bilan) |
| `WEBHOOK_DOMAIN` | Production webhook domeni. Bo'sh → polling rejimi |

> Telegram ID ni bilish uchun [@userinfobot](https://t.me/userinfobot) ga yozing.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Auth | Izoh |
|--------|----------|------|------|
| POST | `/auth/register` | ❌ | Ro'yxatdan o'tish |
| POST | `/auth/login` | ❌ | Login (token qaytaradi) |

### Categories
| Method | Endpoint | Auth | Izoh |
|--------|----------|------|------|
| POST | `/api/categories` | ✅ | Kategoriya yaratish |
| GET | `/api/categories` | ❌ | Barcha kategoriyalar |
| GET | `/api/categories/:id/products` | ❌ | Kategoriya mahsulotlari |

### Products
| Method | Endpoint | Auth | Izoh |
|--------|----------|------|------|
| POST | `/api/products` | ✅ | Mahsulot yaratish |
| GET | `/api/products` | ❌ | Barcha mahsulotlar |

> Himoyalangan endpointlar: `Authorization: Bearer <token>`

📮 To'liq so'rovlar: `postman_collection.json` (Postmanga import qiling).

---

## 🤖 Telegram Bot

### Foydalanuvchi buyruqlari
| Buyruq | Vazifa |
|--------|--------|
| `/start` | Botni ishga tushirish, xush kelibsiz |
| `/help` | Buyruqlar ro'yxati |
| `/info` | O'z profilini ko'rish |
| `/products` (`/items`) | Mahsulotlar ro'yxati (kategoriya bo'yicha inline) |
| `/link` | Web akkauntni Telegramga ulash (wizard) |

### Admin buyruqlari
| Buyruq | Vazifa |
|--------|--------|
| `/admin` | Admin panel (inline keyboard) |
| `/stats` | Statistika (users, products, categories) |
| `/users` | Foydalanuvchilar ro'yxati |
| `/broadcast` | Barcha ulangan foydalanuvchilarga xabar (wizard) |

### Xususiyatlar
- ✅ **Reply keyboard** + **inline keyboard**
- ✅ **Scenes / Wizard** — akkaunt ulash va broadcast
- ✅ **Bir nechta admin** — `ADMIN_TELEGRAM_IDS` yoki DB `role: admin`
- ✅ **Polling** (local) yoki **Webhook** (production, `WEBHOOK_DOMAIN`)
- ✅ Ro'yxatdan o'tish / mahsulot qo'shilganda adminlarga **avtomatik bildirishnoma**
- ✅ MongoDB bilan to'liq integratsiya

---

## 🚀 Deploy

- **Backend:** Render / Railway. `WEBHOOK_DOMAIN` ga deploy URL ni qo'ying → bot webhook rejimida ishlaydi.
- **Database:** MongoDB Atlas (cloud).
- **Env:** barcha o'zgaruvchilarni platform settings'da sozlang.
- **CORS:** `CORS_ORIGIN` ga frontend (Netlify) domenini qo'ying.

---

## 📁 Project Structure

```txt
src/
 ├─ bot/                    # Telegram bot (Telegraf.js)
 │   ├─ index.js            # Bot, buyruqlar, keyboardlar, webhook/polling
 │   ├─ admin.js            # Admin tekshiruvi (env + DB role)
 │   ├─ keyboards.js        # Reply & inline keyboardlar
 │   ├─ notifier.js         # Adminlarga bildirishnoma yuborish
 │   └─ scenes/             # Wizard sahnalari (link, broadcast)
 ├─ config/db.js            # MongoDB ulanish
 ├─ controllers/            # Business logic
 ├─ middleware/             # Auth middleware (JWT)
 ├─ models/                 # Mongoose modellar
 ├─ routes/                 # API routelar
 └─ server.js               # Entry point (Express + bot)
```

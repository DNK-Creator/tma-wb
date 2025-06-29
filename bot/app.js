import {Telegraf, Markup, session} from "telegraf"
import { fetchTasksBot, getAllSponsors } from "./storeapp.js"
import 'dotenv/config'

// 1238921831289048054013802130: ABSDBADBASDJFUFEWILBSKDNFKFNNDFJDCNVBEYWYURWIOTGKMMAFSDNMF9123487FNDSFJ318R1N1MNB4N13414V
const token=process.env.BOT_TOKEN
// DKSLDI:80SA8DA898238123892183128904805401380213051533151 99:dASD2E913981312 41314ABSDBADBASDJFUFEWI13LBSKDNFKFNNDFJDCNVBEYWYURWIOTGKMMAFSDNMF9123487FNDSFJ318R1N1MNB4N13414V
const webAppUrl = "https://purplevibes.ru/"
const bot = new Telegraf(token)

console.log(
  'Starting bot with token:',
  token ? `${token.slice(0,4)}…${token.slice(-4)}` : 'undefined!'
);

// one of the six free/custom emoji IDs you can use; for example, 🎉:
const effectId = "5159385139981059251";
const effectIdTwo = "5046509860389126442";

// install session middleware
bot.use(session())

// helper to pull deep-link payload from "/start ABC123"
function extractPayload(ctx) {
  if (!ctx.message || !ctx.message.text) return null
  const parts = ctx.message.text.split(" ")
  // allow "/start=ABC123", "/start ABC123", or even "/startABC123"
  if (parts[0].startsWith("/start")) {
    // after "/start", grab anything after '=' or space
    const raw = parts[0].includes("=")
      ? parts[0].split("=")[1]
      : (parts[1] || null)
    return raw
  }
  return null
}

// pull all the logic into one function
async function handleStart(ctx) {
  try {

    await ctx.telegram.setMessageReaction(
      ctx.chat.id,
      ctx.message.message_id,
      [
        {
          type: "emoji",
          emoji: "💘"
        }
      ],
      false
    );

    await ctx.sendChatAction('typing');

    // ensure session exists
    if (!ctx.session) ctx.session = {}

    // if they launched via deep-link, save it
    const incoming = extractPayload(ctx)
    if (incoming) {
      ctx.session.ref = incoming
      console.log("Saved ref for", ctx.from.id, "=", incoming)
    }

    // check subscriptions
    const isFine = await fetchTasksBot(ctx.from.id)

    if(isFine) {
        return ctx.replyWithPhoto(
        { url: "https://i.postimg.cc/WpyynBfq/meow.png" },
        {
            caption: "<b>Добро пожаловать в PurpleVibes 🌷 </b>Крути рулетку и " +
                    "<b>выигрывай подарочные карты</b> от 300 ₽ до 5000 ₽ ежедневно. " +
                    "Приглашай друзей, поднимайся в топе и <b>гарантированно забирай дорогие карты.</b>",
            parse_mode: "HTML",
            // <-- spread the inlineKeyboard into the options:
            ...Markup.inlineKeyboard([
           [Markup.button.webApp(
                "✨ КРУТИТЬ РУЛЕТКУ ✨",
                `${webAppUrl}?ref=${ctx.session.ref || ""}`
            )],
            [Markup.button.url(
              "Отзывы",
              `https://t.me/purplevibes_reviews`
            ),
            Markup.button.url(
              "Поддержка",
              `https://t.me/purplevibes_support?text=Здравствуйте! `
            )
            ]]),
          message_effect_id: effectIdTwo,
        });
    }

    // otherwise show sponsor links + “check” button
    const sponsors = await getAllSponsors()
    const subscribeButtons = sponsors.map(s =>
      Markup.button.url(
        s.title,
        s.url.startsWith("http")
          ? s.url
          : `https://t.me/${s.url.replace(/^@/, "")}`
      )
    )
    const checkBtn = Markup.button.callback("✅ Проверить подписки", "CHECK_SUB")

    const keyboard = Markup.inlineKeyboard([
      ...subscribeButtons.map(b => [ b ]),
      [ checkBtn ],
    ]);

    return ctx.reply(
      "Чтобы пользоваться рулеткой бесплатно, подпишись на каналы наших чудесных спонсоров:",
      {
        // spread in your inline-keyboard
        ...keyboard,
        // (optional) if you want MarkdownV2 formatting
       // parse_mode: "MarkdownV2",
        // here’s the new bit:
        message_effect_id: effectId,
      });
  }
  catch (err) {
    console.error("❌ start handler failed:", err)
    return ctx.reply("Произошла ошибка, попробуйте позже.")
  }
}

async function handleNewUser(ctx) {
  try {
    // ensure session exists
    if (!ctx.session) ctx.session = {}

    // if they launched via deep-link, save it
    const incoming = extractPayload(ctx)
    if (incoming) {
      ctx.session.ref = incoming
      console.log("Saved ref for", ctx.from.id, "=", incoming)
    }

    // check subscriptions
    const isFine = await fetchTasksBot(ctx.from.id)
    if(isFine !== true) {
        // otherwise show sponsor links + “check” button
        const sponsors = await getAllSponsors()
        const subscribeButtons = sponsors.map(s =>
        Markup.button.url(
            s.title,
            s.url.startsWith("http")
            ? s.url
            : `https://t.me/${s.url.replace(/^@/, "")}`
        )
        )
    const checkBtn = Markup.button.callback("✅ Проверить подписки", "CHECK_SUB")

    const keyboard = Markup.inlineKeyboard([
      ...subscribeButtons.map(b => [ b ]),
      [ checkBtn ],
    ]);

    return ctx.reply(
      "Чтобы пользоваться рулеткой бесплатно, подпишись на каналы наших чудесных спонсоров:",
      {
        ...keyboard,
        message_effect_id: effectId,
      });
      }
    }
  catch (err) {
    console.error("❌ start handler failed:", err)
    return ctx.reply("Произошла ошибка, попробуйте позже.")
  }
}

bot.command("start", handleStart)
bot.on("text", handleNewUser)


// ── callback handler for “CHECK_SUB” ────────────────────────────────────────
bot.action("CHECK_SUB", async ctx => {
  try {
    const isFine = await fetchTasksBot(ctx.from.id)

    if (!isFine) {
      // alert modal
      return ctx.answerCbQuery("❌ Вы еще не подписались на все каналы", { show_alert: true })
    }

    // dismiss loader
    await ctx.answerCbQuery()

    // success → edit with roulette link (remembering original ref)
      return ctx.replyWithPhoto(
      { url: "https://i.postimg.cc/WpyynBfq/meow.png" },
      {
          caption: "<b>Добро пожаловать в PurpleVibes 🌷 </b>Крути рулетку и " +
                  "<b>выигрывай подарочные карты</b> от 300 ₽ до 5000 ₽ ежедневно. " +
                  "Приглашай друзей, поднимайся в топе и <b>гарантированно забирай дорогие карты.</b>",
          parse_mode: "HTML",
          // <-- spread the inlineKeyboard into the options:
          ...Markup.inlineKeyboard([
          [Markup.button.webApp(
              "✨ КРУТИТЬ РУЛЕТКУ ✨",
              `${webAppUrl}?ref=${ctx.session.ref || ""}`
          )],
          [Markup.button.url(
            "Отзывы",
            `https://t.me/purplevibes_reviews`
          ),
          Markup.button.url(
            "Поддержка",
            `https://t.me/purplevibes_support?text=Здравствуйте! `
          )
          ]]),
          message_effect_id: effectIdTwo,
      });
  }
  catch (err) {
    console.error("❌ CHECK_SUB handler failed:", err)
    return ctx.answerCbQuery("Произошла ошибка, попробуйте ещё раз", { show_alert: true })
  }
})

bot.launch()

export default bot
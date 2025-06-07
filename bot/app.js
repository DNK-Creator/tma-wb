import {Telegraf, Markup, Context} from "telegraf"
const webAppUrl = "https://testwebapp300.web.app"

const bot = new Telegraf(import.meta.env.VITE_BOT_TOKEN)

bot.command("start", (ctx)=> {
ctx.reply("Test your luck! You know luck is a strange thing! When you need it the most it just might not be there.", 
    Markup.inlineKeyboard([
        Markup.button.webApp( "Spin the wheel", `${webAppUrl}?ref=${ctx.payload}`
        ),
    ]));
})  

bot.launch()
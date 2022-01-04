const { Telegraf } = require("telegraf");
require("dotenv").config();
const pgp = require("pg-promise")();
const { formatData } = require("./config");
// const addProduct = async ({ db }) => "asdf";
try {
    const cn = {
        connectionString:
            "postgres://postgres:postgres@localhost:5432/freemarketethiopia",
        max: 30,
    };
    var db = pgp(cn);
} catch (e) {
    var db = "Failure";
    console.log(e);
}
const bot = new Telegraf(process.env.BOT_TOKEN);
// bot.telegram.editMessageCaption();
// bot.hears("asdf", async (_ctx) => {
//     const data = {
//         product_id: 7,
//         name: "asdfasdf",
//         picture:
//             "AgACAgQAAxkBAANNYWv8wNEfZjkyyXqfu3aSeVagOEkAAtm1MRu5mmBTsI8RF-JryBABAAMCAAN5AAMhBA",
//         price: "90",
//         description: "I am about to God damn it",
//         category: "#technology #clothing",
//         condition: "Brand new",
//         quantity: 10,
//         status: 0,
//         poster_user_name: "Yared101",
//         poster_id: "339431238",
//     };
//     //im awaiting here to get the mesage id and save it in the posted data
//     const { message_id } = await bot.telegram.sendPhoto(
//         process.env.MANAGER_ID,
//         data.picture,
//         {
//             reply_markup: {
//                 inline_keyboard: [
//                     [
//                         { text: "Approve", callback_data: "approve" },
//                         { text: "Disapprove", callback_data: "disapprove" },
//                     ],
//                 ],
//             },
//             caption: formatData(data),
//             parse_mode: "HTML",
//         }
//     );
//     await db.none("UPDATE products SET page_text_id=$1", [message_id]);
// });

const help = require("./src/commands/help");
help(bot, db);

const start = require("./src/commands/start");
start(bot, db);

const myProducts = require("./src/commands/myProducts");
myProducts(bot, db);

const addProduct = require("./src/commands/addProduct");
addProduct(bot, db);

const handleInputs = require("./src/commands/handleInputs");
handleInputs(bot, db);

const approvers = require("./src/actions/approvers");
approvers(bot, db);

const setSold = require("./src/actions/setSold");
setSold(bot, db);

bot.catch((err, ctx) => {
    ctx.reply("error happened");
    console.log(err);
});
console.log("bot started");
bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

const { product_col_names, formatData } = require("../../config");
module.exports = (bot, db) => {
    bot.start(async (ctx) => {
        const product_id = ctx.message.text.split(" ")[1];
        if (product_id) {
            const data = await db.one(
                "SELECT $1:name FROM products WHERE product_id=$2",
                [product_col_names, product_id]
            );
            bot.telegram.sendPhoto(ctx.chat.id, data.picture, {
                caption:
                    formatData(data) +
                    `\n to buy contact @${data.poster_user_name}`,
                parse_mode: "HTML",
            });
        } else {
            ctx.reply("Welcome, use /add to sell your product");
        }
    });
};

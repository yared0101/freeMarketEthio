const {
    previousSessionDeleted,
    product_col_names,
    formatData,
    completedText,
} = require("../../config");
module.exports = (bot, db) => {
    bot.command("myproducts", async (ctx) => {
        try {
            await db.one("DELETE FROM new_products WHERE poster_id=$1::text", [
                ctx.chat.id,
            ]);
            ctx.reply(previousSessionDeleted);
        } catch {}
        try {
            const data = await db.any(
                "SELECT $1:name FROM products WHERE poster_id=$2::text",
                [product_col_names, ctx.chat.id]
            );
            if (data.length == 0) {
                ctx.reply(
                    "You haven't added any products yet, use \n /add to add more"
                );
            }
            for (let i in data) {
                let caption = "";
                let replyStuff = {};
                const statusStrings = [
                    "disapproved",
                    "unapproved",
                    "approved",
                    "sold",
                ];
                if (data[i]["status"] == 1) {
                    replyStuff = {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: "set as sold out",
                                        callback_data: "sold",
                                    },
                                ],
                            ],
                        },
                    };
                    caption = formatData(data[i]);
                } else {
                    caption =
                        completedText(statusStrings[data[i]["status"] + 1])[0] +
                        formatData(data[i]) +
                        completedText(statusStrings[data[i]["status"] + 1])[1];
                }
                if (data[i]["quantity"] > 1) {
                    replyStuff.reply_markup.inline_keyboard[0].push({
                        text: "reduce quantity",
                        callback_data: "reduceQuantity",
                    });
                }
                bot.telegram.sendPhoto(ctx.chat.id, data[i].picture, {
                    ...replyStuff,
                    caption,
                    parse_mode: "HTML",
                });
            }
        } catch (e) {
            console.log(e);
            ctx.reply("something went wrong");
        }
    });
};

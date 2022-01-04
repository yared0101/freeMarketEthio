const { formatData, product_col_names, idExtractor } = require("../../config");

module.exports = (bot, db) => {
    bot.action(["approve", "disapprove"], async (ctx) => {
        const approved = ctx.match[0] == "approve";
        const id = idExtractor(ctx.update.callback_query.message.caption);
        try {
            const data = await db.one(
                "UPDATE products SET status=$1 WHERE product_id=$2 RETURNING $3:name",
                [approved ? 1 : -1, id, product_col_names]
            );
            if (approved) {
                const { message_id } = await bot.telegram.sendPhoto(
                    process.env.PAGE_ID,
                    data.picture,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: "BUY",
                                        url: `https://t.me/ethiopiafreemarketbot?start=${data.product_id}`,
                                    },
                                ],
                            ],
                        },
                        caption: formatData(data),
                        parse_mode: "HTML",
                    }
                );
                await bot.telegram.sendMessage(
                    data.poster_id,
                    `your product with id = ${id} has been approved`
                );
                await db.none(
                    "UPDATE products SET page_text_id=$1 WHERE product_id = $2",
                    [message_id, data.product_id]
                );
            } else {
                await bot.telegram.sendMessage(
                    data.poster_id,
                    `your product with id = ${id} has been denied approval`
                );
            }
            ctx.answerCbQuery("all done");
            ctx.deleteMessage();
        } catch (e) {
            console.log(e);
            ctx.reply("something went wrong");
            ctx.answerCbQuery();
        }
    });
};

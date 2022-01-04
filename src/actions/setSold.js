const {
    idExtractor,
    product_col_names,
    formatData,
    completedText,
} = require("../../config");
module.exports = (bot, db) => {
    bot.action(["sold", "reduceQuantity"], async (ctx) => {
        const sold = ctx.match[0] == "sold";
        const id = idExtractor(ctx.update.callback_query.message.caption);
        const localMessageId = ctx.update.callback_query.message.message_id;
        const localChatId = ctx.update.callback_query.message.chat.id;

        try {
            const data = await db.one(
                "UPDATE products SET quantity=0, status=2 WHERE product_id = $2 RETURNING $1:name",
                [product_col_names, id]
            );
            console.log(data);
            if (sold) {
                bot.telegram.editMessageCaption(
                    localChatId,
                    localMessageId,
                    "",
                    completedText("sold")[0] +
                        formatData(data) +
                        completedText("sold")[1],
                    {
                        parse_mode: "HTML",
                    }
                );
                bot.telegram.editMessageCaption(
                    process.env.PAGE_ID,
                    data.page_text_id,
                    "",
                    completedText("sold")[0] +
                        formatData(data) +
                        completedText("sold")[1],
                    {
                        parse_mode: "HTML",
                    }
                );
            } else {
                const data = await db.one(
                    "UPDATE products SET quantity=quantity-1 WHERE product_id = $1 RETURNING $2:name",
                    [id, product_col_names]
                );
                console.log(data);
                let reducerButton = {};
                inline_keyboard_data = [
                    {
                        text: "set as sold out",
                        callback_data: "sold",
                    },
                ];
                if (data.quantity > 1)
                    inline_keyboard_data.push({
                        text: "reduce quantity",
                        callback_data: "reduceQuantity",
                    });
                bot.telegram.editMessageCaption(
                    localChatId,
                    localMessageId,
                    "",
                    formatData(data),
                    {
                        parse_mode: "HTML",
                        reply_markup: {
                            inline_keyboard: [inline_keyboard_data],
                        },
                    }
                );
                bot.telegram.editMessageCaption(
                    process.env.PAGE_ID,
                    data.page_text_id,
                    "",
                    formatData(data),
                    {
                        parse_mode: "HTML",
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: "BUY",
                                        url: `https://t.me/ethiopiafreemarketbot?start=${id}`,
                                    },
                                ],
                            ],
                        },
                    }
                );
            }
        } catch (e) {
            ctx.answerCBQuery();
            ctx.reply("something went wrong");
        }
    });
};

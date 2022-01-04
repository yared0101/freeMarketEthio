const {
    new_product_col_types,
    product_col_names,
    formatData,
} = require("../../config");
const {
    checkName,
    checkCategory,
    checkPrice,
    checkDescription,
    checkQuantity,
} = require("../validation");
module.exports = (bot, db) => {
    // const expectedData;
    const inputsHandler = {
        name: async (sentType, ctx) => {
            if (sentType == "text") {
                try {
                    try {
                        checkName(ctx.update.message.text);
                    } catch (e) {
                        ctx.reply(e);
                    }
                    await db.none(
                        "UPDATE new_products SET name=$1 WHERE poster_id=$2::text",
                        [ctx.update.message.text, ctx.chat.id]
                    );
                    ctx.reply("done! please send picture");
                } catch (e) {
                    ctx.reply("something went wrong, please try adding again");
                }
            } else {
                ctx.reply("please send text");
            }
        },
        picture: async (sentType, ctx) => {
            if (sentType == "photo") {
                let photo = [...ctx.message.photo].pop().file_id;
                try {
                    await db.none(
                        "UPDATE new_products SET picture=$1 WHERE poster_id=$2::text",
                        [photo, ctx.chat.id]
                    );
                    ctx.reply("done! please send price");
                } catch (e) {
                    ctx.reply("something went wrong, please try adding again");
                }
            } else {
                console.log(sentType, "photo");
                ctx.reply("please send a photo");
            }
        },
        price: async (sentType, ctx) => {
            if (sentType == "text") {
                let price;
                try {
                    try {
                        price = checkPrice(ctx.update.message.text);
                    } catch (e) {
                        ctx.reply(e);
                    }
                    await db.none(
                        "UPDATE new_products SET price=$1 WHERE poster_id=$2::text",
                        [price, ctx.chat.id]
                    );
                    ctx.reply("done! please send description");
                } catch (e) {
                    ctx.reply("something went wrong, please try adding again");
                }
            } else {
                ctx.reply("please send a number");
            }
        },
        description: async (sentType, ctx) => {
            if (sentType == "text") {
                try {
                    try {
                        checkDescription(ctx.update.message.text);
                    } catch (e) {
                        ctx.reply(e);
                    }
                    await db.none(
                        "UPDATE new_products SET description=$1 WHERE poster_id=$2::text",
                        [ctx.update.message.text, ctx.chat.id]
                    );
                    ctx.reply(
                        "done! please send category, with a format of \n#technology #clothing ..."
                    );
                } catch (e) {
                    ctx.reply("something went wrong, please try adding again");
                }
            } else {
                ctx.reply("please send text");
            }
        },
        category: async (sentType, ctx) => {
            if (sentType == "entities") {
                // console.log(ctx.update.message);
                try {
                    try {
                        checkDescription(ctx.update.message.text, "category");
                    } catch (e) {
                        ctx.reply(e);
                    }
                    await db.none(
                        "UPDATE new_products SET category=$1 WHERE poster_id=$2::text",
                        [ctx.update.message.text, ctx.chat.id]
                    );
                    ctx.reply("done! please send condition", {
                        reply_markup: {
                            remove_keyboard: true,
                            keyboard: [
                                [
                                    { text: "Brand New" },
                                    { text: "Slightly Used" },
                                ],
                                [{ text: "1-2 Years" }, { text: "2-3 Years" }],
                                [{ text: "3+ Years" }],
                            ],
                            resize_keyboard: true,
                            one_time_keyboard: true,
                        },
                    });
                } catch (e) {
                    ctx.reply("something went wrong, please try adding again");
                }
            } else {
                ctx.reply(
                    "please send in the requested format, like \n #technology #clothing"
                );
            }
        },
        condition: async (sentType, ctx) => {
            if (sentType == "text") {
                try {
                    try {
                        checkDescription(ctx.update.message.text);
                    } catch (e) {
                        ctx.reply(e);
                    }
                    await db.none(
                        "UPDATE new_products SET condition=$1 WHERE poster_id=$2::text",
                        [ctx.update.message.text, ctx.chat.id]
                    );
                    ctx.reply("done! please send quantity ", {
                        reply_markup: {
                            remove_keyboard: true,
                        },
                    });
                } catch (e) {
                    ctx.reply("something went wrong, please try adding again");
                }
            } else {
                ctx.reply("please send text");
            }
        },
        quantity: async (sentType, ctx) => {
            if (sentType == "text") {
                let quantity;
                try {
                    try {
                        quantity = checkQuantity(ctx.update.message.text);
                    } catch (e) {
                        ctx.reply(e);
                        return;
                    }
                    let data;
                    let sendData;
                    await db.tx(async (t) => {
                        await t.none(
                            "UPDATE new_products SET quantity=$1, status=0 WHERE poster_id=$2::text",
                            [quantity, ctx.chat.id]
                        );
                        data = await t.one(
                            "SELECT $1:name FROM new_products WHERE poster_id=$2::text",
                            [new_product_col_types, ctx.chat.id]
                        );
                        sendData = await t.one(
                            "INSERT INTO products($1:name) VALUES($2:csv) RETURNING $3:name",
                            [new_product_col_types, data, product_col_names]
                        );
                        await t.none(
                            "DELETE FROM new_products WHERE poster_id=$1::text",
                            [ctx.chat.id]
                        );
                    });
                    await bot.telegram.sendPhoto(
                        process.env.MANAGER_ID,
                        data.picture,
                        {
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        {
                                            text: "Approve",
                                            callback_data: "approve",
                                        },
                                        {
                                            text: "Disapprove",
                                            callback_data: "disapprove",
                                        },
                                    ],
                                ],
                            },
                            caption: formatData(sendData),
                            parse_mode: "HTML",
                        }
                    );
                    ctx.reply("done! product sent for verification");
                } catch (e) {
                    console.log(e);
                    ctx.reply("something went wrong, please try adding again");
                }
            } else {
                ctx.reply("please send a number above 0");
            }
        },
    };
    bot.on(["text", "photo"], async (ctx) => {
        try {
            const data = await db.one(
                "SELECT $1:name FROM new_products WHERE poster_id=$2::text",
                [new_product_col_types, ctx.chat.id]
            );
            let keys = Object.keys(ctx.message);
            const sentType = keys.pop();
            let neededData;
            for (let i in data) {
                if (!data[i]) {
                    neededData = i;
                    break;
                }
            }
            console.log(data);
            await inputsHandler[neededData](sentType, ctx);
        } catch (e) {
            ctx.reply("Please use one of the given commands");
        }
    });
};

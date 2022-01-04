const { previousSessionDeleted } = require("../../config");
module.exports = (bot, db) => {
    bot.command("add", async (ctx) => {
        try {
            try {
                await db.one(
                    "DELETE FROM new_products WHERE poster_id=$1::text RETURNING poster_id",
                    [ctx.chat.id]
                );
                ctx.reply(previousSessionDeleted);
            } catch (e) {}
            await db.none(
                "INSERT INTO new_products(poster_id,poster_user_name) VALUES($1::text,$2)",
                [ctx.chat.id, ctx.chat.username]
            );
            ctx.reply("input name");
        } catch (e) {
            console.log(e);
            ctx.reply("error happened, try again later");
        }
    });
};

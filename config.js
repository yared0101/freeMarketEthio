const new_product_col_types = {
    name: "text",
    picture: "photo",
    price: "float",
    description: "text",
    category: "text[]",
    condition: "text",
    quantity: "number",
    status: "text",
    poster_user_name: "text",
    poster_id: "text",
};
const product_col_names = {
    product_id: 1,
    name: 1,
    condition: 1,
    picture: 1,
    price: 1,
    description: 1,
    category: 1,
    quantity: 1,
    poster_id: 1,
    status: "text",
    poster_user_name: 1,
    page_text_id: 1,
};
const idExtractor = (caption) => {
    return Number(caption.split("name")[0].split(":")[1]);
};
const previousSessionDeleted = "Previous adding session has been deleted ";
const completedText = (completed) => [
    `-------------${completed}-------------\n\n`,
    `\n\n-------------${completed}-------------`,
];
const formatData = (data) => {
    let captionText = "";
    for (let i in data) {
        if (
            i == "picture" ||
            i == "status" ||
            i == "poster_id" ||
            i == "poster_user_name" ||
            i == "page_text_id"
        ) {
            continue;
        } else {
            captionText += `<strong><i>${
                i == "product_id" ? "ID" : i
            }</i></strong>\t:\t${data[i]}\n\n`;
        }
    }
    return captionText;
};
module.exports = {
    new_product_col_types,
    product_col_names,
    formatData,
    previousSessionDeleted,
    idExtractor,
    completedText,
};

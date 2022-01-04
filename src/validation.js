const error = (str) => {
    return { type: "myError", error: str };
};
const validation = {
    checkName: (name, key = "ስሙ") => {
        name = String(name);
        if (name.length > 30) throw error(`${key}በጣም ረዘመ`);
        else return name;
    },
    checkCategory: async (category, db) => {
        category = "%" + String(category) + "%";
        try {
            const { name } = await db.one(
                "SELECT name FROM category where name ILIKE $1",
                [category]
            );
            if (name) return name;
        } catch (e) {
            throw error("እንዲ አይነት ካታጎሪ የለም");
        }
    },
    checkPrice: (price) => {
        price = Number(price);
        if (price && price > 0) return price;
        else {
            throw "please send number";
        }
    },
    checkDescription: (description, key = "ዲስክሪፕሽን") => {
        description = String(description);
        if (description.length > 300) {
            throw error(`${key} በጣም ረዘመ`);
        } else return description;
    },
    checkQuantity: (quantity) => {
        quantity = Math.floor(Number(quantity));
        if (quantity && quantity > 0) return quantity;
        else {
            throw "please send a number above 0";
        }
    },
    checkPhoneNumber: (phone_number) => {
        phone_number = String(phone_number);
        if (phone_number.length !== 9) throw error("ስልክ ቁጥር ከ 9 መብለጥ አይችልም");
        if (phone_number[0] !== "9") throw error("ስልክ ቁጥር በ 9 መጀመር አለበት");
        if (phone_number.match("[0-9]{9}")) {
            return phone_number;
        }
        throw error("ስልክ ቁጥር፣ ቴክስት( text ) መሆን አይችልም");
    },
};
module.exports = validation;

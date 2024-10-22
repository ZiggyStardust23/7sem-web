const { randomBytes } = require('crypto');

export function generateRandomString(length: number) {
    return randomBytes(Math.ceil(length/2)).toString('hex').slice(0, length);
}

export const guestMenu = "You are unauthorized\n" +
                         "Here is menu for you\n" +
                         "1 - Show store assortment\n" +
                         "2 - Search\n" +
                         "3 - Show your basket\n" +
                         "4 - Registration\n" +
                         "5 - Login\n"
                         "0 - Exit\n"

export const userMenu = "You are authorized\n" +
                         "Here is menu for you\n" +
                         "1 - Show store assortment\n" +
                         "2 - Search\n" +
                         "3 - Show your basket\n" +
                         "4 - Make an order\n"
                         "0 - Exit\n"

export const sellerMenu = "You are a seller\n" +
                          "Here is menu for you\n" +
                          "1 - Show store assortment\n" +
                          "2 - Search\n" +
                          "3 - Change order status\n" +
                          "0 - Exit\n"

export const adminMenu = "You are an admin\n" +
                          "Here is menu for you\n" +
                          "1 - Show store assortment\n" +
                          "2 - Search\n" +
                          "3 - Create or update anything you want\n" +
                          "0 - Exit\n"
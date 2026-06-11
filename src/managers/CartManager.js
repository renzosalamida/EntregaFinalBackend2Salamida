import fs from "fs/promises";

class CartManager {
    constructor(path) {
        this.path = path;
    }

    async getCarts() {
        const data = await fs.readFile(this.path, "utf-8");
        return JSON.parse(data);
    }

    async createCart() {
        const carts = await this.getCarts();

        const newCart = {
            id: carts.length > 0
                ? carts[carts.length - 1].id + 1
                : 1,
            products: []
        };

        carts.push(newCart);

        await fs.writeFile(
            this.path,
            JSON.stringify(carts, null, 2)
        );

        return newCart;
    }

    async getCartById(id) {
        const carts = await this.getCarts();

        return carts.find(cart => cart.id === Number(id));
    }

    async addProductToCart(cartId, productId) {
        const carts = await this.getCarts();

        const cartIndex = carts.findIndex(
            cart => cart.id === Number(cartId)
        );

        if (cartIndex === -1) {
            return null;
        }

        const productInCart = carts[cartIndex].products.find(
            item => item.product === Number(productId)
        );

        if (productInCart) {
            productInCart.quantity++;
        } else {
            carts[cartIndex].products.push({
                product: Number(productId),
                quantity: 1
            });
        }

        await fs.writeFile(
            this.path,
            JSON.stringify(carts, null, 2)
        );

        return carts[cartIndex];
    }
}

export default CartManager;
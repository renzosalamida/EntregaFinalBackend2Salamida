class CartRepository {
    constructor(dao) {
        this.dao = dao;
    }

    async getCarts() {
        return await this.dao.getAll();
    }

    async getCartById(id) {
        return await this.dao.getById(id);
    }

    async getCartByIdPopulated(id) {
        return await this.dao.getByIdPopulated(id);
    }

    async createCart(cartData = { products: [] }) {
        return await this.dao.create(cartData);
    }

    async updateCart(id, cartData) {
        return await this.dao.update(id, cartData);
    }

    async updateProductQuantity(cartId, productId, quantity) {
        return await this.dao.updateProductQuantity(
            cartId,
            productId,
            quantity
        );
    }

    async emptyCart(id) {
        return await this.dao.empty(id);
    }

    async saveCart(cart) {
        return await this.dao.save(cart);
    }

    async deleteCart(id) {
        return await this.dao.delete(id);
    }
}

export default CartRepository;
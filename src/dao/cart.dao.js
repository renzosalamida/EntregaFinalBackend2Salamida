import cartModel from "../models/cart.model.js";

class CartDAO {
    async getAll() {
        return await cartModel
            .find()
            .populate("products.product");
    }

    async getById(id) {
        return await cartModel.findById(id);
    }

    async getByIdPopulated(id) {
        return await cartModel
            .findById(id)
            .populate("products.product")
            .lean();
    }

    async create(cartData = { products: [] }) {
        return await cartModel.create(cartData);
    }

    async update(id, cartData) {
        return await cartModel.findByIdAndUpdate(
            id,
            cartData,
            {
                new: true,
                runValidators: true,
            }
        );
    }

    async updateProductQuantity(cartId, productId, quantity) {
        return await cartModel.findOneAndUpdate(
            {
                _id: cartId,
                "products.product": productId,
            },
            {
                $set: {
                    "products.$.quantity": quantity,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );
    }

    async empty(id) {
        return await cartModel.findByIdAndUpdate(
            id,
            { products: [] },
            { new: true }
        );
    }

    async save(cart) {
        return await cart.save();
    }

    async delete(id) {
        return await cartModel.findByIdAndDelete(id);
    }
}

export default CartDAO;
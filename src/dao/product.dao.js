import productModel from "../models/product.model.js";

class ProductDAO {
    async getAll(filter = {}, options = {}) {
        return await productModel.paginate(filter, options);
    }

    async getById(id) {
        return await productModel.findById(id).lean();
    }

    async create(productData) {
        return await productModel.create(productData);
    }

    async update(id, productData) {
        return await productModel.findByIdAndUpdate(
            id,
            productData,
            {
                new: true,
                runValidators: true,
            }
        );
    }

    async updateStock(id, stock) {
        return await productModel.findByIdAndUpdate(
            id,
            { stock },
            { new: true }
        );
    }

    async delete(id) {
        return await productModel.findByIdAndDelete(id);
    }
}

export default ProductDAO;
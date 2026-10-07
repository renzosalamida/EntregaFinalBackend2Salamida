class ProductRepository {
    constructor(dao) {
        this.dao = dao;
    }

    async getProducts(filter = {}, options = {}) {
        return await this.dao.getAll(filter, options);
    }

    async getProductById(id) {
        return await this.dao.getById(id);
    }

    async createProduct(productData) {
        return await this.dao.create(productData);
    }

    async updateProduct(id, productData) {
        return await this.dao.update(id, productData);
    }

    async updateProductStock(id, stock) {
        return await this.dao.updateStock(id, stock);
    }

    async deleteProduct(id) {
        return await this.dao.delete(id);
    }
}

export default ProductRepository;
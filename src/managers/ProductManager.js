import fs from "fs/promises";

class ProductManager {
    constructor(path) {
        this.path = path;
    }

    async getProductById(id) {
        const products = await this.getProducts();

        return products.find(product => product.id === Number(id));
    }

    async getProducts() {
        const data = await fs.readFile(this.path, "utf-8");
        return JSON.parse(data);
    }

    async addProduct(product) {
        const products = await this.getProducts();

        const newProduct = {
            id: products.length > 0
                ? products[products.length - 1].id + 1
                : 1,
            ...product
        };

        products.push(newProduct);

        await fs.writeFile(
            this.path,
            JSON.stringify(products, null, 2)
        );

        return newProduct;
    }

    async updateProduct(id, updatedFields) {
        const products = await this.getProducts();

        const index = products.findIndex(
            product => product.id === Number(id)
        );

        if (index === -1) {
            return null;
        }

        products[index] = {
            ...products[index],
            ...updatedFields,
            id: products[index].id
        };

        await fs.writeFile(
            this.path,
            JSON.stringify(products, null, 2)
        );

        return products[index];
    }

    async deleteProduct(id) {
        const products = await this.getProducts();

        const filteredProducts = products.filter(
            product => product.id !== Number(id)
        );

        if (filteredProducts.length === products.length) {
            return false;
        }

        await fs.writeFile(
            this.path,
            JSON.stringify(filteredProducts, null, 2)
        );

        return true;
    }
}

export default ProductManager;
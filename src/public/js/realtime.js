const socket = io();

const productList = document.getElementById("productList");

// Actualizar lista
socket.on("updateProducts", (products) => {
    productList.innerHTML = "";

    products.forEach(product => {
        productList.innerHTML += `
            <li>
                ${product.id} - ${product.title} - $${product.price}
            </li>
        `;
    });
});

// Agregar producto
document.getElementById("addProductForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const product = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        code: document.getElementById("code").value,
        price: Number(document.getElementById("price").value),
        status: true,
        stock: Number(document.getElementById("stock").value),
        category: document.getElementById("category").value,
        thumbnails: []
    };

    socket.emit("addProduct", product);

    e.target.reset();
});

// Eliminar producto
document.getElementById("deleteProductForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const id = Number(document.getElementById("deleteId").value);

    socket.emit("deleteProduct", id);

    e.target.reset();
});
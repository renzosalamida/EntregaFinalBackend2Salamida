import UserDAO from "../dao/user.dao.js";
import ProductDAO from "../dao/product.dao.js";
import CartDAO from "../dao/cart.dao.js";
import TicketDAO from "../dao/ticket.dao.js";

import UserRepository from "./user.repository.js";
import ProductRepository from "./product.repository.js";
import CartRepository from "./cart.repository.js";
import TicketRepository from "./ticket.repository.js";

const userDAO = new UserDAO();
const productDAO = new ProductDAO();
const cartDAO = new CartDAO();
const ticketDAO = new TicketDAO();

export const userRepository = new UserRepository(userDAO);
export const productRepository = new ProductRepository(productDAO);
export const cartRepository = new CartRepository(cartDAO);
export const ticketRepository = new TicketRepository(ticketDAO);
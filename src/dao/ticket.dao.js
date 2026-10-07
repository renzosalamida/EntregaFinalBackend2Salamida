import ticketModel from "../models/ticket.model.js";

class TicketDAO {
    async create(ticketData) {
        return await ticketModel.create(ticketData);
    }

    async getById(id) {
        return await ticketModel.findById(id);
    }

    async getByCode(code) {
        return await ticketModel.findOne({ code });
    }
}

export default TicketDAO;
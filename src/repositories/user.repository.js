class UserRepository {
    constructor(dao) {
        this.dao = dao;
    }

    async getUsers() {
        return await this.dao.getAll();
    }

    async getUserById(id) {
        return await this.dao.getById(id);
    }

    async getUserByIdWithPassword(id) {
        return await this.dao.getByIdWithPassword(id);
    }

    async getUserByEmail(email) {
        return await this.dao.getByEmail(email);
    }

    async createUser(userData) {
        return await this.dao.create(userData);
    }

    async updateUser(id, userData) {
        return await this.dao.update(id, userData);
    }

    async deleteUser(id) {
        return await this.dao.delete(id);
    }
}

export default UserRepository;
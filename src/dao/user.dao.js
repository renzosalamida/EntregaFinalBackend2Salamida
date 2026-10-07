import userModel from "../models/user.model.js";

class UserDAO {
    async getAll() {
        return await userModel
            .find()
            .select("-password")
            .populate("cart");
    }

    async getById(id) {
        return await userModel
            .findById(id)
            .select("-password")
            .populate("cart");
    }

    async getByIdWithPassword(id) {
        return await userModel.findById(id);
    }

    async getByEmail(email) {
        return await userModel.findOne({
            email: email.toLowerCase(),
        });
    }

    async create(userData) {
        return await userModel.create(userData);
    }

    async update(id, userData) {
        return await userModel
            .findByIdAndUpdate(id, userData, {
                new: true,
                runValidators: true,
            })
            .select("-password");
    }

    async delete(id) {
        return await userModel.findByIdAndDelete(id);
    }
}

export default UserDAO;
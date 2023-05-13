import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
const Schema = mongoose.Schema;
import { Role } from "./role.js";

const defaultRole = new mongoose.Types.ObjectId(process.env.DEFAULT_ROLE_ID);

const userSchema = new Schema(
    {
        name: {
            type: String,
        },
        email: {
            type: Object,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: Schema.Types.ObjectId,
            required: true,
            default: defaultRole,
            ref: Role,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("user", userSchema);

const getUser = async (email) => {
    return await User.findOne({ email: email });
};

const createUser = async (name, email, password) => {
    const newUser = new User({
        name,
        email,
        password,
    });
    const savedUser = await newUser.save();
    return savedUser._id;
};

const checkPermissions = async (id, resource, method) => {
    const user = await User.findById(id).populate("role");
    const permissions = user.role.permissions; // array of objs
    const matchedAccess = permissions.find((p) => p.access === resource);

    if (matchedAccess) {
        const action = matchedAccess[method.toLowerCase()];
        console.log("action", action);
        if (action) {
            return true;
        }
    }
    return false;
};

const delUser = async (id) => {
    const user = await User.deleteOne({ _id: id });
    if (user.deletedCount === 0) {
        return null;
    } else {
        return { success: true };
    }
};

const selectAllUser = async () => {
    return await User.find({});
};

const checkUserById = async (id) => {
    return await User.findOne({ _id: id });
};

const updateUser = async (id, password) => {
    const filter = { _id: id };
    const update = { $set: { password: password } };
    return await User.findOneAndUpdate(filter, update, { new: true });
};

export { User, getUser, createUser, checkPermissions, delUser, selectAllUser, checkUserById, updateUser };

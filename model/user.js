import mongoose from "mongoose";
const Schema = mongoose.Schema;
import { Role } from "./role.js";

// TODO default role ObjectId 不寫死
// const defaultRole = async function () {
//     const defaultRole = await Role.findOne({ role_id: 2 }).select("_id");
//     return defaultRole._id;
// };
const defaultRole = new mongoose.Types.ObjectId("6440a8fceebac57447ba38a0");

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
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
        required: true, // 1:admin & 2:user & 3: viewer
        default: defaultRole,
        ref: Role,
    },
    created_at: {
        type: Date,
        required: true,
        default: Date.now,
    },
    updated_At: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

userSchema.pre("save", function (next) {
    this.updated_at = new Date();
    next();
});

const User = mongoose.model("user", userSchema);

const getUser = async (email) => {
    try {
        const user = await User.findOne({ email: email });
        return user;
    } catch (e) {
        console.error(`Error retrieving user: ${e.message}`);
        return null;
    }
};

const insertUser = async (name, email, password) => {
    try {
        const newUser = new User({
            name,
            email,
            password,
        });
        const savedUser = await newUser.save();
        console.log(savedUser);
        return savedUser._id;
    } catch (e) {
        console.error(`Error creating user: ${e.message}`);
        return null;
    }
};

const checkPermissions = async (id, resource, method) => {
    try {
        const user = await User.findById(id).populate("role");
        const permissions = user.role.permissions; // array of objs
        console.log("permissions", permissions);
        const matchedAccess = permissions.find((p) => p.access === resource);
        console.log("matchedAccess", matchedAccess);

        if (matchedAccess) {
            const action = matchedAccess[method.toLowerCase()];
            console.log("action", action);
            if (action) {
                return true;
            }
        }
        return false;
    } catch (e) {
        console.error(e);
        return e.message;
    }
};

const delUser = async (id) => {
    try {
        const user = await User.deleteOne({ _id: id });
        return user;
    } catch (e) {
        console.error(`Error retrieving user: ${e.message}`);
        return null;
    }
};

const selecAlltUser = async () => {
    try {
        const users = await User.find({});
        return users;
    } catch (e) {
        console.error(`Error retrieving user: ${e.message}`);
        return null;
    }
};

export { User, getUser, insertUser, checkPermissions, delUser, selecAlltUser };

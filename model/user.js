import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: Object,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: Schema.Types.ObjectId,
        required: true, // 1:admin & 2:user & 3: viewer
        ref: "Role",
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
    } catch (err) {
        console.error(`Error retrieving user: ${err.message}`);
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

const checkPermissions = async (id, endpoint, method) => {
    try {
        const user = await User.findById(id).populate("role");
        const permissions = user.role.permissions; // array of objs
        const matchedAccess = permissions.find((p) => p.access === endpoint);

        if (matchedAccess) {
            const action = matchedAccess[method.toLowerCase()];
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

export { User, getUser, insertUser, checkPermissions };

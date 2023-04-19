import mongoose from "mongoose";
const Schema = mongoose.Schema;

const permissionSchema = new Schema({
    access: {
        type: String, // campaigns, members, segments, users
    },
    get: { type: Boolean },
    post: { type: Boolean },
    put: { type: Boolean },
    delete: { type: Boolean },
});

const roleSchema = new Schema({
    role_id: {
        type: String,
        required: true, // 1:admin & 2:user & 3: reader
    },
    name: {
        type: String, // admin, user, viewer
        required: true,
    },
    permissions: {
        type: [permissionSchema],
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

roleSchema.pre("save", function (next) {
    this.updated_at = new Date();
    next();
});

const Role = mongoose.model("role", roleSchema);

export { Role };

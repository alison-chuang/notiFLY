import mongoose from "mongoose";
const Schema = mongoose.Schema;

const permissionSchema = new Schema({
    access: {
        type: String, // campaigns, members, segments, users
    },
    getRead: { type: Boolean, alias: "get" },
    post: { type: Boolean },
    put: { type: Boolean },
    delete: { type: Boolean },
});

const roleSchema = new Schema(
    {
        role_id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        permissions: {
            type: [permissionSchema],
        },
    },
    {
        timestamps: true,
    }
);

const Role = mongoose.model("role", roleSchema);

export { Role };

import mongoose from "mongoose";
const Schema = mongoose.Schema;
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const adminSchema = new Schema({
    username: {
        type: String,
        unique: true
    },
    password: {
        type: String,
    }
},
    { timestamps: true }
);

adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }
    catch (err) {
        return next(err);
    }
});

adminSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

adminSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        username: this.username
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
import mongoose from "mongoose";
const Schema = mongoose.Schema;
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const alumniSchema = new Schema({
    username: {
        type: String,
        unique: true
    },
    password: {
        type: String,
    },
    name:String,
    fatherName:String,
    profession:String,
    gender:String,
    email: {
        type: String,
    },
    roll: {
        type: Number,
    },
    phone: {
        type: Number,
    },
    dob:Date,
    course:String,
    branch:String,
    year:Number,
    linkedin:String,
    instagram:String,
    github:String,
    company:String,
    image:String,
    verified:{
        type:Boolean,
        default:false,
    },
},
    { timestamps: true }
);

alumniSchema.pre("save", async function (next) {
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

alumniSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

alumniSchema.methods.generateAccessToken = function () {
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

alumniSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const Alumni = mongoose.model("Alumni", alumniSchema);

export default Alumni;
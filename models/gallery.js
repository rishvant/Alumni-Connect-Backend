import mongoose from "mongoose";
const Schema=mongoose.Schema;

const imagesSchema=new Schema({
    image:String
});

const Gallery=mongoose.model("gallery",imagesSchema);

export default Gallery;
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
          
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("File uploaded to cloudinary", result.url);
        return result;
    }
    catch (err) {
        fs.unlinkSync(localFilePath);
        return null;
    }
}
  
export { uploadOnCloudinary };
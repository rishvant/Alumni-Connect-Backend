import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
        console.log(file);
        cb(null, file.originalname || "default-filename")
    }
});

export const upload = multer({ storage: storage });
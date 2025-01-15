const multer = require('multer');
const path = require('path');


const BASE_UPLOAD_PATH = path.join(process.cwd(), 'public', 'uploads', 'product-images');
const BRAND_UPLOAD_PATH = path.join(process.cwd(), 'public', 'uploads', 'brand-image');

const brandStorage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, BRAND_UPLOAD_PATH)
    },
    filename:(req,file,cb)=>{
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const productStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,BASE_UPLOAD_PATH);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const categoryStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join('..', 'public', 'uploads','product-images'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});


const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/; // Allowed image types
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true); // Accept file
  } else {
    cb(new Error('Only image files are allowed'), false); // Reject file
  }       
};


const uploadProductImage = multer({
    storage: productStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadCategoryImage = multer({
    storage: categoryStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadBrandImage = multer({
    storage: brandStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports={
    uploadCategoryImage,
    BASE_UPLOAD_PATH,
    uploadProductImage,
    uploadBrandImage,
    BRAND_UPLOAD_PATH
}
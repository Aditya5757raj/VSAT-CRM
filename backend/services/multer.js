const fs = require('fs');
const multer = require('multer');
const path = require('path');

function getMulterUpload(folderName = 'uploads/servicecenter_docs') {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(folderName);

      // Automatically create the directory if it doesn't exist
      fs.mkdirSync(uploadPath, { recursive: true });

      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = `${file.fieldname}-${Date.now()}${ext}`;
      cb(null, name);
    }
  });

  return multer({ storage });
}

module.exports = getMulterUpload;

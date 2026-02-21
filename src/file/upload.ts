import multer from "multer";
import path from "node:path";


export const storage = multer.diskStorage({
  destination: './public/profile',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});



// Add file type validation
export const profile = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('avatar');



// Add file type validation
export const resume = multer({
  storage: storage,
  limits: { fileSize: 1000000 }
}).single('resume');




export const uploadResume = async (req: any, res: any, file: any) => {
  resume(req, res, (err) => {
    if (err) { console.error(err); return res.status(500).json({ error: err }); }
    if (!file) return res.status(400).json({ error: 'Please send file' });

    console.log(file);
    res.send('File uploaded!');
  });
}


export const profileResume = async (req: any, res: any, file: any) => {
  profile(req, res, (err) => {
    if (err) { console.error(err); return res.status(500).json({ error: err }); }
    if (!file) return res.status(400).json({ error: 'Please send file' });

    console.log(file);
    res.send('File uploaded!');
  });
}





// Check file type
export const checkFileType = (file: any, cb: any) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images only! (jpeg, jpg, png, gif)');
  }
}
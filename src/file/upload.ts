import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

const profileUploadPath = path.join(process.cwd(), "uploads/profile");
fs.mkdirSync(profileUploadPath, { recursive: true });

// Ensure the upload directory exists
const uploadPath = path.join(process.cwd(), "uploads/resumes");
fs.mkdirSync(uploadPath, { recursive: true });

// Sanitize worker name for filename
const sanitizeFileName = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req: Request, file, cb) => {
    const workerName = req.body.name || "worker";
    const sanitizedName = sanitizeFileName(workerName);
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);

    cb(null, `${sanitizedName}_${timestamp}${extension}`);
  },
});

export const uploadFiles = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const documentTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const imageTypes = ["image/jpeg", "image/png", "image/jpg"];

    // Accept resume documents and optional profile images
    if (
      (file.fieldname === "resume" && documentTypes.includes(file.mimetype)) ||
      (file.fieldname === "photo" && imageTypes.includes(file.mimetype))
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});


const permitUploadPath = path.join(process.cwd(), "uploads/permits");
fs.mkdirSync(permitUploadPath, { recursive: true });


const permitStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, permitUploadPath);
  },
  filename: (req: Request, file, cb) => {
    const companyName = req.body.company || "employer";
    const sanitizedName = sanitizeFileName(companyName);
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);

    cb(null, `${sanitizedName}_${timestamp}${extension}`);
  },
});


export const uploadEmployerPermit = multer({
  storage: permitStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // same limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (file.fieldname === "permit" && allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});












const profileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, profileUploadPath);
  },
  filename: (req: Request, file, cb) => {
    const workerName = req.body.name || "worker";
    const sanitizedName = sanitizeFileName(workerName);
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);

    cb(null, `${sanitizedName}_profile_${timestamp}${extension}`);
  },
});

export const uploadProfilePhoto = multer({
  storage: profileStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // optional smaller limit for avatars
  fileFilter: (req, file, cb) => {
    const imageTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (file.fieldname === "photo" && imageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});


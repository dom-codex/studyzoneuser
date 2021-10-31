const axios = require("axios");
const path = require("path");
const multer = require("multer");
const deleteFile = require("../utils/deleteFromFileSystem");
const nanoid = require("nanoid").nanoid;
const { Storage } = require("@google-cloud/storage");
const cloudinary = require("cloudinary");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
    console.log(file);
  },
  filename: (req, file, cb) => {
    const name = `${file.fieldname}_${nanoid()}_${file.originalname}`;
    req.fileName = name;
    cb(null, name);
  },
  //add mime type and size filter
});
exports.extractWithMulter = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "video/mp4") {
      return cb(null, true);
    }
    return cb(new Error("file must be in mp4 format"), false);
  },
}).single("testimony");
exports.uploadTestimony = async (req, res, next) => {
  try {
    const { fileName, user } = req;

    if (!fileName) {
      return res.json({
        code: 400,
        message: "uploadFailed",
      });
    }
    //check for testimony
    const testimonycheckuri = `${process.env.centralBase}/testimony/user?user=${user.uid}`;
    const isTestimony = await axios.get(testimonycheckuri);
    console.log(isTestimony.data);
    if (isTestimony.data.code == 200) {
      return res.status(405).json({
        code: 405,
        message: "already uploaded a testimony",
      });
    }
    //construct path
    const pathTofile = path.join(`./uploads/${fileName}`);
    const result = await cloudinary.v2.uploader.upload(pathTofile, {
      resource_type: "video",
    });
    console.log(result);
    /*const cloudStorage = new Storage({ keyFilename: "./key.json" });
    const result = await cloudStorage
      .bucket("studyzonetestimonies")
      .upload(`./${pathTofile}`, { destination: fileName });
    const filelink = result[0].metadata.selfLink;
    const fileId = result[0].metadata.id;*/
    //make request to admin db
    //with videolink,id,user hash, user name.user email
    const uri = `${process.env.centralBase}/testimony/user/add`;
    const { data } = await axios.post(uri, {
      link: result.secure_url, //filelink,
      fileId: result.public_id,
      user: user.uid,
      name: user.name,
      email: user.email,
    });
    if (data.code != 200) {
      deleteFile(fileName);
      return res.status(400).json({
        code: 400,
        message: "failed to upload testimony",
      });
    }
    deleteFile(fileName);
    res.status(200).json({
      code: 200,
      message: "uploaded successfully",
    });
  } catch (e) {
    const { fileName } = req;
    deleteFile(fileName);
    console.log(e);
    res.status(500).json({
      code: 500,
      message: "an error occured",
    });
  }
};
exports.checkForTestimony = async (req, res, next) => {
  try {
    const { user } = req;
    const testimonyUrl = `${process.env.centralBase}/testimony/user?user=${user.uid}`;
    const { data } = await axios.get(testimonyUrl);
    if (data.code != 200) {
      return res.json({
        code: 405,
        message: data.message,
      });
    }
    next();
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
};

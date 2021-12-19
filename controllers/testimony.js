const axios = require("axios");
const path = require("path");
const fs = require("fs")
const multer = require("multer");
const deleteFile = require("../utils/deleteFromFileSystem");
const nanoid = require("nanoid").nanoid;
const { Storage } = require("@google-cloud/storage");
const cloudinary = require("cloudinary");
const { Dropbox } = require("dropbox")
const userDb = require("../models/user")
//multer storage configuration
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
//multer middleware 
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
//method for checking for existing testimony
exports.checkForTestimony = async (req, res, next) => {
  try {
    const { userHash } = req.body
    //check for testimony
    const testimonycheckuri = `${process.env.centralBase}/testimony/user?user=${userHash}`;
    const isTestimony = await axios(testimonycheckuri);
    if (isTestimony.data.code == 200) {
      return res.status(405).json({
        code: 405,
        message: "already uploaded a testimony",
      });
    }
    //forward request to next middleware if no testimony 
    next()
  } catch (e) {
    console.log(e)
    res.status(500).json({
      message: "an  error occurred"
    })
  }
}
exports.uploadTestimony = async (req, res, next) => {
  try {
    const { fileName, user } = req;

    if (!fileName) {
      return res.json({
        code: 400,
        message: "uploadFailed",
      });
    }
    //find user
    const userr = await userDb.findOne({
      where: {
        id: user
      },
      attributes: ["name", "email", "uid"]
    })
    //construct path
    const pathTofile = path.join(`./uploads/${fileName}`);
    //INIT DROPBOX
    const dropbox = new Dropbox({ accessToken: process.env.dropboxToken })
    //SEND RESPONSE FUNCTION
    const sendResponse = async(link, fileId) => {
      const uri = `${process.env.centralBase}/testimony/user/add`;
      const { data } = await axios.post(uri, {
        link: link, //filelink,
        fileId: fileId,
        user: userr.uid,
        name: userr.name,
        email: userr.email,
      });
      if (data.code != 200) {
        //delete file from cloud
        await dropbox.filesDeleteV2({ path: `/testimony/${fileName}` })
        //DELETE FROM SERVER
        fs.unlink(pathTofile, (e) => {
          if (e) { }
          return res.status(400).json({
            code: 400,
            message: "failed to upload testimony",
          });
        })

      } else {
        fs.unlink(pathTofile, (e) => {
          if (e) { }
          res.status(200).json({
            code: 200,
            message: "uploaded successfully",
          });
        })
      }


    }
    fs.readFile(pathTofile, async(e, contents) => {
      if (e) {
        //UNLINK FILE
      } else {
        const resp = await dropbox.filesUpload({ path: `/testimony/${fileName}`, contents })
        console.log(resp)
        await sendResponse(resp.result.name,resp.result.name)
      }
    })
    //upload file to database (cloudingary)
    /*  const result = await cloudinary.v2.uploader.upload(pathTofile, {
        resource_type: "video",
      });
      console.log(result);*/
    //upload to google cloud storage
    /*const cloudStorage = new Storage({ keyFilename: "./key.json" });
    const result = await cloudStorage
      .bucket("studyzonetestimonies")
      .upload(`./${pathTofile}`, { destination: fileName });
    const filelink = result[0].metadata.selfLink;
    const fileId = result[0].metadata.id;*/
    //save testimony link to admin database
  } catch (e) {
    const { fileName } = req;
    //delete from cloud
    deleteFile(fileName);
    console.log(e);
    res.status(500).json({
      code: 500,
      message: "an error occured",
    });
  }
};

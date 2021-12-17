const { Storage } = require("@google-cloud/storage");
const axios = require("axios");
const { bulkCreateDownloads } = require("../utils/bulkcreateDownloads");
const downloadDb = require("../models/downloads");
const userDb = require("../models/user");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary");
//const slugDb = require("../models/slug")

//new download method
exports.downloadAPastQuestion = async (req, res, next) => {
  try {
    const { user } = req;
    //get pastquestion hash and associated institution details from request body
    const { pastquestionId, school, department, faculty, level, semester } =
      req.body;
    //fetch associated pastquestion details
    const uri = `${process.env.centralBase}/download/pastquestion`;
    const {
      data: { exists, fileId, url, fileName },
    } = await axios.post(uri, {
      pastquestionId,
      school,
      department,
      faculty,
      level,
      semester,
    });

    if (!exists) {
      return res.status(401).json({
        message: "past question not found",
      });
    }
    //use returned url to download pastquestion or use id or url to get associated pq from cloud storage to download pastquestion into server
    //add code to make downloads unique
    const filePath = path.join(__dirname, "..", "downloads", `${fileName}`);
    const writer = fs.createWriteStream(filePath);
    console.log(fileName)
    
    const response = await axios({
      url: `${process.env.centralBase}/uploads/${fileName}`,
      method: "GET",
      responseType: "stream",
    });

    //pipe downloaded pastquestion to user
    response.data.pipe(writer);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res).on("finish", () => {
      stream.destroy();
      fs.unlinkSync(filePath, (e) => {});

      res.end();
      //delete pastquestion
      // fs.unlinkSync(filePath, (e) => {});
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      code: 500,
      message: "an error occurred",
    });
  }
};
//end of new download method
/*
exports.prepareDownloads = async (req, res, next) => {
  try {
    const { user } = req;
    const { sch, faculty, department, level, semester, pid } = req.body;
    //check if free trial is turned on by admin
    //retrieve past questions from admin db
    //send past question name and total number as response
    //then make call to new api which will carry out the downloads
    const uri = `${process.env.centralBase}/download/get/pastquestions`;
    const { data } = await axios.post(uri, {
      sid: sch,
      fid: faculty,
      did: department,
      lid: level,
      pid: pid,
      sem: semester,
    });
    if (data.code != 200) {
      return res.status(data.code).json({
        code: data.code,
        message: "could not complete download",
        files: [],
      });
    }
    //create downloadslugs
    /*const { downloadSlugs } = await bulkCreateDownloads(
      data.pastquestions,
      user.id
    );
    console.log(data, "DATAS");
    const nanoid = require("nanoid").nanoid;
    const slug = await downloadDb.create({
      slug: nanoid(),
      pastQuestion: data.pastquestion.pid,
      fileName: data.pastquestion.fileName,
      userId: user.id,
      cloudUri: data.pastquestion.cloudUri,
    });
    return res.status(200).json({
      code: 200,
      message: "success",
      file: slug,
    });
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
};
exports.downloadPastQuestion = async (req, res, next) => {
  try {
    const { user, deviceId, slug } = req.body;
    const userOne = await userDb.findOne({
      where: {
        [Op.and]: [
          //  {
          //  deviceId: deviceId,
          //},
          {
            uid: user,
          },
        ],
      },
      attributes: [
        "id",
        "freeTrialOn",
        "freeTrialStartMillis",
        "freeTrialEndMillis",
      ],
    });

    if (!userOne) {
      return res.status(404).json({
        code: 404,
        message: "user not found",
      });
    }
    //get download
    const file = await downloadDb.findOne({
      where: {
        [Op.and]: [{ userId: userOne.id }, { slug: slug }],
      },
    });
    if (!file) {
      return res.status(404).json({
        code: 404,
        message: "invalid url",
      });
    }

    //initiate download
    //  const cloud = new Storage({ keyFilename: "key.json" });
    const filePath = path.join(
      __dirname,
      "..",
      "downloads",
      `${file.fileName}`
    );
    /*const result = await cloud
      .bucket("studyzonespark")
      .file(file.fileName)
      .download({ destination: filePath });
*/
/*   const response = await axios({
      url: `${process.env.centralBase}/uploads/${file.cloudUri}`,
      method: "GET",
      responseType: "stream",
    });

    response.data.pipe(fs.createWriteStream(filePath));
    const stream = fs.createReadStream(filePath);
    stream.pipe(res).once("close", async () => {
      stream.destroy();
      if (userOne.freeTrialOn) {
        userOne.freeTrialOn = false;
        userOne.freeTrialStartMillis = 0;
        userOne.freeTrialEndMillis = 0;
        await userOne.save();
      }
      fs.unlinkSync(filePath, (e) => {});
    });*/

/*  res.download(filePath, async (e) => {
      console.log(e);
      if (!e) {
        if (userOne.freeTrialOn) {
          userOne.freeTrialOn = false;
          userOne.freeTrialStartMillis = 0;
          userOne.freeTrialEndMillis = 0;
          await userOne.save();
        }
        await file.destroy();
        // fs.unlinkSync(filePath, (e) => {});
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
};
*/

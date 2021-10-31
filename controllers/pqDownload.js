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
    );*/
    console.log(data,"DATAS");
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
    const response = await axios({
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
    });

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
    });*/
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
};

const { nanoid } = require("nanoid");
const downloadDb = require("../models/downloads");
exports.bulkCreateDownloads = async (pqs, user) => {
  const slugs = [];
  const downloadSlugs = pqs.map((pq) => {
    const slug = nanoid();
    slugs.push(slug);
    return {
      slug: slug,
      pastQuestion: pq.pid,
      fileName: pq.fileName,
      userId: user,
    };
  });
  const downloads = await downloadDb.bulkCreate(downloadSlugs, {
    validate: true,
  });
  return {
    downloads: downloads,
    downloadSlugs,
  };
};

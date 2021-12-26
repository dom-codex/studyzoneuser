const { Dropbox } = require("dropbox")
const createOrgetLink = async (folder, file) => {
    const dropbox = new Dropbox({ accessToken: process.env.dropboxToken })
    try {
        const { result } = await dropbox.sharingCreateSharedLinkWithSettings({ path: `/${folder}/${file}` })
        const newLink = result.url.replace("www.dropbox.com", "dl.dropboxusercontent.com")
        return newLink
    } catch (e) {
        const { result: { links } } = await dropbox.sharingListSharedLinks({ path: `/${folder}/${file}`, direct_only: true })
        const newLink = links[0].url.replace("www.dropbox.com", "dl.dropboxusercontent.com")
        return newLink
    }

}
module.exports = createOrgetLink
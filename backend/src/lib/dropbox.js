import axios from "axios";

export const uploadJsonToDropbox = async ({ fileName, jsonData }) => {
    const dropboxToken = process.env.DROPBOX_ACCESS_TOKEN;
    const dropboxFolder = process.env.DROPBOX_SUPPORT_FOLDER || "/support-tickets";

    if (!dropboxToken) {
        throw new Error("DROPBOX_ACCESS_TOKEN is not set");
    }

    const path = `${dropboxFolder}/${fileName}`;

    const response = await axios.post(
        "https://content.dropboxapi.com/2/files/upload",
        JSON.stringify(jsonData, null, 2),
        {
            headers: {
                Authorization: `Bearer ${dropboxToken}`,
                "Content-Type": "application/octet-stream",
                "Dropbox-API-Arg": JSON.stringify({
                    path,
                    mode: "add",
                    autorename: true,
                    mute: false
                })
            }
        }
    );

    return response.data;
};
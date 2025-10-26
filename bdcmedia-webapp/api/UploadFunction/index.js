const { BlobServiceClient } = require("@azure/storage-blob");

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = "media";

module.exports = async function (context, req) {
  try {
    const { fileName, fileContent } = req.body || {};
    if (!fileName || !fileContent) {
      context.res = { status: 400, body: "Missing fileName or fileContent" };
      return;
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();

    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    const buffer = Buffer.from(fileContent, "base64");
    await blockBlobClient.uploadData(buffer, { overwrite: true });

    const publicUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${encodeURIComponent(fileName)}`;
    context.res = { status: 200, body: { url: publicUrl } };
  } catch (err) {
    context.res = { status: 500, body: err.message };
  }
};

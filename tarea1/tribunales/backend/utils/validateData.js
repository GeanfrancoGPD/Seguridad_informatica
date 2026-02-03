const mime = require("mime-types");

function validatePDF(filename) {
  const mimeType = mime.lookup(filename);
  return mimeType === "application/pdf";
}

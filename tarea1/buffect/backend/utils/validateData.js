import mime from "mime-types";

export default function validatePDF(filename) {
  const mimeType = mime.lookup(filename);
  return mimeType === "application/pdf";
}

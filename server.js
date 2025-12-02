import express from "express";
import multer from "multer";
import sharp from "sharp";
import { createWorker } from "tesseract.js";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.post("/ocr", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Preprocess image: increase brightness/contrast
    const preprocessedBuffer = await sharp(req.file.buffer)
      .grayscale()             // convert to grayscale
      .linear(1.2, -20)        // increase contrast and brightness
      .toBuffer();

    const worker = await createWorker({
      logger: m => console.log(m),
    });
    await worker.loadLanguage("eng");
    await worker.initialize("eng");

    const { data } = await worker.recognize(preprocessedBuffer);
    await worker.terminate();

    res.json({ text: data.text.trim() });
  } catch (err) {
    console.error("OCR Error:", err);
    res.status(500).json({ error: "OCR API Error: " + err.message });
  }
});

app.get("/", (req, res) => res.send("OCR API running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

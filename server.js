import express from "express";
import multer from "multer";
import { createWorker } from "tesseract.js";

const app = express();
const upload = multer({ storage: multer.memoryStorage() }); // memory storage

// OCR endpoint
app.post("/ocr", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const worker = await createWorker({
      logger: m => console.log(m), // optional: logs progress
    });

    await worker.loadLanguage("eng");
    await worker.initialize("eng");

    // Recognize text from buffer
    const { data } = await worker.recognize(req.file.buffer);

    await worker.terminate();

    res.json({ text: data.text.trim() });
  } catch (err) {
    console.error("OCR Error:", err);
    res.status(500).json({ error: "OCR API Error: " + err.message });
  }
});

// Test endpoint
app.get("/", (req, res) => res.send("OCR API running"));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

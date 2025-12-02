import express from "express";
import multer from "multer";
import { createWorker } from "tesseract.js";
import fs from "fs";

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/ocr", upload.single("image"), async (req, res) => {
    try {
        const worker = await createWorker();
        await worker.loadLanguage("eng");
        await worker.initialize("eng");

        const result = await worker.recognize(req.file.path);
        await worker.terminate();
        fs.unlinkSync(req.file.path);

        res.json({
            text: result.data.text
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(3000, () => console.log("OCR API running on port 3000"));

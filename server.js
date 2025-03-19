const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// TODO 1: Get the PDF file
// TODO 2: Convert multipages PDF to single paged PDF
// TODO 3: For each single paged PDF -> extract the text [for this we'll use mpdf-parse npm package]
// TODO 4: Convert the text to vector embedding [for this we'll use open ai's text-embedding-small-3 model]
// TODO 5: Store vector embedding in vector database [for this we'll use mongoDB vector databse]

app.post("/pdf/indexing", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No PDF file uploaded",
      });
    }

    const pdfFilePath = req.file.path;
    const pdfFileName = req.file.filename;

    // Read the PDF file
    const dataBuffer = fs.readFileSync(pdfFilePath);

    // Extract text from PDF
    const pdfData = await pdfParse(dataBuffer);
    const pdfText = pdfData.text;
    // chunk the text into smaller chunks
    const words = pdfText.split(/\s+/);
    const chunks = [];
    for (let i = 0; i < words.length; i += 1000) {
      chunks.push(words.slice(i, i + 100).join(" "));
    }
    
    chunks.forEach(async (chunk) => {
      const chunk_vector_embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
      });
      console.log(chunk_vector_embedding.data[0].embedding);
    });

    // Delete the PDF file
    // Delete the PDF file
    try {
      fs.unlinkSync(req.file.path);
      console.log("File deleted successfully");
    } catch (err) {
      console.error("Error deleting file:", err);
      return res.status(500).json({
        success: false,
        message: `Error deleting file: ${err.message}`,
      });
    }

    res.status(201).json({
      success: true,
      message: "PDF is indexing in AI system.",
      file: req.file,
      pdfInfo: {
        numberOfPages: pdfData.numpages,
        text: pdfData.text,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Some error occured: ${err.message}`,
    });
  }
});

// app.get('/hii', (req, res)=>{
//     console.log('hii')
//     res.send('hii')
// });

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

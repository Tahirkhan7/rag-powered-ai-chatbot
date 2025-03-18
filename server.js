const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT;

// TODO 1: Get the PDF file
// TODO 2: Convert multipages PDF to single paged PDF
// TODO 3: For each single paged PDF -> extract the text [for this we'll use mpdf-parse npm package]
// TODO 4: Convert the text to vector embedding [for this we'll use open ai's text-embedding-small-3 model]
// TODO 5: Store vector embedding in vector database [for this we'll use mongoDB vector databse]

app.post("/pdf/indexing", (req, res) => {
  try {
    res.status(201).json({
      success: true,
      message: "PDF is indexing in AI system.",
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

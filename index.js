const express = require("express");
const HTMLToPDF = require("html-pdf-node");
const fs = require("fs");
const cors = require("cors");
require("dotenv/config");

const app = express("express");

let origin = ["http://localhost:3000", "https://audio-to-pdf.vercel.app"];

const corsOptions = {
  origin: origin,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());

let options = { format: "A4" };

app.get("/", (req, res) => res.send("Server running..."));

app.post("/", (req, res) => {
  let file = {
    content: `<html><body><pre style='font-size: 1.2rem'>${req.body.text}</pre></body></html>`,
  };

  try {
    HTMLToPDF.generatePdf(file, options).then((pdfBuffer) => {
      // console.log("PDF Buffer:-", pdfBuffer);

      const pdfName = "./data/speech" + Date.now() + ".pdf";

      fs.writeFile(pdfName, pdfBuffer, function (writeError) {
        if (writeError) {
          return res
            .status(500)
            .json({ message: "Unable to write file. Try again." });
        }

        fs.readFile(pdfName, function (readError, readData) {
          if (!readError && readData) {
            // console.log({ readData });
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment");
            res.send(readData);
            return;
          }

          return res
            .status(500)
            .json({ message: "Unable to write file. Try again." });
        });
      });
    });
  } catch (error) {
    // console.log(error);
    res.status(500).send(error);
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("Server running on port " + PORT));

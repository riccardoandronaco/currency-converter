import express from "express";
import { CurrencyRequest } from "./models/CurrencyRequest";
import https from 'https';
import * as xml2js from 'xml2js';

let app = express();
const currencyUrl = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml";
let currencyList = null;

app.get("/", (req, res) => {
  res.send("test ok!");
});

app.get("/convert", (req, res) => {
  if (req && req.query) {
    const request = req.query as CurrencyRequest;
    
  } else {
    res.status(422);
  };
});

app.listen(3000, () => {
  console.log("App listening on port 3000.");
});


function startup(){
  let xml = "";
  https.get(currencyUrl, res => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on('data', data => {
      xml += data;
    });

    res.on('end', (data: string | Uint8Array) => {
      xml2js.parseString(xml, (error, result) => {
        if (result){
          currencyList = result;
        }
      });
    });

  });
}


startup();
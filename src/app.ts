import express from "express";
import { CurrencyRequest } from "./models/CurrencyRequest";
import https from 'https';
import * as xpath from 'xpath-ts';
import { CurrencyResponse } from "./models/CurrencyResponse";
var DOMParser = require('xmldom').DOMParser;
let app = express();

const currencyUrl = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml";
let currencyListByTime: { [date: string]: { [currency: string]: number } } = {};

app.get("/", (req, res) => {
  res.send("test ok!");
});

app.get("/convert", (req, res) => {
  if (req && req.query) {
    const request = req.query as CurrencyRequest;
    const currencyList = currencyListByTime[request.reference_date];

    if (currencyList == null){
      console.log("Reference date is not found");
    }
    if (currencyList.hasOwnProperty(request.src_currency) === false || currencyList.hasOwnProperty(request.dest_currency) === false){
      console.log("the requested currency are not available. Please choose another currencies");
    }

    const result: CurrencyResponse = {
        amount: request.amount,
        currency: request.dest_currency
    };

  } else {
    res.status(422);
  };
});

app.listen(3000, () => {
  console.log("App is listening using port 3000.");
});


function populateCurrencyRatesList() {
  let xml = "";
  https.get(currencyUrl, res => {
    res.on('data', data => {
      xml += data;
    });
    res.on('end', (data: string | Uint8Array) => {
      var doc = new DOMParser().parseFromString(xml);
      var d = new Date();
      d.setDate(d.getDate() - 1);
      const times = xpath.select("gesmes:Envelope//*[local-name()='Cube']/@time", doc) as Node[];
      times.forEach(time => {
        const timeValue = time.nodeValue;
        let currencyRates = xpath.select(`gesmes:Envelope/*[local-name()='Cube']/*[local-name()='Cube' and @time='${timeValue}']//*[local-name()='Cube']`, doc) as any;
        let currencyList = currencyRates.reduce((acc: any, cur: any) => ({ ...acc, [cur.getAttribute("currency")]: parseFloat(cur.getAttribute("rate")) }), {});
        currencyListByTime[timeValue] = currencyList;
      });
    });
  });
}


populateCurrencyRatesList();
import express from "express";
import { CurrencyRequest } from "./models/CurrencyRequest";
import https from 'https';
import * as xpath from 'xpath-ts';
import { CurrencyResponse } from "./models/CurrencyResponse";
import moment = require('moment');
import { stringify } from "querystring";


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
    let currencyList: { [currency: string]: number; };
    let referenceDate = moment(request.reference_date);
    let srcCurrency = request.src_currency ? request.src_currency.toLocaleUpperCase() : null;
    let destCurrency = request.dest_currency ? request.dest_currency.toLocaleUpperCase() : null;

    if (referenceDate.isValid() === false) {
      referenceDate = moment();
      let refDateValue: string;
      while (currencyListByTime.hasOwnProperty(refDateValue) === false) {
        referenceDate = moment(referenceDate).subtract(1, 'd');
        refDateValue = referenceDate.format('YYYY-MM-DD');
      }
      console.log("Assuming reference date equals to " + refDateValue);
    }

    currencyList = currencyListByTime[referenceDate.format('YYYY-MM-DD')];

    if (!srcCurrency || !destCurrency || currencyList.hasOwnProperty(srcCurrency) === false || currencyList.hasOwnProperty(destCurrency) === false) {
      let errorMessage = `The requested currencies are not supported, you can use the following ones: ${Object.keys(currencyList).join(",")}`;
      console.log(errorMessage);
      res.send(errorMessage);
      res.status(422);
    }

    const result: CurrencyResponse = {
      amount: parseFloat(((request.amount / currencyList[request.src_currency]) * (currencyList[request.dest_currency])).toFixed(2)),
      currency: request.dest_currency
    };

    res.status(200);
    res.send(result);
  } else {
    res.status(422);
  };
});

function startListening() {
  app.listen(3000, () => {
    console.log("App is listening using port 3000.");
  });
}

async function populateCurrencyRatesList(): Promise<{ [date: string]: { [currency: string]: number } }> {
  return new Promise((resolve, reject) => {
    console.log("Getting Currency Rates...");
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
        let cListByTime: { [date: string]: { [currency: string]: number } } = {};
        times.forEach(time => {
          const timeValue = time.nodeValue;
          let currencyRates = xpath.select(`gesmes:Envelope/*[local-name()='Cube']/*[local-name()='Cube' and @time='${timeValue}']//*[local-name()='Cube']`, doc) as any;
          let currencyList = currencyRates.reduce((acc: any, cur: any) => ({ ...acc, [cur.getAttribute("currency")]: parseFloat(cur.getAttribute("rate")) }), { "EUR": 1 });
          cListByTime[timeValue] = currencyList;
        });
        resolve(cListByTime);
        console.log("Done.");
      });
      res.on('error', data => {
        reject(data);
      });
    });
  });
}

async function startup() {
  console.log("Startup process..");
  try {
    currencyListByTime = await populateCurrencyRatesList();
    startListening();
  } catch (error) {
    console.log(error);
  }
}

startup();

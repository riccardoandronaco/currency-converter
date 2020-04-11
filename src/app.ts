import * as express from 'express';
import { CurrencyRequest } from './models/CurrencyRequest';
import { CurrencyConverter } from './currency-converter';

const app = express();
let currencyConverter: CurrencyConverter;

app.get('/', (req, res) => {
  res.send('Welcome to currency converter, use /convert to use this app.');
});

app.get('/convert', (req, res) => {
  if (req && req.query) {
    const request = req.query;
    try {
      const result = currencyConverter.convertCurrencyFromRequest(request as any);
      res.status(200);
      res.send(result);
    } catch (error) {
      res.status(422);
      res.send(error);
    }
  } else {
    res.status(422);
  }
});

async function startup() {
  console.log('Startup process..');
  try {
    currencyConverter = new CurrencyConverter();
    await currencyConverter.init();
    app.listen(3000, () => {
      console.log('App is listening on port 3000.');
    });
  } catch (error) {
    console.log(error);
  }
}

startup();

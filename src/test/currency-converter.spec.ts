import { expect } from 'chai';
import 'mocha';
import { CurrencyConverter } from '../currency-converter';
import { CurrencyRequest } from '../models/CurrencyRequest';
import * as fs from 'fs';
import * as path from 'path';


describe('', async () => {
  const currencyConverter = new CurrencyConverter();
  const xml = fs.readFileSync(path.join(__dirname, './currency-test.xml'), 'utf8');
  await currencyConverter.populateCurrencyRates(xml);

  it('Currency rates should be filled after init', async () => {
    expect(currencyConverter.currencyListByTime).be.not.null;
    expect(Object.keys(currencyConverter.currencyListByTime)).length.greaterThan(0);
  });

  it('Test the convert function', async () => {
    const currencyReq: CurrencyRequest = {
        amount: 26.54,
        src_currency: "EUR",
        dest_currency: "USD"
    };
    const result = currencyConverter.convertCurrencyFromRequest(currencyReq);
    expect(result).be.not.null;
    expect(result.amount).be.not.null;
    expect(result.currency).be.equals(currencyReq.dest_currency);
  });

  it('Test currency error if currency are not correct', async () => {
    const currencyReq: CurrencyRequest = {
        amount: 134,
        src_currency: "DUS",
        dest_currency: "EUR"
    };
    expect(() => currencyConverter.convertCurrencyFromRequest(currencyReq)).to.throw();
  });

});
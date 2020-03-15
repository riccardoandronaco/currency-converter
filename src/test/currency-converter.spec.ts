import { expect } from 'chai';
import 'mocha';
import { CurrencyConverter } from '../currency-converter';
import { CurrencyRequest } from '../models/CurrencyRequest';

describe('', () => {
  it('Currency rates should be filled after init', async () => {
    const currencyConverter = new CurrencyConverter();
    await currencyConverter.init();
    expect(currencyConverter.currencyListByTime).be.not.null;
    expect(Object.keys(currencyConverter.currencyListByTime)).length.greaterThan(0);
  });
  it('Test the convert function', async () => {
    const currencyConverter = new CurrencyConverter();
    await currencyConverter.init();
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
    const currencyConverter = new CurrencyConverter();
    await currencyConverter.init();
    const currencyReq: CurrencyRequest = {
        amount: 134,
        src_currency: "DUS",
        dest_currency: "EUR"
    };
    expect(() => currencyConverter.convertCurrencyFromRequest(currencyReq)).to.throw();
  });
});
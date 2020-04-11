/**
 * Currency Converter class
 * Author Riccardo Andronaco
 * A NodeJs application: Currency Converter application
 */

import * as xpath from 'xpath-ts';
import * as https from 'https';
import { CurrencyRequest } from './models/CurrencyRequest';
import { CurrencyResponse } from './models/CurrencyResponse';
import moment = require('moment');

var DOMParser = require('xmldom').DOMParser;

export class CurrencyConverter {
  private _currencyListByTime: { [date: string]: { [currency: string]: number } } = {};
  private currencyUrl: string = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml';

  constructor() {}

  get currencyListByTime() {
    return this._currencyListByTime;
  }

  public async init() {
    await this.populateCurrencyRatesList();
  }

  public convertCurrencyFromRequest(request: CurrencyRequest): CurrencyResponse {
    let currencyList: { [currency: string]: number };
    let referenceDate = request.reference_date ? moment(request.reference_date) : null;
    let srcCurrency = request.src_currency ? request.src_currency.toLocaleUpperCase() : null;
    let destCurrency = request.dest_currency ? request.dest_currency.toLocaleUpperCase() : null;

    if (!referenceDate || referenceDate.isValid() === false) {
      referenceDate = moment();
      var cycles: number = 0;
      while (this._currencyListByTime.hasOwnProperty(referenceDate.format('YYYY-MM-DD')) === false && cycles < 100) {
        referenceDate = moment(referenceDate).subtract(1, 'd');
        cycles++;
        if (cycles === 100) {
          throw new Error('Unable to get currency rates for the given date');
        }
      }
      console.log('Assuming reference date equals to ' + referenceDate.format('YYYY-MM-DD'));
    }

    currencyList = this._currencyListByTime[referenceDate.format('YYYY-MM-DD')];

    if (currencyList == null) {
      throw new Error('Unable to get currency rates for the given date');
    }

    if (
      !srcCurrency ||
      !destCurrency ||
      currencyList.hasOwnProperty(srcCurrency) === false ||
      currencyList.hasOwnProperty(destCurrency) === false
    ) {
      let errorMessage = `The requested currencies are not supported, you can use the following ones: ${Object.keys(
        currencyList,
      ).join(',')}`;
      console.log(errorMessage);
      throw new Error(errorMessage);
    }

    const result: CurrencyResponse = {
      amount: this.convert(currencyList[srcCurrency], currencyList[destCurrency], request.amount),
      currency: destCurrency,
    };

    return result;
  }

  public populateCurrencyRates(xml: string) {
    var doc = new DOMParser().parseFromString(xml);
    var d = new Date();
    d.setDate(d.getDate() - 1);
    const times = xpath.select("gesmes:Envelope//*[local-name()='Cube']/@time", doc) as Node[];
    let cListByTime: { [date: string]: { [currency: string]: number } } = {};
    times.forEach((time) => {
      const timeValue = time.nodeValue;
      let currencyRates = xpath.select(
        `gesmes:Envelope/*[local-name()='Cube']/*[local-name()='Cube' and @time='${timeValue}']//*[local-name()='Cube']`,
        doc,
      ) as any;
      let currencyList = currencyRates.reduce(
        (acc: any, cur: any) => ({ ...acc, [cur.getAttribute('currency')]: parseFloat(cur.getAttribute('rate')) }),
        { EUR: 1 },
      );
      if (timeValue) {
        cListByTime[timeValue] = currencyList;
      }
    });
    console.log('Done.');
    this._currencyListByTime = cListByTime;
  }

  private convert(src: number, dest: number, value: number) {
    return parseFloat(((value / src) * dest).toFixed(2));
  }

  private async populateCurrencyRatesList(): Promise<{ [date: string]: { [currency: string]: number } }> {
    return new Promise((resolve, reject) => {
      console.log('Getting Currency Rates...');
      let xml = '';
      https.get(this.currencyUrl, (res) => {
        res.on('data', (data) => {
          xml += data;
        });
        res.on('end', (data: string | Uint8Array) => {
          this.populateCurrencyRates(xml);
          resolve();
        });
        res.on('error', (data) => {
          reject(data);
        });
      });
    });
  }
}

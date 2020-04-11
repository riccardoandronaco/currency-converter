export interface CurrencyRequest {
  amount: number;
  src_currency: string;
  dest_currency: string;
  reference_date?: string; // Optional - can be omitted, in this case the latest exchange rates will be applied
}

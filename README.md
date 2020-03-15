# How to build and run the project

## From a local machine
### Requirements:
- It's necessary that the local machine is connected to the internet.
- Typescript installed (tsc v3.8.3 has been used for the development)
- NodeJs installed > 7 (node v12.10.0 has been used for the development)

### Steps:
Download the entire folder as a zip file and extract it
run the following commands to install dependencies
```js 
npm run build
```
```js 
npm run start
```

## Dockerizing it
In order to install the project as a docker package I have included a .dockerfile that contains a series of instruction to build and run the application in a fast way

The commands to execute are:

- build
```ps1
docker build -t igenius-currency-converter .
```
- run
```ps1
docker run -p 3000:3000 igenius-currency-converter
```

the application will listen to requests at port 3000.

### To test the application a request has to be performed with the following options
- url: http://localhost:3000/convert

```ts
//query parameters
interface CurrencyRequest{
    amount: number,
    src_currency: string,
    dest_currency: string
    reference_date?: string //Optional - can be omitted, in this case the latest exchange rates will be applied
}

interface CurrencyResponse {
    amount: number,
    currency: string
}
```
```
//This example will convert an amount of money equals to 15.32EUR to USD.
http://localhost:3000/convert?amount=15.32&src_currency=USD&dest_currency=EUR&reference_date=2020-03-11
```

## Unit tests execution
For this project I have used mocha to implement some unit tests. To execute it it's necessary to run the following command:
```ps1
npm run test
```
![Node.js CI](https://github.com/riccardoandronaco/currency-converter/workflows/Node.js%20CI/badge.svg)
# How to build and run the project

## Execute the application using the node and typescript installed in local machine
### Requirements:
- It's necessary that the local machine is connected to the internet.
- Typescript installed starting from version 3.x (tsc v3.8.3 has been used for the development)
- NodeJs installed starting from version 7 (node v12.10.0 has been used for the development)

### Steps:
- Download the entire folder as a zip file and extract it
run the following commands to install dependencies
- Launch npm command to build the project
```js 
npm run build
```
- Start the application
```js 
npm run start
```

## Execute the application using docker:
In order to install the project as a docker package the project contains a Dockerfile that contains a series of instruction to build and run the application

The commands to execute are:
- build the docker image
```ps1
docker build -t currency-converter .
```
- run a container that user the builded docker image
```ps1
docker run -p 3000:3000 currency-converter
```

the application will listen to requests at port 3000.

### To try the application is necessary to perform a request with the following options (from postman or a browser)
- url: http://localhost:3000/convert
- method: GET

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
//This example will convert an amount of money equals to 15.32 EUR to USD.
http://localhost:3000/convert?amount=15.32&src_currency=USD&dest_currency=EUR&reference_date=2020-03-11
```

## Unit tests execution
For this project I have used mocha to implement some unit tests. To execute it it's necessary to run the following command:
```ps1
npm run test
```
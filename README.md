# supertest-body-validator

This module is an addon to supertest supercharging `.expect` to add the possibility to define a function to call 
when validating one of the properties of a response. 

This enables developers to use `.expect(body)` even if they do not know what the server is going to send, 
without having to redefine the deep equal logic using `.expect(function)`.

## Installing

`npm install --save-dev supertest-body-validator`

```javascript
import supercharge from 'supertest-body-validator';
// or const supercharge = require('supertest-body-validator');

supercharge(); // surcharges supertest's .expect method.
```

If you do not want to surcharge the existing `.expect` method, you can pass a name to `supercharge()` to define a new
method.

```javascript
supercharge('validateJson') // will add the method .validateJson
supercharge(Symbol('expect')); // Symbols also work.
```

## Usage example

```javascript
request(app)
  .post('/user')
  .send({
    username: 'ephys'
  }).expect({
    // verifies that id is a number. Returning a string will use the string to tell the developer what the output should have been
    id: val => Number.isInteger(id) ? true : '*integer*',
    creationDate: val => !Number.isNaN(Date.parse(val)) ? true : '*Date*',
    username: 'ephys'
  })
```

## Troubleshooting

If you're seeing bugs when using `.expect`, try naming the function differently and see if it works then. 
Something else might be conflicting with the surcharge.

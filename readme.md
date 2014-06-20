# Clearance [![Build Status](https://travis-ci.org/jasonbellamy/clearance.png?branch=master)](https://travis-ci.org/jasonbellamy/clearance)

> Agnostic, asynchronous, and extensible JavaScript object validation.


## Features

[Clearance](https://github.com/jasonbellamy/clearance) is a powerful, dependency-free validation library that:
- allows you to create and bind unlimited validation rules to an object.
- asynchronously validates your objects.
- works on both the client-side and server-side.
- gives you complete control over your objects during each state (valid/invalid/validated/unvalidated)

## Getting Started

- Install with [Bower](http://bower.io) - `bower install --save clearance`
- Install with [NPM](https://www.npmjs.org/) - `npm install --save clearance`


## Usage

```javascript
var schema = [
  { name: "username", rules: [ "required", "alpha" ] },
  { name: "password", rules: [ "required", "alphaNumeric" ] },
  { name: "email", rules: [ "required", "email" ] }
];
   
var clearance = new Clearance( schema );

clearance.validate({
  data: [ 
    { name: "username", value: "jasonbellamy" }, 
    { name: "password", value: "unic0rn" }, 
    { name: "email", value: "j@sonbellamy.com" } 
  ],
  // Executed if all of the objects are valid.
  valid: function( objects ) {
    // objects => [ {...} ]
  },
  // Executed if there are any invalid objects.
  invalid: function( objects ) {
    // objects => [ {...} ]
  },
  // Executed after the objects have been validated.
  complete: function( objects ) {
    // objects => [ {...} ]
  }
});
```


## Examples

-  Create a validation rule.

```javascript

Clearance.setRule( "minimumLength", function( object, set, collection ) {
  // object.message - the current message associated with the object being validated.
  // object.name    - the name of the object being validated.
  // object.valid   - the current state of the object being validated.
  // object.value   - the value of the object being validated.
  // set.invalid    - the method to execute if the object is invalid (optional message).
  // set.valid      - the method to execute if the object is valid (optional message).
  // collection     - the collection of objects the object being validated belongs to.
 
  if ( object.value.length < 4 ) {
    set.invalid( "This objects value must be at least 4 characters long." );
  } else {
    set.valid( "Congratulations! This objects value is longer than 4 characters!" );
  }
});
```

- Register a schema.

```javascript
var schema = [
  { 
    name: "username",           // (required) the name of this object.
    rules: [ "minimumLength" ], // (required) validation rules for this object.
    message: "default message", // (optional) default message for this object.
    valid: true                 // (optional) default state for this object.
    value: "default value"      // (optional) default value for this object.
  }
];
```

- Validate objects against the schema.

```javascript
clearance.validate({
  data: [ 
    { name: "username", value: "jab" }
  ],
  valid: function( objects ) {
    // ...
  },
  invalid: function( objects ) {
    // objects => [ { name: "username", value: "jab", message: "This objects value must be at least 4 characters long." } ]
  },
  complete: function( objects ) {
    // objects => [ { name: "username", value: "jab", message: "This objects value must be at least 4 characters long." } ]
  }
});
```


## API

### Clearance( schema )

Name   | Type    | Argument     | Description
-------|---------|--------------|------------
schema | `object[]` | `<required>` | schema containing an array of objects to register for validation. 

### Clearance.setRule( name, function )

Name     | Type       | Argument     | Description
---------|------------|--------------|------------
name     | `string`   | `<required>` | the name of the rule.
function | `function` | `<required>` | the rules validation logic.

### Clearance.validate( options )

Name             | Type       | Argument     | Description
-----------------|------------|--------------|------------
options.data     | `object[]` | `<required>` | array of objects to validate.
options.valid    | `function` | `<optional>` | executed if all of the objects are valid.
options.invalid  | `function` | `<optional>` | executed if there are any invalid objects.
options.complete | `function` | `<optional>` | executed after the objects have been validated.


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality.


## License
Copyright (c) 2014 [Jason Bellamy ](http://jasonbellamy.com)  
Licensed under the MIT license.


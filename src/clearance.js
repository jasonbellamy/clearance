( function ( root, factory ) {
  if ( typeof exports === "object" ) {
    factory( exports );
  } else if ( typeof define === "function" && define.amd ) {
    define( [ "exports" ], factory );
  } else {
    factory( root );
  }
}( this, function( exports ) {

  "use strict";

  /**
   * @constructor
   * @namespace Clearance
   * @requires ClearanceObject
   * @description handles the creation and validation of objects.
   * @param {object[]} schema - schema containing an array of objects to register for validation.
   * @example
   *
   * var schema = [
   *  { name: "username", rules: [ "required", "alpha" ] },
   *  { name: "password", rules: [ "required", "alphaNumeric" ] },
   *  { name: "password", rules: [ "required", "email" ] }
   * ];
   *
   * var clearance = new Clearance( schema );
   *
   * clearance.validate({
   *   data: [
   *     { name: "username", value: "jasonbellamy" },
   *     { name: "password", value: "unic0rn" },
   *     { name: "email", value: "j@sonbellamy.com" }
   *   ],
   *   valid: function( objects ) {
   *     // "There are no invalid objects."
   *   },
   *   invalid: function( objects ) {
   *     // "There are invalid objects."
   *   },
   *   complete: function( objects ) {
   *     // "The objects have been validated."
   *   }
   * });
   *
   */
  var Clearance = function( schema ) {
    if ( !( this instanceof Clearance ) ) {
      return new Clearance( schema );
    }

    this.collection = Object.create( null );

    schema.forEach( function( object ) {
      this.set( object );
    }.bind( this ));
  };

  /**
   * @instance
   * @memberof Clearance
   * @description adds a custom validation rule.
   * @param {string} name - the name of the rule.
   * @param {Clearance.ruleCallback} func - the rules logic.
   * @example
   *
   * // Add a validation rule to check if an objects value is at least 4 characters long.
   * Clearance.setRule( "minimumLength", function( object, set, collection ) {
   *   if ( object.value.length < 4 ) {
   *     set.invalid( "This objects value must be at least 4 characters long" );
   *   } else {
   *     set.valid( "Congratulations! This objects value is longer than 4 characters!" );
   *   }
   * });
   *
   */
  Clearance.setRule = function( name, func ) {
    if ( !name || {}.toString.call( name ) !== "[object String]" ) {
      throw new TypeError( "You must provide a string for a rules name." );
    }

    if ( !func || {}.toString.call( func ) !== "[object Function]" ) {
      throw new TypeError( "You must provide a function for a rules logic." );
    }

    /**
     * @callback Clearance.ruleCallback
     * @param {object} object - the object being validated.
     * @param {string} object.message - the message associated with the state of the object.
     * @param {string} object.name - the name of the object.
     * @param {boolean} object.valid - the state of the object.
     * @param {string|number|boolean} object.value - the value of the object.
     * @param {object} set - object containing valid/invalid callback methods.
     * @param {Clearance.ruleValidCallback} set.valid - callback to trigger if the object is valid.
     * @param {Clearance.ruleInvalidCallback} set.invalid - callback to trigger if the object is invalid.
     * @param {object} collection - collection of objects this object is associated with.
     */

    /**
     * @callback Clearance.ruleValidCallback
     * @param {string} [message] - message to set on the object when the rule is valid.
     */

    /**
     * @callback Clearance.ruleInvalidCallback
     * @param {string} [message] - message to set on the object when the rule is invalid.
     */
    Clearance.prototype.rules[ name ] = func;
  };

  /**
   * @memberof Clearance
   */
  Clearance.prototype = {

    constructor: Clearance,

    rules: Object.create( null ),

    /**
     * @requires ClearanceObject
     * @description creates an object entry in the collection.
     * @param {object} object - the object containing the properties required to create an object.
     * @param {string} object.name - the name to be associated with this object.
     * @param {array} object.rules - the validation rules associated with this object.
     * @param {string} [object.message] - the validation message associated with the current state.
     * @param {boolean} [object.valid] - the initial state of the object.
     * @param {string|number|boolean} [object.value] - the value to be validated.
     */
    set: function( object ) {
      var rules = object.rules.map( function( rule ) {
        return this.rules[ rule ];
      }.bind( this ));

      return Object.defineProperty( this.collection, object.name, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: new ClearanceObject( { name: object.name, value: object.value, message: object.message, valid: object.valid, rules: rules, collection: this.collection } )
      });
    },

    /**
     * @description gets a list of objects from the collection that match the provided filters.
     * @param {object} filters - an object containing property/value pairs to match.
     * @return {object[]} an array of objects from the collection.
     * @example
     *
     * this.get( { valid: false } );     // returns all the invalid objects from the collection.
     * this.get( { name: "username" } ); // returns the username object from the collection.
     * this.get( { value: "unicorn" } ); // returns all objects with a value of "unicorn" from the collection.
     *
     */
    get: function( filters ) {
      return Object.keys( this.collection ).map( function( name ) {
        if ( this.exists( name, filters ) ) {
          return this.collection[ name ];
        }
      }.bind( this )).filter( function( object ) {
        return object !== undefined;
      });
    },

    /**
     * @description tests whether ALL of the objects in the collection are valid.
     * @returns {boolean} true if ALL of the objects are valid.
     */
    isValid: function () {
      return !Object.keys( this.collection ).map( function( name ) {
        return this.collection[ name ];
      }.bind( this )).some( function( object ) {
        return !object.valid;
      });
    },

    /**
     * @description checks if all the provided filters (property/values pairs) exist and match for the given object.
     * @param {string} name - the name of the object to check.
     * @param {object} filters - an object containing property/value pairs to match.
     * @return {boolean}
     */
    exists: function( name, filters ) {
      return Object.keys( filters ).every( function( filter ) {
        return ( filters[ filter ] === this.collection[ name ][ filter ] );
      }.bind( this ));
    },

    /**
     * @description sets and validates a list of objects.
     * @param {object} options
     * @param {object[]} options.data - an array of objects to validate.
     * @param {Clearance.validateValidCallback} options.valid - callback that is executed if all the objects are valid.
     * @param {Clearance.validateInvalidCallback} options.invalid - callback that is executed if all the objects are invalid.
     * @param {Clearance.validateCompleteCallback} options.complete - callback thats always executed after all the PASSED in objects have been validated.
     */
    validate: function( options ) {

      options.data.forEach( function( filter ) {
        var object = this.get( { name: filter.name } )[ 0 ];

        if ( object ) {
          object.setValue( filter.value );
          object.validate( function () {
            /**
             * @callback Clearance.validateValidCallback
             * @param {object[]} objects - an array containing all the valid objects.
             */
            if ( this.isValid() && options.valid && typeof options.valid === "function" ) {
              options.valid.apply( this, [ this.get( { valid: true } ).map( function( object ) { return object.getSanitized(); } ) ] );
            }

            /**
             * @callback Clearance.validateInvalidCallback
             * @param {object[]} objects - an array containing all the invalid objects.
             */
            if ( !this.isValid() && options.invalid && typeof options.invalid === "function" ) {
              options.invalid.apply( this, [ this.get( { valid: false } ).map( function( object ) { return object.getSanitized(); } ) ] );
            }

            /**
             * @callback Clearance.validateCompleteCallback
             * @param {object[]} objects - an array containing all the objects that were validated.
             */
            if ( options.complete && typeof options.complete === "function" ) {
              var objects = ( function () {
                return options.data.map( function( filter ) {
                  return this.get( { name: filter.name } ).map( function( object ) {
                    return object.getSanitized();
                  });
                }.bind( this )).reduce( function( a, b ) {
                  return a.concat( b );
                });
              }.bind( this )());

              options.complete.apply( this, [ objects ] );

            }
          }.bind( this ));
        }
      }.bind( this ));
    }
  };


  /**
  /**
   * @constructor
   * @namespace ClearanceObject
   * @description creates a validator object.
   * @param {string} object.name - the name to be associated with this object.
   * @param {array} object.rules - the validation rules associated with this object.
   * @param {string} [object.message=""] - the validation message associated with the current state.
   * @param {boolean} [object.valid=false] - the initial state of the object.
   * @param {string|number|boolean} [object.value=""] - the value to be validated.
   * @param {object} [object.collection={}] - the collection of objects this object is associated with.
   */
  var ClearanceObject = function( object ) {
    if ( !( this instanceof ClearanceObject ) ) {
      return new ClearanceObject( object );
    }

    this.setMessage( object.message );
    this.setName( object.name );
    this.setRules( object.rules );
    this.setValid( object.valid );
    this.setValue( object.value );
    this.setCollection( object.collection );
  };

  /**
   * @memberof ClearanceObject
   */
  ClearanceObject.prototype = {

    constructor: ClearanceObject,

    /**
     * @description set the name to be associated with this object.
     * @param {string} value - the name.
     */
    setName: function( value ) {
      Object.defineProperty( this, "name", { value: value } );
    },

    /**
     * @description set the value to be validated.
     * @param {string|number} value - the input value.
     */
    setValue: function( value ) {
      Object.defineProperty( this, "value", { writable: true, value: value || "" } );
    },

    /**
     * @description set the validation rules associated with the object.
     * @param {function[]} value - an array of all the validation rule functions.
     */
    setRules: function( value ) {
      Object.defineProperty( this, "rules", { value: value } );
    },

    /**
     * @description sets the current validation message.
     * @param {string} value - the message.
     */
    setMessage: function( value ) {
      Object.defineProperty( this, "message", { writable: true, value: value || "" } );
    },

    /**
     * @description sets the object as valid/invalid.
     * @param {boolean} value - is the object valid?
     */
    setValid: function( value ) {
      Object.defineProperty( this, "valid", { writable: true, value: value || false } );
    },

    /**
     * @description sets the collection of objects this object is associated with.
     * @param {object} value - the collection.
     */
    setCollection: function( value ) {
      Object.defineProperty( this, "collection", { value: value || {} } );
    },

    /**
     * @description returns an object that contains only the properties that should be exposed.
     * @return {object} - the sanitized object.
     */
    getSanitized: function () {
      return {
        message: this.message,
        name: this.name,
        valid: this.valid,
        value: this.value
      };
    },

    /**
     * @description tests whether the objects rules are valid and sets the corresponding message.
     * @param {function} callback - executed after all the objects validation rules have been run.
     */
    validate: function( callback ) {
      var validate = function( i ) {
        this.rules[ i ]( this.getSanitized(), {
          valid: function( message ) {
            this.setValid( true );

            if ( i === ( this.rules.length - 1 ) ) {
              this.setMessage( message );
              callback();
            } else {
              validate( i + 1 );
            }
          }.bind( this ),

          invalid: function( message ) {
            this.setValid( false );
            this.setMessage( message );
            callback();
          }.bind( this )
        },

        Object.keys( this.collection ).map( function( name ) {
          return this.collection[ name ].getSanitized();
        }.bind( this )) );

      }.bind( this );

      validate( 0 );
    }
  };

  exports.Clearance = Clearance;

}));

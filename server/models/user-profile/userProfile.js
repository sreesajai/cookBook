'use strict';

module.exports = function (UserProfile) {
  /*var dietarySchema = {
    'id': { 'type': 'number', 'required': true },
    'dietaryRestrictions': 'number',
    'allergies': 'number'

  };
  var userProfile = UserProfile.extend('UserProfile', dietarySchema);

  console.log(dietarySchema);*/
  require('./remote_methods')(UserProfile);
  UserProfile.validatesPresenceOf('userId');
  UserProfile.validatesUniquenessOf('userId');
};

'use strict';

module.exports = function(User) {
  User.validatesUniquenessOf('contactNumber');
  User.validatesUniquenessOf('email');
  require('./remote_methods')(User);
};

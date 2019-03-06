'use strict';

module.exports = function(Recipe) {
  require('./remote_methods')(Recipe);
  Recipe.validatesPresenceOf('userId');
};

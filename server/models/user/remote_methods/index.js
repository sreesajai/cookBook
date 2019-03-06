module.exports = User => {
  require('./mailRegistration')(User);
  require('./facebookRegistration')(User);
  require('./mobile')(User);
  require('./userDetails')(User);

  User.disableRemoteMethodByName('prototype.patchAttributes');
  User.disableRemoteMethodByName('replaceById');
  User.disableRemoteMethodByName('deleteById');
  User.disableRemoteMethodByName('prototype.verify');
  User.disableRemoteMethodByName('resetPassword');
  User.disableRemoteMethodByName('setPassword');
};
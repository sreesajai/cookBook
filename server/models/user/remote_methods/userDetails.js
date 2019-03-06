const { badRequest, internalError } = require('../../../helpers/errorFormatter');

module.exports = function (user) {
  user.remoteMethod(
    'postName',
    {
      accepts: [{ arg: 'id', type: 'number', required: true },
      { arg: 'profileName', type: 'string', required: true },
      { arg: 'userName', type: 'string', required: true },
      { arg: 'dietaryRestrictions', type: 'number', required: true },
      { arg: 'allergies', type: 'array', required: true }],
      http: { path: '/userProfileData', verb: 'post' },
      returns: { root: true, type: 'object' }
    });

  user.postName = async function (id, profileName, userName, dietaryRestrictions, allergies, cb) {
    try {
      const targetUser = await user.findOne({
        where: {
          id
        }
      });

      if (!targetUser) {
        return cb(badRequest('Invalid User'));
      }
      
      //var myJson = JSON.stringify(allergies);
      await targetUser.updateAttributes({
        'profileName': profileName,
        'userName': userName,
        'dietaryRestrictions': dietaryRestrictions,
        'allergies': allergies
      });
      return targetUser;
    } catch (e) {
      console.log('Error in user.postName', e);
      return internalError();
    }
  };
};

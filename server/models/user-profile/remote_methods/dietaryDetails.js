module.exports = function (userProfile) {
  userProfile.remoteMethod(
    'dietaryDetails',
    {
      accepts: [{ arg: 'userId', type: 'number', required: true },
      { arg: 'dietaryRestrictions', type: 'number', required: false },
      { arg: 'allergies', type: 'number', required: false }],
      http: { path: '/dietaryDetails', verb: 'post' },
      returns: { root: true, type: 'object' }
    });

  userProfile.dietaryDetails = async function (userId, dietaryRestrictions, allergies, cb) {
    try {
      const targetUser = await userProfile.findOne({
        where: {
          userId
        }
      });
      if (!targetUser) {
        await userProfile.create({ dietaryRestrictions});
      }
    } catch (e) {
      console.log('Error in userProfile.dietaryDetails', e);
    }
  }

};
const createRemoteMethod = require('../../../helpers/createRemoteMethod');
const { badRequest, unauthorized, internalError } = require('../../../helpers/errorFormatter');

module.exports = recipe => {
  createRemoteMethod({
    model: recipe,
    name: 'displayRecipe',
    accepts: [
    ],
    description: 'All recipes will be displayed here',
    httpOptions: {
      errorStatus: 400,
      path: '/displayRecipe',
      status: 200,
      verb: 'POST',
    },
    returns: { root: true, type: 'object' }
  });
  // { "include": ["user"] , "where":{"private":"0"}}
  recipe.displayRecipe = async (req, cb) => {
    try {
      const privateVar = req.query.private;
      const targetRecipe = await recipe.find({
        include: {
          relation: 'user',
          scope: {
            fields: { profileName: true, fbProfile: true },
          },
        },
        where: {
          'private': privateVar,
        },
        fields: {
          userId: true,
          link: true,
          title: true,
          createdTime: true,
          description: true
        }
      });
      console.log(targetRecipe[0].user);
      /* const countVal = await recipe.count({
         'private': privateVar
       });
       console.log(countVal);*/

      if (targetRecipe) {
        return targetRecipe;
      }
      else {
        console.log('No records to display');
        return 'no records to display';
      }

    } catch (e) {
      console.log('Error in displayRecipe', e);
      return cb(badRequest('Error in displayRecipe', e));
    }
  }
};
/*var base64ToImage = require('base64-to-image');
const createRemoteMethod = require('../../../helpers/createRemoteMethod');
const { badRequest, unauthorized, internalError } = require('../../../helpers/errorFormatter');
const { uploadFileToS3, deleteObjectInS3 } = require('../../../helpers/S3');
const getFileFromRequest = require('../../../helpers/getFileFromRequest');

module.exports = recipe => {
  createRemoteMethod({
    model: recipe,
    name: 'uploadImage',
    accepts:
      [{ arg: 'req', type: 'object', http: { source: 'req' } }],
    description: 'upload Image for the recipe',
    httpOptions: {
      errorStatus: 400,
      path: '/uploadImage',
      status: 200,
      verb: 'POST',
    },
    returns: { root: true, type: 'object' }
  });

  recipe.uploadImage = async (req) => {
    try {
      const Id = req.query.recipeId;
      const currentRecipe = await recipe.findOne({
        where: {
          'id': Id
        }
      });
      console.log(currentRecipe);
      console.log(Id);
      if (!currentRecipe) {
        //return cb(badRequest('Invalid recipe'));
        return 'Invalid User/Recipe';
      }

      // extract the file from the request object
      const file = await getFileFromRequest(req);
      // upload the file
      const { Location, ETag, Bucket, Key } = await uploadFileToS3(file, {}, 'platedate');
      const updatedRecipe = await currentRecipe.updateAttributes({
        'link': Location,
        'etag': ETag,
        'bucket': Bucket,
        'image': Key,
      });
      console.log(updatedRecipe);
      return updatedRecipe;
    } catch (error) {
      console.log('Error in recipe.uploadImage', error);
      //return cb(badRequest('Error'));
      return 'error';
    }
  };
};*/


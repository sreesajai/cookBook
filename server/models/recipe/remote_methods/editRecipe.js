const createRemoteMethod = require('../../../helpers/createRemoteMethod');
const { badRequest, unauthorized, internalError } = require('../../../helpers/errorFormatter');
const { uploadFileToS3, deleteObjectInS3 } = require('../../../helpers/S3');
//const getFileFromRequest = require('../../../helpers/getFileFromRequest');
var buffer = require('buffer');
var path = require('path');
var fs = require('fs');
const multiparty = require('multiparty');

function getFileFromRequestforEdit(req) {
  return new Promise((resolve, reject) => {
    const form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
      try {
        if (err) reject(err);
        let file;
        if (typeof files === 'object' && files.file) {
          file = files['file'][0]; // get the file from the returned files object
        }
        else {
          const obj = {
            id: fields.id[0] === 'undefined' ? null : fields.id[0],
            userId: fields.userId[0] === 'undefined' ? null : fields.userId[0],
            private: fields.private[0] === 'undefined' ? null : fields.private[0],
            title: fields.title[0] === 'undefined' ? null : fields.title[0],
            description: fields.description[0] === 'undefined' ? null : fields.description[0],
            ingredient: fields.ingredient[0] === 'undefined' ? null : fields.ingredient[0],
            ingredientAmount: fields.ingredientAmount[0] === 'undefined' ? null : fields.ingredientAmount[0],
            cookware: fields.cookware[0] === 'undefined' ? null : fields.cookware[0],
            prepTime: fields.prepTime[0] === 'undefined' ? null : fields.prepTime[0],
            servings: fields.servings[0] === 'undefined' ? null : fields.servings[0],
            steps: fields.steps[0] === 'undefined' ? null : fields.steps[0],
          };
          resolve(obj);
        }
        if (!fields) {
          resolve({ file });
        }
        else {
          console.log('Inside else');
          const obj = {
            file,
            id: fields.id[0] === 'undefined' ? null : fields.id[0],
            userId: fields.userId[0] === 'undefined' ? null : fields.userId[0],
            private: fields.private[0] === 'undefined' ? null : fields.private[0],
            title: fields.title[0] === 'undefined' ? null : fields.title[0],
            description: fields.description[0] === 'undefined' ? null : fields.description[0],
            ingredient: fields.ingredient[0] === 'undefined' ? null : fields.ingredient[0],
            ingredientAmount: fields.ingredientAmount[0] === 'undefined' ? null : fields.ingredientAmount[0],
            cookware: fields.cookware[0] === 'undefined' ? null : fields.cookware[0],
            prepTime: fields.prepTime[0] === 'undefined' ? null : fields.prepTime[0],
            servings: fields.servings[0] === 'undefined' ? null : fields.servings[0],
            steps: fields.steps[0] === 'undefined' ? null : fields.steps[0],
          };
          resolve(obj);
        }
      } catch (e) {
        console.log('Error in getFilefromRequest', e);
        return reject(e);
      }
    });
  });
}

module.exports = recipe => {
  createRemoteMethod({
    model: recipe,
    name: 'editRecipe',
    accepts: [
    ],
    description: 'Users can edit their recipe here',
    httpOptions: {
      errorStatus: 400,
      path: '/editRecipe',
      status: 200,
      verb: 'POST',
    },
    returns: { root: true, type: 'object' }
  });

  recipe.editRecipe = async (req, res, cb) => {
    try {
      const parsed = await getFileFromRequestforEdit(req);
      const {
        id,
        userId,
        file,
        private,
        title,
        description,
        ingredient,
        ingredientAmount,
        cookware,
        prepTime,
        servings,
        steps
      } = parsed;
      console.log(id);
      if (!file) {
        const targetRecipe = await recipe.findOne({
          where: {
            id
          }
        });
        await targetRecipe.updateAttributes({
          private, userId, title, description, ingredient, ingredientAmount, cookware, prepTime, servings, steps
        });
        return 'recipe edited';
      }
      const { Location, ETag, Bucket, Key } = await uploadFileToS3(file, {}, 'platedate');
      const targetRecipe = await recipe.findOne({
        where: {
          id
        }
      });
      await targetRecipe.updateAttributes({
        private, userId, title, description, ingredient, ingredientAmount, cookware, prepTime, servings, steps,
        'link': Location,
        'etag': ETag,
        'bucket': Bucket,
        'image': Key,
      });
      return 'Recipe has been edited successfully';
    } catch (e) {
      console.log('error in editRecipe', e);
      return cb(badRequest('Error in edit Recipe', e));

    }
  };

};
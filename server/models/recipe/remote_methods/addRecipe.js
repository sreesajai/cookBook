let date = require('date-and-time');
const createRemoteMethod = require('../../../helpers/createRemoteMethod');
const { badRequest, unauthorized, internalError } = require('../../../helpers/errorFormatter');
const { uploadFileToS3, deleteObjectInS3 } = require('../../../helpers/S3');
//const getFileFromRequest = require('../../../helpers/getFileFromRequest');
var buffer = require('buffer');
var path = require('path');
var fs = require('fs');
const multiparty = require('multiparty');

function getFileFromRequest(req) {
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
        } else {
          const obj = {
            file,
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
        return reject(e);
      }
    });
  });
}

module.exports = recipe => {
  createRemoteMethod({
    model: recipe,
    name: 'addRecipe',
    accepts: [
    ],
    description: 'Users can post their recipe here',
    httpOptions: {
      errorStatus: 400,
      path: '/addRecipe',
      status: 200,
      verb: 'POST',
    },
    returns: { root: true, type: 'object' }
  });
  recipe.addRecipe = async (req, res, cb) => {
    try {
      // extract the file from the request object
      const parsed = await getFileFromRequest(req);
      const {
        file,
        userId,
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

      if (!file && private === '1') {
        const newRecipe = await recipe.create({
          userId, private, title, description, ingredient, ingredientAmount, cookware, prepTime, servings, steps
        });
        return 'Recipe added ';
      }
      if (!file && private === '0')
        return cb(badRequest('User has to upload a recipe image'));
      if (!userId) {
        return cb(badRequest('Unauthenticated user'));
      }
      let now = new Date();
      date.format(now, 'YYYY/MM/DD HH:mm:ss');
      let currentTime = date.addMinutes(now, 330);
      console.log(currentTime);
      //const datetime = new Date();
      //console.log(datetime);
      const { Location, ETag, Bucket, Key } = await uploadFileToS3(file, {}, 'platedate');
      const newRecipe = await recipe.create({
        userId, private, title, description, ingredient, ingredientAmount, cookware, prepTime, servings, steps,
        'createdTime': currentTime,
        'link': Location,
        'etag': ETag,
        'bucket': Bucket,
        'image': Key,
      });
      return 'Recipe added successfully';
    } catch (error) {
      console.log('Error in recipe.addRecipe', error);
      throw error;
    }
  };


  recipe.remoteMethod(
    'getRecipe',
    {
      accepts: [{ arg: 'recipeId', type: 'number', required: true }],
      http: { path: '/getRecipe', verb: 'post' },
      returns: { root: true, type: 'object' }
    });

  recipe.getRecipe = async function (recipeId, cb) {
    try {
      //let ingredientDetails;
      const targetRecipe = await recipe.findOne({
        where: {
          'id': recipeId
        }
      });
      if (targetRecipe) {
        const recipeDetails = {
          userId: targetRecipe.userId,
          image_link: targetRecipe.link,
          private: targetRecipe.private,
          title: targetRecipe.title,
          description: targetRecipe.description,
          cookware: targetRecipe.cookware,
          ingredient: targetRecipe.ingredient,
          ingredientAmount: targetRecipe.ingredientAmount,
          prepTime: targetRecipe.prepTime,
          servings: targetRecipe.servings,
          steps: targetRecipe.steps,
          createdTime: targetRecipe.createdTime
        }
        return recipeDetails;
      }
      /*else {
        for (var i = 0; i < targetRecipe.ingredient.length; i++) {
          ingredientDetails = {
            'ingredient': targetRecipe.ingredient[i],
            'ingredientAmount': targetRecipe.ingredient[i]
          };
        }
      }*/
      else
        return cb(badRequest('Recipe not found'));
    } catch (e) {
      return badRequest('Error in getRecipe', e);
    }
  };
};


  /*recipe.remoteMethod(
    'deleteRecipe',
    {
      accepts: [{ arg: 'recipeId', type: 'number', required: true }],
      http: { path: '/deleteRecipe', verb: 'post' },
      returns: { root: true, type: 'object' }
    });
  recipe.deleteRecipe = async (recipeId, cb) => {
    try {
      const targetRecipe = await recipe.findOne({
        where: {
          'id': recipeId
        }
      });
      console.log(targetRecipe);
      await recipe.destroyById(recipeId, function (err) {
        var response = 'Successfully removed';
        cb(null, response);
        console.log(response);
      });

    } catch (error) {
      console.log('Error in deleteRecipe', error);
      return cb(badRequest('Error in deleteRecipe'));
    }
  };
};*/


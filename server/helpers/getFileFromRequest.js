const multiparty = require('multiparty');

/**
 * Helper method which takes the request object and returns a promise with a file.
 */
module.exports = function getFileFromRequest(req) {
  return new Promise((resolve, reject) => {
    const form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
      try {
        if (err) reject(err);
        if (!files) {
          return reject(false);
        }
        const file = files['file'][0]; // get the file from the returned files object
        if (!file) reject('File was not found in form data.');
        else resolve(file);
      } catch (e) {
        return reject(e);
      }
    });
  });
};
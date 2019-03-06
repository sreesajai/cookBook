
'use strict';
var Promise = require('bluebird');
const request = require('request-promise');

const { badRequest, internalError } = require('../../../helpers/errorFormatter');

module.exports = function (user) {
  user.remoteMethod(
    'facebookRegistration',
    {
      accepts: [
        {
          arg: 'oauth-token',
          type: 'string',
          required: true,
          description: 'OAuth2 token received from Facebook when logging in. Retrieved from the callback URL.'
        },
        {
          arg: 'email',
          type: 'string',
          required: true,
          description: 'Email of the user logging into fb'
        }
      ],
      returns: [
        {
          arg: 'result',
          type: 'object',
          root: true,
          description: 'instance of User'
        }
      ],
      description: 'Allows users to login with an OAuth2 token received from Facebook',
      http: [
        {
          path: '/facebookRegistration',
          verb: 'post'
        }
      ]
    });

  user.facebookRegistration = async function (accessToken, email, cb) {
    try {
      const userFieldSet = 'id,name,email,picture';
      const options = {
        method: 'GET',
        uri: 'https://graph.facebook.com/v2.8/me',
        qs: {
          access_token: accessToken,
          fields: userFieldSet
        }

      };
      const fbResponse = await request(options);
      //console.log(fbResponse);

      const parsed = JSON.parse(fbResponse);
      //console.log(parsed.picture.data);
      if (parsed.email === email) {
        const existingUser = await user.findOne({
          where: {
            email
          }
        });
        if (existingUser) {
          if (existingUser.firstLogin === false) {
            await existingUser.updateAttributes({ 'firstLogin': true });
            const currentUser = {
              email: existingUser.email,
              contactNumber: existingUser.contactNumber,
              emailVerified: existingUser.emailVerified,
              firstLogin: existingUser.firstLogin,
              profileName: existingUser.profileName
            };
            return currentUser;
          }
          else {
            await existingUser.updateAttributes({
              firstLogin: null

            });
            const currentUser = {
              email: existingUser.email,
              contactNumber: existingUser.contactNumber,
              emailVerified: existingUser.emailVerified,
              firstLogin: existingUser.firstLogin,
              profileName: existingUser.profileName,
            };
            return currentUser;
          }
        }
        const createdUser = await user.create({
          email,
          emailVerified: true,
          firstLogin: true,
          'fbProfile': parsed
        });
        
        return createdUser;
      } else {
        return cb(badRequest('Email does not match'));
      }
    } catch (e) {
      console.log('Error in user.facebookRegistration', e);
      return internalError();
    }
  };
};


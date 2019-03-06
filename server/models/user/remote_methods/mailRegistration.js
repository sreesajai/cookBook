'use strict';
const ejs = require('ejs');
const { badRequest, internalError } = require('../../../helpers/errorFormatter');
const fs = require('fs');
const sgMail = require('@sendgrid/mail');

module.exports = function (user) {
  user.remoteMethod(
    'postSignupEmail',
    {
      accepts: [{ arg: 'email', type: 'string', required: true }],
      http: { path: '/postSignupEmail', verb: 'post' },
      returns: { root: true, type: 'object' }
    });

  user.remoteMethod(
    'verifyEmail',
    {
      accepts: [
        { arg: 'email', type: 'string', required: true },
        { arg: 'verificationCode', type: 'string', required: true }
      ],
      description: 'Verify If the token received in the user\'s email is valid for confirmation',
      http: { path: '/verifyEmail', verb: 'post' },
      returns: { root: true, type: 'object' }
    });

  var randomFixedInteger = function (length) {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));
  }

  user.postSignupEmail = async function (email, cb) {
    try {
      const targetUser = await user.findOne({
        where: {
          email
        }
      });
      if (targetUser) {
        const verificationToken = randomFixedInteger(6);
        await targetUser.updateAttributes({ verificationToken, firstLogin: null });

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
          to: email,
          from: process.env.FROM_EMAIL,
          subject: 'Authentication Token from plateDate',

          html: '<h2>PlateDate Verification Code <h2>' + ' ' + '<h1>' + verificationToken + '<h1>',
        };
        sgMail.send(msg);
        return 'Kindly check your email for verification code';
      }
      else if (!targetUser) {
        const verificationToken = randomFixedInteger(6);
        await user.create({ email, verificationToken });

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
          to: email,
          from: process.env.FROM_EMAIL,
          subject: 'Authentication Token from plateDate',

          html: '<h2>PlateDate Verification Code <h2>' + ' ' + '<h1>' + verificationToken + '<h1>',
        };
        sgMail.send(msg);
        return 'Verification code has been sent to your email';
      }
      else {
        return cb(badRequest('There is an error while sending otp.Please try login using fb/phone number'));
      }
    } catch (e) {
      console.log('Error in sending mail to the user', e);
      return internalError();
    }
  }
  user.verifyEmail = async function (email, verificationToken, cb) {
    try {
      const targetUser = await user.findOne({
        where: {
          email
        }
      });
      if (!targetUser) {
        return { emailVerified: null };
      }
      else if (targetUser.verificationToken !== verificationToken)
        return cb(badRequest('Invalid verification code'));
      else if (targetUser.verificationToken === verificationToken && targetUser.emailVerified === true) {
        await targetUser.updateAttributes({
          verificationToken: null,
          emailVerified: true,
          firstLogin: null
        });
        const currentUser = {
          email: targetUser.email,
          firstLogin: targetUser.firstLogin,
          emailVerified: targetUser.emailVerified,
          id: targetUser.id,
          profileName: targetUser.profileName

        }
        return currentUser;
      }
      else {
        await targetUser.updateAttributes({
          verificationToken: null,
          emailVerified: true,
          firstLogin: true
        });
        const currentUser = {
          email: targetUser.email,
          firstLogin: targetUser.firstLogin,
          emailVerified: targetUser.emailVerified,
          id: targetUser.id,
          profileName: targetUser.profileName

        }
        return currentUser;
      }
    } catch (e) {
      console.log('Error in user.verifyEmail', e);
      return internalError();
    }

  }
};

//const sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
//const sendgrid = require('sendgrid').mail;
//const fromEmail = new sendgrid.Email(process.env.FROM_EMAIL);

/*function sendMail(mail) {
  const request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON(),
  });

  sg.API(request, (error, response) => {
    if (error) {
      console.log('SENDGRID ERROR', error.response.body);
    }
  });
}*/



/*module.exports = function (user) {
  user.remoteMethod(
    'verifyEmail',
    {
      accepts: [
        { arg: 'req', type: 'object', 'http': { source: 'req' } },
        { arg: 'res', type: 'object', 'http': { source: 'res' } },
        { arg: 'verificationToken', type: 'string', required: true }
      ],
      description: 'Verify If the token received in the user\'s email is valid for confirmation',
      http: { path: '/verifyEmail', verb: 'get' },
      returns: { root: true, type: 'object' }
    });

  user.remoteMethod(
    'postSignupEmail',
    {
      accepts: [{ arg: 'email', type: 'String', required: true }],
      //accepts: { arg : 'token',type:'String', required : true},
      http: { path: '/postSignupEmail', verb: 'post' },
      returns: { root: true, type: 'object' }
    });

  /*user.remoteMethod(
    'firstLogin',
    {
      accepts: [{ arg: 'email', type: 'String', required: true }],
      http: { path: '/firstLogin', verb: 'get' },
      returns: { root: true, type: 'object' }
    });*/



  /*user.postSignupEmail = async function (email, cb) {
    try {
      const targetUser = await user.findOne({
        where: {
          email
        }
      });
      //console.log(targetUser.firstLogin);
      if (targetUser) {
        if (targetUser.firstLogin === false) {
          //console.log();
          await targetUser.updateAttributes({ 'firstLogin': true });
          const currentUser = {
            email: targetUser.email,
            contactNumber: targetUser.contactNumber,
            emailVerified: targetUser.emailVerified,
            firstLogin: targetUser.firstLogin,
            profileName: targetUser.profileName,
            id: targetUser.id
          };
          return currentUser;
        }

        else {
          await targetUser.updateAttributes({ 'firstLogin': null });
          const currentUser = {
            email: targetUser.email,
            contactNumber: targetUser.contactNumber,
            emailVerified: targetUser.emailVerified,
            firstLogin: targetUser.firstLogin,
            profileName: targetUser.profileName,
            id: targetUser.id
          };
          return currentUser;
        }
      }
      if (!targetUser) {
        const templateString = fs.readFileSync(__dirname + '/template/verify.ejs', 'utf-8');
        const template = ejs.compile(templateString);
        const toEmail = new sendgrid.Email(email);
        const verificationToken = Math.floor((Math.random() * 10000000000) + 54);
        console.log(verificationToken);
        await user.create({ email, verificationToken });


        //await targetUser.updateAttribute({verificationToken: token});
        const subject = 'Welcome to plateDate';
        const content = new sendgrid.Content(
          'text/html', template({
            email,
            url: `${[process.env.APP_HOST]}api/users/verifyEmail?verificationToken=${verificationToken}`,
          })
        );
        const mail = new sendgrid.Mail(fromEmail, subject, toEmail, content);

        sendMail(mail);

        return 'You will receive email shortly';
      }
    }
    catch (e) {
      console.log('Error in user.postSsignUpEmail', e);
      return internalError();
    }
  }

  user.verifyEmail = async function (req, res, verificationToken, cb) {
    try {
      const targetUser = await user.findOne({
        where: {
          verificationToken
        }
      });
      if (!targetUser) {
        console.log(targetUser);
        return { emailVerified: null };
       // return res.redirect('/error');
      }

      await targetUser.updateAttributes({
        verificationToken: null,
        emailVerified: true
      });
      // const currentUser = {
      //   email: targetUser.email,
      //   contactNumber: targetUser.contactNumber,
      //   emailVerified: targetUser.emailVerified,
      //   firstLogin: targetUser.firstLogin,
      //   profileName: targetUser.profileName,
      //   id: targetUser.id
      // };
      // return currentUser;

      return res.redirect('/thank_you');
    } catch (e) {
      console.log('Error in user.verifyEmail', e);
      return internalError();
    }
  };


  /*user.firstLogin = async function (email) {
    try {
      const targetUser = await user.findOne({
        where: {
          email
        }
      });
      let countLogin = 1;
      if (targetUser.countLogin === null) {
        await targetUser.updateAttributes({countLogin});
        return targetUser;
      }
      else {
        return 'User has already logged several times';
      } 
    } catch (e) {
      console.log('Error in user.firstLogin', e);
    }
  }
};*/



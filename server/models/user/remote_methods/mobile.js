const SendOtp = require('sendotp');
const { badRequest, internalError } = require('../../../helpers/errorFormatter');
const twilio = require('twilio');

module.exports = function (user) {
  user.remoteMethod(
    'sendMobileOtp',
    {
      accepts: { arg: 'contactNumber', type: 'string', required: true },
      http: { path: '/sendMobileOtp', verb: 'post' },
      returns: { root: true, type: 'object' }
    });

  user.remoteMethod(
    'verifyMobileOtp',
    {
      accepts: [{ arg: 'contactNumber', type: 'String', required: true }, { arg: 'otp_to_verify', type: 'number', required: true }],
      http: { path: '/verifyMobileOtp', verb: 'post' },
      returns: { root: true, type: 'object' }
    });

  user.remoteMethod(
    'resendOtp',
    {
      accepts: [{ arg: 'contactNumber', type: 'String', required: true }],
      http: { path: '/resendOtp', verb: 'post' },
      returns: { root: true, type: 'object' }
    });

  var randomFixedInteger = function (length) {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));
  }

  user.sendMobileOtp = async function (contactNumber, cb) {
    var accountSid = process.env.TWILIO_ACCOUNTSID; // Your Account SID from www.twilio.com/console
    var authToken = process.env.TWILIO_AUTHTOKEN;   // Your Auth Token from www.twilio.com/console

    console.log(accountSid);
    console.log(authToken)
    console.log(contactNumber)
    var client = new twilio(accountSid, authToken);
    try {
      const existingUser = await user.findOne({
        where: {
          contactNumber
        }
      });
      if (!existingUser) {
        const otp = randomFixedInteger(6);
        const message = await client.messages.create({
          body: 'Verification code : ' + otp,
          to: contactNumber,  // Text this number
          from: process.env.TWILIO_FROM_NUMBER
        });
        console.log(message);
        const newUser = await user.create({ 'contactNumber': contactNumber, 'otp': otp });
        const currentUser = {
          contactNumber: newUser.contactNumber,
          otpVerified: newUser.otpVerified
        };
        return currentUser;
      }
      else if (existingUser) {
        const otp = randomFixedInteger(6);
        const message = await client.messages.create({
          body: 'Verification code : ' + otp,
          to: contactNumber,  // Text this number
          from: process.env.TWILIO_FROM_NUMBER
        });
        console.log(message);
        await existingUser.updateAttributes({ 'contactNumber': contactNumber, 'otp': otp });
        const currentUser = {
          contactNumber: existingUser.contactNumber,
          otpVerified: existingUser.otpVerified,
          firstLogin: existingUser.firstLogin
        };
        return currentUser;
      }
      else {
        return cb(badRequest('There is an error sending otp to your mobile'));
      }
    }
    catch (error) {
      console.log('Error in sendMobileOtp');
      console.log(error);
    }
  }

  user.verifyMobileOtp = async function (contactNumber, otp, cb) {
    try {
      const targetUser = await user.findOne({
        where: {
          contactNumber
        }
      });
      if (!targetUser) {
        return cb(badRequest('Invalid Contact number'));
      }
      else if (targetUser.otp !== otp) {
        return cb(badRequest('Invalid OTP'));
      }
      else if (targetUser.otp === otp && targetUser.otpVerified === true) {
        await targetUser.updateAttributes({
          otp: null,
          otpVerified: true,
          firstLogin: null
        });
        const currentUser = {
          email: targetUser.contactNumber,
          firstLogin: targetUser.firstLogin,
          otpVerified: targetUser.otpVerified,
          id: targetUser.id,
          profileName: targetUser.profileName

        }
        return currentUser;
      }
      else {
        await targetUser.updateAttributes({
          otp: null,
          otpVerified: true,
          firstLogin: true
        });
        const currentUser = {
          contactNumber: targetUser.contactNumber,
          firstLogin: targetUser.firstLogin,
          otpVerified: targetUser.otpVerified,
          id: targetUser.id,
          profileName: targetUser.profileName

        }
        return currentUser;
      }
    } catch (e) {
      console.log('Error in user.verifyMobileOtp', e);
      return internalError();
    }

  }

  user.resendOtp = async function (contactNumber, cb) {
    var accountSid = process.env.TWILIO_ACCOUNTSID; // Your Account SID from www.twilio.com/console
    var authToken = process.env.TWILIO_AUTHTOKEN;   // Your Auth Token from www.twilio.com/console

    var client = new twilio(accountSid, authToken);
    try {
      const existingUser = await user.findOne({
        where: {
          contactNumber
        }
      });
      if (!existingUser) {
        const otp = randomFixedInteger(6);
        const message = await client.messages.create({
          body: 'Verification code : ' + otp,
          to: contactNumber,  // Text this number
          from: process.env.TWILIO_FROM_NUMBER
        });
        console.log(message);
        const newUser = await user.create({ 'contactNumber': contactNumber, 'otp': otp });
        const currentUser = {
          contactNumber: newUser.contactNumber,
          otpVerified: newUser.otpVerified
        };
        return currentUser;
      }
      else if (existingUser) {
        const otp = randomFixedInteger(6);
        const message = await client.messages.create({
          body: 'Verification code : ' + otp,
          to: contactNumber,  // Text this number
          from: process.env.TWILIO_FROM_NUMBER
        });
        console.log(message);
        await existingUser.updateAttributes({ 'contactNumber': contactNumber, 'otp': otp });
        const currentUser = {
          contactNumber: existingUser.contactNumber,
          otpVerified: existingUser.otpVerified,
          firstLogin: existingUser.firstLogin
        };
        return currentUser;
      }
      else {
        return cb(badRequest('There is an error sending otp to your mobile'));
      }
    }
    catch (error) {
      console.log('Error in sendMobileOtp');
      console.log(error);
    }
  }
};
    /*try {
      const otp = Math.floor((Math.random() * 1000000) + 54);
      client.messages
        .create({
          body: 'Verification code : ' + otp,
          to: contactNumber,  // Text this number
          from: process.env.TWILIO_FROM_NUMBER// From a valid Twilio number
        })
        .then(message => console.log(message))
        .done(() => {
          user.create({ 'contactNumber': contactNumber, 'otp': otp });
          console.log('done cb');
          cb(null, 'ok');
        });
    } catch (error) {
      console.log('Error in sendMobileOtp');
      console.log(error);
      cb(error);
    }
  }
};*/

 /*await targetUser.updateAttributes({
        otp: null
      });
      if (targetUser) {
        if (targetUser.firstLogin === false) {
          await targetUser.updateAttributes({
            firstLogin: true,
            otpVerified: true
          });
          const currentUser = {
            contactNumber: targetUser.contactNumber,
            otpVerified: targetUser.otpVerified,
            firstLogin: targetUser.firstLogin
          };
          return currentUser;
        } else {
          await targetUser.updateAttributes({
            firstLogin: null
          });
          const currentUser = {
            contactNumber: targetUser.contactNumber,
            otpVerified: targetUser.otpVerified,
            firstLogin: targetUser.firstLogin
          };
          return currentUser;
        }
      }*/


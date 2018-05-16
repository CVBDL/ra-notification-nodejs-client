const fs = require('fs');
const https = require('https');
const path = require('path');
const url = require('url');

const config = require('./config/config.json');
const certificate =
  fs.readFileSync(path.join(__dirname, 'config', 'certificate.cer'));


/**
 * 
 * @param {Object} args 
 * 
 * @returns {Promise}
 */
function sendEmail(args) {
  let mailEntity;
  try {
    mailEntity = normalize(args);

  } catch (e) {
    return Promise.reject(e);
  }

  return send(mailEntity);
}

/**
 * 
 * @param {Object} args 
 * 
 * @returns {Object} Mail entity.
 */
function normalize(args) {
  let mailEntity = {};

  mailEntity.Subject = args.Subject || 'You\'ve Got a New Notification';

  if (!isObject(args)) {
    throw 'Notification: Invalid arguments.';
  }

  if (!args.Body) {
    throw 'Notification: Missing mail body.';

  } else {
    mailEntity.Body = args.Body;
  }

  if (Array.isArray(args.To) && args.To.length > 0) {
    mailEntity.To = args.To;

  } else {
    throw 'Notification: Missing mail to list.';
  }

  if (Array.isArray(args.Cc)) {
    mailEntity.Cc = args.Cc;

  } else {
    mailEntity.Cc = [];
  }

  if (Array.isArray(args.Bcc)) {
    mailEntity.Bcc = args.Bcc;

  } else {
    mailEntity.Bcc = [];
  }

  mailEntity.From = args.From || 'noreply@rockwellautomation.com';
  mailEntity.IsHtml = !!args.IsHtml;

  return mailEntity;
}

/**
 * Call notification web service.
 * 
 * @param {Object} mailEntity 
 * 
 * @returns {Promise}
 */
function send(mailEntity) {
  const urlParts = url.parse(config.mailEndpoint);
  const options = {
    hostname: urlParts.hostname,
    port: 443,
    path: urlParts.path,
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    ca: certificate
  };

  let payload;
  try {
    payload = JSON.stringify(mailEntity);

  } catch (e) {
    return Promise.reject('Notification: Error occurred parsing payload JSON.');
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      if (res.statusCode === 200) {
        resolve();

      } else {
        reject('Notification: Error occurred in service server.');
      }
    });

    req.on('error', (e) => {
      reject('Notification: Failed to send notification request.');
    });

    req.write(payload);
    req.end();
  });
}

function isObject(value) {
  return (value !== null && typeof value === 'object');
}


exports.sendEmail = sendEmail;

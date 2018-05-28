const fs = require('fs');
const https = require('https');
const path = require('path');
const url = require('url');

const config = require('./config/config.json');
const certificate =
  fs.readFileSync(path.join(__dirname, 'config', 'certificate.cer'));


let attachments = [];

function addAttachment(filename, fileAbsolutePath) {
  if (filename && fileAbsolutePath) {
    try {
      let base64Content = fs.readFileSync(fileAbsolutePath).toString('base64');
      attachments.push({
        Name: filename,
        Data: base64Content
      });

    } catch(e) {
      console.log('Notification: Cannot read attached file.');
    }
  }

  return module.exports;
}

function clearAttachment() {
  attachments = [];
}

/**
 * Send basic email.
 * 
 * @param {Object} args Mail entry.
 * 
 * @returns {Promise}
 */
function sendEmail(args) {
  try {
    return send(normalize(args)).then(() => {
      // clean cache
      clearAttachment();
    });

  } catch (e) {
    return Promise.reject(e);
  }
}

/**
 * Send email with an HTML template as body.
 * 
 * @param {Object} args Mail entry.
 * @param {string} htmlAbsolutePath Absolute file path.
 * 
 * @returns {Promise}
 */
function sendHtmlEmail(args, htmlAbsolutePath) {
  args.IsHtml = true;

  if (htmlAbsolutePath) {
    try {
      args.Body = fs.readFileSync(htmlAbsolutePath, {
        encoding: 'utf-8'
      });

    } catch(e) {
      return Promise.reject('Notification: Cannot read HTML file.');
    }
  }

  return sendEmail(args);
}

/**
 * @param {Object} args Mail entry.
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

  mailEntity.Attachments = attachments;

  return mailEntity;
}

/**
 * Call notification web service.
 * 
 * @param {Object} mailEntity Mail entry.
 * 
 * @returns {Promise}
 */
function send(mailEntity) {
  let payload;
  try {
    payload = JSON.stringify(mailEntity);

  } catch (e) {
    return Promise.reject('Notification: Error occurred parsing payload JSON.');
  }

  const urlParts = url.parse(config.mailEndpoint);
  const options = {
    hostname: urlParts.hostname,
    port: 443,
    path: urlParts.path,
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(payload)
    },
    ca: certificate
  };

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


exports.addAttachment = addAttachment;
exports.clearAttachment = clearAttachment;
exports.sendEmail = sendEmail;
exports.sendHtmlEmail = sendHtmlEmail;

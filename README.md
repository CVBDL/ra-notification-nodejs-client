# Ra Notification NodeJS Client

## Usage

```node
const raNotificationClient = require('ra-notification-nodejs-client');

const mail = {
  From: "no-reply@example.com",
  To: ["example@example.com"],
  Cc: [],
  Bcc: [],
  Subject: "RaNotification Released!",
  Body: "Hi all, we're pleased to announce that RaNotification is released.",
  IsHtml:  false
};

raNotificationClient
  .sendEmail(mail)
  .then(() => {
    console.log('Success');
  })
  .catch(err => {
    console.log('Failure: ', err);
  });
```

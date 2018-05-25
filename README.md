# Ra Notification NodeJS Client

## Prerequisites

- NodeJS v6.0.0+

## Usage

```js
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

// send basic email
raNotificationClient
  .sendEmail(mail)
  .then(() => {
    console.log('Success');
  })
  .catch(err => {
    console.log('Failure: ', err);
  });

// send email with HTML template as body
raNotificationClient
  .sendHtmlEmail(mail, 'C:\\email-template.html')
  .then(() => {
    console.log('Success');
  })
  .catch(err => {
    console.log('Failure: ', err);
  });
```

### email-template.html

```html
<ul>
  <li>Hello</li>
  <li>World</li>
</ul>
```

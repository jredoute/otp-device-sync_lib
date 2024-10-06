# OTP Device Sync

`otp-device-sync` is an npm library exposing a method `getMailComponents`that simplifies retrieving One-Time Password (OTP) sent via a special email provided by OTP Device Sync (user@mail.otp-device-sync.net), without having to interact directly with email service APIs. This library is ideal for end-to-end testing, especially for automating OTP retrieval during two-factor authentication (2FA) processes.

## Installation

You can install the library using npm:

```
npm install otp-device-sync
```

Or with yarn:

```
yarn add otp-device-sync
```

## Usage

### Syntax

```
const getMailComponents = async (email, from, options = { verbose: false });
```

### Parameters

- **email** (string): The email address where the OTP was sent. This email address must be provided by OTP Device Sync (user@mail.otp-device-sync.net)
- **from** (string): The sender's email address. This is required to retrieve OTP from emails that comes from your service.
- **options** (object, optional):
  - **verbose** (boolean): If enabled, outputs additional information to the console (useful for debugging). By default, this option is disabled (`false`).
  - **timeout** (number): Throw error after the specified number of millisecond if no OTP is retrieved. By default, this option is set to wait forever (`0`).
  - **registeredKey** (number): access token to use with associated (service, user) pair


### Example with Playwright

```
import { test } from '@playwright/test';
import { getMailComponents } from 'otp-device-sync'

test('test login', async ({ page }) => {
  const page = await browser.newPage();
  
  await page.goto('https://your-website.com/login');
  
  // Perform the initial authentication
  await page.fill('#email', 'user@mail.otp-device-sync.net');
  await page.click('#sendOTP');
  
  // Retrieve the OTP code
  const comps = await getMailComponents('user@mail.otp-device-sync.net', 'noreply@service.com');
  const otp = comps.codes[0]

  // Input the OTP code into the relevant field
  await page.fill('#otp', otp);
  await page.click('#verifyOTP');
  
  // Following test with OTP verified
})
```

### Error Handling

If no OTP is found or an error occurs, an exception will be thrown. You can handle this using a `try...catch` block as shown in the examples above.

## Contributing

Contributions are welcome! Please submit a `pull request` or open an `issue` to discuss the changes you'd like to make.

## License

MIT License

# OTP Migration Parser

This is a lightweight, dependency-free JavaScript utility for parsing `otpauth-migration://` URLs (e.g. exported from Google Authenticator). It extracts human-readable OTP account details **without relying on external libraries** or web services.

Unlike other solutions, this tool is **not published as an NPM package**, turned into a library, or offered as a web service. Why? Because when dealing with sensitive data like OTP secrets, **trust is everything**. This script is fully open-source - no data is sent anywhere, and no black-box code is involved. **Everything stays local**.

## ⚡ Why this script?

- **No dependencies**: Lightweight and fast - no external libraries.
- **Self-contained**: Works in both browser and Node.js environments.
- **Clear code**: Clean, understandable logic with inline documentation.
- **Fully typed**: TypeScript types for better DX and fewer bugs.
- **Custom parsers**: Built-in Base32 and Protobuf handling - no bloated packages.
- **Compact**: Entire script (including comments) is under 200 lines.
- **Transparent**: No data is sent anywhere. Everything runs locally, ensuring your secrets remain private.

## 🛠 Use Cases

- **Migrate 2FA accounts**: Easily migrate 2FA accounts from Google Authenticator to other apps.
- **Debug or inspect exports**: Inspect `otpauth-migration://` QR exports for debugging purposes.
- **Integrate in OTP backup tools**: Use this script in your own OTP backup/export tools.

## 🚀 Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jens-duttke/otp-migration-parser.git

   cd otp-migration-parser
   ```

2. Either run the `index.js` script via Node.js:
   ```bash
   node . "otpauth-migration://offline?data=CkoKDZePmX7z8qHgFlH9yVcSIlRoaXNfaXNfYW5fRXhhbXBsZTplbWFpbEBlbWFpbC5jb20aD0V4YW1wbGVfV2Vic2l0ZSABKAEwAhABGAEgAA%3D%3D"
   ```

   Alternatively using a hard-coded example URL:
   ```bash
   node .
   ```

   Or run a **local** HTTP server to access the browser-based `index.html`:
   ```bash
   npx http-server -o
   ```

## 🧑‍💻 Contributing

Feel free to fork this repository and submit pull requests. If you find bugs or have feature suggestions, please open an issue!

## 📜 License

This project is licensed under the MIT License.

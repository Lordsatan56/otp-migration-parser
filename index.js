#!/usr/bin/node

/**
 * @file Node.js entry point
 * 
 * Execute the script using Node.js with the following command:
 * node . otpauth-migration://offline?data=...
 * 
 * Alternatively, replace the example URL below with your own:
 *
 * @author Jens Duttke <web@duttke.de>
 * @link https://github.com/jens-duttke/otp-migration-parser
 * @license MIT Free to use, modify, and distribute.
 */

import { parseOtpMigrationUrl } from './otp-migration-parser.js';

console.log(
	parseOtpMigrationUrl(
		globalThis.process?.argv[2] ??
		'otpauth-migration://offline?data=CkoKDZePmX7z8qHgFlH9yVcSIlRoaXNfaXNfYW5fRXhhbXBsZTplbWFpbEBlbWFpbC5jb20aD0V4YW1wbGVfV2Vic2l0ZSABKAEwAhABGAEgAA%3D%3D'
	)
);

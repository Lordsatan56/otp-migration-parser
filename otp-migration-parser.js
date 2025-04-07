/**
 * @file Google Authenticator Migration Parser
 *
 * @author Jens Duttke <web@duttke.de>
 * @link https://github.com/jens-duttke/otp-migration-parser
 * @license MIT Free to use, modify, and distribute.
 */

/**
 * @typedef AccountInformation
 * @property {string} name
 * @property {string} issuer
 * @property {'UNSPECIFIED' | 'HOTP' | 'TOTP'} type
 * @property {'UNSPECIFIED' | 'SHA1' | 'SHA256' | 'SHA512' | 'MD5'} algorithm
 * @property {null | 6 | 8} digits
 * @property {string} secret
 * @property {number} [counter]
 */

/**
 * Parses an otpauth-migration URL and extracts account information.
 *
 * @param {string} url - The "otpauth-migration://" URL.
 * @returns {AccountInformation[]} - List of extracted OTP account details.
 */
export function parseOtpMigrationUrl (url) {
	const { protocol, searchParams } = new URL(url);
	const data = searchParams.get('data');

	if (protocol !== 'otpauth-migration:' || data === null) {
		throw new Error('Invalid "otpauth-migration" URL');
	}

	return decodeProtobuf(Uint8Array.from(atob(data), (c) => c.charCodeAt(0))).otpParameters;
}

/**
 * Custom Base32 implementation according to RFC4648.
 *
 * @param {Uint8Array} buffer - The binary data to encode.
 * @returns {string} - Base32 encoded string.
 */
function base32Encode (buffer) {
	const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
	let result = '';
	let bits = 0;
	let value = 0;

	for (const byte of buffer) {
		value = (value << 8) | byte;
		bits += 8;

		while (bits >= 5) {
			result += ALPHABET[(value >>> (bits -= 5)) & 0x1F];
		}
	}

	if (bits > 0) {
		result += ALPHABET[(value << (5 - bits)) & 0x1F];
	}

	return result.padEnd(Math.ceil(result.length / 8) * 8, '=');
}

/**
 * Custom simplified Protobuf parser for a specific migration payload format.
 *
 * @param {Uint8Array} buffer - The binary protobuf payload.
 * @returns {{ otpParameters: AccountInformation[] }} - Parsed payload with OTP parameters.
 */
function decodeProtobuf (buffer) {
	let offset = 0;

	function readVarint () {
		let result = 0;
		let shift = 0;
		let byte;

		do {
			if (offset >= buffer.length) {
				throw new Error('Unexpected end of buffer while reading varint');
			}

			byte = buffer[offset++];
			result |= (byte & 0x7F) << shift;
			shift += 7;
		} while (byte & 0x80);

		return result;
	}

	/** @type {{ otpParameters: AccountInformation[]; }} */
	const payload = { otpParameters: [] };

	while (offset < buffer.length) {
		const tag = readVarint();
		const fieldNumber = tag >> 3;
		const wireType = tag & 0x7;

		if (fieldNumber === 1 && wireType === 2) {
			const length = readVarint();
			const endPos = offset + length;
			const parameter = parseOTPParameters(buffer.slice(offset, endPos));

			payload.otpParameters.push(parameter);
			offset = endPos;
		}
		else {
			skipField(wireType);
		}
	}

	return payload;

	function skipField (wireType) {
		switch (wireType) {
			case 0: readVarint(); break;
			case 1: offset += 8; break;
			case 2: offset += readVarint(); break;
			case 5: offset += 4; break;
			default: throw new Error(`Unknown wire type: ${wireType}`);
		}
	}
}

/**
 * Parses a single OTPParameters message from a protobuf buffer.
 *
 * @param {Uint8Array} buffer - The OTP parameters section.
 * @returns {AccountInformation} - Parsed OTP parameter object.
 */
function parseOTPParameters (buffer) {
	let localOffset = 0;
	/** @type {AccountInformation} */
	const result = {};

	function readLocalVarint () {
		let varint = 0;
		let shift = 0;
		let byte;

		do {
			if (localOffset >= buffer.length) {
				throw new Error('Unexpected end of buffer while reading varint');
			}

			byte = buffer[localOffset++];
			varint |= (byte & 0x7F) << shift;
			shift += 7;
		} while (byte & 0x80);

		return varint;
	}

	function readLocalBytes () {
		const length = readLocalVarint();
		const start = localOffset;

		localOffset += length;

		if (localOffset > buffer.length) {
			throw new Error('Unexpected end of buffer while reading bytes');
		}

		return buffer.slice(start, localOffset);
	}

	function readLocalString () {
		return new TextDecoder('utf-8').decode(readLocalBytes());
	}

	while (localOffset < buffer.length) {
		const tag = readLocalVarint();
		const fieldNumber = tag >> 3;
		const wireType = tag & 0x7;

		if (fieldNumber === 1 && wireType === 2) { result.secret = base32Encode(readLocalBytes()); }
		else if (fieldNumber === 2 && wireType === 2) { result.name = readLocalString(); }
		else if (fieldNumber === 3 && wireType === 2) { result.issuer = readLocalString(); }
		else if (fieldNumber === 4 && wireType === 0) { result.algorithm = /** @type {const} */(['UNSPECIFIED', 'SHA1', 'SHA256', 'SHA512', 'MD5'])[readLocalVarint()]; }
		else if (fieldNumber === 5 && wireType === 0) { result.digits = /** @type {const} */([null, 6, 8])[readLocalVarint()]; }
		else if (fieldNumber === 6 && wireType === 0) { result.type = /** @type {const} */(['UNSPECIFIED', 'HOTP', 'TOTP'])[readLocalVarint()]; }
		else if (fieldNumber === 7 && wireType === 0) { result.counter = readLocalVarint(); }
		else {
			// Skip locale field
			switch (wireType) {
				case 0: readLocalVarint(); break;
				case 1: localOffset += 8; break;
				case 2: localOffset += readLocalVarint(); break;
				case 5: localOffset += 4; break;
				default: throw new Error(`Unknown wire type: ${wireType}`);
			}
		}
	}

	return result;
}

#!/usr/bin/env node
/*!
 * Module dependencies.
 */

var qrcode = require('qrcode-terminal'),
    base32 = require('base32.js'),
    path = require('path'),
    fs = require('fs'),
    os = require('os'),
    crypto = require('crypto');

/*!
 * Parse the process name and input
 */

var name = process.argv[1].replace(/^.*[\\\/]/, '').replace('.js', ''),
    input = process.argv[2],
    issuer = process.argv[3] || os.hostname(),
    user = process.argv[4] || process.env['USER'] + "@" + os.hostname();

/*!
 * Display help
 */

if (input === '-h' || input === '--help') {
    help();
    process.exit();
}

/*!
 * Display version
 */

if (input === '-v' || input === '--version') {
    version();
    process.exit();
}

/**!
 * Handle disk I/O
 */
input = input || process.env['HOME']+"/.totp-key"
exists = fs.existsSync(input)
if(!exists) {
  fs.writeFileSync(input, bytes().toString('hex'), {mode: 0600});
}

var handle = fs.openSync(input, 'r');
if ((fs.fstatSync(handle).mode & 07777) !=  parseInt('600',8)) {
  throw new Error('Bad Permissions on ' + input);
}
var key = new Buffer(fs.readFileSync(input), "hex")
key = new Buffer(key.toString(), "hex")

/*!
 * Setup URL 
 */
issuer = issuer.replace (" ", "%20");
var encoder = new base32.Encoder();
var secret = encoder.write(key).finalize();
var url = "otpauth://totp/" + issuer + ':' + user + "?secret=" + secret + "&issuer=" + issuer;

/*!
 * Render the QR Code
 */
console.log(input + (exists?' read':' written'));
qrcode.generate(url);
console.log(url);

/*!
 * Helper functions
 */

function bytes() {
    return crypto.randomBytes(10);
}

function help() {
    console.log([
        '',
        'Usage: ' + name + ' [file] [issuer] [user@host]',
        '',
        'Options:',
        '  -h, --help           output usage information',
        '  -v, --version        output version number',
        '',
        'Examples:',
        '',
        '  $ ' + name ,
        '  $ ' + name + ' ~mojonixon/.totp-key',
        '  $ ' + name + ' ~al/.totp-key \"Wax Trax\"',
        '  $ ' + name + ' ~jellob/.totp-key \"Holiday Inn\" jellob@travel.kh',
        ''
    ].join('\n'));
}

function version() {
    var packagePath = path.join(__dirname, '..', 'package.json'),
        packageJSON = JSON.parse(fs.readFileSync(packagePath), 'utf8');

    console.log(packageJSON.version);
}

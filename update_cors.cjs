const fs = require('fs');

let code = fs.readFileSync('server/index.js', 'utf8');

const target = "res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Range, x-custom-header, apikey');";
const replacement = `const requestedHeaders = req.headers['access-control-request-headers'];
  if (requestedHeaders) {
    res.setHeader('Access-Control-Allow-Headers', requestedHeaders);
  } else {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Range, x-custom-header, apikey, Cache-Control, Pragma, Expires, If-Modified-Since, If-None-Match');
  }`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('server/index.js', code, 'utf8');
  console.log('Successfully updated server/index.js CORS headers!');
} else {
  console.error('Target not found in server/index.js');
}


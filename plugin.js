/* eslint-disable no-prototype-builtins, new-cap */

var crypto = require('crypto');

const regexUri = /.*?\/open\/i\/.*?/;

function sign(req, apiSecret) {
  // Get all parameters from the request and generate a query string
  const params = req.getParameters();

  let params4Sign = {};

  params.forEach(function(param) {
    params4Sign[param['name']] = param['value'];
  });

  params4Sign['appSignKey'] = apiSecret;

  let unsignStr = "";

  Object.keys(params4Sign).sort().forEach(function(key) {
    if (unsignStr.length > 0) {
      unsignStr += "&";
    }
    unsignStr = unsignStr + key + '=' + params4Sign[key];
  });

  const sha1Algo = crypto.createHash('sha1');
  sha1Algo.update(unsignStr);
  return sha1Algo.digest('hex');
}

// A request hook will be run before sending the request to API, but after everything else is finalized
module.exports.requestHooks = [
  (context) => {
    // Validate context
    if (context === null || context === undefined) {
      console.log('Invalid context');
      return;
    }
    // Validate request
    if (
      !context.hasOwnProperty('request') ||
      context['request'] === null ||
      context['request'] === undefined ||
      context['request'].constructor.name != 'Object'
    ) {
      console.log('Invalid request');
      return;
    }
    const req = context.request;
    // Validate URL
    if (
      !req.hasOwnProperty('getUrl') ||
      req['getUrl'] == null ||
      req['getUrl'].constructor.name != 'Function' ||
      !regexUri.test(req.getUrl())
    ) {
      console.log('Not a OpenApi API URL');
      return ;
    }

    // Check if a timestamp parameter is present. If so, it likely needs to be signed.
    if (!req.hasParameter('timestamp')) {
      console.log('No timestamp parameter, not signing.');
      return;
    }

    if (!req.hasParameter('nonce')) {
      console.log('No nonce parameter, not signing.');
      return;
    }

    // Check for a valid api key
    const key = req.getEnvironmentVariable("app_sign_key");

    if (key == null) {
      console.log(
        'Could not find environment variable "app_sign_key". Cannot sign message'
      );
      throw new Error(
        "Message should be signed, but cannot find 'app_sign_key' environment variable. key: " + key
      );
    }

    // Make sure there is not already a signature parameter
    if (req.hasParameter('sign')) {
      throw new Error(
        'This message should be signed, but signature parameter is already filled in!'
      );
    }

    // Get the parameter string
    const signature = sign(req, key);
    // Set the signature
    req.setParameter('sign', signature);

    console.log('Done signing');
  }
];

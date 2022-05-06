/*
* Create and export configuration variables
* openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
*/

// Container for all the environments
var environments = {};

//Staging (default) environment
environments.staging = {
  'httpPort' : 3000,
  'httpsPort' : 3001,
  'envName' : 'staging',
  'hashingSecret' : 'thisIsASecret',
  'maxChecks' : 5,
  'twilio' : {
    'accountSid' : 'AC144eae96614e106119a8ee86e5435335',
    'authToken' : '198f2e7903670c644faed7e03c31393c',
    'fromPhone' : '+14454551883'
  },
  'templateGlobals' : {
    'appName' : 'UptimeChecker',
    'companyName' : 'CompanyName, Inc',
    'yearCreated' : '2022',
    'baseUrl' : 'http://localhost:3000/'
  }
};

// Production environment
environments.production = {
  'httpPort' : 6000,
  'httpsPort' : 6001,
  'envName' : 'production',
  'hashingSecret' : 'thisIsAlsoASecret',
  'maxChecks' : 5,
  'twilio' : {
    'accountSid' : 'AC144eae96614e106119a8ee86e5435335',
    'authToken' : '198f2e7903670c644faed7e03c31393c',
    'fromPhone' : '+14454551883'
  },
  'templateGlobals' : {
    'appName' : 'UptimeChecker',
    'companyName' : 'CompanyName, Inc',
    'yearCreated' : '2022',
    'baseUrl' : 'http://localhost:6000/'
  }
};

// Determine which environment was passed as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above, if not, default to staging
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;

const StellarSdk = require('stellar-sdk');

try {
    const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    console.log('Server instantiated successfully:', server);
} catch (error) {
    console.error('Error instantiating Server:', error.message);
}

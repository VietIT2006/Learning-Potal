import speakeasy from 'speakeasy';

const secretData = speakeasy.generateSecret({ name: 'Test Admin' });
const secret = secretData.base32;
console.log("Secret (base32):", secret);
console.log("OTP Auth URL:", secretData.otpauth_url);

const token = speakeasy.totp({
  secret: secret,
  encoding: 'base32'
});
console.log("Generated Token:", token);

const isValid = speakeasy.totp.verify({
  secret: secret,
  encoding: 'base32',
  token: token,
  window: 1
});
console.log("Is Valid?", isValid);

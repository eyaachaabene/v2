// Debug script to check JWT secrets
console.log('JWT_SECRET from env:', process.env.JWT_SECRET);
console.log('Fallback secret would be: "fallback-secret"');

const jwt = require('jsonwebtoken');

// Test token creation and verification with same secret
const testPayload = { userId: 'test', email: 'test@test.com', role: 'supplier' };
const secret = process.env.JWT_SECRET || "fallback-secret";

console.log('Using secret for test:', secret);

const token = jwt.sign(testPayload, secret, { expiresIn: '1h' });
console.log('Created token:', token);

try {
  const decoded = jwt.verify(token, secret);
  console.log('Successfully verified token:', decoded);
} catch (error) {
  console.log('Failed to verify token:', error.message);
}
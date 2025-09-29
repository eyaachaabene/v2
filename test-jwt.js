// Test JWT authentication
console.log('Testing JWT authentication...')

// Get current JWT_SECRET
console.log('JWT_SECRET from env:', process.env.JWT_SECRET)

if (!process.env.JWT_SECRET) {
  console.log('JWT_SECRET is undefined, using fallback')
} else {
  console.log('JWT_SECRET is defined:', process.env.JWT_SECRET.substring(0, 10) + '...')
}
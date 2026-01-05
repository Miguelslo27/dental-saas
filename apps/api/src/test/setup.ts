// Test setup file - sets environment variables before tests run
process.env.SETUP_KEY = 'test-setup-key-minimum-16-chars'
process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-characters-here'
process.env.NODE_ENV = 'test'

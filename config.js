// Configuration file for Mental Health Coach Backend
module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://anchorpoint_db_user:QyKRd84kYjUCNVWm@cluster0.kv346v6.mongodb.net/anchorpoint?retryWrites=true&w=majority',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || '123',
  JWT_EXPIRES_IN: '7d',
  
  // Google AI Configuration
  GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY || 'AIzaSyD2zftsPT3y4To2altLClRrll64HMep-m4',
  
  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100, // limit each IP to 100 requests per windowMs
  
  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};

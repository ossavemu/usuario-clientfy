CREATE TABLE IF NOT EXISTS password_resets(
  token TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(email) REFERENCES users(email) ON DELETE CASCADE
); 
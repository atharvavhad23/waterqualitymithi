import express from 'express';

const router = express.Router();

// Predefined admin accounts (in a real app, these would be in a database)
const adminAccounts = [
  { 
    id: 1,
    username: "admin", 
    email: "admin@mithiriver.com", 
    password: "admin123", 
    name: "System Administrator",
    role: "admin" 
  },
  { 
    id: 2,
    username: "supervisor", 
    email: "supervisor@mithiriver.com", 
    password: "super123", 
    name: "Water Quality Supervisor",
    role: "admin" 
  },
  { 
    id: 3,
    username: "moderator", 
    email: "moderator@mithiriver.com", 
    password: "mod123", 
    name: "Community Moderator",
    role: "admin" 
  }
];

// Login endpoint
export const handleLogin = (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required"
      });
    }

    // Check admin credentials
    const admin = adminAccounts.find(acc => 
      (acc.username === username || acc.email === username) && 
      acc.password === password
    );

    if (admin) {
      // Successful login
      const { password: _, ...userInfo } = admin; // Remove password from response
      return res.json({
        success: true,
        message: "Login successful",
        user: userInfo,
        token: `mock_token_${admin.id}_${Date.now()}` // Mock token for demo
      });
    }

    // Invalid credentials
    return res.status(401).json({
      error: "Invalid username or password"
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: "Internal server error during login"
    });
  }
};

// Register endpoint (simple demo version)
export const handleRegister = (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Username, email, and password are required"
      });
    }

    // Check if user already exists
    const existingUser = adminAccounts.find(acc => 
      acc.username === username || acc.email === email
    );

    if (existingUser) {
      return res.status(409).json({
        error: "User with this username or email already exists"
      });
    }

    // In a real app, you would save to database
    // For demo, we'll just return success
    return res.json({
      success: true,
      message: "Registration successful! Please use predefined admin accounts for demo.",
      redirectToLogin: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      error: "Internal server error during registration"
    });
  }
};

// Get user profile
export const handleProfile = (req, res) => {
  try {
    // In a real app, you would verify the token and get user from database
    return res.json({
      success: true,
      message: "Profile endpoint working",
      note: "Token verification not implemented in demo"
    });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
};
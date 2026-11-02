# 🌊 मिठी नदी (Mithi River) Water Quality Analysis System

A comprehensive full-stack web application for monitoring and analyzing water quality of Mumbai's Mithi River using Machine Learning and real-time data visualization.

## 🎯 Features

### 🔐 **Authentication System**
- Secure user registration and login
- OTP-based email verification
- Password reset functionality
- JWT token-based authentication

### 🤖 **Machine Learning Models**
- **Water Quality Index (WQI) Classifier**: 99.85% accuracy
- **Linear Regression Predictors**: BOD, COD, TDS prediction
- Real-time water quality parameter analysis
- Environmental impact assessment

### 📊 **Dashboard & Analytics**
- Real-time water quality metrics
- Interactive data visualization
- Historical trend analysis
- Beautiful water-themed UI with animations

### 🗺️ **River Monitoring**
- 17.84 km river length coverage
- Multiple monitoring points
- Live sensor data integration
- Location-based quality mapping

## 🚀 Tech Stack

### **Frontend**
- React 18 + Vite
- TailwindCSS 3 with custom animations
- React Router 6 (SPA)
- Radix UI components
- TypeScript support

### **Backend**
- Django 5.2.6 + Django REST Framework
- SQLite database
- JWT authentication
- RESTful API design

### **Machine Learning**
- Python + scikit-learn
- pandas for data processing
- joblib for model persistence
- Custom trained models on Mithi River data

## 📋 Prerequisites

- Node.js 18+
- Python 3.9+
- pnpm (recommended) or npm
- Git

## 🛠️ Installation & Setup

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/Jadeyydbit/waterqualityanalysis.git
cd waterqualityanalysis
\`\`\`

### 2. Frontend Setup
\`\`\`bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
\`\`\`

### 3. Backend Setup
\`\`\`bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\\Scripts\\activate
# On macOS/Linux:
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Train ML models (this will create the .pkl files)
python train_mithi_models.py

# Start Django server
python manage.py runserver
\`\`\`

### 4. Access the Application
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

## 🔑 Default Login Credentials

After creating a superuser, you can login with:
- **Username**: [your superuser username]
- **Password**: [your superuser password]

## 📁 Project Structure

\`\`\`
waterqualityanalysis/
├── client/                 # React frontend
│   ├── pages/             # Route components
│   ├── components/        # Reusable UI components
│   └── ...
├── server/                # Django backend
│   ├── api/              # API endpoints
│   ├── backend/          # Django settings
│   └── ...
├── shared/               # Shared types/interfaces
└── ...
\`\`\`

## 🤖 Machine Learning Models

The system includes pre-trained ML models for:

1. **WQI Classifier** (`mithi_classifier_model.pkl`)
   - Classifies water quality as Excellent/Good/Fair/Poor
   - 99.85% accuracy on test data

2. **Linear Regression Models**
   - BOD (Biological Oxygen Demand) prediction
   - COD (Chemical Oxygen Demand) prediction  
   - TDS (Total Dissolved Solids) prediction

**Note**: ML model files (*.pkl) are not included in the repository due to size constraints. Run \`python train_mithi_models.py\` to generate them locally.

## 🌊 Key Features

### **Beautiful UI/UX**
- Industry-level animations and transitions
- Water-themed design with flowing animations
- Responsive design for all devices
- Glassmorphism effects and modern styling

### **Real-time Monitoring**
- Live water quality parameter tracking
- Environmental condition monitoring
- Historical data visualization
- Alert system for quality thresholds

### **Comprehensive Analytics**
- Statistical analysis of water parameters
- Trend prediction using ML models
- Export functionality for reports
- Interactive charts and graphs

## 🔧 API Endpoints

### Authentication
- \`POST /api/register/\` - User registration
- \`POST /api/login/\` - User login
- \`POST /api/send-otp/\` - Send OTP for verification
- \`POST /api/verify-otp/\` - Verify OTP

### ML Predictions
- \`POST /api/predict-wqi/\` - Water Quality Index classification
- \`POST /api/predict-linear/\` - Linear regression predictions

### River Data
- \`GET /api/rivers/\` - Get all rivers
- \`POST /api/rivers/\` - Add new river data

## 🌍 Environmental Impact

This project contributes to:
- **Water Conservation**: Early detection of pollution
- **Public Health**: Monitoring drinking water quality  
- **Environmental Protection**: Data-driven conservation efforts
- **Smart City Initiative**: IoT integration for Mumbai's infrastructure

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support, email: [your-email@gmail.com] or create an issue in this repository.

## 🏆 Acknowledgments

- Mumbai Municipal Corporation for Mithi River data
- Open source community for libraries and frameworks
- Environmental monitoring organizations for inspiration

---

**Made with ❤️ for Mumbai's Mithi River Conservation** 🌊

---

## 📸 Screenshots

*Add screenshots of your application here*

## 🚀 Deployment

### Production Deployment Options:
1. **Vercel** (Frontend) + **Railway/Heroku** (Backend)
2. **Netlify** (Frontend) + **PythonAnywhere** (Backend)  
3. **Docker** containers for full-stack deployment

### Environment Variables:
Create \`.env\` file in server directory:
\`\`\`
SECRET_KEY=your-secret-key
DEBUG=False
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
\`\`\`
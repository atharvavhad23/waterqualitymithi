"""
Mithi River Water Quality ML Model Training Script
Trains Linear Regression and Random Forest Classifier models
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_squared_error, r2_score, classification_report, accuracy_score
import joblib
import os

def load_and_preprocess_data(file_path):
    """Load and preprocess the Mithi River data"""
    print("Loading Mithi River water quality data...")
    
    # Load the CSV file
    df = pd.read_csv(file_path)
    print(f"Dataset shape: {df.shape}")
    print(f"Columns: {df.columns.tolist()}")
    
    # Display basic info
    print("\nDataset Info:")
    print(df.info())
    print("\nFirst 5 rows:")
    print(df.head())
    
    # Check for missing values
    print("\nMissing values:")
    print(df.isnull().sum())
    
    # Handle missing values if any
    df = df.dropna()
    
    # Encode categorical variables
    le_location = LabelEncoder()
    df['Location_encoded'] = le_location.fit_transform(df['Location'])
    
    # Save the label encoder for later use
    joblib.dump(le_location, 'location_encoder.pkl')
    
    return df, le_location

def train_regression_model(df):
    """Train Linear Regression model to predict water quality parameters"""
    print("\n" + "="*50)
    print("TRAINING LINEAR REGRESSION MODEL")
    print("="*50)
    
    # Features for regression (predict TDS, BOD, COD based on other parameters)
    feature_cols = ['Year', 'Location_encoded', 'Temp', 'DO', 'pH']
    target_cols = ['TDS', 'BOD', 'COD']
    
    X = df[feature_cols]
    
    # Create models for each target
    models = {}
    scalers = {}
    
    for target in target_cols:
        print(f"\nTraining model for {target}...")
        
        y = df[target]
        
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train model
        model = LinearRegression()
        model.fit(X_train_scaled, y_train)
        
        # Predictions
        y_pred = model.predict(X_test_scaled)
        
        # Evaluate
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        print(f"{target} Model Performance:")
        print(f"  MSE: {mse:.2f}")
        print(f"  R²: {r2:.4f}")
        
        # Store model and scaler
        models[target] = model
        scalers[target] = scaler
        
        # Save individual models
        joblib.dump(model, f'linear_regression_{target.lower()}.pkl')
        joblib.dump(scaler, f'scaler_{target.lower()}.pkl')
    
    # Save combined models
    joblib.dump(models, 'mithi_regression_models.pkl')
    joblib.dump(scalers, 'mithi_regression_scalers.pkl')
    
    print(f"\nRegression models saved successfully!")
    return models, scalers

def train_classifier_model(df):
    """Train Random Forest Classifier to predict WQI category"""
    print("\n" + "="*50)
    print("TRAINING RANDOM FOREST CLASSIFIER")
    print("="*50)
    
    # Features for classification
    feature_cols = ['Year', 'Location_encoded', 'Temp', 'DO', 'pH', 'TDS', 'BOD', 'COD']
    target_col = 'WQI'
    
    X = df[feature_cols]
    y = df[target_col]
    
    print(f"WQI categories: {y.unique()}")
    print(f"WQI distribution:\n{y.value_counts()}")
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest Classifier
    clf = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2
    )
    
    print("Training Random Forest Classifier...")
    clf.fit(X_train_scaled, y_train)
    
    # Predictions
    y_pred = clf.predict(X_test_scaled)
    
    # Evaluate
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\nClassifier Performance:")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': feature_cols,
        'importance': clf.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print(f"\nFeature Importance:")
    print(feature_importance)
    
    # Save model and scaler
    joblib.dump(clf, 'mithi_classifier_model.pkl')
    joblib.dump(scaler, 'mithi_classifier_scaler.pkl')
    
    print(f"\nClassifier model saved successfully!")
    return clf, scaler

def main():
    """Main function to train all models"""
    print("Mithi River Water Quality ML Model Training")
    print("=" * 60)
    
    # File path to the CSV
    csv_file = "mithi_river_genuine_data.csv" if os.path.exists("mithi_river_genuine_data.csv") else "mithi_river_data.csv"
    
    # Check if file exists
    if not os.path.exists(csv_file):
        print(f"Error: {csv_file} not found!")
        print("Please make sure the Mithi River CSV file is in the current directory.")
        return
    
    try:
        # Load and preprocess data
        df, le_location = load_and_preprocess_data(csv_file)
        
        # Train regression models
        regression_models, regression_scalers = train_regression_model(df)
        
        # Train classifier model
        classifier_model, classifier_scaler = train_classifier_model(df)
        
        print("\n" + "="*60)
        print("MODEL TRAINING COMPLETED SUCCESSFULLY!")
        print("="*60)
        print("\nGenerated files:")
        print("1. mithi_regression_models.pkl - Linear regression models")
        print("2. mithi_regression_scalers.pkl - Feature scalers for regression")
        print("3. mithi_classifier_model.pkl - Random Forest classifier")
        print("4. mithi_classifier_scaler.pkl - Feature scaler for classifier")
        print("5. location_encoder.pkl - Location label encoder")
        print("6. Individual model files for each target variable")
        
        # Save model metadata
        model_info = {
            'dataset_shape': df.shape,
            'feature_columns_regression': ['Year', 'Location_encoded', 'Temp', 'DO', 'pH'],
            'target_columns_regression': ['TDS', 'BOD', 'COD'],
            'feature_columns_classifier': ['Year', 'Location_encoded', 'Temp', 'DO', 'pH', 'TDS', 'BOD', 'COD'],
            'target_column_classifier': 'WQI',
            'locations': le_location.classes_.tolist(),
            'wqi_categories': df['WQI'].unique().tolist()
        }
        
        joblib.dump(model_info, 'model_metadata.pkl')
        print("7. model_metadata.pkl - Model information and metadata")
        
    except Exception as e:
        print(f"Error during model training: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
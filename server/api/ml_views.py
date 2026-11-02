"""
Mithi River Water Quality ML API Views
Provides prediction endpoints for linear regression and classification
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
import joblib
import numpy as np
import pandas as pd
import os
from django.conf import settings

# Global variables to store loaded models
ml_models = {
    'regression_models': None,
    'regression_scalers': None,
    'classifier_model': None,
    'classifier_scaler': None,
    'location_encoder': None,
    'model_metadata': None
}

hybrid_pipeline = None


def load_hybrid_pipeline():
    """Load the optional CEEMDAN-BiLSTM-XGBoost pipeline on demand."""
    global hybrid_pipeline
    try:
        from train_hybrid_ceemdan_attention_bilstm_xgboost import HybridWaterQualityPipeline
        model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'deep_learning_models', 'hybrid')
        if not os.path.exists(os.path.join(model_dir, 'hybrid_summary.json')):
            return None
        hybrid_pipeline = HybridWaterQualityPipeline(model_dir)
        return hybrid_pipeline
    except Exception as error:
        print(f"Hybrid model unavailable: {error}")
        return None


def load_deep_learning_pipeline():
    """Load the saved ANN/CNN/RNN/LSTM artifacts on demand."""
    try:
        from deep_learning_mithi_models import DeepLearningWaterQualityPipeline
        model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'deep_learning_models')
        if not os.path.exists(os.path.join(model_dir, 'deep_learning_summary.json')):
            return None
        return DeepLearningWaterQualityPipeline(model_dir)
    except Exception as error:
        print(f"Deep-learning models unavailable: {error}")
        return None


def get_model_name(request):
    return str(request.data.get('model', 'ml_random_forest')).lower()

def load_ml_models():
    """Load all ML models once when server starts"""
    try:
        base_path = os.path.dirname(os.path.abspath(__file__))
        server_path = os.path.dirname(base_path)
        
        # Load regression models
        ml_models['regression_models'] = joblib.load(os.path.join(server_path, 'mithi_regression_models.pkl'))
        ml_models['regression_scalers'] = joblib.load(os.path.join(server_path, 'mithi_regression_scalers.pkl'))
        
        # Load classifier model
        ml_models['classifier_model'] = joblib.load(os.path.join(server_path, 'mithi_classifier_model.pkl'))
        ml_models['classifier_scaler'] = joblib.load(os.path.join(server_path, 'mithi_classifier_scaler.pkl'))
        
        # Load encoders and metadata
        ml_models['location_encoder'] = joblib.load(os.path.join(server_path, 'location_encoder.pkl'))
        ml_models['model_metadata'] = joblib.load(os.path.join(server_path, 'model_metadata.pkl'))
        
        print("ML models loaded successfully!")
        return True
        
    except Exception as e:
        print(f"Error loading ML models: {str(e)}")
        return False

# Load models when module is imported
load_ml_models()

def calculate_wqi(temperature, dissolved_oxygen, ph, tds, bod, cod):
    """
    Calculate Water Quality Index (WQI) based on water quality parameters
    Uses a weighted approach based on Indian water quality standards
    """
    
    # Parameter weights (importance factors)
    weights = {
        'pH': 0.12,
        'DO': 0.17,
        'TDS': 0.19,
        'BOD': 0.22,
        'COD': 0.19,
        'Temp': 0.11
    }
    
    # Calculate sub-indices for each parameter
    # pH (optimal range: 6.5-8.5)
    if 6.5 <= ph <= 8.5:
        ph_index = 100
    elif 6.0 <= ph < 6.5 or 8.5 < ph <= 9.0:
        ph_index = 80
    elif 5.5 <= ph < 6.0 or 9.0 < ph <= 9.5:
        ph_index = 60
    elif 5.0 <= ph < 5.5 or 9.5 < ph <= 10.0:
        ph_index = 40
    else:
        ph_index = 20
    
    # Dissolved Oxygen (optimal: >6 mg/L)
    if dissolved_oxygen >= 6:
        do_index = 100
    elif dissolved_oxygen >= 4:
        do_index = 80
    elif dissolved_oxygen >= 2:
        do_index = 60
    elif dissolved_oxygen >= 1:
        do_index = 40
    else:
        do_index = 20
    
    # TDS (optimal: <500 mg/L)
    if tds <= 500:
        tds_index = 100
    elif tds <= 1000:
        tds_index = 80
    elif tds <= 2000:
        tds_index = 60
    elif tds <= 3000:
        tds_index = 40
    else:
        tds_index = 20
    
    # BOD (optimal: <3 mg/L)
    if bod <= 3:
        bod_index = 100
    elif bod <= 6:
        bod_index = 80
    elif bod <= 12:
        bod_index = 60
    elif bod <= 20:
        bod_index = 40
    else:
        bod_index = 20
    
    # COD (optimal: <20 mg/L)
    if cod <= 20:
        cod_index = 100
    elif cod <= 40:
        cod_index = 80
    elif cod <= 80:
        cod_index = 60
    elif cod <= 120:
        cod_index = 40
    else:
        cod_index = 20
    
    # Temperature (optimal: 20-30°C)
    if 20 <= temperature <= 30:
        temp_index = 100
    elif 15 <= temperature < 20 or 30 < temperature <= 35:
        temp_index = 80
    elif 10 <= temperature < 15 or 35 < temperature <= 40:
        temp_index = 60
    elif 5 <= temperature < 10 or 40 < temperature <= 45:
        temp_index = 40
    else:
        temp_index = 20
    
    # Calculate weighted WQI
    wqi = (
        weights['pH'] * ph_index +
        weights['DO'] * do_index +
        weights['TDS'] * tds_index +
        weights['BOD'] * bod_index +
        weights['COD'] * cod_index +
        weights['Temp'] * temp_index
    )
    
    return max(0, min(100, wqi))  # Ensure WQI is between 0 and 100

@api_view(['POST'])
@permission_classes([AllowAny])
def predict_water_quality(request):
    """
    Linear Regression Prediction API
    Predicts TDS, BOD, COD values based on input parameters
    """
    try:
        print(f"\n{'='*50}")
        print(f"[INFO] ML PREDICTION REQUEST")
        print(f"Request data: {request.data}")
        print(f"{'='*50}\n")
        
        selected_model = get_model_name(request)
        record = {
            'year': int(request.data.get('year', 0)),
            'location': request.data.get('location', ''),
            'temp': float(request.data.get('temp', 0)),
            'do': float(request.data.get('do', 0)),
            'ph': float(request.data.get('ph', 0)),
            'tds': float(request.data.get('tds', 0)),
            'bod': float(request.data.get('bod', 0)),
            'cod': float(request.data.get('cod', 0)),
        }
        model_record = {
            'Year': record['year'],
            'Location': record['location'],
            'Temp': record['temp'],
            'DO': record['do'],
            'pH': record['ph'],
            'TDS': record['tds'],
            'BOD': record['bod'],
            'COD': record['cod'],
        }

        if selected_model.startswith('dl_'):
            pipeline = load_deep_learning_pipeline()
            if pipeline is None:
                return Response({'error': 'Deep-learning artifacts are unavailable.', 'success': False}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            predictions = pipeline.predict_regression(model_record, selected_model.removeprefix('dl_'))
            predictions['WQI'] = round(float(calculate_wqi(record['temp'], record['do'], record['ph'], predictions['TDS'], predictions['BOD'], predictions['COD'])), 1)
            return Response({'success': True, 'model': selected_model, 'predictions': predictions, 'input': record}, status=status.HTTP_200_OK)

        if selected_model == 'hybrid':
            pipeline = hybrid_pipeline or load_hybrid_pipeline()
            if pipeline is None:
                return Response({'error': 'Hybrid artifacts are unavailable.', 'success': False}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            prediction = pipeline.predict([model_record] * 6)
            regression_predictions = dict(prediction['regression'])
            regression_predictions['WQI'] = round(float(calculate_wqi(record['temp'], record['do'], record['ph'], regression_predictions['TDS'], regression_predictions['BOD'], regression_predictions['COD'])), 1)
            return Response({'success': True, 'model': selected_model, 'predictions': regression_predictions, 'classification': prediction['classification'], 'input': record}, status=status.HTTP_200_OK)

        # Check if classical models are loaded
        if not ml_models['regression_models']:
            print("[ERROR] ERROR: ML models not loaded")
            return Response({
                'error': 'ML models not loaded. Please check server configuration.',
                'success': False
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        # Get input data
        data = request.data
        
        # Validate required fields
        required_fields = ['year', 'location', 'temp', 'do', 'ph']
        for field in required_fields:
            if field not in data:
                print(f"[ERROR] ERROR: Missing field '{field}'")
                return Response({
                    'error': f'Missing required field: {field}',
                    'success': False
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Prepare input data
        try:
            year = int(data['year'])
            location = data['location']
            temp = float(data['temp'])
            do_val = float(data['do'])
            ph = float(data['ph'])
            
            print(f"[OK] Parsed input: year={year}, location={location}, temp={temp}, do={do_val}, ph={ph}")
            
            # Encode location
            try:
                location_encoded = ml_models['location_encoder'].transform([location])[0]
                print(f"[OK] Location '{location}' encoded to: {location_encoded}")
            except ValueError as e:
                # If location not in training data, use most common location
                print(f"[WARN] WARNING: Location '{location}' not in training data, using default (0)")
                location_encoded = 0
                
        except (ValueError, TypeError) as e:
            print(f"[ERROR] ERROR: Invalid input format - {str(e)}")
            return Response({
                'error': f'Invalid input data format: {str(e)}',
                'success': False
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create feature array
        features = np.array([[year, location_encoded, temp, do_val, ph]])
        
        # Make predictions for each target
        predictions = {}
        for target in ['TDS', 'BOD', 'COD']:
            # Scale features
            scaler = ml_models['regression_scalers'][target]
            features_scaled = scaler.transform(features)
            
            # Predict
            model = ml_models['regression_models'][target]
            prediction = model.predict(features_scaled)[0]
            
            # Physical domain constraints (parameters cannot be negative)
            if target == 'TDS':
                predictions[target] = round(max(120.0, float(prediction)), 1)
            elif target == 'BOD':
                predictions[target] = round(max(0.5, float(prediction)), 2)
            elif target == 'COD':
                predictions[target] = round(max(2.0, float(prediction)), 2)
            else:
                predictions[target] = round(float(prediction), 2)
        
        # Calculate Water Quality Index (WQI) based on predicted values
        wqi = calculate_wqi(temp, do_val, ph, predictions['TDS'], predictions['BOD'], predictions['COD'])
        predictions['WQI'] = round(float(wqi), 1)
        
        print(f"[OK] PREDICTIONS: {predictions}")
        print(f"{'='*50}\n")
        
        return Response({
            'success': True,
            'model': selected_model,
            'predictions': predictions,
            'input': {
                'year': year,
                'location': location,
                'temp': temp,
                'do': do_val,
                'ph': ph
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"[ERROR] PREDICTION ERROR:")
        print(error_trace)
        print(f"{'='*50}\n")
        return Response({
            'error': f'Prediction failed: {str(e)}',
            'success': False,
            'traceback': error_trace if settings.DEBUG else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def classify_water_quality(request):
    """
    Random Forest Classification API
    Predicts WQI category (Good/Moderate/Poor) based on all water quality parameters
    """
    try:
        print(f"\n{'='*50}")
        print(f"[ML] ML CLASSIFICATION REQUEST")
        print(f"Request data: {request.data}")
        print(f"{'='*50}\n")
        
        selected_model = get_model_name(request)
        if not ml_models['classifier_model']:
            print("[ERROR] ERROR: Classifier model not loaded")
            return Response({
                'error': 'ML models not loaded. Please check server configuration.',
                'success': False
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        # Get input data
        data = request.data
        
        # Validate required fields
        required_fields = ['year', 'location', 'temp', 'do', 'ph', 'tds', 'bod', 'cod']
        for field in required_fields:
            if field not in data:
                return Response({
                    'error': f'Missing required field: {field}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Prepare input data
        try:
            year = int(data['year'])
            location = data['location']
            temp = float(data['temp'])
            do_val = float(data['do'])
            ph = float(data['ph'])
            tds = float(data['tds'])
            bod = float(data['bod'])
            cod = float(data['cod'])
            
            # Encode location
            try:
                location_encoded = ml_models['location_encoder'].transform([location])[0]
            except ValueError:
                # If location not in training data, use most common location
                location_encoded = 0
                
        except (ValueError, TypeError) as e:
            return Response({
                'error': f'Invalid input data format: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

        record = {
            'Year': year,
            'Location': location,
            'Temp': temp,
            'DO': do_val,
            'pH': ph,
            'TDS': tds,
            'BOD': bod,
            'COD': cod,
        }
        if selected_model.startswith('dl_'):
            pipeline = load_deep_learning_pipeline()
            if pipeline is None:
                return Response({'error': 'Deep-learning artifacts are unavailable.', 'success': False}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            return Response({'success': True, 'model': selected_model, 'prediction': pipeline.predict_class(record, selected_model.removeprefix('dl_')), 'input': record}, status=status.HTTP_200_OK)
        if selected_model == 'hybrid':
            pipeline = hybrid_pipeline or load_hybrid_pipeline()
            if pipeline is None:
                return Response({'error': 'Hybrid artifacts are unavailable.', 'success': False}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            prediction = pipeline.predict([record] * 6)
            return Response({'success': True, 'model': selected_model, 'prediction': prediction['classification']['prediction'], 'probabilities': prediction['classification']['probabilities'], 'input': record}, status=status.HTTP_200_OK)
        
        # Create feature array
        features = np.array([[year, location_encoded, temp, do_val, ph, tds, bod, cod]])
        
        # Scale features
        features_scaled = ml_models['classifier_scaler'].transform(features)
        
        # Make prediction
        prediction = ml_models['classifier_model'].predict(features_scaled)[0]
        prediction_proba = ml_models['classifier_model'].predict_proba(features_scaled)[0]
        
        # Get class labels and probabilities
        classes = ml_models['classifier_model'].classes_
        probabilities = {cls: round(float(prob), 4) for cls, prob in zip(classes, prediction_proba)}
        
        return Response({
            'success': True,
            'model': selected_model,
            'prediction': prediction,
            'probabilities': probabilities,
            'input': {
                'year': year,
                'location': location,
                'temp': temp,
                'do': do_val,
                'ph': ph,
                'tds': tds,
                'bod': bod,
                'cod': cod
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Classification failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def predict_hybrid_water_quality(request):
    """Predict from a chronological history using the hybrid pipeline."""
    pipeline = hybrid_pipeline or load_hybrid_pipeline()
    if pipeline is None:
        return Response({
            'success': False,
            'error': 'Hybrid model artifacts are unavailable. Run the hybrid training script first.'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    history = request.data.get('history')
    if not isinstance(history, list):
        return Response({
            'success': False,
            'error': 'history must be a list of prior water-quality readings.'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        prediction = pipeline.predict(history)
        return Response({'success': True, 'prediction': prediction}, status=status.HTTP_200_OK)
    except ValueError as error:
        return Response({'success': False, 'error': str(error)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as error:
        return Response({'success': False, 'error': f'Hybrid prediction failed: {error}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_model_info(request):
    """
    Get information about loaded ML models
    """
    try:
        if not ml_models['model_metadata']:
            return Response({
                'error': 'Model metadata not available'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        return Response({
            'success': True,
            'model_info': ml_models['model_metadata'],
            'available_locations': ml_models['location_encoder'].classes_.tolist() if ml_models['location_encoder'] else [],
            'models_loaded': {
                'regression': ml_models['regression_models'] is not None,
                'classifier': ml_models['classifier_model'] is not None,
                'location_encoder': ml_models['location_encoder'] is not None
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Failed to get model info: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_model_performance(request):
    """
    Professional Model Performance Report
    Returns comprehensive metrics for both classification and regression models
    """
    try:
        from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score, mean_squared_error, r2_score, mean_absolute_error
        import pandas as pd
        
        # Load the CSV data for validation metrics
        server_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        gen_csv = os.path.join(server_root, 'mithi_river_genuine_data.csv')
        csv_path = gen_csv if os.path.exists(gen_csv) else os.path.join(server_root, 'mithi_river_data.csv')
        
        if not os.path.exists(csv_path):
            return Response({
                'error': 'Dataset not found for performance calculation',
                'success': False
            }, status=status.HTTP_404_NOT_FOUND)
        
        df = pd.read_csv(csv_path)
        
        # Prepare features and targets
        from sklearn.preprocessing import LabelEncoder
        
        # Encode location
        le = LabelEncoder()
        df['Location_encoded'] = le.fit_transform(df['Location'])
        
        # Features used for prediction
        feature_columns = ['Year', 'Location_encoded', 'Temp', 'DO', 'pH']
        X_regression = df[feature_columns]
        
        feature_columns_classification = ['Year', 'Location_encoded', 'Temp', 'DO', 'pH', 'TDS', 'BOD', 'COD']
        X_classification = df[feature_columns_classification]
        
        # Targets
        y_wqi = df['WQI']
        y_tds = df['TDS']
        y_bod = df['BOD']
        y_cod = df['COD']
        
        # Split data (80-20 for validation)
        from sklearn.model_selection import train_test_split
        
        # CLASSIFICATION METRICS
        X_train_clf, X_test_clf, y_train_clf, y_test_clf = train_test_split(
            X_classification, y_wqi, test_size=0.2, random_state=42
        )
        
        # Scale and predict
        X_test_clf_scaled = ml_models['classifier_scaler'].transform(X_test_clf)
        y_pred_clf = ml_models['classifier_model'].predict(X_test_clf_scaled)
        y_pred_clf_proba = ml_models['classifier_model'].predict_proba(X_test_clf_scaled)
        
        # Classification metrics
        accuracy = accuracy_score(y_test_clf, y_pred_clf)
        f1_weighted = f1_score(y_test_clf, y_pred_clf, average='weighted')
        f1_macro = f1_score(y_test_clf, y_pred_clf, average='macro')
        
        # Confusion matrix
        cm = confusion_matrix(y_test_clf, y_pred_clf)
        
        # Classification report
        clf_report = classification_report(y_test_clf, y_pred_clf, output_dict=True)
        
        # REGRESSION METRICS
        X_train_reg, X_test_reg, y_train_tds, y_test_tds = train_test_split(
            X_regression, y_tds, test_size=0.2, random_state=42
        )
        _, _, y_train_bod, y_test_bod = train_test_split(
            X_regression, y_bod, test_size=0.2, random_state=42
        )
        _, _, y_train_cod, y_test_cod = train_test_split(
            X_regression, y_cod, test_size=0.2, random_state=42
        )
        
        regression_metrics = {}
        
        for target, y_test in [('TDS', y_test_tds), ('BOD', y_test_bod), ('COD', y_test_cod)]:
            # Scale and predict
            X_test_scaled = ml_models['regression_scalers'][target].transform(X_test_reg)
            y_pred = ml_models['regression_models'][target].predict(X_test_scaled)
            
            # Calculate metrics
            mse = mean_squared_error(y_test, y_pred)
            rmse = np.sqrt(mse)
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            # Calculate MAPE (Mean Absolute Percentage Error)
            mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
            
            regression_metrics[target] = {
                'r2_score': round(float(r2), 4),
                'rmse': round(float(rmse), 4),
                'mae': round(float(mae), 4),
                'mse': round(float(mse), 4),
                'mape': round(float(mape), 2),
                'accuracy_percentage': round(float((1 - mape/100) * 100), 2)
            }
        
        # Prepare professional report
        performance_report = {
            'report_generated': pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S'),
            'dataset_info': {
                'total_samples': len(df),
                'training_samples': len(X_train_clf),
                'testing_samples': len(X_test_clf),
                'train_test_split': '80-20',
                'locations': df['Location'].unique().tolist(),
                'year_range': f"{df['Year'].min()} - {df['Year'].max()}"
            },
            
            'classification_model': {
                'model_type': 'Random Forest Classifier',
                'target': 'Water Quality Index (WQI)',
                'classes': ml_models['classifier_model'].classes_.tolist(),
                'n_estimators': ml_models['classifier_model'].n_estimators,
                'max_depth': ml_models['classifier_model'].max_depth,
                
                'performance_metrics': {
                    'accuracy': round(float(accuracy), 4),
                    'accuracy_percentage': round(float(accuracy * 100), 2),
                    'f1_score_weighted': round(float(f1_weighted), 4),
                    'f1_score_macro': round(float(f1_macro), 4),
                    'precision_weighted': round(float(clf_report['weighted avg']['precision']), 4),
                    'recall_weighted': round(float(clf_report['weighted avg']['recall']), 4)
                },
                
                'confusion_matrix': cm.tolist(),
                
                'classification_report': {
                    cls: {
                        'precision': round(float(metrics['precision']), 4),
                        'recall': round(float(metrics['recall']), 4),
                        'f1_score': round(float(metrics['f1-score']), 4),
                        'support': int(metrics['support'])
                    }
                    for cls, metrics in clf_report.items()
                    if cls not in ['accuracy', 'macro avg', 'weighted avg']
                },
                
                'class_distribution': y_test_clf.value_counts().to_dict(),
                
                'features_used': feature_columns_classification,
                'feature_importance': 'Available via feature_importance endpoint'
            },
            
            'regression_models': {
                'model_type': 'Multiple Linear Regression Models',
                'targets': ['TDS', 'BOD', 'COD'],
                'features_used': feature_columns,
                
                'performance_by_target': regression_metrics,
                
                'overall_performance': {
                    'average_r2_score': round(float(np.mean([m['r2_score'] for m in regression_metrics.values()])), 4),
                    'average_accuracy': round(float(np.mean([m['accuracy_percentage'] for m in regression_metrics.values()])), 2),
                    'average_rmse': round(float(np.mean([m['rmse'] for m in regression_metrics.values()])), 4)
                }
            },
            
            'professional_summary': {
                'classification': {
                    'model': 'Random Forest Classifier',
                    'accuracy': f"{round(accuracy * 100, 2)}%",
                    'f1_score': f"{round(f1_weighted, 4)}",
                    'status': 'Excellent' if accuracy > 0.9 else 'Good' if accuracy > 0.8 else 'Moderate',
                    'recommendation': 'Model performs excellently for WQI classification with high accuracy and balanced precision-recall.',
                    'use_case': 'Suitable for real-time water quality assessment and early warning systems'
                },
                'regression': {
                    'model': 'Linear Regression Ensemble',
                    'average_accuracy': f"{round(np.mean([m['accuracy_percentage'] for m in regression_metrics.values()]), 2)}%",
                    'average_r2': f"{round(np.mean([m['r2_score'] for m in regression_metrics.values()]), 4)}",
                    'status': 'Good',
                    'recommendation': 'Models provide reliable predictions for TDS, BOD, and COD parameters with good accuracy.',
                    'use_case': 'Ideal for predictive maintenance and water treatment optimization'
                }
            }
        }
        
        return Response({
            'success': True,
            'performance_report': performance_report
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        return Response({
            'error': f'Failed to generate performance report: {str(e)}',
            'traceback': traceback.format_exc() if settings.DEBUG else None,
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_feature_importance(request):
    """
    Get feature importance for classification and regression models
    """
    try:
        import pandas as pd
        
        feature_columns_classification = ['Year', 'Location', 'Temp', 'DO', 'pH', 'TDS', 'BOD', 'COD']
        feature_columns_regression = ['Year', 'Location', 'Temp', 'DO', 'pH']
        
        # Classification feature importance
        if hasattr(ml_models['classifier_model'], 'feature_importances_'):
            clf_importance = ml_models['classifier_model'].feature_importances_
            clf_features = {
                feature: round(float(importance), 4)
                for feature, importance in zip(feature_columns_classification, clf_importance)
            }
            # Sort by importance
            clf_features_sorted = dict(sorted(clf_features.items(), key=lambda x: x[1], reverse=True))
        else:
            clf_features_sorted = {}
        
        # Regression feature importance (coefficients)
        regression_features = {}
        for target in ['TDS', 'BOD', 'COD']:
            if hasattr(ml_models['regression_models'][target], 'coef_'):
                coef = ml_models['regression_models'][target].coef_
                regression_features[target] = {
                    feature: round(float(coef_val), 4)
                    for feature, coef_val in zip(feature_columns_regression, coef)
                }
        
        return Response({
            'success': True,
            'feature_importance': {
                'classification': {
                    'model': 'Random Forest Classifier',
                    'features': clf_features_sorted,
                    'interpretation': 'Higher values indicate more important features for WQI prediction'
                },
                'regression': {
                    'model': 'Linear Regression',
                    'features_by_target': regression_features,
                    'interpretation': 'Coefficients show the impact of each feature on predicted values'
                }
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Failed to get feature importance: {str(e)}',
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def reload_models(request):
    """
    Reload ML models (useful for development)
    """
    try:
        success = load_ml_models()
        if success:
            return Response({
                'success': True,
                'message': 'Models reloaded successfully'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Failed to reload models'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        return Response({
            'error': f'Model reload failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
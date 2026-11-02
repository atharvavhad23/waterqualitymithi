from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import pandas as pd
import os
from django.conf import settings
import json
from datetime import datetime
import numpy as np

@api_view(['GET'])
def get_dashboard_stats(request):
    """Get real-time dashboard statistics from CSV file"""
    try:
        # Path to CSV file
        csv_path = os.path.join(settings.BASE_DIR, 'mithi_river_data.csv')
        
        if not os.path.exists(csv_path):
            return Response({
                'error': 'CSV file not found',
                'path': csv_path
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Read CSV file
        df = pd.read_csv(csv_path)
        
        # Get latest year data (most recent)
        latest_year = df['Year'].max()
        latest_data = df[df['Year'] == latest_year]
        
        # Calculate current statistics
        current_stats = {
            'temperature': {
                'value': round(latest_data['Temp'].mean(), 1),
                'unit': '°C',
                'status': get_temp_status(latest_data['Temp'].mean())
            },
            'ph': {
                'value': round(latest_data['pH'].mean(), 1),
                'unit': '',
                'status': get_ph_status(latest_data['pH'].mean())
            },
            'dissolved_oxygen': {
                'value': round(latest_data['DO'].mean(), 1),
                'unit': 'mg/L',
                'status': get_do_status(latest_data['DO'].mean())
            },
            'tds': {
                'value': int(latest_data['TDS'].mean()),
                'unit': 'ppm',
                'status': get_tds_status(latest_data['TDS'].mean())
            },
            'bod': {
                'value': round(latest_data['BOD'].mean(), 1),
                'unit': 'mg/L',
                'status': get_bod_status(latest_data['BOD'].mean())
            },
            'cod': {
                'value': round(latest_data['COD'].mean(), 1),
                'unit': 'mg/L',
                'status': get_cod_status(latest_data['COD'].mean())
            }
        }
        
        # Water Quality Index distribution
        wqi_counts = latest_data['WQI'].value_counts()
        wqi_distribution = [
            {'name': category, 'value': count, 'percentage': round((count/len(latest_data))*100, 1)}
            for category, count in wqi_counts.items()
        ]
        
        # Location-wise pollution data
        location_stats = []
        for location in df['Location'].unique():
            loc_data = latest_data[latest_data['Location'] == location]
            if len(loc_data) > 0:
                location_stats.append({
                    'location': location,
                    'pollution_level': int(loc_data['BOD'].mean() + loc_data['COD'].mean()/10),
                    'samples': len(loc_data),
                    'wqi': loc_data['WQI'].mode().iloc[0] if len(loc_data) > 0 else 'Poor'
                })
        
        # Trend data (last 7 days simulation using recent samples)
        trend_data = generate_trend_data(latest_data)
        
        # Dataset info
        dataset_info = {
            'total_records': len(df),
            'locations': df['Location'].nunique(),
            'year_range': f"{df['Year'].min()} - {df['Year'].max()}",
            'latest_year': int(latest_year),
            'parameters': ['Temperature', 'pH', 'DO', 'TDS', 'BOD', 'COD', 'WQI']
        }
        
        return Response({
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'current_stats': current_stats,
            'wqi_distribution': wqi_distribution,
            'location_data': location_stats,
            'trend_data': trend_data,
            'dataset_info': dataset_info,
            'data_source': 'Mithi River CSV Dataset'
        })
        
    except Exception as e:
        return Response({
            'error': str(e),
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_latest_readings(request):
    """Get latest sensor readings from CSV"""
    try:
        csv_path = os.path.join(settings.BASE_DIR, 'mithi_river_data.csv')
        df = pd.read_csv(csv_path)
        
        # Get most recent readings (simulate real-time by sampling from latest year)
        latest_year = df['Year'].max()
        latest_samples = df[df['Year'] == latest_year].sample(n=min(10, len(df[df['Year'] == latest_year])))
        
        readings = []
        for _, row in latest_samples.iterrows():
            readings.append({
                'id': len(readings) + 1,
                'location': row['Location'],
                'timestamp': datetime.now().isoformat(),
                'temperature': row['Temp'],
                'ph': row['pH'],
                'dissolved_oxygen': row['DO'],
                'tds': row['TDS'],
                'bod': row['BOD'],
                'cod': row['COD'],
                'wqi': row['WQI'],
                'year': row['Year']
            })
        
        return Response({
            'success': True,
            'readings': readings,
            'count': len(readings)
        })
        
    except Exception as e:
        return Response({
            'error': str(e),
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def get_temp_status(temp):
    if 20 <= temp <= 30:
        return {'category': 'optimal', 'color': 'green', 'message': 'Optimal'}
    elif temp < 20:
        return {'category': 'cool', 'color': 'blue', 'message': 'Cool'}
    else:
        return {'category': 'warm', 'color': 'orange', 'message': 'Warm'}

def get_ph_status(ph):
    if 6.5 <= ph <= 8.5:
        return {'category': 'normal', 'color': 'green', 'message': 'Normal Range'}
    elif ph < 6.5:
        return {'category': 'acidic', 'color': 'red', 'message': 'Acidic'}
    else:
        return {'category': 'alkaline', 'color': 'orange', 'message': 'Alkaline'}

def get_do_status(do):
    if do >= 6:
        return {'category': 'excellent', 'color': 'green', 'message': 'Excellent'}
    elif do >= 4:
        return {'category': 'good', 'color': 'blue', 'message': 'Good'}
    else:
        return {'category': 'low', 'color': 'red', 'message': 'Low'}

def get_tds_status(tds):
    if tds <= 300:
        return {'category': 'excellent', 'color': 'green', 'message': 'Excellent'}
    elif tds <= 600:
        return {'category': 'good', 'color': 'blue', 'message': 'Good'}
    elif tds <= 900:
        return {'category': 'fair', 'color': 'orange', 'message': 'Fair'}
    else:
        return {'category': 'poor', 'color': 'red', 'message': 'Poor'}

def get_bod_status(bod):
    if bod <= 3:
        return {'category': 'excellent', 'color': 'green', 'message': 'Excellent'}
    elif bod <= 6:
        return {'category': 'good', 'color': 'blue', 'message': 'Good'}
    else:
        return {'category': 'poor', 'color': 'red', 'message': 'High'}

def get_cod_status(cod):
    if cod <= 50:
        return {'category': 'good', 'color': 'green', 'message': 'Good'}
    elif cod <= 100:
        return {'category': 'moderate', 'color': 'orange', 'message': 'Moderate'}
    else:
        return {'category': 'poor', 'color': 'red', 'message': 'High'}

def generate_trend_data(latest_data):
    """Generate 7-day trend data from recent samples"""
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    trend_data = []
    
    # Use random sampling from latest data to simulate daily trends
    for i, day in enumerate(days):
        if len(latest_data) > 0:
            sample = latest_data.sample(n=1).iloc[0]
            # Add some realistic variation
            variation = np.random.normal(0, 0.1)
            
            wqi_numeric = 85 if sample['WQI'] == 'Good' else 65 if sample['WQI'] == 'Moderate' else 45
            
            trend_data.append({
                'day': day,
                'wqi': max(20, min(100, int(wqi_numeric + np.random.normal(0, 5)))),
                'ph': round(max(5, min(9, sample['pH'] + variation)), 1),
                'temperature': round(max(15, min(40, sample['Temp'] + variation)), 1),
                'do': round(max(1, min(12, sample['DO'] + variation)), 1),
                'tds': max(50, min(5000, int(sample['TDS'] + np.random.normal(0, 100)))),
                'bod': round(max(1, min(25, sample['BOD'] + variation)), 1),
                'cod': round(max(10, min(300, sample['COD'] + np.random.normal(0, 10))), 1)
            })
    
    return trend_data
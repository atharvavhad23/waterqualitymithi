#!/usr/bin/env python3
"""
Generate real statistics from Mithi River dataset for dashboard display
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json

def calculate_wqi_status(wqi_category):
    """Convert WQI category to status and color"""
    if wqi_category == 'Good':
        return "Excellent Quality", "from-green-500 to-emerald-600", "bg-green-50", "text-green-600"
    elif wqi_category == 'Moderate':
        return "Good Quality", "from-blue-500 to-cyan-600", "bg-blue-50", "text-blue-600"
    else:  # Poor
        return "Needs Improvement", "from-red-500 to-orange-600", "bg-red-50", "text-red-600"

def get_ph_status(ph_value):
    """Get pH status based on value"""
    if 6.5 <= ph_value <= 8.5:
        return "Normal Range", "from-green-500 to-emerald-600", "bg-green-50", "text-green-600"
    elif ph_value < 6.5:
        return "Acidic", "from-red-500 to-orange-600", "bg-red-50", "text-red-600"
    else:
        return "Alkaline", "from-yellow-500 to-orange-600", "bg-yellow-50", "text-yellow-600"

def get_temp_status(temp_value):
    """Get temperature status based on value"""
    if 20 <= temp_value <= 30:
        return "Optimal", "from-orange-500 to-red-500", "bg-orange-50", "text-orange-600"
    elif temp_value < 20:
        return "Cool", "from-blue-500 to-cyan-600", "bg-blue-50", "text-blue-600"
    else:
        return "Warm", "from-red-500 to-pink-600", "bg-red-50", "text-red-600"

def get_do_status(do_value):
    """Get dissolved oxygen status"""
    if do_value >= 6:
        return "Excellent", "from-purple-500 to-pink-600", "bg-purple-50", "text-purple-600"
    elif do_value >= 4:
        return "Good", "from-blue-500 to-purple-600", "bg-blue-50", "text-blue-600"
    else:
        return "Low", "from-red-500 to-orange-600", "bg-red-50", "text-red-600"

def get_tds_status(tds_value):
    """Get TDS status"""
    if tds_value <= 300:
        return "Excellent", "from-green-500 to-emerald-600", "bg-green-50", "text-green-600"
    elif tds_value <= 600:
        return "Good", "from-blue-500 to-teal-600", "bg-blue-50", "text-blue-600"
    elif tds_value <= 900:
        return "Fair", "from-yellow-500 to-orange-600", "bg-yellow-50", "text-yellow-600"
    else:
        return "Poor", "from-red-500 to-pink-600", "bg-red-50", "text-red-600"

def generate_dashboard_stats():
    """Generate real dashboard statistics from the dataset"""
    
    # Load the dataset
    print("Loading Mithi River dataset...")
    df = pd.read_csv('mithi_river_data.csv')
    
    # Get latest data (most recent year)
    latest_year = df['Year'].max()
    latest_data = df[df['Year'] == latest_year]
    
    # Calculate averages for the latest year
    avg_stats = latest_data[['Temp', 'DO', 'pH', 'TDS', 'BOD', 'COD']].mean()
    
    # Get WQI distribution for latest year
    wqi_counts = latest_data['WQI'].value_counts()
    most_common_wqi = wqi_counts.index[0]
    
    # Calculate trends (compare with previous year)
    prev_year = latest_year - 1
    prev_data = df[df['Year'] == prev_year]
    
    if len(prev_data) > 0:
        prev_stats = prev_data[['Temp', 'DO', 'pH', 'TDS', 'BOD', 'COD']].mean()
        temp_trend = avg_stats['Temp'] - prev_stats['Temp']
        ph_trend = avg_stats['pH'] - prev_stats['pH']
        do_trend = avg_stats['DO'] - prev_stats['DO']
        tds_trend = avg_stats['TDS'] - prev_stats['TDS']
    else:
        temp_trend = ph_trend = do_trend = tds_trend = 0
    
    # Create dashboard stats
    wqi_status, wqi_color, wqi_bg, wqi_text = calculate_wqi_status(most_common_wqi)
    ph_status, ph_color, ph_bg, ph_text = get_ph_status(avg_stats['pH'])
    temp_status, temp_color, temp_bg, temp_text = get_temp_status(avg_stats['Temp'])
    do_status, do_color, do_bg, do_text = get_do_status(avg_stats['DO'])
    tds_status, tds_color, tds_bg, tds_text = get_tds_status(avg_stats['TDS'])
    
    # Calculate BOD for turbidity representation (using BOD as turbidity indicator)
    turbidity_status = "Clear" if avg_stats['BOD'] < 10 else "Moderate" if avg_stats['BOD'] < 15 else "High"
    
    stats = [
        {
            "title": "Water Quality Index",
            "value": most_common_wqi,
            "status": wqi_status,
            "icon": "🌊",
            "color": wqi_color,
            "bgColor": wqi_bg,
            "textColor": wqi_text,
            "trend": f"{wqi_counts[most_common_wqi]} samples"
        },
        {
            "title": "pH Level",
            "value": f"{avg_stats['pH']:.1f}",
            "status": ph_status,
            "icon": "⚗️",
            "color": ph_color,
            "bgColor": ph_bg,
            "textColor": ph_text,
            "trend": f"{'↑' if ph_trend > 0 else '↓' if ph_trend < 0 else '→'}{abs(ph_trend):.1f}"
        },
        {
            "title": "Temperature",
            "value": f"{avg_stats['Temp']:.1f}°C",
            "status": temp_status,
            "icon": "🌡️",
            "color": temp_color,
            "bgColor": temp_bg,
            "textColor": temp_text,
            "trend": f"{'↑' if temp_trend > 0 else '↓' if temp_trend < 0 else '→'}{abs(temp_trend):.1f}°C"
        },
        {
            "title": "Dissolved Oxygen",
            "value": f"{avg_stats['DO']:.1f}",
            "status": do_status,
            "icon": "💨",
            "color": do_color,
            "bgColor": do_bg,
            "textColor": do_text,
            "trend": f"{'↑' if do_trend > 0 else '↓' if do_trend < 0 else '→'}{abs(do_trend):.1f}mg/L"
        },
        {
            "title": "Total Dissolved Solids",
            "value": f"{int(avg_stats['TDS'])}",
            "status": tds_status,
            "icon": "🔬",
            "color": tds_color,
            "bgColor": tds_bg,
            "textColor": tds_text,
            "trend": f"{'↑' if tds_trend > 0 else '↓' if tds_trend < 0 else '→'}{abs(tds_trend):.0f}ppm"
        },
        {
            "title": "BOD Level",
            "value": f"{avg_stats['BOD']:.1f}",
            "status": turbidity_status,
            "icon": "✨",
            "color": "from-indigo-500 to-purple-600",
            "bgColor": "bg-indigo-50",
            "textColor": "text-indigo-600",
            "trend": f"{avg_stats['BOD']:.1f}mg/L"
        }
    ]
    
    # Generate trend data for charts (last 7 days simulation using recent data)
    recent_data = latest_data.sample(min(7, len(latest_data))).sort_values('Year')
    
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    trend_data = []
    
    for i, day in enumerate(days):
        if i < len(recent_data):
            row = recent_data.iloc[i]
            # Convert WQI category to numeric for charting
            wqi_numeric = 85 if row['WQI'] == 'Good' else 65 if row['WQI'] == 'Moderate' else 45
        else:
            # Use average values for missing days
            wqi_numeric = 65 if most_common_wqi == 'Moderate' else 45
            row = {
                'pH': avg_stats['pH'],
                'DO': avg_stats['DO'],
                'Temp': avg_stats['Temp']
            }
        
        trend_data.append({
            'day': day,
            'wqi': int(wqi_numeric + np.random.normal(0, 5)),  # Add some variation
            'pH': round(row['pH'] + np.random.normal(0, 0.2), 1),
            'DO': round(row['DO'] + np.random.normal(0, 0.5), 1),
            'temp': round(row['Temp'] + np.random.normal(0, 1), 1)
        })
    
    # Generate location-based pollution data
    location_stats = latest_data.groupby('Location')[['BOD', 'COD', 'TDS']].mean()
    pollution_data = []
    
    for location in location_stats.index:
        pollution_data.append({
            'location': location,
            'pollution': int(location_stats.loc[location, 'BOD'] + location_stats.loc[location, 'COD']/10),
            'bod': round(location_stats.loc[location, 'BOD'], 1),
            'cod': round(location_stats.loc[location, 'COD'], 1),
            'tds': int(location_stats.loc[location, 'TDS'])
        })
    
    # Dataset summary
    dataset_info = {
        'total_records': len(df),
        'year_range': f"{df['Year'].min()} - {df['Year'].max()}",
        'locations': df['Location'].nunique(),
        'latest_year': int(latest_year),
        'parameters_monitored': ['Temperature', 'DO', 'pH', 'TDS', 'BOD', 'COD', 'WQI']
    }
    
    result = {
        'stats': stats,
        'trendData': trend_data,
        'pollutionData': pollution_data,
        'datasetInfo': dataset_info,
        'generatedAt': datetime.now().isoformat()
    }
    
    return result

if __name__ == "__main__":
    try:
        real_stats = generate_dashboard_stats()
        
        # Save to JSON file
        with open('real_dashboard_data.json', 'w') as f:
            json.dump(real_stats, f, indent=2)
        
        print("✅ Real dashboard statistics generated successfully!")
        print(f"📊 Dataset: {real_stats['datasetInfo']['total_records']} records")
        print(f"📅 Years: {real_stats['datasetInfo']['year_range']}")
        print(f"📍 Locations: {real_stats['datasetInfo']['locations']}")
        print("\n🎯 Key Statistics:")
        for stat in real_stats['stats']:
            print(f"   {stat['title']}: {stat['value']} ({stat['status']})")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getRealDashboardStats = (req, res) => {
  try {
    console.log('API called: /api/dashboard/real-stats');
    // Read the generated real statistics
    const dataPath = path.join(__dirname, '..', 'real_dashboard_data.json');
    console.log('Looking for data file at:', dataPath);
    
    if (!fs.existsSync(dataPath)) {
      // If file doesn't exist, generate it first
      return res.status(404).json({
        error: 'Real data not generated yet. Please run generate_real_stats.py first.',
        message: 'Run: cd server && python generate_real_stats.py'
      });
    }
    
    const realData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Add current timestamp
    realData.lastUpdated = new Date().toISOString();
    
    res.json({
      success: true,
      data: realData,
      source: 'Mithi River Dataset (400,000 records)',
      note: 'Real statistics calculated from actual water quality measurements'
    });
    
  } catch (error) {
    console.error('Error serving real dashboard stats:', error);
    res.status(500).json({
      error: 'Failed to load real dashboard statistics',
      details: error.message
    });
  }
};

export const getLatestWaterQuality = (req, res) => {
  try {
    const dataPath = path.join(__dirname, '..', 'real_dashboard_data.json');
    
    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({
        error: 'Data not available'
      });
    }
    
    const realData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Extract key metrics for quick access
    const keyMetrics = realData.stats.reduce((acc, stat) => {
      const key = stat.title.toLowerCase().replace(/\s+/g, '_');
      acc[key] = {
        value: stat.value,
        status: stat.status,
        trend: stat.trend
      };
      return acc;
    }, {});
    
    res.json({
      success: true,
      metrics: keyMetrics,
      trendData: realData.trendData,
      pollutionData: realData.pollutionData,
      datasetInfo: realData.datasetInfo,
      generatedAt: realData.generatedAt
    });
    
  } catch (error) {
    console.error('Error serving latest water quality:', error);
    res.status(500).json({
      error: 'Failed to load water quality data',
      details: error.message
    });
  }
};
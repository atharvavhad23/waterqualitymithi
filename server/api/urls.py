# Placeholder API endpoint to fix ImproperlyConfigured error

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import ml_views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'rivers', views.RiverViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('profile/', views.user_profile),
    path('change-password/', views.change_password),
    path('login/', views.login),
    path('register/', views.register),  # Django User registration with email
    path('forgot-password/', views.forgot_password),  # Password reset request
    path('signup/', views.signup),      # Custom UserRegister (legacy)
    path('send-otp', views.send_otp),
    path('send-signup-otp', views.send_signup_otp),
    path('verify-otp', views.verify_otp),
    path('find-account', views.find_account),
    path('reset-password', views.reset_password),
    
    # ML API endpoints
    path('ml/predict/', ml_views.predict_water_quality, name='ml_predict'),
    path('ml/classify/', ml_views.classify_water_quality, name='ml_classify'),
    path('ml/hybrid-predict/', ml_views.predict_hybrid_water_quality, name='ml_hybrid_predict'),
    path('ml/model-info/', ml_views.get_model_info, name='ml_model_info'),
    path('ml/performance/', ml_views.get_model_performance, name='ml_performance'),
    path('ml/feature-importance/', ml_views.get_feature_importance, name='ml_feature_importance'),
    path('ml/reload/', ml_views.reload_models, name='ml_reload'),
    
    # Dashboard CSV data endpoints
    path('dashboard/stats/', views.get_dashboard_stats, name='dashboard_stats'),
    path('dashboard/latest-readings/', views.get_latest_readings, name='latest_readings'),
    path('advanced-features/', views.get_advanced_features_data, name='advanced_features'),
    path('3d-visualization/', views.get_3d_visualization_data, name='3d_visualization'),
    
    # Admin panel endpoints
    path('admin/users/', views.admin_users, name='admin_users_list'),
    path('admin/users/<int:user_id>/', views.admin_users, name='admin_users_detail'),
    path('export-data/', views.export_data, name='export_data'),
    
    # Cleanup drives endpoints
    path('cleanup-drives/', views.cleanup_drives, name='cleanup_drives'),
]

# Define your API endpoints here, e.g.:
# from . import views
# urlpatterns = [
#     path('rivers/', views.river_list),
# ]

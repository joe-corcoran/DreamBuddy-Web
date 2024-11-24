import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Enhanced database URL handling
    if os.environ.get("FLASK_ENV") == "production":
        SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
        if SQLALCHEMY_DATABASE_URI and SQLALCHEMY_DATABASE_URI.startswith('postgres://'):
            SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace('postgres://', 'postgresql://')
    else:
        SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///dev.db')
    
    SQLALCHEMY_ECHO = True
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    
     # CSRF Configuration
    WTF_CSRF_ENABLED = True
    WTF_CSRF_CHECK_DEFAULT = True
    WTF_CSRF_TIME_LIMIT = None
    WTF_CSRF_SSL_STRICT = False  # Add this if using HTTP in development
    
    # Session/Cookie Configuration
    SESSION_COOKIE_SECURE = os.environ.get('FLASK_ENV') == 'production'  # Only require HTTPS in production
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    REMEMBER_COOKIE_SECURE = os.environ.get('FLASK_ENV') == 'production'
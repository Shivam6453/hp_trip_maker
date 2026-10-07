import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'himachal-tourism-super-secret-key'
    DEBUG = True
    basedir = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'himachal.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
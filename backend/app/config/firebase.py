# app/config/firebase.py
import firebase_admin
from firebase_admin import credentials, auth
import os
from dotenv import load_dotenv

load_dotenv()

cred = credentials.Certificate(os.getenv("FIREBASE_CREDENTIALS"))

firebase_app = firebase_admin.initialize_app(cred)
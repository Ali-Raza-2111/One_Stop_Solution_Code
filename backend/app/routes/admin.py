import os
import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from firebase_admin import auth, firestore
from app.config.firebase import firebase_app

router = APIRouter()

class AdminSignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup")
def admin_signup(request: AdminSignupRequest):
    try:
        # Create user in Firebase Auth
        user = auth.create_user(
            email=request.email,
            password=request.password,
            display_name=request.name
        )
        
        # Add to Firestore 'admins' collection
        db = firestore.client()
        db.collection("admins").document(user.uid).set({
            "name": request.name,
            "email": request.email,
            "created_at": firestore.SERVER_TIMESTAMP
        })
        
        return {"message": "Admin account created successfully", "uid": user.uid}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def admin_login(request: AdminLoginRequest):
    # To log in with email/password from the backend using Firebase,
    # we need the Web API Key for the Identity Toolkit REST API.
    api_key = os.getenv("FIREBASE_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500, 
            detail="FIREBASE_API_KEY is not set in environment variables. You must add it to your .env file to login with email/password."
        )
        
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={api_key}"
    payload = {
        "email": request.email,
        "password": request.password,
        "returnSecureToken": True
    }
    
    try:
        # Call Firebase REST API to verify email and password
        response = requests.post(url, json=payload)
        response_data = response.json()
        
        if "error" in response_data:
            # e.g., INVALID_PASSWORD, EMAIL_NOT_FOUND
            error_message = response_data["error"]["message"]
            raise HTTPException(status_code=401, detail=f"Authentication failed: {error_message}")
            
        uid = response_data["localId"]
        id_token = response_data["idToken"]
        
        # Verify if this user is an admin by checking the Firestore 'admins' collection
        db = firestore.client()
        admin_ref = db.collection("admins").document(uid).get()
        
        if not admin_ref.exists:
            raise HTTPException(status_code=403, detail="User does not have admin privileges")
            
        return {
            "message": "Login successful", 
            "uid": uid, 
            "token": id_token
        }
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to communicate with Firebase Auth API: {str(e)}")

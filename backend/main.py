import firebase_admin
from firebase_admin import credentials
from fastapi import FastAPI, Request
import json
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from routers import ask
from dotenv import load_dotenv
import os

load_dotenv()

firebase_creds_json = os.getenv("FIREBASE_CREDENTIALS_JSON")

if firebase_creds_json:
    cred_dict = json.loads(firebase_creds_json)
    cred = credentials.Certificate(cred_dict)
else:
    cred_path = os.path.join(os.path.dirname(__file__), "firebase-credentials.json")
    cred = credentials.Certificate(cred_path)

firebase_admin.initialize_app(cred)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="LankaTaxMind API",
    description="Domain-specific RAG AI for Sri Lankan Tax Law Consulting",
    version="1.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://lanka-tax-mind-kpzv.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ask.router, prefix="/api")

@app.get("/")
def root():
    return {"status": "LankaTaxMind API is running"}
"""
Vercel Serverless Function Entrypoint
Maps Vercel requests to FastAPI app
"""
from backend.main import app

# Vercel looks for a module-level `app` variable

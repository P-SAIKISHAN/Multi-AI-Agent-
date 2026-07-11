from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from pydantic import BaseModel
from typing import List
from app.core.ai_agent import get_response_from_ai_agents
from app.config.settings import settings
from app.common.logger import get_logger
from app.common.custom_exception import CustomException

logger = get_logger(__name__)

app = FastAPI(title="MULTI AI AGENT")

# Allow CORS for flexibility in testing (e.g. running frontend via live server or file system)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files directory path
static_dir_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "static"))
if not os.path.exists(static_dir_path):
    os.makedirs(static_dir_path, exist_ok=True)

# Serve index.html at root
@app.get("/")
def serve_frontend():
    index_file = os.path.join(static_dir_path, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file, media_type="text/html")
    return {"message": "3D HTML/CSS/JS frontend file is missing or building."}

# Serve style.css
@app.get("/style.css")
def serve_style_css():
    style_file = os.path.join(static_dir_path, "style.css")
    if os.path.exists(style_file):
        return FileResponse(style_file, media_type="text/css")
    raise HTTPException(status_code=404, detail="style.css not found")

# Serve app.js
@app.get("/app.js")
def serve_app_js():
    js_file = os.path.join(static_dir_path, "app.js")
    if os.path.exists(js_file):
        return FileResponse(js_file, media_type="application/javascript")
    raise HTTPException(status_code=404, detail="app.js not found")



class RequestState(BaseModel):
    model_name:str
    system_prompt:str
    messages:List[str]
    allow_search: bool

@app.post("/chat")
def chat_endpoint(request:RequestState):
    logger.info(f"Received request for model : {request.model_name}")

    if request.model_name not in settings.ALLOWED_MODEL_NAMES:
        logger.warning("Invalid model name")
        raise HTTPException(status_code=400 , detail="Invalid model name")
    
    try:
        response = get_response_from_ai_agents(
            request.model_name,
            request.messages,
            request.allow_search,
            request.system_prompt
        )

        logger.info(f"Sucesfully got response from AI Agent {request.model_name}")

        return {"response" : response}
    
    except Exception as e:
        logger.error("Some error ocuured during reponse generation")
        raise HTTPException(
            status_code=500 , 
            detail=str(CustomException("Failed to get AI response" , error_detail=e))
            )
    




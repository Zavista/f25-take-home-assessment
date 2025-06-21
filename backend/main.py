from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
from dotenv import load_dotenv
import httpx
import os
from datetime import datetime
from uuid import uuid4
import logging
import uvicorn

load_dotenv()
WEATHERSTACK_API_KEY = os.getenv("WEATHERSTACK_API_KEY")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)


app = FastAPI(title="Weather Data System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for weather data
weather_storage: Dict[str, Dict[str, Any]] = {}

class WeatherRequest(BaseModel):
    date: str
    location: str
    notes: Optional[str] = ""

class WeatherResponse(BaseModel):
    id: str

@app.post("/weather", response_model=WeatherResponse)
async def create_weather_request(request: WeatherRequest):
    """
    You need to implement this endpoint to handle the following:
    1. Receive form data (date, location, notes)
    2. Calls WeatherStack API for the location
    3. Stores combined data with unique ID in memory
    4. Returns the ID to frontend
    """
    logger.info("Received weather request: %s", request.model_dump())

    if not WEATHERSTACK_API_KEY:
        logger.error("Missing WeatherStack API key.")
        raise HTTPException(status_code=500, detail="WeatherStack API Key is missing")
    
    if request.date != datetime.today().strftime('%Y-%m-%d'):
        logger.warning("Invalid date submitted: %s", request.date)
        raise HTTPException(
            status_code=400,
            detail=f"Only current date is supported for weather requests (FREE TIER LIMITATION). Current Date: {datetime.today().strftime('%Y-%m-%d')}"
        )

    async with httpx.AsyncClient() as client:
        logging.info("Fetching information from WeatherStack...")
        response = await client.get(
            "http://api.weatherstack.com/current",
            params={"access_key": WEATHERSTACK_API_KEY, "query": request.location}
        )
    
    if response.status_code != 200:
        logger.error("WeatherStack request failed with status %d", response.status_code)
        raise HTTPException(status_code=500, detail="Weather API request failed.")
    
    data = response.json()

    if not data.get("success", True):
        logger.error("WeatherStack API Error: %s", data.get("error"))
        raise HTTPException(
            status_code=400,
            detail=f"WeatherStack API Error: {data['error']['info']}"
        )

    weather_id = str(uuid4())
    weather_storage[weather_id] = {
        "id": weather_id,
        "date": request.date,
        "notes": request.notes,
        "location": data.get("location", {}),
        "weather": data.get("current", {})
    }
    logger.info("Weather data stored under ID: %s", weather_id)
    return WeatherResponse(id=weather_id)

@app.get("/weather/{weather_id}")
async def get_weather_data(weather_id: str):
    """
    Retrieve stored weather data by ID.
    This endpoint is already implemented for the assessment.
    """
    logger.info("Received request for weather ID: %s", weather_id)

    if weather_id not in weather_storage:
        logger.warning("Weather ID not found: %s", weather_id)
        raise HTTPException(status_code=404, detail="Weather data not found")
    
    logger.info("Returning weather data for ID: %s", weather_id)
    return weather_storage[weather_id]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
import uvicorn
from fastapi import FastAPI
from src.feature_addition import load_data, get_name_from_data
from pathlib import Path

PROJECT_ROOT = (Path(__file__).parents[1])
DATA_FILE_PATH = PROJECT_ROOT/"data/google_trips/trip_data.json"

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    app.state.data = load_data(DATA_FILE_PATH)

@app.get("/")
def default():
    return {"Name": "Dataholics",
            "Mission": "Change the world, make it a sustainable place, for you and for me and the entire human race",
            "Description": "Implement eco-friendly route API"}



@app.get("/get-timeline-data")
def calculate_carbon_footprint(month: str, name: str):
    # TODO: Add code to calculate carbon footprint and return response
    return {
        "name": get_name_from_data(data=app.state.data, name=name),
        "co2_absolute":get_co2_absolute_from_data(data=app.state.data, name=name, month=month),
        "co2_average": get_co2_average_from_data(data=app.state.data, name=name, month=month),
        "friend_rank": get_friend_rank(data=app.state.data, month=month),
        "trip_destinations": get_trip_destinations(data=app.state.data, name=name, month=month),
        "co2_footprint_each_day": get_each_day_co2_footprint(data=app.state.data, name=name, month=month) ,
    }


if __name__ == "__main__":

    uvicorn.run(app, host="0.0.0.0", port=8000)


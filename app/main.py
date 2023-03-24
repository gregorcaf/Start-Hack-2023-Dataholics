import json
import os

import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from starlette.staticfiles import StaticFiles

from src.feature_addition import load_data, get_co2_absolute_from_data, get_co2_average_from_data,\
    get_co2_footprint_per_day, get_friend_rank, get_all_end_locations
from pathlib import Path

PROJECT_ROOT = (Path(__file__).parents[1])
DATA_FILE_PATH = PROJECT_ROOT/"data/prepared_trips/trip_data.json"

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    try:
        app.state.data = load_data(DATA_FILE_PATH)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to load data: {}".format(str(e)))

app.mount("/home", StaticFiles(directory=PROJECT_ROOT/"assets/", html=True), name="assets")


@app.get("/info")
def default():

    return {"Name": "Dataholics",
            "Mission": "Change the world, make it a sustainable place, for you and for me and the entire human race",
            "Description": "Implement eco-friendly route API",
            "path": Path(os.path.dirname(__file__)).parents[1]/"assets",
            }


@app.get("/get-timeline-data")
def calculate_carbon_footprint(month: str, name: str):
    try:
        return {
            "name": name.capitalize(),
            "co2_absolute": get_co2_absolute_from_data(data=app.state.data, name=name, month=month),
            "co2_average": get_co2_average_from_data(data=app.state.data, name=name, month=month),
            "friend_rank": get_friend_rank(data=app.state.data, name=name, month=month),
            "trip_destinations": get_all_end_locations(data=app.state.data, name=name, month=month),
            "co2_footprint_each_day": get_co2_footprint_per_day(data=app.state.data, user_name=name, month=month)
        }
    except KeyError:
        raise HTTPException(status_code=404, detail="Data not found for the given user and month")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to calculate carbon footprint: {}".format(str(e)))


# @app.get("/get-directions")
# def directions(client, origin, destination,
#                mode=None, waypoints=None, alternatives=False, avoid=None,
#                language=None, units=None, region=None, departure_time=None,
#                arrival_time=None, optimize_waypoints=False, transit_mode=None,
#                transit_routing_preference=None, traffic_model=None):
#
#
# TODO add knn nearest neighbour algorithm to find people who go to similar places at similar times


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)


import uvicorn
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def default():
    return {"Name": "Dataholics",
            "Mission": "Change the world, make it a sustainable place, for you and for me and the entire human race",
            "Description": "Implement eco-friendly route API"}

@app.get("/get-timeline-data")
def calculate_carbon_footprint(month: str):
    # TODO: Add code to calculate carbon footprint and return response
    return {
        "name": "John Doe",
        "co2_absolute": 23.5,
        "co2_average": 2.3,
        "friend_rank": 7,
        "trip_destinations": [[37.7749, -122.4194], [40.7128, -74.0060]],
        "co2_footprint_each_day": [0.8, 1.2, 1.1, 0.9, 1.0, 1.3, 1.4, 1.5, 1.1, 1.0, 0.9, 0.8, 0.7, 0.6, 0.7, 0.9, 1.2, 1.3, 1.4, 1.1, 1.0, 0.8, 0.7, 0.6, 0.5, 0.5, 0.6, 0.8, 1.1, 1.3, 1.2]
    }


if __name__ == "__main__":
    uvicorn.run(app)



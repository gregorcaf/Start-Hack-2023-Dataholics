import json

# grams per km
# TODO update subway
ACTIVITY_DICT = {
    "CYCLING": 21,
    "IN_BUS": 105,
    "IN_PASSENGER_VEHICLE": 192,
    "IN_SUBWAY": 41,
    "IN_TRAIN": 35,
    "IN_TRAM": 20.2,
    "WALKING": 50
}

def load_data(db_file):
    with open(db_file, "r") as f:
        data = json.load(f)

    generate_all_endpoint_data(data)
    return data


def get_name_from_data(data: dict, name: str):
    return data[name].capitalize()


def get_co2_absolute_from_data(data: dict, name: str, month: str):
    year = 2023
    month_str = f"{year}_{month}"

    user_data = data[name][month_str]
    absolute_co2 = 0
    for trip in user_data["raw"]:
        activity = trip["activity_type"]
        duration = trip["duration"]
        distance = trip["distance"]
        # TODO update formula later
        absolute_co2 += distance / 1000 * ACTIVITY_DICT[activity]

    data[name][month_str]["features"]["co2_absolute"] = absolute_co2
    return absolute_co2


def get_co2_average_from_data(data: dict, name: str, month: str):
    year = 2023
    month_str = f"{year}_{month}"

    user_data = data[name][month_str]
    absolute_co2 = 0
    for trip in user_data["raw"]:
        activity = trip["activity_type"]
        duration = trip["duration"]
        distance = trip["distance"]
        # TODO update formula later
        absolute_co2 += distance / 1000 * ACTIVITY_DICT[activity]

    average_trip_co2 = absolute_co2 / len(user_data["raw"])
    data[name][month_str]["features"]["co2_absolute"] = average_trip_co2
    return average_trip_co2


def generate_all_endpoint_data(data):
    for user_name in data:
        for month_data in data[user_name]:
            # here we work with a user per month summary
            all_end_locations = []
            for trip in data[user_name][month_data]["raw"]:
                # per each trip in a month
                all_end_locations.append(trip["end_location"])

            data[user_name][month_data]["features"]["all_end_locations"] = all_end_locations


def get_all_end_locations(user_name, month, data):
    year = 2023
    month_str = f"{year}_{month}"
    return data[user_name][month_str]["features"]["all_end_locations"]


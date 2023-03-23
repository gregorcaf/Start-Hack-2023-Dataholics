import calendar
import json
import datetime

from dateutil import parser

# grams per km
# TODO update subway
ACTIVITY_DICT = {"IN_FERRY": 19.2,
                 'IN_TRAM': 20.2,
                 'CYCLING': 21,
                 'IN_TRAIN': 35,
                 'IN_SUBWAY': 41,
                 'WALKING': 50,
                 'IN_BUS': 105,
                 'IN_PASSENGER_VEHICLE': 192}


def load_data(db_file):
    """
        Load data from a JSON file.

        Args:
            db_file (str): path to the JSON file.

        Returns:
            dict: data loaded from the JSON file.
        """
    with open(db_file, "r") as f:
        data = json.load(f)

    generate_all_endpoint_data(data)
    return data


def get_name_from_data(data: dict, name: str):
    """
        Get the capitalized name from the data dictionary.

        Args:
            data (dict): the data dictionary.
            name (str): the name to capitalize.

        Returns:
            str: the capitalized name.
        """
    if name not in data:
        print(f"Name {name} not found in the data dictionary.")
        return ""

    return data[name].capitalize()


def calculate_co2_in_trip(trip):
    round_to = 2
    # TODO update formula later
    activity = trip["activity_type"]
    distance = trip["distance"]
    duration = trip["duration"]

    return round(distance / 1000 * ACTIVITY_DICT[activity], round_to)


def get_co2_absolute_from_data(data: dict, name: str, month: str):
    """
        Calculate the absolute CO2 footprint for a user in a given month.

        Args:
            data (dict): the data dictionary.
            name (str): the name of the user.
            month (str): the month to calculate the CO2 footprint for.

        Returns:
            str: the calculated absolute CO2 footprint.
        """
    year = 2023
    month_str = f"{year}_{month}"

    user_data = data[name][month_str]
    absolute_co2 = 0
    for trip in user_data["raw"]:
        absolute_co2 += calculate_co2_in_trip(trip)

    data[name][month_str]["features"]["co2_absolute"] = absolute_co2
    return absolute_co2


def get_co2_average_from_data(data: dict, name: str, month: str):
    """
        Calculate the average CO2 footprint per trip for a user in a given month.

        Args:
            data (dict): the data dictionary.
            name (str): the name of the user.
            month (str): the month to calculate the CO2 footprint for.

        Returns:
            float: the calculated average CO2 footprint per trip.
        """
    year = 2023
    month_str = f"{year}_{month}"

    user_data = data[name][month_str]
    absolute_co2 = 0
    for trip in user_data["raw"]:
        absolute_co2 += calculate_co2_in_trip(trip)

    average_trip_co2 = round(absolute_co2 / len(user_data["raw"]), 2)
    data[name][month_str]["features"]["co2_absolute"] = average_trip_co2
    return average_trip_co2


def generate_all_endpoint_data(data):
    """
        Generate a list of all end locations for each user in each month.

        Args:
            data (dict): the data dictionary.
        """
    for user_name in data:
        for month_data in data[user_name]:
            # here we work with a user per month summary
            all_end_locations = []
            for trip in data[user_name][month_data]["raw"]:
                # per each trip in a month
                all_end_locations.append(trip["end_location"])

            data[user_name][month_data]["features"]["all_end_locations"] = all_end_locations


def get_all_end_locations(data: dict, name: str, month: str):
    """
    Get a list of all end locations for a user in a given month.

    Args:
        data (dict): the data dictionary.
        name (str): the name of the user.
        month (str): the month to get the end locations for.

    Returns:
        list: a list of all end locations for trips of a user in a given month
        """
    year = 2023
    return data[name][f"{year}_{month}"]["features"]["all_end_locations"]


def get_friend_rank(data:dict, name:str, month:str):
    """
       Given a dictionary of user data, a user's name, and a month, return the user's rank based on CO2 emissions for that month.

       Parameters:
       data (dict): A dictionary of user data.
       name (str): The name of the user.
       month (str): The month for which to retrieve the CO2 emissions data.

       Returns:
       int: The user's rank based on CO2 emissions for the specified month.
       """
    co2_for_all_users = {}

    for names in data:
        co2_for_all_users[names] = get_co2_absolute_from_data(data=data, name=names, month=month)

    co2_for_all_users = {k: v for k, v in sorted(co2_for_all_users.items(), key=lambda item: item[1])}

    rank = -1

    for (rank, item) in enumerate(co2_for_all_users.items()):
        if item[0] == name:
            break

    return f"{rank + 1} / {len(co2_for_all_users)}"


def get_co2_footprint_per_day(user_name, month, data):
    """
        Given a user's name, a month, and a dictionary of user data, return a dictionary of CO2 emissions for each day of the specified month.

        Parameters:
        user_name (str): The name of the user.
        month (str): The month for which to retrieve the CO2 emissions data.
        data (dict): A dictionary of user data.

        Returns:
        dict: A dictionary of CO2 emissions for each day of the specified month.
        """
    year = 2023
    month_str = f"{year}_{month}"
    month_map = {month_i.lower(): index for index, month_i in enumerate(calendar.month_name) if month_i}
    month_number = month_map[month.lower()]
    num_days_in_month = calendar.monthrange(year, month_number)[1]
    days_co2_dict = {str(datetime.date(year, month_number, day)): 0 for day in range(1, num_days_in_month + 1)}

    # for date, value in days_co2_arr:
    for trip in data[user_name][month_str]["raw"]:
        start_date = str(parser.parse(trip["start_time"]).date())
        # check not mandatory, but just for safety
        if start_date in days_co2_dict:
            days_co2_dict[str(start_date)] += calculate_co2_in_trip(trip)

    days_co2_dict = {k: round(v, 2) for k, v in days_co2_dict.items()}
    data[user_name][month_str]["features"]["day_of_month_co2"] = days_co2_dict
    return days_co2_dict

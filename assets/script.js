let url = "http://" + window.location.host + "/get-timeline-data?name=gordan&month=february"
let totalEmissionsLow = 70
let totalEmissionsHigh = 90
let perTripConsumptionLow = 1
let perTripConsumptionHigh = 2
let arrayLocations = [];


function getData() {
    let data;

    fetch(url).then(function (u) {
            return u.json();
        }
    ).then(function (json) {
            data = json;

            let name = data["name"];
            let rank = parseInt(data["friend_rank"].split(" / ")[0]);
            let numPeople = parseInt(data["friend_rank"].split(" / ")[1]);
            let totalEmissions = parseFloat(data["co2_absolute"]) / 1000;
            let perTripConsumption = parseFloat(data["co2_average"]) / 1000;
            let arrayDays = data["co2_footprint_each_day"];
            // arrayLocations = data["trip_destinations"];
            let daysX = [];
            let valuesY = [];

            console.log("name ", name);
            console.log("rank ", rank);
            console.log("num people ", numPeople);
            console.log("total emissions ", totalEmissions);
            console.log("per trip consumptions ", perTripConsumption);
            // console.log("array ", arrayDays)
            // console.log("locations ", arrayLocations)


            for (var key in arrayDays) {
                // console.log(key + " -> " + arrayDays[key]);
                daysX.push(key);
                valuesY.push((arrayDays[key] / 1000).toFixed(2));
            }

            // for (var key in arrayLocations) {
            //     console.log(key + " -> " + arrayLocations[key]);
            //     locations.push(key);
            //     valuesY.push(arrayDays[key]);
            // }

            var colors = [];
            for (var i = 0; i < valuesY.length; i++) {
                var red_value = Math.round((valuesY[i] / Math.max.apply(null, valuesY)) * 255);
                var green_value = Math.round(((Math.max.apply(null, valuesY) - valuesY[i]) / Math.max.apply(null, valuesY)) * 255);
                colors.push('rgb(' + red_value + ', ' + green_value + ', 0)');
            }

            let text_rank;
            let text_per_trip;
            let text_total_emissions;
            let text_user_better_worse;
            let value_user_better_worse = ((numPeople - rank) / numPeople) * 100

            // rank
            if (rank <= (numPeople / 3)) {
                text_rank = "Munich area leaderboard: <span class=\"badge text-bg-success\">";
            } else if (rank <= (numPeople - numPeople / 3)) {
                text_rank = "Munich area leaderboard: <span class=\"badge text-bg-warning\">";
            } else {
                text_rank = "Munich area leaderboard: <span class=\"badge text-bg-danger\">";
            }

            text_rank += rank;

            if (rank == 1) {
                text_rank += "st";

            } else if (rank == 2) {
                text_rank += "nd";
            } else if (rank == 3) {
                text_rank += "rd";
            } else {
                text_rank += "th";
            }

            text_rank += "</span>";


            // total emissions
            if (totalEmissions < totalEmissionsLow) {
                text_total_emissions = "Total emissions: <span class=\"badge text-bg-success\">";
            } else if (totalEmissions < totalEmissionsHigh) {
                text_total_emissions = "Total emissions: <span class=\"badge text-bg-warning\">";
            } else {
                text_total_emissions = "Total emissions: <span class=\"badge text-bg-danger\">";
            }

            text_total_emissions += totalEmissions.toFixed(2);
            text_total_emissions += " kg</span>";


            // per trip consumption
            if (perTripConsumption < perTripConsumptionLow) {
                text_per_trip = "Per trip consumption: <span class=\"badge text-bg-success\">";
            } else if (perTripConsumption < perTripConsumptionHigh) {
                text_per_trip = "Per trip consumption: <span class=\"badge text-bg-warning\">";
            } else {
                text_per_trip = "Per trip consumption: <span class=\"badge text-bg-danger\">";
            }

            text_per_trip += perTripConsumption.toFixed(2);
            text_per_trip += " kg</span>";


            // comparison
            if (rank <= numPeople / rank) {
                text_user_better_worse = "This month you did better than <span class=\"badge text-bg-success\">"
                text_user_better_worse += value_user_better_worse.toFixed(2);
                text_user_better_worse += " %</span> of people in Munich area"
            } else {
                text_user_better_worse = "This month you did better than <span class=\"badge text-bg-danger\">"
                text_user_better_worse += value_user_better_worse.toFixed(2);
                text_user_better_worse += " %</span> of people in Munich area"
            }

            // change the data in HTML
            document.getElementById("labelAreaLeaderboard").innerHTML = text_rank;
            document.getElementById("labelEcoFootprintNumber").innerHTML = text_total_emissions;
            document.getElementById("labelTotalEmissions").innerHTML = text_total_emissions;
            document.getElementById("labelPerTripConsumption").innerHTML = text_per_trip;
            document.getElementById("labelMonthlyComparison").innerHTML = text_user_better_worse;

            // plotly chart
            var layout = {
                margin: {
                    l: 50,
                    r: 50,
                    b: 50,
                    t: 50,
                    pad: 4
                },
                autosize: false,
                width: 450,
                height: 300,
                yaxis: {
                    title: {
                        text: 'kg of CO2'
                    }
                },
            };

            var dataChart = [
                {
                    x: daysX,
                    y: valuesY,
                    type: 'bar',
                    marker: {
                        color: "#4CAF50",
                        opacity: 0.66,
                    }
                }
            ];

            Plotly.newPlot('myDiv', dataChart, layout, {displayModeBar: false});

            // setTimeout(() => {
            //     window.initMap = initMap;
            // }, 500)

        }
    )
}


function initMap() {


    fetch(url).then(function (u) {
            return u.json();
        }
    ).then(function (json) {
        // The location of Uluru
        const uluru = {lat: 48.1370339, lng: 11.5732385};
        // The map, centered at Uluru
        const map = new google.maps.Map(document.getElementById("map"), {
            zoom: 12,
            center: uluru,
        });

        let infowindow = new google.maps.InfoWindow();

        let marker, i;
        data = json;
        arrayLocations = data["trip_destinations"];
        // console.log(arrayLocations)

        for (i = 0; i < arrayLocations.length; i++) {
            // console.log(arrayLocations[i][0], arrayLocations[i][1])
            marker = new google.maps.Marker({
                position: new google.maps.LatLng(arrayLocations[i][0] / 10000000, arrayLocations[i][1] / 10000000),
                map: map
            });

            google.maps.event.addListener(marker, 'click', (function (marker, i) {
                return function () {
                    infowindow.setContent("Default");
                    infowindow.open(map, marker);
                }
            })(marker, i));
        }
    })


}


function calculateCo2(data) {
    // TODO: Change values
    co2_per_km = {
        "BUS": 105,
        "CABLE_CAR": 41,
        "COMMUTER_TRAIN": 35,
        "FERRY": 19,
        "FUNICULAR": 19,
        "GONDOLA_LIFT": 21,
        "HEAVY_RAIL": 35,
        "HIGH_SPEED_TRAIN": 6,
        "INTERCITY_BUS": 105,
        "METRO_RAIL": 41,
        "MONORAIL": 41,
        "OTHER": 0,
        "RAIL": 35,
        "SHARE_TAXI": 101,
        "SUBWAY": 35,
        "TRAM": 20.5,
        "TROLLEYBUS": 21,
        "DRIVING": 192,
        "WALKING": 50,
        "BICYCLING": 21
    }

    let co2 = []

    for (let i = 0; i < data.length; i++) {
        const steps_data = data[i]["routes"][0]["legs"][0]["steps"];
        let route_co2_sum = 0;

        for (let j = 0; j < steps_data.length; j++) {
            const sub_route = steps_data[j];
            let sub_type = null;
            let gram_constant = null;
            if (sub_route['travel_mode'].toUpperCase() === "TRANSIT" && "transit" in sub_route) {
                sub_type = sub_route["transit"]["line"]["vehicle"]["type"];
                gram_constant = co2_per_km[sub_type.toUpperCase()];
            } else {
                gram_constant = co2_per_km[sub_route['travel_mode'].toUpperCase()];
            }
            route_co2_sum += sub_route['distance']['value'] / 1000 * gram_constant;
        }
        co2.push(route_co2_sum)
    }
    return co2;
}


function createRoute() {
    const directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        hideRouteList: true
    });

    const uluru = {lat: 48.1370339, lng: 11.5732385};
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: uluru,
    });
    directionsRenderer.setMap(map);

    var start = document.getElementById('inputFrom').value;
    var end = document.getElementById('inputTo').value;

    let travel_modes = ['DRIVING', 'TRANSIT', 'BICYCLING', 'WALKING']
    let travel_img = ['images/car.png', 'images/train.jpg', 'images/cycle.png', 'images/walking.png']

    let all_directios = (async () => {
        const directionsService = new google.maps.DirectionsService();

        let all_directios = [];

        for (i = 0; i < travel_modes.length; i++) {
            var request = {
                origin: start,
                destination: end,
                transitOptions: {
                    modes: ['BUS', 'RAIL', 'TRAM', 'SUBWAY', 'TRAIN']
                },
                travelMode: travel_modes[i]
            };

            await directionsService.route(request, function (result, status) {
                if (status == 'OK') {
                    all_directios.push(result);
                }
            });
        }
        console.log(all_directios);
        return all_directios;
    })().then((all_directios) => {
            let routes = document.getElementById('routes');
            routes.innerHTML = '';

            let colors = ['green', '#FFCC00', '#FF7C00', 'red']
            let cos = calculateCo2(all_directios);

            const min_cos = cos[0];

            const dsu = (arr1, arr2) => arr1
                .map((item, index) => [arr2[index], item]) // add the args to sort by
                .sort(([arg1], [arg2]) => arg1 - arg2) // sort by the args
                .map(([, item]) => item); // extract the sorted items

            sorted_col = dsu(colors, cos)

            let html_els = [];
            let times = [];
            console.log("all directions ", all_directios)
            for (i = 0; i < all_directios.length; i++) {
                var dr = new google.maps.DirectionsRenderer({
                    suppressMarkers: true,
                    polylineOptions: {
                        strokeColor: sorted_col[i]
                    },
                    markerOptions: {
                        icon: travel_img[i]
                    },
                    hideRouteList: true,
                    suppressBicyclingLayer: true
                });
                dr.setDirections(all_directios[i]);
                dr.setRouteIndex(i);
                dr.setMap(map);

                let time = all_directios[i]['routes'][0]['legs'][0]['duration']['text'];
                let mode_cur = travel_modes[i].charAt(0) + travel_modes[i].toLowerCase().slice(1);
                let time_num = all_directios[i]['routes'][0]['legs'][0]['duration']['value'];
                let percent = cos[i] / min_cos * 100;
                percent = Math.round(percent);

                let start_time = Date.now();
                let end_time = start_time + time_num * 1000;

                console.log(start_time, end_time)

                start_time = new Date(start_time);
                end_time = new Date(end_time);

                let text_col = 'text-success';

                if (percent == 100) {
                    text_col = 'text-secondary';
                } else if (percent > 100) {
                    text_col = 'text-danger';
                } else if (percent > 50) {
                    text_col = 'text-warning';
                }

                if (percent == 100) {
                    percent = "0%";
                } else if (percent < 100) {
                    percent = `-${Math.abs(100 - percent)}%`;
                } else {
                    percent = `+${Math.abs(100 - percent)}%`;
                }

                let carbon;

                if (cos[i] < 300) {
                    carbon = Math.round(cos[i]) + " g"
                } else {
                    carbon = (cos[i] / 1000).toFixed(2) + " kg"
                }

                let html_temp = `
                <div class="row border-bottom border-top p-4" style="background-color: white;">
                <div class="col-2 d-flex flex-wrap align-items-center">
                    <img class="" src=${travel_img[i]} alt="">
                </div>
                <div class="col p-0"> </div>
                <div class="col-3 p-0">
                    <div>
                        <span>${start_time.toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                })} - ${end_time.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true})}</span>
                    </div>
                    <span class="small" style="color: ${sorted_col[i]};">${mode_cur}</span>
                </div>
                <div class="col p-0"> </div>
                <div class="col-2 p-0 d-flex flex-wrap align-items-center">
                    ${time}
                </div>
                <div class="col p-0 "> </div>
                <div class="col-2 p-0 d-flex flex-wrap align-items-center">
                    <div>
                        <span>${carbon}</span><br/>
                        <span class="${text_col}">${percent}</span>
                    </div>
                </div>
            </div>
            `
                html_els.push(html_temp);
                times.push(time_num);
            }

            let curr = '';

            sorted_els = dsu(html_els, times)

            for (i = 0; i < sorted_els.length; i++) {
                curr += sorted_els[i];
            }

            routes.innerHTML = curr;

            directionsRenderer.setMap(map);
        }
    );

    return false;
}

// let locations = [
//     {name: 'A', lat: 48.1370339, lng: 11.5732385},
//     {name: 'B', lat: 48.18, lng: 11.578},
//     {name: 'C', lat: 48.12, lng: 11.7},
//     {name: 'D', lat: 48.16, lng: 11.5},
//     {name: 'E', lat: 48.19, lng: 11.6}
// ]

window.initMap = initMap;
window.onload = getData;

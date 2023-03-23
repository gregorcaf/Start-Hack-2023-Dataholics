let url = "http://localhost:8000/get-timeline-data?name=gordan&month=february"
let totalEmissionsLow = 70
let totalEmissionsHigh = 90
let perTripConsumptionLow = 1
let perTripConsumptionHigh = 2

function initMap() {
    // The location of Uluru
    const uluru = {lat: 48.1370339, lng: 11.5732385};
    // The map, centered at Uluru
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: uluru,
    });

    let infowindow = new google.maps.InfoWindow();

    let marker, i;

    for (i = 0; i < locations.length; i++) {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(locations[i]['lat'], locations[i]['lng']),
            map: map
        });

        google.maps.event.addListener(marker, 'click', (function (marker, i) {
            return function () {
                infowindow.setContent(locations[i]['name']);
                infowindow.open(map, marker);
            }
        })(marker, i));
    }

}

// function getData() {
//   let fetched_data = 0
//
//   fetch(url).then((response) => response.json()).then((data) => console.log(data));
//   console.lo
// }

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
            let arrayDays = data["co2_footprint_each_day"]
            let daysX = []
            let valuesY = []

            console.log("name ", name)
            console.log("rank ", rank) // DONE
            console.log("num people ", numPeople)
            console.log("total emissions ", totalEmissions) // DONE
            console.log("per trip consumptions ", perTripConsumption) // DONE
            // console.log("array ", arrayDays)

            for (var key in arrayDays) {
                console.log(key + " -> " + arrayDays[key]);
                daysX.push(key)
                valuesY.push(arrayDays[key])
            }

            var colors = [];
            for (var i = 0; i < valuesY.length; i++) {
                var red_value = Math.round((valuesY[i] / Math.max.apply(null, valuesY)) * 255);
                var green_value = Math.round(((Math.max.apply(null, valuesY) - valuesY[i]) / Math.max.apply(null, valuesY)) * 255);
                colors.push('rgb(' + red_value + ', ' + green_value + ', 0)');
            }


            let text_rank
            let text_per_trip
            let text_total_emissions
            let text_user_better_worse

            // rank
            if (rank <= (numPeople / 3)) {
                text_rank = "Munich area leaderboard: <span class=\"badge text-bg-success\">"
            } else if (rank <= (numPeople - numPeople / 3)) {
                text_rank = "Munich area leaderboard: <span class=\"badge text-bg-warning\">"
            } else {
                text_rank = "Munich area leaderboard: <span class=\"badge text-bg-danger\">"
            }

            text_rank += rank

            if (rank == 1) {
                text_rank += "st"

            } else if (rank == 2) {
                text_rank += "nd"
            } else if (rank == 3) {
                text_rank += "rd"
            } else {
                text_rank += "th"
            }
            text_rank += "</span>"


            // total emissions
            if (totalEmissions < totalEmissionsLow) {
                text_total_emissions = "Total emissions: <span class=\"badge text-bg-success\">"
            } else if (totalEmissions < totalEmissionsHigh) {
                text_total_emissions = "Total emissions: <span class=\"badge text-bg-warning\">"
            } else {
                text_total_emissions = "Total emissions: <span class=\"badge text-bg-danger\">"
            }

            text_total_emissions += totalEmissions.toFixed(2);
            text_total_emissions += " kg</span>"


            // per trip consumption
            if (perTripConsumption < perTripConsumptionLow) {
                text_per_trip = "Per trip consumption: <span class=\"badge text-bg-success\">"
            } else if (perTripConsumption < perTripConsumptionHigh) {
                text_per_trip = "Per trip consumption: <span class=\"badge text-bg-warning\">"
            } else {
                text_per_trip = "Per trip consumption: <span class=\"badge text-bg-danger\">"
            }

            text_per_trip += perTripConsumption.toFixed(2);
            text_per_trip += " kg</span>"

            // change the data in HTML
            document.getElementById("labelAreaLeaderboard").innerHTML = text_rank
            document.getElementById("labelEcoFootprintNumber").innerHTML = text_total_emissions
            document.getElementById("labelTotalEmissions").innerHTML = text_total_emissions
            document.getElementById("labelPerTripConsumption").innerHTML = text_per_trip

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
                width: 300,
                height: 300
            };

            var dataChart = [
                {
                    x: daysX,
                    y: valuesY,
                    type: 'bar',
                    marker:{
                        color: colors,
                        opacity: 0.66
                      }
                }
            ];

            Plotly.newPlot('myDiv', dataChart, layout, {displayModeBar: false});

            // TODO
            // document.getElementById("labelMonthlyComparison").innerHTML = text_user_better_worse
        }
    )
}


let locations = [
    {name: 'A', lat: 48.1370339, lng: 11.5732385},
    {name: 'B', lat: 48.18, lng: 11.578},
    {name: 'C', lat: 48.12, lng: 11.7},
    {name: 'D', lat: 48.16, lng: 11.5},
    {name: 'E', lat: 48.19, lng: 11.6}
]

window.initMap = initMap;
window.onload = getData;
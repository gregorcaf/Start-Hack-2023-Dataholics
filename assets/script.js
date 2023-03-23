function initMap() {
    // The location of Uluru
    const uluru = { lat: 48.1370339, lng: 11.5732385 };
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


function calculateCo2(data) {
    // TODO: Change values
    co2_per_km = {
        "BUS": 101,
        "CABLE_CAR": 41,
        "COMMUTER_TRAIN": 41,
        "FERRY": 194,
        "FUNICULAR": 19,
        "GONDOLA_LIFT": 21,
        "HEAVY_RAIL": 41,
        "HIGH_SPEED_TRAIN": 13,
        "INTERCITY_BUS": 27,
        "METRO_RAIL": 68,
        "MONORAIL": 76,
        "OTHER": 0,
        "RAIL": 41,
        "SHARE_TAXI": 101,
        "SUBWAY": 68,
        "TRAM": 41,
        "TROLLEYBUS": 68,
        "DRIVING": 50,
        "WALKING": 10,
        "BICYCLING": 10
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

    const uluru = { lat: 48.1370339, lng: 11.5732385 };
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

        let colors = ['green', 'yellow', 'orange', 'red']
        let cos = calculateCo2(all_directios);

        const min_cos = cos[0];  

        const dsu = (arr1, arr2) => arr1
            .map((item, index) => [arr2[index], item]) // add the args to sort by
            .sort(([arg1], [arg2]) => arg1 - arg2) // sort by the args
            .map(([, item]) => item); // extract the sorted items

        sorted_col = dsu(colors, cos)

        let html_els = [];
        let times = [];
        for (i = 0; i < all_directios.length; i++) {
            var dr = new google.maps.DirectionsRenderer({
                polylineOptions: {
                    strokeColor: sorted_col[i]
                },
                markerOptions: {
                    icon: travel_img[i],

                }
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
            let end_time = start_time + time_num*1000;

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
                percent = `-${100-percent}%`;
            } else {
                percent = `+${100-percent}%`;
            }

            let html_temp = `
            <div class="row border-bottom border-top p-4">
                <div class="col-2 d-flex flex-wrap align-items-center">
                    <img class="" src=${travel_img[i]} alt="">
                </div>
                <div class="col p-0"> </div>
                <div class="col-3 p-0">
                    <div>
                        <span>${start_time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })} - ${end_time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</span>
                    </div>
                    <span class="text-secondary small">${mode_cur}</span>
                </div>
                <div class="col p-0"> </div>
                <div class="col-2 p-0 d-flex flex-wrap align-items-center">
                    ${time}
                </div>
                <div class="col p-0 "> </div>
                <div class="col-2 p-0 d-flex flex-wrap align-items-center">
                    <div>
                        <span>${Math.round(cos[i])} g</span><br/>
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


let locations = [
    { name: 'A', lat: 48.1370339, lng: 11.5732385 },
    { name: 'B', lat: 48.18, lng: 11.578 },
    { name: 'C', lat: 48.12, lng: 11.7 },
    { name: 'D', lat: 48.16, lng: 11.5 },
    { name: 'E', lat: 48.19, lng: 11.6 }
]

window.initMap = initMap;
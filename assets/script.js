function initMap() {
    // The location of Uluru
    const uluru = { lat: 48.1370339, lng: 11.5732385 };
    // The map, centered at Uluru
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 12,
      center: uluru,
    });
  }
  
  window.initMap = initMap;
async function main() {
  (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
    key: "AIzaSyC7xDbizvxJvWNG2bkl3zmM9YbuoGUOPTo", v: "weekly" });
    
    const {Place, SearchNearbyRankPreference} = await google.maps.importLibrary("places");
    
    const MILE = 1609.34; // meters
    const restaurantTypes = [
      'american_restaurant',
      'bakery',
      'bar',
      'barbecue_restaurant',
      'brazilian_restaurant',
      'breakfast_restaurant',
      'brunch_restaurant',
      'cafe',
      'chinese_restaurant',
      'coffee_shop',
      'fast_food_restaurant',
      'french_restaurant',
      'greek_restaurant',
      'hamburger_restaurant',
      'ice_cream_shop',
      'indian_restaurant',
      'indonesian_restaurant',
      'italian_restaurant',
      'japanese_restaurant',
      'korean_restaurant',
      'lebanese_restaurant',
      'meal_delivery',
      'meal_takeaway',
      'mediterranean_restaurant',
      'mexican_restaurant',
      'middle_eastern_restaurant',
      'pizza_restaurant',
      'ramen_restaurant',
      'restaurant',
      'sandwich_shop',
      'seafood_restaurant',
      'spanish_restaurant',
      'steak_house',
      'sushi_restaurant',
      'thai_restaurant',
      'turkish_restaurant',
      'vegan_restaurant',
      'vegetarian_restaurant',
      'vietnamese_restaurant',
    ];
    
    const outputView = document.getElementById('output');
    const copyBtn = document.getElementById('copy-output-btn');
    const searchBtn = document.getElementById('search-btn');
    const routeForm = document.getElementById('route-form');
    const routeChoiceSelect = document.getElementById('route-choice');
    
    let routeStops = [];
    let next = 0;
    let abort = false;
    
    routeForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      routeStops = DART_Stops[routeChoiceSelect.value];
      
      searchNextStop();
    });
    
    async function searchNextStop() {
      const nextStop = routeStops[next];
      let stopId;
      try {
        stopId = nextStop.properties.onestop_id;
      } catch(e) {
        console.log(routeStops);
        console.log(next)
        console.log(e);
        return;
      }
      const stopCoords = nextStop.geometry.coordinates; 
      const stopCenter = new google.maps.LatLng(stopCoords[1], stopCoords[0]);
      const google_request = {
        // required parameters
        fields: ["displayName", "location"],
        locationRestriction: {
          center: stopCenter,
          radius: MILE / 2,
        },
        // optional parameters
        rankPreference: SearchNearbyRankPreference.DISTANCE,
        includedPrimaryTypes: restaurantTypes,
        maxResultCount: 20,
        language: "en-US",
        region: "us"
      };
      
      const { places } = await Place.searchNearby(google_request);
      
      places.forEach(({Eg}) => {
        const placeFeature = {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Point",
            "coordinates": [Eg.location.lng, Eg.location.lat]
          }
        };
        
        const stopDistance = turf.distance(nextStop, placeFeature, { units: "miles" }).toFixed(2);
        
        if (!data[Eg.id]) {
          data[Eg.id] = {
            id: Eg.id,
            name: Eg.displayName,
            location: Eg.location,
            nearbyStops: {}
          };
        }
        
        data[Eg.id].nearbyStops[stopId] = stopDistance;
      });
      
      writeStop(nextStop, places);
      
      outputView.innerText = JSON.stringify(data, null, 2);
      
      next = next + 1;
      
      if (next < routeStops.length && !abort) {
        const minSeconds = 3;
        const maxSeconds = 5;
        const randomSeconds = Math.random() * maxSeconds;
        
        console.log((minSeconds + randomSeconds) * 1000);
        
        setTimeout(searchNextStop, (minSeconds + randomSeconds) * 1000);
      }
    }
    
    function getRouteById(id) {
      for (const route of DART_Routes.features) {
        if (route.properties.onestop_id == id) {
          return route;
        }
      }
      
      return false;
    }
    
    function findPlaceById(id) {
      return data[id];
    }
    
    function writeStop(stop, places) {
      const stopId = stop.properties.onestop_id;
      const stopsTable = document.getElementById('stops-table');
      const placesList = places.map((place) => {
        const details = findPlaceById(place.Eg.id);
        const distance = details.nearbyStops[stopId];
        
        return `<li>${details.name} - ${distance} miles</li>`
      }).join('');
      
      stopsTable.innerHTML = stopsTable.innerHTML
      + `<tr>`
      + `<td>${stop.properties.stop_name}</td>`
      + `<td>${placesList}</td>`
      + `</tr>`;
    }
    
    DART_Routes.features.forEach((route) => {
      let routeId = route.properties.onestop_id;
      let routeName = route.properties.route_long_name.replace('DART LIGHT RAIL - ', '');
      let routeNumber = parseInt(route.properties.route_short_name, 10);
      
      routeNumber = Number.isInteger(routeNumber) ? `🚍${routeNumber}` : routeNumber = `🚉`;
      
      routeChoiceSelect.innerHTML = routeChoiceSelect.innerHTML + `<option value='${routeId}'>${routeNumber} ${routeName}</option>`
    });
    
    outputView.innerText = JSON.stringify(data);
    
    copyBtn.addEventListener('click', function() {
      // Copy the text inside the text field
      navigator.clipboard.writeText(JSON.stringify(data));
      
      // Alert the copied text
      alert("Copied the text: ");
    });
  };
  
  main();
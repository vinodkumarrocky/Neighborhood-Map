import React, { Component } from 'react';
import './App.css';
import axios from 'axios';

class App extends Component {
  state = {
    venues:[],
    markers:[],
    hamburgerActive: false
  }
  componentDidMount(){
    window.gm_authFailure = () => {
      alert('ERROR!! \nFailed to get Google map.')
      console.log('ERROR!! \nFailed to get Google map.')
   }
    this.getVenues()
  }
  renderMap = () => {
    loadScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyDBuTMyBD4GlwIC2panKoa31VzgNLFkIU4&callback=initMap")
    window.initMap = this.initMap;
  }

  getVenues = () => {
    const api = 'https://api.foursquare.com/v2/venues/explore?';
    const param = {
      client_id: 'LEMQI0VL0ADKRLN23NJV1LJ3JW0JYERQJBOKJ10SLOZAJH42',
      client_secret:'CM5ERC0CFCTIQPHZLVH4KPRVMKFWZUQNYZ5NT0EWLGC25PE5',
      query:'burger',
      limit:20,
      near:'India',
      v:'20181311'
    }

    axios.get(api + new URLSearchParams(param))
    .then(response => {
      this.setState({
        venues :response.data.response.groups[0].items
      },this.renderMap())
    })
    .catch(error => {
      console.log(error);
    })
}

initMap = () => {
  let map = new window.google.maps.Map(document.getElementById('map'),{
    center :{ lat:20.5937, lng:78.9629},
    zoom:7
  });

  this.map = map;
  let infowindow = new window.google.maps.InfoWindow();
  const allMarkers = [];

  this.setState({
    map: map,
    infowindow:infowindow
  });

  this.state.venues.forEach(venueinfo => {
    let contentString =`<div id="info" tabindex="1">
        <div><h2>${venueinfo.venue.name}</h2></div>
        <div><h3>${venueinfo.venue.location.address}</h3></div>
        </div>`;
    let marker = new window.google.maps.Marker({
      position:{
      lat:venueinfo.venue.location.lat,
      lng:venueinfo.venue.location.lng
    },
    map: map,
    city: venueinfo.venue.location.city,
    address: venueinfo.venue.location.address,
    venueinfo: venueinfo,
    id: venueinfo.venue.id,
    name: venueinfo.venue.name,
    draggable: true,
    animation: window.google.maps.Animation.DROP,
    title: venueinfo.venue.name
    });

    marker.addListener("click",function() {
      // body...
      let pos = map.getZoom();
      infowindow.setContent(contentString);
      infowindow.open(map, marker);
      map.setZoom(13);
      map.setCenter(marker.getPosition());
       window.setTimeout(function() {map.setZoom(pos);},3000);
      });

    allMarkers.push(marker);
  });

  this.setState({
    markers: allMarkers
  });

  this.setState({
    filtermyvenue: this.state.venues
  });
};
  constructor(props){
    super(props);
    this.state = {
      sidebar:false,
      query:""
    };
  }

listItemClick = (venues) => {
  //checking for matchiing id
  let marker = this.state.markers.filter(m => m.id === venues.id)[0];

//adding city and address
  this.state.infowindow.setContent(`${marker.name +
    ", " +
  marker.city + ", " + marker.address}`);

  //set the map positon to marker positon
  this.map.setCenter(marker.position);
  //open infowindow
  this.state.infowindow.open(this.state.map, marker);
  
}

filtermyvenue(query) {
  let f = this.state.venues.filter(myvenue => myvenue.venue.name.toLowerCase().includes(query.toLowerCase()))
  
  //show the infowindow 
  this.state.markers.forEach(marker => {
      marker.name.toLowerCase().includes(query.toLowerCase()) === true ?
    marker.setVisible(true) :
    marker.setVisible(false);
  });
  if (f.length === 0) {
    //this will close the infowindow  
    this.state.infowindow.close();   
  }
  this.setState({filtermyvenue: f, query}); 
}

// Toggle sidebar
  onSidebarClick = () => {
    const sidebar = document.querySelector('#sidebar');
    if (this.state.hamburgerActive) {
      sidebar.style.transform = 'translateX(-250px)'
      this.setState({ hamburgerActive: false });
    }
    else {
      sidebar.style.transform = 'translateX(0px)'
      this.setState({sidebar: true});
      this.setState({ hamburgerActive: true });
    }
  }

  render() {
    return (  
      <main role="main">
      <div className="header" aria-label="name">
        <button aria-label='Hamburger Menu' tabIndex='0' role="menu" className="hamburger-container" onClick={this.onSidebarClick}> 
          <div className="hamburger-bar"></div>
          <div className="hamburger-bar"></div>
          <div className="hamburger-bar"></div>
        </button>
        <span className="title"><strong>Restaurants</strong></span></div>
          
        <div role="application" aria-label="map" id='map'></div>
        
          <div aria-label="sidebar" role="search menu" id='sidebar' >
            <input type="text" autoFocus="autofocus" tabIndex="0" className="SearchVenues" placeholder="Search venues" value={this.state.query} onChange={(e)=>{this.filtermyvenue(e.target.value)}}/>
            <br/>
            <br/>
            {
              this.state.filtermyvenue && this.state.filtermyvenue.length > 0 && this.state.filtermyvenue.map((myvenue, index) => (
                  <div tabIndex="-1" key={index} className="venue-item">
                      {/* <h4>{myvenue.venue.name}</h4> */}
                      <ul><li role="link" aria-label="search" onClick={()=>{this.listItemClick(myvenue.venue)}}>{myvenue.venue.name}</li>
                  </ul>
                  </div>
              ))
            }
        </div>
      </main>      
    )
  }
}
function loadScript(source) {
  try {
    var index = window.document.getElementsByTagName('script')[0]
    var script = window.document.createElement('script')
    script.src = source
    script.async = true
    script.defer = true
    index.parentNode.insertBefore(script, index)
   } catch (error) {
    console.log(error);
   alert("Google Maps API not loading");
   }
  }
export default App;

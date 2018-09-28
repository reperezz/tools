import { Component, OnInit, Input } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { ViewChild, ElementRef, NgZone, } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  public latitude: number;
  public longitude: number;
  public fillInAddress: '';
  public searchControl: FormControl;
  public zoom: number;
  public province: string;
  public country: string;
  public sCountry: string;
  public postalCode: string;
  public state: string;
  public sState: string;
  public streetNumber: number;
  public route: string;
  public locality: string;
  public formatted_address: string;
  public publicPlace: google.maps.places.PlaceResult;
  public loading = true;

  @ViewChild('searchAddress')
  public searchAddressElementRef: ElementRef;

  @ViewChild('searchRegion')
  public searchRegionElementRef: ElementRef;

  constructor(private mapsAPILoader: MapsAPILoader, private ngZone: NgZone) {
    this.setCurrentPosition();
  }

  ngOnInit() {
    // set current position
    this.getGeoLocation();

    // load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      const autocompleteRegion = new google.maps.places.Autocomplete(this.searchRegionElementRef.nativeElement, {
        types: ['(regions)'],
        componentRestrictions: {
          country: 'es'
        }
      });
      const autocompleteAddress = new google.maps.places.Autocomplete(this.searchAddressElementRef.nativeElement, {
        types: ['address'],
        componentRestrictions: {
          country: 'es'
        }
      });
      autocompleteRegion.addListener('place_changed', () => {
        this.ngZone.run(() => {
          this.loading = true;

          // get the place result
          const place: google.maps.places.PlaceResult = autocompleteRegion.getPlace();

          // verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          this.searchAddressElementRef.nativeElement.value = '';

          console.log(place);
          this.publicPlace = place;
          // set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 12;

          this.getPlace(this.latitude, this.longitude);
        });
      });

      autocompleteAddress.addListener('place_changed', () => {
        this.ngZone.run(() => {
          this.loading = true;

          // get the place result
          const place: google.maps.places.PlaceResult = autocompleteAddress.getPlace();

          // verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          this.searchRegionElementRef.nativeElement.value = '';

          console.log(place);
          this.publicPlace = place;
          // set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 12;

          this.getPlace(this.latitude, this.longitude);
        });
      });
    });
  }

  mapClicked($event: MouseEvent) {
    this.latitude = $event['coords'].lat;
    this.longitude = $event['coords'].lng;
    this.zoom = 12;
    this.getPlace(this.latitude, this.longitude);
  }

  private setCurrentPosition() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
        this.getPlace(this.latitude, this.longitude);
      });
    } else {
      console.log('No hay acceso a la geolocalización');
    }
    this.loading = false;
  }

  getGeoLocation() {
    if ('geolocation' in navigator) {
        const options = { enableHighAccuracy: true };
        navigator.geolocation.getCurrentPosition(position => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.zoom = 12;
          this.getPlace(this.latitude, this.longitude);
        }, error => {
          console.log(error);
        }, options);
    } else {
      console.log('No hay acceso a la geolocalización');
    }
  }

  private getPlace(latitude, longitude) {
    this.mapsAPILoader.load().then(() => {
      const geocoder = new google.maps.Geocoder();
      const latlng = new google.maps.LatLng(latitude, longitude);
      const request = { location: latlng };

      geocoder.geocode(request, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          console.log(results);
          if (results[0] !== null) {
            this.getAddressComponentByPlace(results[0]);
          } else {
            alert('No address available');
          }
        }
        this.loading = false;
      });
    });
  }

  private getAddressComponentByPlace(place) {
    const components = place.address_components;
    this.formatted_address = place.formatted_address;

    ['country', 'sCountry', 'state', 'sState', 'province',
     'postalCode', 'streetNumber', 'route', 'locality'].forEach(variable => {
      this[variable] = null;
    });

    for (let i = 0, component; component = components[i]; i++) {
      console.log(component);
      if (component.types[0] === 'country') {
        this.sCountry = component['short_name'];
        this.country = component['long_name'];
      }
      if (component.types[0] === 'administrative_area_level_1') {
          this.state = component['long_name'];
          this.sState = component['short_name'];
      }
      if ( component.types[0] === 'administrative_area_level_2') {
        this.province = component['long_name'];
      }
      if (component.types[0] === 'postal_code') {
          this.postalCode = component['short_name'];
      }
      if (component.types[0] === 'street_number') {
          this.streetNumber = component['short_name'];
      }
      if (component.types[0] === 'route') {
          this.route = component['long_name'];
      }
      if (component.types[0] === 'locality') {
          this.locality = component['short_name'];
      }
    }
  }
}

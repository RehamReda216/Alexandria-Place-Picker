import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  isFetching = signal(false);
  places = signal<Place[] | undefined>(undefined);
  error= signal('');
  private placeService = inject(PlacesService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(){
      this.isFetching.set(true);
      const subscription =this.placeService.loadAvailablePlaces().
      subscribe({
      //   next: (response) => {
      //       console.log(response.body?.places)
      //   },
          next: (places) => {
            this.places.set(places)
          },
          error: (error:Error)=>{
              this.error.set(error.message)
          },
          complete: ()=>{
            this.isFetching.set(false)
          }
          // next: (event) => {
          //   console.log(event)
          // },
      });

      this.destroyRef.onDestroy(()=>{
        subscription.unsubscribe();
      })
      
    }
    onSelectPlace(selectedPlace:Place){
      const subscription = this.placeService.addPlaceToUserPlaces(selectedPlace).subscribe((responseData)=>{
        console.log(responseData)
      })
      this.destroyRef.onDestroy(()=>{
        subscription.unsubscribe();
      })
    }
}

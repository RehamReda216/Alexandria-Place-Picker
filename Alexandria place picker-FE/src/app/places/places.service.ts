import { DestroyRef, inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private errorService = inject(ErrorService)
  private userPlaces = signal<Place[]>([]);
  isFetching = signal(false);
  places = signal<Place[] | undefined>(undefined);
  error= signal('');
  private httpclient = inject(HttpClient);
  private destroyRef = inject(DestroyRef)

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchImages(
      'https://alexandria-place-picker-be-production.up.railway.app/places','Something went wrong during fetching available places data...'
    )
  }

  loadUserPlaces() {
    return this.fetchImages(
      'https://alexandria-place-picker-be-production.up.railway.app/user-places','Something went wrong during fetching user places data...'
    ).pipe(tap(
      (userplaces)=> this.userPlaces.set(userplaces)
    ))
  }

  addPlaceToUserPlaces(place:Place) {
    const prevPlaces = this.userPlaces();
    if(!prevPlaces.some((p)=>p.id === place.id)){
      this.userPlaces.set([...prevPlaces,place])
    }
    return this.httpclient.put('https://alexandria-place-picker-be-production.up.railway.app/user-places',{
      placeId:place.id
    }).pipe(
      catchError((error)=>{
        this.userPlaces.set(prevPlaces);
        this.errorService.showError('Failed to store selected place.')
        return throwError(()=> new error('Failed to store selected place.'))
      })
  )
  }

  removeUserPlace(place: Place) {
    const prevPlaces = this.userPlaces();
    if(prevPlaces.some((p)=>p.id === place.id)){
      this.userPlaces.set(prevPlaces.filter(p => p.id !== place.id));
    }
    return this.httpclient.delete<{places:Place[]}>('https://alexandria-place-picker-be-production.up.railway.app/user-places' + place.id).pipe(
      catchError((error)=>{
        this.userPlaces.set(prevPlaces);
        this.errorService.showError('Failed to remove selected place.')
        return throwError(()=> new error('Failed to remove selected place.'))
      })
    )
  }

  private fetchImages(url:string,errorMessage:string){
    return this.httpclient.get<{places:Place[]}>(url).pipe(
      map((responseData)=> responseData.places),
      catchError((error)=>{
        console.log(error);
        return throwError(()=> new error(errorMessage))
      }
    ))   
  }
}

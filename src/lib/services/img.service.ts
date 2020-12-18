import {Inject, Injectable, InjectionToken} from '@angular/core';
import {SafeUrl} from '@angular/platform-browser';

export const IMAGE_SERVICE_CONFIG = new InjectionToken('ImgServiceConfig');

@Injectable({
  providedIn: 'any'
})
export class ImgService {
  imageNotFound: SafeUrl;
  loadingImage: SafeUrl;

  constructor(
    @Inject(IMAGE_SERVICE_CONFIG) imgService,
  ) {
    Object.assign(this, imgService);
  }
}

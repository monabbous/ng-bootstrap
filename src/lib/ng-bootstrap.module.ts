import {ModuleWithProviders, NgModule} from '@angular/core';
import {ImageInputComponent} from './components/image-input/image-input.component';
import {ImageGalleryComponent} from './components/image-gallery/image-gallery.component';
import {CommonModule} from '@angular/common';
import {PopoverDirective} from './directives/popover.directive';
import {AdvanceInputDirective} from './directives/advance-input.directive';
import {BreadcrumbsComponent} from './components/breadcrumbs/breadcrumbs.component';
import {RouterModule} from '@angular/router';
import {ImgDirective} from './directives/img.directive';
import {DomSanitizer} from '@angular/platform-browser';
import {PaginationComponent} from './components/pagination/pagination.component';
import {NgFormQueryParamsDirective} from './directives/ng-form-query-params.directive';
import {FormsModule} from '@angular/forms';
import {LoadingDirective} from './directives/loading.directive';
import {NG_MODEL_ERROR_MAPPER, NgModelErrorMessageDirective} from './directives/ng-model-error-message.directive';
import {Observable} from 'rxjs';
import {IMAGE_SERVICE_CONFIG} from './services/img.service';
import {AdvancedOptionComponent, AdvancedSelectComponent} from './components/advanced-select/advanced-select.component';
import {StartRatingComponent} from './components/start-rating/start-rating.component';


@NgModule({
  declarations: [ImageInputComponent, ImageGalleryComponent],
  imports: [
    CommonModule,
  ],
  exports: [ImageInputComponent, ImageGalleryComponent],
})
export class ImageInputComponentsModule {
}

@NgModule({
  declarations: [PopoverDirective],
  imports: [CommonModule],
  exports: [PopoverDirective],
})
export class PopoverModule {
}

// @dynamic
@NgModule({
  declarations: [ImgDirective],
  imports: [CommonModule],
  exports: [ImgDirective],
})
export class ImgModule {
  static forRoot(options: {
    defaultErrorImage?: string | boolean,
    defaultThumbnailImage?: string | boolean,
  }): ModuleWithProviders<ImgModule> {
    return ({
      ngModule: ImgModule,
      providers: [
        {
          provide: IMAGE_SERVICE_CONFIG,
          useFactory: (sanitizer: DomSanitizer) => {
            const imgService: {
              imageNotFound: any;
              loadingImage: any;
            } = {
              imageNotFound: '',
              loadingImage: '',
            };
            if (typeof options?.defaultErrorImage === 'string') {
              imgService.imageNotFound = sanitizer.bypassSecurityTrustUrl(options.defaultErrorImage);
            } else if (options?.defaultErrorImage) {
              imgService.imageNotFound = sanitizer.bypassSecurityTrustUrl(`data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 24.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3Csvg version='1.1' id='Layer_1' focusable='false' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 512 512' style='enable-background:new 0 0 512 512;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23AFAFAF;%7D%0A%3C/style%3E%3Cg transform='scale(0.8)' transform-origin='center'%3E%3Cpath class='st0' d='M46.3,448l48-48H54c-3.3,0-6-2.7-6-6V118c0-3.3,2.7-6,6-6h328.3l48-48H48C21.5,64,0,85.5,0,112v288 C0,425.9,20.6,447.1,46.3,448z'/%3E%3Cpolygon class='st0' points='416,352 416,272 347.3,203.3 198.7,352 '/%3E%3Cpath class='st0' d='M482.8,67.8L438.7,112H458c3.3,0,6,2.7,6,6v276c0,3.3-2.7,6-6,6H150.7l-48,48H464c26.5,0,48-21.5,48-48V112 C512,92.2,500,75.2,482.8,67.8z'/%3E%3Ccircle class='st0' cx='128' cy='192' r='40'/%3E%3Cpath class='st0' d='M135.5,264.5L96,304v48h46.3l48.9-48.9l-38.7-38.7C147.8,259.8,140.2,259.8,135.5,264.5z'/%3E%3Cg%3E%3Cpath class='st0' d='M56.1,480.4c-3.6,0-7.1-1.4-9.9-4.1c-5.5-5.5-5.5-14.3,0-19.7L460,42.7c5.5-5.5,14.3-5.5,19.7,0 c5.5,5.5,5.5,14.3,0,19.7L66,476.3C63.2,479,59.7,480.4,56.1,480.4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A`);
            }
            if (typeof options?.defaultThumbnailImage === 'string') {
              imgService.loadingImage = sanitizer.bypassSecurityTrustUrl(options.defaultThumbnailImage);
            } else if (options?.defaultThumbnailImage) {
              imgService.loadingImage = sanitizer.bypassSecurityTrustUrl(`data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 24.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3Csvg version='1.1' id='Layer_1' focusable='false' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 512 512' style='enable-background:new 0 0 512 512;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23AFAFAF;%7D%0A%3C/style%3E%3Ccircle transform='scale(0.8)' transform-origin='center' class='st0' cx='256' cy='256' r='256'%3E%3Canimate attributeName='r' values='0;256' dur='1s' repeatCount='indefinite'/%3E%3Canimate attributeName='opacity' values='1;0' dur='1s' repeatCount='indefinite'/%3E%3C/circle%3E%3C/svg%3E%0A`);
            }
            return imgService;
          },
          deps: [DomSanitizer],
        }
      ],
    });
  }
}

@NgModule({
  declarations: [StartRatingComponent],
  imports: [CommonModule, FormsModule],
  exports: [StartRatingComponent],
})
export class StarRatingModule {
}

@NgModule({
  declarations: [AdvanceInputDirective],
  imports: [CommonModule],
  exports: [AdvanceInputDirective],
})
export class AdvanceInputModule {
}

@NgModule({
  declarations: [LoadingDirective],
  imports: [CommonModule],
  exports: [LoadingDirective],
})
export class LoadingModule {
}

// @dynamic
@NgModule({
  declarations: [NgModelErrorMessageDirective],
  imports: [CommonModule],
  exports: [NgModelErrorMessageDirective],
})
export class NgModelErrorMessageModule {
  static forRoot({errorMapper}: { errorMapper: (errors) => Observable<string | string[]> }):
    ModuleWithProviders<NgModelErrorMessageModule> {
    return {
      ngModule: NgModelErrorMessageModule,
      providers: [
        {provide: NG_MODEL_ERROR_MAPPER, useValue: errorMapper}
      ]
    };
  }
}

@NgModule({
  declarations: [NgFormQueryParamsDirective],
  imports: [CommonModule, FormsModule, RouterModule],
  exports: [NgFormQueryParamsDirective],
})
export class NgFormQueryParamsModule {
}

@NgModule({
  declarations: [BreadcrumbsComponent],
  imports: [CommonModule, RouterModule],
  exports: [BreadcrumbsComponent],
})
export class BreadcrumbsModule {
}

@NgModule({
  declarations: [PaginationComponent],
  imports: [CommonModule, RouterModule],
  exports: [PaginationComponent],
})
export class PaginationModule {
}

@NgModule({
  declarations: [AdvancedSelectComponent, AdvancedOptionComponent],
  imports: [PopoverModule, FormsModule, CommonModule],
  exports: [AdvancedSelectComponent, AdvancedOptionComponent],
})
export class AdvancedSelectModule {
}

@NgModule({
  imports: [
    CommonModule,
    ImageInputComponentsModule,
    AdvanceInputModule,
    PopoverModule,
    BreadcrumbsModule,
    PaginationModule,
    ImgModule,
    NgFormQueryParamsModule,
    LoadingModule,
  ],
  exports: [
    ImageInputComponentsModule,
    AdvanceInputModule,
    PopoverModule,
    BreadcrumbsModule,
    PaginationModule,
    ImgModule,
    NgFormQueryParamsModule,
    LoadingModule,
  ]
})
export class NgBootstrapModule {
}



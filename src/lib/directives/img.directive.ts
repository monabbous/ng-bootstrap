import {Attribute, Directive, ElementRef, HostBinding, Input} from '@angular/core';
import {TriggerOnViewportService} from '../services/trigger-on-viewport.service';
import {ImgService} from '../services/img.service';
import {SafeUrl} from '@angular/platform-browser';

type status = 'loading' | 'loaded' | 'error';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'img'
})
export class ImgDirective {

  constructor(
    public elementRef: ElementRef<HTMLImageElement>,
    public triggerOnViewportService: TriggerOnViewportService,
    public imgService: ImgService,
  ) {
  }

  status: status;
  private originalSrc: any;
  private image: HTMLImageElement;

  @HostBinding('src') src;

  @Attribute('loadingStrategy') @Input() loadingStrategy: 'lazy' | 'eager' = 'lazy';

  thumbnailSrcValue: SafeUrl | string = this.imgService.loadingImage;

  @Attribute('thumbnailSrc') @Input('thumbnailSrc') set thumbnailSrc(src) {
    this.thumbnailSrcValue = src;
    if (this.status === 'loading') {
      this.src = src as string;
    }
  }

  get thumbnailSrc() {
    return this.thumbnailSrcValue;
  }

  errorSrcValue: SafeUrl | string = this.imgService.imageNotFound;

  @Attribute('errorSrc') @Input('errorSrc') set errorSrc(src) {
    this.errorSrcValue = src;
    if (this.status === 'error') {
      this.src = src as string;
    }
  }

  get errorSrc() {
    return this.errorSrcValue;
  }

  @Attribute('src') @Input('src') set source(src) {
    this.originalSrc = src;
    this.image = new Image();
    this.image.remove();
    this.image.onload = () => {
      this.status = 'loaded';
      this.src = this.originalSrc;
      this.image.remove();
    };
    this.image.onerror = () => {
      this.status = 'error';
      this.src = (this.errorSrc || this.thumbnailSrc) as string;
      this.image.remove();
    };


    this.status = 'loading';
    if (this.thumbnailSrc) {
      this.src = this.thumbnailSrc as string;
    }

    if (this.loadingStrategy === 'eager') {
      this.image.src = src;
    } else if (this.loadingStrategy === 'lazy') {
      this.triggerOnViewportService.addElement({
        element: this.elementRef.nativeElement, callback: () => this.image.src = this.originalSrc});
    }
  }
}

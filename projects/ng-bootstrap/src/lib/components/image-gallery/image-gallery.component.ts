import {Component, EventEmitter, forwardRef, HostBinding, Input, OnDestroy, Output} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BehaviorSubject, OperatorFunction} from 'rxjs';
import {ImageInputValue} from '../image-input/image-input.component';

export class GalleryImageValue extends ImageInputValue {
  sort: number;
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ImageGalleryComponent),
    multi: true
  }]
})
export class ImageGalleryComponent implements OnDestroy, ControlValueAccessor {

  @HostBinding('class.disabled') @Input() disabled = false;
  @HostBinding('class.form-control') bootstrap = true;

  @Output() valueChange = new BehaviorSubject<GalleryImageValue[]>(this.value);
  @Output() delete = new EventEmitter<{deleted: GalleryImageValue, index: number, images: GalleryImageValue[]}>();

  @Input() imageInputModifier: OperatorFunction<GalleryImageValue, any>;

  randomId = btoa(Math.random().toString());
  index = -1;

  originalValue: GalleryImageValue[] = [
    // {
    //   src: 'https://source.unsplash.com/random',
    //   sort: 0
    // },
    // {
    //   src: 'https://source.unsplash.com/random',
    //   sort: 1
    // },
    // {
    //   src: 'https://source.unsplash.com/random',
    //   sort: 2
    // },
    // {
    //   src: 'https://source.unsplash.com/random',
    //   sort: 2
    // },
  ];

  selected: GalleryImageValue;
  htmlElementObserver: MutationObserver;
  dir = 'ltr';

  set value(value) {
    if (this.disabled) {
      return;
    }

    this.originalValue = value.sort((a, b) => a.sort - b.sort);
    this.onChangeFn(value);
    this.valueChange.next(value);

    if (!this.selected && value.length) {
      this.selected = this.originalValue[0];
    }
  }

  get value() {
    return this.originalValue;
  }


  constructor() {
    const targetNode = window.document.documentElement;

    const config = {attributes: true, childList: false, subtree: false};

    const callback = (mutationsList, observer) => {
      // Use traditional 'for loops' for IE 11
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes') {
          this.dir = targetNode.getAttribute('dir') || 'ltr';
        }
      }
    };

    this.htmlElementObserver = new MutationObserver(callback);

    this.htmlElementObserver.observe(targetNode, config);
  }


  onChangeFn = (x: GalleryImageValue[]) => null;

  ngOnDestroy(): void {
    this.htmlElementObserver.disconnect();
  }

  registerOnChange(fn: (x: GalleryImageValue[]) => any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
  }

  writeValue(obj: GalleryImageValue[]): void {
    if (!obj) {
      return;
    }
    this.originalValue = obj.sort((a, b) => a.sort - b.sort);

    if (!this.selected && obj.length) {
      this.selected = this.originalValue[0];
    }
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  newImage($event: ImageInputValue) {
    if (!$event) {
      return;
    }
    const newImage = {...$event, sort: this.value.length};
    this.originalValue.push(newImage);
    this.value = this.originalValue;

    this.selected = newImage;
  }

  deleteImage(index) {
    this.delete.next({index, images: this.originalValue, deleted: this.originalValue[index]});
    delete this.originalValue[index];
    for (let i = index; i < this.originalValue.length - 1; i++) {
      this.originalValue[i] = this.originalValue[i + 1];
      this.originalValue[i].sort = i;
    }
    if (this.value.length) {
      if (index > 0) {
        this.selected = this.originalValue[index];
      } else {
        this.selected = this.originalValue[index - 1];
      }
    } else {
      this.selected = null;
    }

    this.originalValue.splice(this.originalValue.length - 1, 1);
    this.value = this.originalValue;
  }

  swapImages(aIndex, bIndex) {
    if (!this.originalValue[aIndex] || !this.originalValue[bIndex]) {
      return;
    }
    const temp = this.originalValue[aIndex];
    this.originalValue[aIndex] = this.originalValue[bIndex];
    this.originalValue[bIndex] = temp;
    for (let i = 0; i < this.originalValue.length; i++) {
      this.originalValue[i].sort = i;
    }
  }
}

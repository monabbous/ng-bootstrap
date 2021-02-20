import {Component, ElementRef, forwardRef, HostBinding, Input, OnInit, Output} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BehaviorSubject, of, OperatorFunction} from 'rxjs';
import {finalize, take} from 'rxjs/operators';

export class ImageInputValue {
  id: string;
  src: string | ArrayBuffer;
  blob?: Blob | File;
  value?: any;
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'image-input',
  templateUrl: './image-input.component.html',
  styleUrls: ['./image-input.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ImageInputComponent),
    multi: true
  }]
})
export class ImageInputComponent implements OnInit, ControlValueAccessor {
  randomId = btoa(Math.random().toString());
  @HostBinding('class.form-control') bootstrap = true;
  @HostBinding('class.dragging-over') draggedOver = false;

  @HostBinding('class.has-image') get hasImage() {
    return !!this.value;
  }

  @HostBinding('class.disabled') @Input() disabled = false;
  @HostBinding('class.interactive') @Input() interactive = true;

  bgImage = '';


  originalValue: ImageInputValue;

  @Input() set placeholderValue(value: ImageInputValue) {
    this.originalValue = value;
    if (value && value.src) {
      this.bgImage = `url(${value.src})`;
    } else {
      this.bgImage = '';
    }
  }

  @Input() set value(value) {
    if (this.disabled) {
      return;
    }
    if (this.modifier) {
      this.disabled = true;
      of(value)
        .pipe(
          this.modifier,
          take(1),
          finalize(() => {
            this.disabled = false;
          })
        )
        .subscribe(v => {
          this.disabled = false;
          this.originalValue = v;
          this.onChangeFn(v);
          this.valueChange.next(v);
          this.bgImage = `url(${v.src})`;
        });
      return;
    }

    this.originalValue = value;
    this.onChangeFn(value);
    this.valueChange.next(value);
    this.bgImage = `url(${value.src})`;
  }

  get value() {
    return this.originalValue;
  }

  @Output() valueChange = new BehaviorSubject<ImageInputValue>(this.value);

  @Input() modifier: OperatorFunction<ImageInputValue, any>;

  constructor(
    public elementRef: ElementRef,
  ) {
  }

  onChangeFn = (x: ImageInputValue) => null;

  ngOnInit(): void {
  }

  registerOnChange(fn: (x: ImageInputValue) => any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
  }

  writeValue(obj: ImageInputValue): void {
    if (this.disabled || !obj) {
      return;
    }
    this.originalValue = obj;
    this.bgImage = `url(${obj.src})`;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  fileChange($event: Event | DragEvent) {
    const target = ($event.target) as HTMLInputElement;
    const files = (target.files || ($event as DragEvent).dataTransfer.files) as FileList;
    if (files.length) {
      const reader = new FileReader();
      reader.onload = () => {
        const value = new ImageInputValue();
        value.blob = files.item(0);
        value.src = reader.result;
        value.id = btoa(Math.random().toString());
        this.value = value;
        target.value = null;
      };

      reader.readAsDataURL(files.item(0));
    } else {
      // this.hasImage = false;
      // this.value = {};
    }
  }
}

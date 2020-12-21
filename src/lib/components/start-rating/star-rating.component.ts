import {Component, forwardRef, HostBinding, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StarRatingComponent),
      multi: true
    }
  ]
})
export class StarRatingComponent implements OnInit, ControlValueAccessor {
  @HostBinding('class.form-control') bootstrap = true;
  disabled = false;

  touchedValue = false;

  set touched(touched) {
    this.touchedValue = touched;
    this.registerTouched();
  }

  get touched() {
    return this.touchedValue;
  }

  @Input() readOnly = false;
  allowZeroValue = false;

  @Input() set allowZero(allowZero) {
    if (!this.touched) {
      if (allowZero) {
        this.rangeValueValue = 0;
      } else {
        this.rangeValueValue = this.halfStarValue ? 0.5 : 1;
      }
    }
    this.allowZeroValue = allowZero;
  }

  get allowZero() {
    return this.allowZeroValue;
  }

  halfStarValue = false;

  @Input() set halfStar(halfStar) {
    if (!this.touched) {
      if (!this.allowZero) {
        this.rangeValueValue = halfStar ? 0.5 : 1;
      }
    }
    this.halfStarValue = halfStar;
  }

  get halfStar() {
    return this.halfStarValue;
  }

  rangeValueValue;

  set rangeValue(value) {
    this.touched = true;
    this.rangeValueValue = Math.max(Math.min(5, value), this.defaultRangeValue);
    this.onChange(this.rangeValueValue);
  }

  get rangeValue() {
    return +this.rangeValueValue || this.defaultRangeValue;
  }

  get defaultRangeValue() {
    return this.allowZero ? 0 : this.halfStarValue ? 0.5 : 1;
  }

  get fullStars() {
    return new Array(Math.floor(this.rangeValue)).fill(0);
  }

  get hasHalfStar() {
    return this.rangeValue * 10 % 10 >= 5;
  }

  get emptyStars() {
    return new Array(5 - (Math.floor(this.rangeValue)) - (this.hasHalfStar ? 1 : 0)).fill(0);
  }

  constructor() {
  }

  onChange = (value) => null;
  registerTouched = () => null;

  ngOnInit(): void {
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.registerTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(value: number): void {
    this.rangeValue = value;
  }

}

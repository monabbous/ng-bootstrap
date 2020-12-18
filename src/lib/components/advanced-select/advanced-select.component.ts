import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  forwardRef,
  Host,
  HostBinding,
  Input,
  OnDestroy,
  Output,
  QueryList,
  ViewChild
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {PopoverDirective} from '../../directives/popover.directive';
import {BehaviorSubject, fromEvent, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';

type AdvancedSelectOptionValue = any;

interface AdvancedSelectOptionInterface {
  value: AdvancedSelectOptionValue;
  label: string;
  selectedStateLabel?: string;
}


function compareOptionValues(a: AdvancedSelectOption, b: AdvancedSelectOption) {
  let aValue;
  let bValue;
  // if (typeof a === 'string' || typeof a === 'number') {
  //   if (typeof b === 'string' || typeof b === 'number' ? b === a : b.value === a) {
  //     return true;
  //   }
  // } else {
  //   if (typeof b === 'string' || typeof b === 'number' ? b === a.value : b.value === a.value) {
  //     return true;
  //   }
  // }
  // return false
  aValue = typeof a === 'string' || typeof a === 'number' ? a : a.value;
  aValue = btoa(unescape(encodeURIComponent(JSON.stringify(aValue))));
  bValue = typeof b === 'string' || typeof b === 'number' ? b : b.value;
  bValue = btoa(unescape(encodeURIComponent(JSON.stringify(bValue))));

  return aValue === bValue;
}

export type AdvancedSelectOption = AdvancedSelectOptionInterface | AdvancedSelectOptionValue;


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'advanced-option',
  template: `
    <div #content [class.d-none]="!content.childNodes.length">
      <ng-content></ng-content>
    </div>
    <div [innerHTML]="label" *ngIf="!content.childNodes.length"></div>
  `,
  styles: [
      `
      :host {
        cursor: pointer;
        position: relative;
        word-break: break-word;
      }

      * {
        position: relative;
        z-index: 0;
      }

      :host::before {
        position: absolute;
        content: '';
        top: 0;
        left: 0;
        /*width: 100%;*/
        /*height: 100%;*/
        z-index: 1;
      }

      :host::before ~ * {
        position: relative;
        z-index: 0;
      }

      :host.selected:before {
        content: '\\f14a';
        font-family: 'Font Awesome 5 Free';
        padding: 0.3em;
      }

      :host.highlighted {
        z-index: 30;
        transform-origin: center center;
        /*background-color: #eee;*/
        box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.2);
      }

    `
  ]
})
export class AdvancedOptionComponent implements AfterContentInit, OnDestroy {

  index = null;

  @HostBinding('class') class = 'dropdown-item';
  valueValue: AdvancedSelectOption;

  @Input() set value(value) {
    this.valueValue = value;
    this.updateState();
  }

  get value() {
    return this.valueValue;
  }

  @HostBinding('class.highlighted') highlighted;
  @HostBinding('class.active') @HostBinding('class.selected') selected;

  private ngDestroy$ = new Subject();

  constructor(
    @Host() public parent: AdvancedSelectComponent,
    public elementRef: ElementRef<HTMLElement>,
  ) {
  }

  get label() {
    const label =
      typeof this.value === 'string' || typeof this.value === 'number' ?
        this.value : this.value.label || this.value.value;
    return `${label}`;
  }

  ngAfterContentInit(): void {

    this.updateState();

    let mousedown = false;

    fromEvent(this.elementRef.nativeElement, 'mousedown')
      .pipe(
        takeUntil(this.ngDestroy$),
        filter((event: MouseEvent) => !mousedown && event.button === 0),
      )
      .subscribe(() => {
        mousedown = true;
        this.selected = this.parent.selectValue(this.value);
      });

    fromEvent(window, 'mouseup', {capture: true})
      .pipe(
        takeUntil(this.ngDestroy$),
        filter((event) => mousedown),
      )
      .subscribe(() => {
        mousedown = false;
      });

    this.parent.highlightedOptionIndex$
      .pipe(
        takeUntil(this.ngDestroy$),
      )
      .subscribe(index => {
        if (this.index === index) {
          this.highlighted = true;
          this.elementRef.nativeElement.scrollIntoView();
        } else {
          this.highlighted = false;
        }
      });
  }

  updateState() {
    const index = this.parent.advancedOptionComponents.findIndex(option => compareOptionValues(this.value, option.value));
    if (index > -1) {
      this.parent.advancedOptionComponents[index] = this;
      this.index = index;
    } else {
      this.index = this.parent.advancedOptionComponents.length;
      this.parent.advancedOptionComponents.push(this);
    }


    this.selected = !!this.parent.valueAsArray.find(value => compareOptionValues(this.value, value));
  }

  ngOnDestroy(): void {
    this.ngDestroy$.next();
    // this.parent.advancedOptionComponents.splice(this.index, 1);
  }

}


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'advanced-select',
  templateUrl: './advanced-select.component.html',
  styleUrls: ['./advanced-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AdvancedSelectComponent),
      multi: true
    }
  ]
})
export class AdvancedSelectComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {

  private ngDestroy$ = new Subject();

  public advancedOptionComponents: AdvancedOptionComponent[] = [];
  highlightedOptionIndex$ = new BehaviorSubject(-1);
  @ContentChildren(AdvancedOptionComponent) optionsComponentList: QueryList<AdvancedOptionComponent>;

  @Input() set multiple(multiple) {
    if (this.multipleValue === multiple) {
      return;
    }
    this.multipleValue = multiple;

    if (this.value) {
      if (multiple && !Array.isArray(this.value)) {
        this.value = [this.value];
      } else if (Array.isArray(this.value)) {
        this.value = this.value.shift();
      }
    } else if (multiple) {
      this.value = [];
    }
  }

  get multiple() {
    return this.multipleValue;
  }

  @Input() queryEnabled = false;
  @Input() arrow = true;

  @Input() set query(query) {
    if (query) {
      this.highlightedOptionIndex$.next(0);
    }
    this.queryValue = query;
    this.queryChange.emit(query);
  }

  get query() {
    return this.queryValue;
  }

  @Input() set value(value: AdvancedSelectOption | AdvancedSelectOption[]) {
    if (value) {
      if (this.multiple) {
        if (Array.isArray(value)) {
          this.valueValue = value;
        } else {
          this.valueValue = [value];
        }
      } else {
        if (Array.isArray(value)) {
          this.valueValue = value.shift();
        } else {
          this.valueValue = value;
        }
      }
    } else {
      this.valueValue = this.multiple ? [] : undefined;
    }
    this.updateModel();
    this.valueChange.emit(this.value);
  }

  get value(): AdvancedSelectOption | AdvancedSelectOption[] {
    return this.valueValue;
  }

  get valueAsArray(): AdvancedSelectOption[] {
    if (!this.value) {
      return [];
    }
    return Array.isArray(this.value) ? this.value : [this.value];
  }

  get valueAsOne(): AdvancedSelectOption {
    return Array.isArray(this.value) ? this.value.shift() : this.value;
  }

  constructor(
    public elementRef: ElementRef<HTMLElement>
  ) {
  }

  @HostBinding('class.input-group') @HostBinding('class.form-control') bootstrap = true;
  @ViewChild('popover') popover: PopoverDirective;
  @ViewChild('inputElement') inputElement: ElementRef<HTMLInputElement>;

  queryValue: string;
  @Output() queryChange = new EventEmitter<string>();

  // @Input() options: AdvancedSelectOption[] = [];

  @Input() options: AdvancedSelectOption[];


  @Input() uniqueValues = true;

  multipleValue = false;

  valueValue: AdvancedSelectOption | AdvancedSelectOption[];
  @Output() valueChange = new EventEmitter<AdvancedSelectOption | AdvancedSelectOption[]>();

  selectValue(option: AdvancedSelectOption) {
    let selected = false;
    if (this.multiple) {
      const index = this.valueAsArray.findIndex(value => compareOptionValues(value, option));

      if (index === -1 || !this.uniqueValues) {
        this.valueAsArray.push(option);
        selected = true;
      } else {
        this.valueAsArray.splice(index, 1);
      }
      setTimeout(() => this.inputElement.nativeElement.focus(), 100);
    } else {
      selected = true;
      this.value = option;
      this.popover.hide();
    }
    this.updateModel();
    return selected;
  }

  deselectValue(value: AdvancedSelectOption) {
    if (this.multiple) {
      const index = this.valueAsArray.findIndex(v => compareOptionValues(value, v));
      if (index !== -1) {
        this.valueAsArray.splice(index, 1);
      }
      if (this.popover.popover.show) {
        setTimeout(() => this.inputElement.nativeElement.focus());
      }

    } else {
      this.value = undefined;
    }

    const component = this.advancedOptionComponents.find(option => compareOptionValues(value, option.value));
    if (component) {
      component.selected = false;
    }
    this.updateModel();
  }

  updateModel() {
    if (this.multiple) {
      this.onChange(this.valueAsArray.map(v => typeof v === 'string' || typeof v === 'number' ? v : v.value));
    } else {
      this.onChange(typeof this.valueAsOne === 'string' || typeof this.valueAsOne === 'number' ? this.valueAsOne : this.valueAsOne?.value);
    }
    setTimeout(() => this.popover.popover.updatePopOverPosition(), 50);
  }

  getSelectedLabel(option: AdvancedSelectOption) {
    const label =
      typeof option === 'string' || typeof option === 'number' ? option : option.selectedStateLabel || option.label || option.value;
    return `${label}`;
  }

  onChange = (value): any => null;

  ngAfterViewInit(): void {
    fromEvent(window, 'click')
      .pipe(
        takeUntil(this.ngDestroy$),
      )
      .subscribe((event) =>
        !(this.elementRef.nativeElement.contains(event.target as Node)) &&
        !(this.popover.popover.element.contains(event.target as Node)) ?
          this.popover.hide()
          : null
      );
    this.optionsComponentList.changes
      .pipe(
        takeUntil(this.ngDestroy$)
      )
      .subscribe(() => {
        this.advancedOptionComponents = this.optionsComponentList.toArray();
        this.advancedOptionComponents.forEach((component, index) => component.index = index);
        this.highlightedOptionIndex$.next(-1);
      });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  writeValue(value: AdvancedSelectOptionValue | AdvancedSelectOptionValue[]): void {
    if ([null, undefined, ''].includes(value)) {
      this.value = this.multiple ? [] : undefined;
    } else if (this.multiple && !Array.isArray(value)) {
      this.value = [value];
    } else if (Array.isArray(value)) {
      this.value = [...value].shift();
    } else {
      this.value = value;
    }

    this.advancedOptionComponents.forEach(component => component.updateState());
  }

  ngOnDestroy(): void {
    this.ngDestroy$.next();
  }

  enter() {
    const option = this.advancedOptionComponents[this.highlightedOptionIndex$.value];
    if (option) {
      this.advancedOptionComponents[this.highlightedOptionIndex$.value].selected =
        this.selectValue(this.advancedOptionComponents[this.highlightedOptionIndex$.value].value);
      this.inputElement.nativeElement.blur();
    }
  }


  backspace() {
    if (this.query) {
      return true;
    }
    const value = this.valueAsArray[this.valueAsArray.length - 1];
    this.deselectValue(value);
  }


  moveIndex(amount) {
    // if (this.advancedOptionComponents[this.highlightedOptionIndex$]) {
    //   this.advancedOptionComponents[this.highlightedOptionIndex$].highlighted = false;
    // }
    this.highlightedOptionIndex$.next(
      Math.min(this.advancedOptionComponents.length - 1, Math.max(-1, this.highlightedOptionIndex$.value + amount)));
    // const component = this.advancedOptionComponents[this.highlightedOptionIndex$];
    // if (component) {
    //   component.highlighted = true;
    //   component.elementRef.nativeElement.scrollIntoView();
    // }
    return;
  }

  onFocus() {
    this.popover.show();
    setTimeout(() => {
      if (window.innerHeight <= 400) {
        this.inputElement.nativeElement.scrollIntoView({behavior: 'smooth'});
      }
    }, 600);
  }

  eventHandle(event: Event) {
    event.preventDefault();
  }

  onArrowClick() {
    if (this.popover.popover.show) {
      this.popover.hide();
    } else {
      this.popover.show();
    }
  }
}


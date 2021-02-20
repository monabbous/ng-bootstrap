import {
  AfterContentInit,
  Attribute,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  Renderer2,
  Self
} from '@angular/core';
import {NgModel} from '@angular/forms';
import {Subject} from 'rxjs';
import {distinctUntilChanged, map, takeUntil} from 'rxjs/operators';
import {pressAndHoldEventInit} from '../events/press-and-hold.event';
import {escapeRegExp} from 'lodash';

type InputType = 'tel' | 'text' | 'number';
const numberRegex = /(?:[-+]?\d+\.?\d*)|[\s-+*/]/g;

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'input[advanceInput]',
})
export class AdvanceInputDirective implements AfterContentInit, OnDestroy {
  private backspace: boolean;

  constructor(
    @Self() public model: NgModel,
    private elementRef: ElementRef<HTMLInputElement>,
    private renderer: Renderer2,
  ) {
    this.model.valueAccessor.registerOnChange = function registerOnChange(fn) {
      this.onChange = fn;
    };
  }

  @Attribute('type') @Input() set type(type: InputType) {
    this.typeValue = type;
    if (this.element) {
      this.element.type = 'text';
    }
  }

  @Attribute('prefix') @Input() set prefix(prefix: string) {
    this.prefixValue = prefix;
  }

  @Attribute('suffix') @Input() set suffix(suffix: string) {
    this.suffixValue = suffix;
  }

  @Attribute('controls') @Input() set controls(controls: boolean) {
    this.controlsValue = controls;
    if (this.typeValue === 'number') {
      if (this.controlsValue && this.element) {
        this.initializeControls();
      } else {
        this.incrementElement?.remove();
        this.decrementElement?.remove();
      }
    }
  }

  @Attribute('min') @Input() set min(min) {
    this.minValue = min;
  }

  get min() {
    return this.minValue;
  }

  @Attribute('max') @Input() set max(max) {
    this.maxValue = max;
  }

  get max() {
    return this.maxValue;
  }


  @Attribute('template') @Input() set template(template) {
    this.templateValue = template;
  }

  get template() {
    return this.templateValue;
  }

  @Attribute('pattern') @Input() set pattern(pattern) {
    this.patternValue = pattern;
  }

  get pattern() {
    return this.patternValue;
  }

  private incrementElement: HTMLDivElement;
  private decrementElement: HTMLDivElement;

  minValue: number;

  maxValue: number;

  templateValue: string;
  patternValue: string;

  private ngDestroy$ = new Subject();
  private typeValue: InputType;
  private element: HTMLInputElement;
  private prefixValue = '';
  private suffixValue = '';
  private controlsValue: boolean;
  private value: any = '';

  cursorPosition = 0;

  function;

  updateValue(value: string | number = '') {
    value = (value + '').replace(new RegExp('^' + escapeRegExp(this.prefixValue)), '');
    value = (value + '').replace(new RegExp(escapeRegExp(this.suffixValue) + '$'), '');
    if (this.backspace && value.length === 0) {
      this.backspace = false;
      return this.updateModel(value, '');
    }
    const viewValue = this.updateView(value);
    const modelValue = this.updateModel(value, viewValue);
    this.value = modelValue;
    return modelValue;
  }

  updateView(originalValue) {
    let value = originalValue || '';
    let formattedValue;
    let indexFormat;
    let indexNumber;
    let selection;
    let brackets: string;
    let subLength = 0;
    let cursorEnd = false;
    // @ts-ignore
    if (document.selection) {
      // @ts-ignore
      selection = document.selection.createRange();
      selection.moveStart('character', -value.length);
      this.cursorPosition = selection.text.length;
    } else if (this.element.selectionStart || this.element.selectionStart === 0) {
      this.cursorPosition = this.element.selectionStart;
    }

    switch (this.typeValue) {
      case 'number':
        value = value.replace(/(\s)+/g, '$1');
        value = value.replace(/([^-+*/]|\s)([-+*/])+/g, '$1$2');
        value = value.replace(/(\s[-+*/]\s)[-+*/]/g, '$1');

        // remove the repetition of the left edge zeros of numbers
        value = value.replace(/^([\s]*)(0)+/g, '$1$2');
        value = value.replace(/([^\d.])(0)+/g, '$1$2');

        // remove the left edge zeros of numbers
        value = value.replace(/^([\s]*)(?:0|(0\.))([\d]+)/g, '$1$2$3');
        value = value.replace(/([^\d.])(?:0|(0\.))([\d]+)/g, '$1$2$3');
        value = value.match(numberRegex)?.join('');
        if (!/\.$/.test(value)) {
          const decimals = (value + '').split('.')[1]?.split('').filter(f => !isNaN(+f)).length;
          value = !isNaN(this.min) && !isNaN(+value) ? Math.max(+value, this.min).toFixed(decimals) + '' : value;
          value = !isNaN(this.max) && !isNaN(+value) ? Math.min(+value, this.max).toFixed(decimals) + '' : value;
        }
        break;
      case 'tel':
        if (this.template) {

          if (this.cursorPosition === value.length) {
            cursorEnd = true;
          }

          if (this.backspace && this.template.charAt(value.length) !== 'd') {
            value = (String(value).substring(0, value.length - 1));
          }

          formattedValue = '';
          const num = String(value).replace(/\D/g, '');
          for (indexFormat = 0, indexNumber = 0; indexFormat < this.template.length; indexFormat = indexFormat + 1) {
            if (/\d/g.test(this.template.charAt(indexFormat))) {
              if (this.template.charAt(indexFormat) === num.charAt(indexNumber)) {
                formattedValue += num.charAt(indexNumber);
                indexNumber = indexNumber + 1;
              } else {
                formattedValue += this.template.charAt(indexFormat);
              }
            } else if (this.template.charAt(indexFormat) === '[' && this.template.charAt(indexFormat + 1) === '[') {
              brackets = this.template.substr(indexFormat + 2);
              brackets = brackets.substr(0, brackets.indexOf(']'));
              if (!brackets.includes(num.charAt(indexNumber)) || num.charAt(indexNumber) === '' || indexNumber > num.length - 1) {
                formattedValue += '';
                break;
              } else {
                formattedValue += num.charAt(indexNumber);
                indexNumber = indexNumber + 1;
              }
              indexFormat = indexFormat + ('[[' + brackets + ']]').length - 1;
            } else if (this.template.charAt(indexFormat) !== 'd') {
              if (num.charAt(indexNumber) !== '' || this.template.charAt(indexFormat) === '+') {
                formattedValue += this.template.charAt(indexFormat);
              }
            } else {
              if (num.charAt(indexNumber) === '' || indexNumber > num.length - 1) {
                formattedValue += '';
              } else {
                formattedValue += num.charAt(indexNumber);
                indexNumber = indexNumber + 1;
              }
            }
          }
        }
        break;
      default:
        if (this.pattern) {
          if (!(new RegExp(this.pattern).test(value))) {
            value = this.value;
          }
        }
        if (this.template) {
          if (this.cursorPosition === value.length) {
            cursorEnd = true;
          }
          if (this.backspace) {
            for (indexFormat = 0, indexNumber = 0; indexFormat < this.template.length; indexFormat = indexFormat + 1) {
              subLength = 0;
              if (this.template.charAt(indexFormat) === '[' && this.template.charAt(indexFormat + 1) === '[') {
                brackets = this.template.substr(indexFormat + 2);
                brackets = brackets.split(/]]/).shift();
                if (!(new RegExp(`[${brackets}]`).test(value.charAt(indexNumber))) ||
                  value.charAt(indexNumber) === '' || indexNumber > value.length - 1) {
                  break;
                } else {
                  indexNumber = indexNumber + 1;
                }
                indexFormat = indexFormat + ('[[' + brackets + ']]').length - 1;
              } else {
                subLength += 1;
                if (indexNumber === value.length - 1) {
                  value = (String(value).substring(0, value.length - subLength - 1));
                  break;
                }
                if (this.template.charAt(indexFormat) === value.charAt(indexNumber)) {
                  indexNumber = indexNumber + 1;
                }
              }
            }
          }

          formattedValue = '';
          for (indexFormat = 0, indexNumber = 0; indexFormat < this.template.length; indexFormat = indexFormat + 1) {
            if (this.template.charAt(indexFormat) === '[' && this.template.charAt(indexFormat + 1) === '[') {
              brackets = this.template.substr(indexFormat + 2);
              brackets = brackets.split(/]]/).shift();
              if (!new RegExp(`[${brackets}]`).test(value.charAt(indexNumber)) ||
                value.charAt(indexNumber) === '' || indexNumber > value.length - 1) {
                formattedValue += '';
                break;
              } else {
                formattedValue += value.charAt(indexNumber);
                indexNumber = indexNumber + 1;
              }
              indexFormat = indexFormat + ('[[' + brackets + ']]').length - 1;
            } else {
              if (this.template.charAt(indexFormat) === value.charAt(indexNumber)) {
                formattedValue += value.charAt(indexNumber);
                indexNumber = indexNumber + 1;
              } else {
                formattedValue += this.template.charAt(indexFormat);
              }
            }
          }
        }
        break;
    }

    if (this.template && value !== formattedValue) {
      value = formattedValue;
      if (cursorEnd) {
        this.cursorPosition = value.length;
      }
      // @ts-ignore
      if (document.selection) {
        // @ts-ignore
        selection = document.selection.createRange();
        selection.moveStart('character', -value.length);
        selection.moveStart('character', this.cursorPosition);
        selection.moveEnd('character', 0);
        selection.select();
      } else if (this.element.selectionStart || this.element.selectionStart === 0) {
        this.element.selectionStart = this.cursorPosition;
        this.element.selectionEnd = this.cursorPosition;
      }
    }

    this.model.control.setValue(this.prefixValue
      + ([null, undefined].includes(value) ? '' : value)
      + this.suffixValue,
      {emitEvent: false});
    this.backspace = false;
    return value;
  }

  updateModel(originalValue, viewValue) {
    let value = viewValue;
    switch (this.typeValue) {
      case 'number':
        if (value !== undefined && value.match(/^\s*[-+]?(?:\d+|\d+\.\d+)$/g) && !value.match(/^\s*[-+]?(?:\d+\.\d*0)$/g)) {
          value = value !== '' ? parseFloat(value) : undefined;
          value = isNaN(value) ? undefined : value;
        }
        break;
      case 'tel':
        value = (/^\s*\+/.test(value) ? '+' : '') + value.replace(/\D/g, '');
        break;
    }
    this.model.control.setValue(value, {emitViewToModelChange: false, emitModelToViewChange: false});
    return value;
  }

  @HostListener('focus')
  @HostListener('click')
  @HostListener('select', ['$event'])
  forceCursor($event) {
    if ($event?.type === 'select') {
      $event.preventDefault();
    }
    this.cursorPosition = this.element.selectionStart;
    let cursorPositionEnd = this.element.selectionEnd;
    this.cursorPosition = Math.max(this.prefixValue.length, this.cursorPosition);
    this.cursorPosition = Math.min(this.element.value.length - this.suffixValue.length, this.cursorPosition);
    cursorPositionEnd = Math.max(this.prefixValue.length, cursorPositionEnd);
    cursorPositionEnd = Math.min(this.element.value.length - this.suffixValue.length, cursorPositionEnd);
    this.element.setSelectionRange(this.cursorPosition, cursorPositionEnd, this.element.selectionDirection);
  }

  @HostListener('blur', ['$event'])
  evalValue($event: KeyboardEvent) {
    if (($event.type === 'keydown' && $event.key === 'Enter') || $event.type === 'blur') {
      switch (this.typeValue) {
        case 'number':
          const value = this.value;
          try {
            // tslint:disable-next-line:no-eval
            this.updateValue(eval(this.value));
          } catch (e) {
            this.updateValue((this.value + '' || '').match(/(?:[-+]?\d+\.?\d*)/)?.join(''));
          }
          if (+value !== +this.value) {
            if ($event.type === 'keydown') {
              $event.stopPropagation();
              $event.preventDefault();
            }
          }
          break;
      }
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown($event: KeyboardEvent) {
    this.backspace = $event.key === 'Backspace';
    this.forceCursor($event);
    this.evalValue($event);
    if (this.backspace && this.cursorPosition <= this.prefixValue.length) {
      $event.preventDefault();
      this.backspace = false;
      return;
    }

    if ($event.key === 'Delete' && this.cursorPosition >= this.element.value.length - this.suffixValue.length) {
      $event.preventDefault();
      return;
    }
    switch (this.typeValue) {
      case 'number':
        if (['ArrowUp', 'ArrowDown'].includes($event.key)) {
          $event.preventDefault();
          $event.stopPropagation();
          $event.stopImmediatePropagation();
          let multiplier = 1;
          if ($event.altKey) {
            multiplier = 0.1;
          } else {
            multiplier = $event.metaKey || $event.ctrlKey ? multiplier * 10 : multiplier;
            multiplier = $event.shiftKey ? multiplier * 100 : multiplier;
          }
          if ($event.key === 'ArrowUp') {
            this.updateValue((((this.value || 0) * 10) + (multiplier * 10)) / 10);
          }

          if ($event.key === 'ArrowDown') {
            this.updateValue((((this.value || 0) * 10) - (multiplier * 10)) / 10);
          }
          $event.preventDefault();
          this.cursorPosition = this.prefixValue.length;
          const cursorPositionEnd = this.element.value.length - this.suffixValue.length;
          this.element.setSelectionRange(this.cursorPosition, cursorPositionEnd, 'none');
        }
        break;
    }
  }

  initializeControls() {
    if (this.incrementElement && this.decrementElement) {
      return;
    }
    this.incrementElement?.remove();
    this.decrementElement?.remove();

    this.incrementElement = this.renderer.createElement('div');
    this.decrementElement = this.renderer.createElement('div');
    this.incrementElement.className = this.decrementElement.className = 'input-group-append';
    this.element.parentElement.append(this.decrementElement, this.incrementElement);

    const incrementButton = this.renderer.createElement('button') as HTMLButtonElement;
    incrementButton.innerHTML = `<i class="fas fa-sm fa-plus fa-fw"></i>`;
    this.incrementElement.appendChild(incrementButton);
    const decrementButton = this.renderer.createElement('button') as HTMLButtonElement;
    decrementButton.innerHTML = `<i class="fas fa-sm fa-minus fa-fw"></i>`;
    this.decrementElement.appendChild(decrementButton);
    incrementButton.className = decrementButton.className = 'btn btn-sm btn-primary';
    incrementButton.type = decrementButton.type = 'button';

    pressAndHoldEventInit(incrementButton);
    pressAndHoldEventInit(decrementButton);
    incrementButton.addEventListener('pressandhold', () => this.updateValue((((this.value || 0) * 10) + 10) / 10));
    decrementButton.addEventListener('pressandhold', () => this.updateValue((((this.value || 0) * 10) - 10) / 10));
  }

  ngAfterContentInit(): void {
    this.element = this.elementRef.nativeElement;
    this.element.autocomplete = 'off';
    this.element.type = 'text';
    if (!this.element.classList.contains('form-control')) {
      this.element.classList.add('form-control');
    }
    if (!this.element.parentElement.classList.contains('input-group')) {
      const parent = this.element.parentNode;
      const inputGroup = this.renderer.createElement('div') as HTMLDivElement;
      this.renderer.addClass(inputGroup, 'input-group');
      this.renderer.appendChild(inputGroup, this.element);
      this.renderer.appendChild(parent, inputGroup);
    }

    this.controls = this.controlsValue;

    this.model.valueChanges
      .pipe(
        takeUntil(this.ngDestroy$),
        distinctUntilChanged(),
        map(value => this.updateValue(value)),
      )
      .subscribe();

  }

  ngOnDestroy(): void {
    this.ngDestroy$.next();
  }

}

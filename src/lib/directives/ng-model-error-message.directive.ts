import {
  AfterContentChecked,
  Directive,
  ElementRef,
  Inject, InjectionToken,
  OnDestroy,
  OnInit,
  Optional,
  Renderer2,
  Self
} from '@angular/core';
import {NgControl} from '@angular/forms';
import {Observable, of, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, map, mergeMap, switchMap, takeUntil, tap} from 'rxjs/operators';

export const NG_MODEL_ERROR_MAPPER = new InjectionToken('NgModelErrorMapper');

// @dynamic
@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[ngModel][ngModelErrorMessage]'
})
export class NgModelErrorMessageDirective implements OnInit, OnDestroy {

  smallElement: HTMLElement;
  parentElement: HTMLElement;
  destroyed$ = new Subject();

  constructor(
    @Self() @Optional() public control: NgControl,
    @Inject(NG_MODEL_ERROR_MAPPER) public errorMapper: (errors) => Observable<string | string[]>,
    private renderer: Renderer2,
    private el: ElementRef,
  ) {
  }

  ngOnInit(): void {
    this.parentElement = this.el.nativeElement.parentElement;
    this.smallElement = this.renderer.createElement('small');
    this.renderer.addClass(this.smallElement, 'text-danger');

    if (this.parentElement.classList.contains('input-group')) {
      this.parentElement = this.parentElement.parentElement;
    }

    this.renderer.appendChild(this.parentElement, this.smallElement);
    // this.errors$
    this.control.statusChanges
      .pipe(
        map(() =>
          this.control.errors
        ),
        takeUntil(this.destroyed$),
        debounceTime(200),
        switchMap(errors => this.errorMapper ? this.errorMapper(errors) : of(errors)),
        map(errors => {
          if (!errors) {
            return '';
          }
          if (Array.isArray(errors)) {
            return errors;
          } else if (typeof errors === 'object') {
            return JSON.stringify(errors);
          }

          return errors;
        }),
        distinctUntilChanged(),
        tap(errors => {
          this.smallElement.innerText = typeof errors === 'object' ? Object.values(errors).join(', ') : errors;
          if (!(this.el.nativeElement as HTMLElement).classList.contains('form-control')) {
            return;
          }
          if (errors) {
            (this.el.nativeElement as HTMLElement).classList.add('border-danger');
          } else {
            (this.el.nativeElement as HTMLElement).classList.remove('border-danger');
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }
}

import {AfterContentInit, Directive, EventEmitter, OnDestroy, Self} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {debounceTime, distinctUntilChanged, switchMap, takeUntil, tap} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {isEqual} from 'lodash';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'form[queryParams]'
})
export class NgFormQueryParamsDirective implements OnDestroy, AfterContentInit {

  private ngDestroy$ = new EventEmitter();
  private refreshQuery$ = new BehaviorSubject(null);
  private queryCheckedFirst = false;
  private queryParams: any = {};

  constructor(
    @Self() public form: NgForm,
    public route: ActivatedRoute,
    public router: Router,
  ) {
  }

  ngOnDestroy(): void {
    this.ngDestroy$.next();
  }

  ngAfterContentInit(): void {
    this.refreshQuery$
      .pipe(
        switchMap(() => this.route.queryParams),
        takeUntil(this.ngDestroy$),
        distinctUntilChanged((pre, cur) => {
          return isEqual(pre, cur);
        }),
        tap(queryParams => {
          this.queryParams = queryParams;
          for (const p of Object.keys(queryParams)) {
            const value = queryParams[p];
            this.form.form.get(p)?.setValue(value);
          }
        }),
      )
      .subscribe();

    this.form.valueChanges
      .pipe(
        takeUntil(this.ngDestroy$),
        distinctUntilChanged((pre, cur) => {
          return isEqual(pre, cur);
        }),
        debounceTime(500),
        tap(queryParams => {
          if (!this.queryCheckedFirst) {
            for (const p of Object.keys(this.queryParams)) {
              const value = this.queryParams[p];
              this.form.form.get(p)?.setValue(value);
            }
            this.queryCheckedFirst = true;
            return;
          }
          this.router.navigate([], {queryParams, queryParamsHandling: 'merge'});
        })
      )
      .subscribe();
  }
}

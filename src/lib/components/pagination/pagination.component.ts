import {Attribute, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {distinctUntilChanged, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'nav[pagination]',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit, OnDestroy {

  pages$ = new BehaviorSubject([]);
  page$ = new BehaviorSubject(1);
  private refreshQuery$ = new BehaviorSubject(null);
  queryCheckedFirst = false;
  @Output() pageChange = new EventEmitter();
  lastPage;

  private ngDestroy$ = new EventEmitter();

  queryParam: string;

  pageSizeValue: string | number;

  @Attribute('pageSize') @Input() set pageSize(pageSize) {
    this.pageSizeValue = pageSize;
    this.updatePages();
  }

  get pageSize() {
    return this.pageSizeValue;
  }

  collectionSizeValue: string | number;

  @Attribute('collectionSize') @Input() set collectionSize(collectionSize) {
    this.collectionSizeValue = collectionSize;
    this.updatePages();
  }

  get collectionSize() {
    return this.collectionSizeValue;
  }

  maxSizeValue: string | number;

  @Attribute('maxSize') @Input() set maxSize(maxSize) {
    this.maxSizeValue = maxSize;
    this.updatePages();
  }

  get maxSize() {
    return this.maxSizeValue;
  }

  pageValue: string | number;

  @Attribute('page') @Input() set page(page) {
    this.pageValue = page;
    this.page$.next(+page);
    this.updatePages();
  }

  get page() {
    return +this.pageValue || 1;
  }

  @Input() set pagination(pagination: { page: number; collectionSize: number; pageSize: number; }) {
    Object.assign(this, pagination);
    this.updatePages();
  }

  constructor(
    public router: Router,
    public route: ActivatedRoute) {
  }

  @Attribute('queryParam') @Input('queryParam') set queryParamValue(queryParam: string | boolean) {
    this.queryParam = [true, ''].includes(queryParam) ? 'page' : queryParam === false ? '' : queryParam as string;
    this.refreshQuery$.next(null);
    this.page = this.page;
    this.updatePages();
  }

  updatePages() {
    if (!(this.collectionSize && this.pageSize)) {
      return;
    }
    let pages = Math.ceil(+this.collectionSize / +this.pageSize);
    this.lastPage = pages;
    let base = 1;
    if (pages > this.maxSize) {
      base = Math.max(1, Math.min(Math.round(+this.page - (+this.maxSize * 0.5)), pages - +this.maxSize + 1));
      pages = +this.maxSize;
    }
    this.pages$.next(new Array(Math.ceil(pages)).fill(base).map((a, i) => i + a));
  }

  ngOnInit(): void {
    this.refreshQuery$
      .pipe(
        switchMap(() => this.route.queryParams),
        takeUntil(this.ngDestroy$),
        filter(() => !!this.queryParam),
        map(params => params[this.queryParam]),
        tap(page => this.queryCheckedFirst = isNaN(page)),
        filter(page => !isNaN(+page)),
        distinctUntilChanged(),
        tap(page => {
          this.page = page;
          this.queryCheckedFirst = true;
        })
      )
      .subscribe();

    this.page$
      .pipe(
        takeUntil(this.ngDestroy$),
        filter(page => !isNaN(+page)),
        distinctUntilChanged(),
        tap(page => this.pageChange.emit(page)),
        filter(() => this.queryParam && this.queryCheckedFirst),
        tap(page => {
          const queryParams: any = {};
          queryParams[this.queryParam] = page;
          this.router.navigate([], {queryParams, queryParamsHandling: 'merge'});
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.ngDestroy$.next();
  }

}

import {
  AfterContentInit,
  Directive,
  DoCheck,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  TemplateRef
} from '@angular/core';
import {
  Popover,
  PopoverHorizontalPlacement,
  PopoverService,
  PopoverVerticalPlacement
} from '../services/popover.service';
import {BehaviorSubject, fromEvent, Subject} from 'rxjs';
import {debounceTime, takeUntil, takeWhile, tap} from 'rxjs/operators';

type PopoverHooks = 'hover' | 'click' | '' | null;

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[popover]',
  exportAs: 'popover'
})
export class PopoverDirective implements AfterContentInit, OnDestroy {
  private ngDestroy$ = new Subject();

  @Output() popoverReady = new EventEmitter();

  popover: Popover;

  private popoverContentValue$ = new BehaviorSubject<string | HTMLElement | HTMLElement[] | TemplateRef<any>>('');

  @Input() set popoverContent(content: string | HTMLElement | HTMLElement[] | TemplateRef<any>) {
    this.popoverContentValue$.next(content);
  }

  popoverOnHook: PopoverHooks = '';

  @Input() set popoverOn(hook) {
    if (hook === this.popoverOnHook) {
      return;
    }
    this.popoverOnHook = hook;
    this.updateHook();
  }

  popoverPlacementValue: {
    horizontal: PopoverHorizontalPlacement;
    vertical: PopoverVerticalPlacement;
  } = {
    horizontal: 'auto',
    vertical: 'auto',
  };

  @Input() set popoverPlacement(popoverPlacementValue) {
    this.popoverPlacementValue = popoverPlacementValue;
    this.popover?.updatePopOverPosition();
  }


  popoverClassValue = '';

  @Input() set popoverClass(customClass) {
    this.popoverClassValue = customClass;
    if (this.popover) {
      this.popover.customClass = customClass;
    }
  }

  popoverArrowValue = true;

  @Input() set popoverArrow(customArrow: boolean) {
    this.popoverArrowValue = customArrow;
    if (this.popover) {
      this.popover.arrow = customArrow;
    }
  }

  popoverMatchWidthValue: boolean | 'min-width' = false;

  @Input() set popoverMatchWidth(matchWidth: boolean | 'min-width') {
    this.popoverMatchWidthValue = matchWidth;
    if (this.popover) {
      this.popover.matchWidth = matchWidth;
    }
  }


  popoverMaxWindowHeightValue = false;

  @Input() set popoverMatchHeight(matchHeight: boolean) {
    this.popoverMaxWindowHeightValue = matchHeight;
    if (this.popover) {
      this.popover.maxWindowHeight = matchHeight;
    }
  }

  show() {
    this.popover.show = true;
  }

  hide() {
    this.popover.show = false;
  }

  forceShow(bool = true) {
    this.popover.forceShow = bool;
    this.popover.updatePopOverPosition();
  }

  constructor(
    private popoverService: PopoverService,
    private elementRef: ElementRef<HTMLElement>,
  ) {
  }

  async ngAfterContentInit() {
    this.popover = await this.popoverService.addPopover({
      anchorElement: this.elementRef.nativeElement,
      content: this.popoverContentValue$.value,
      vertical: this.popoverPlacementValue.vertical,
      horizontal: this.popoverPlacementValue.horizontal,
    });
    this.popover.customClass = this.popoverClassValue;
    this.popover.arrow = this.popoverArrowValue;
    this.popover.matchWidth = this.popoverMatchWidthValue;
    this.popover.maxWindowHeight = this.popoverMaxWindowHeightValue;
    setTimeout(() => this.popover.updatePopOverPosition(), 1000);
    this.updateHook();
    this.popoverContentValue$
      .pipe(
        takeUntil(this.ngDestroy$),
        tap(elements => this.popover.content = elements),
      )
      .subscribe();
    this.popoverReady.emit(this);
  }


  private updateHook() {
    if (!this.popover) {
      return;
    }
    switch (this.popoverOnHook) {
      case 'hover':
        this.activateOnHover();
        break;
      case 'click':
        this.activateOnClick();
        break;
    }
  }


  private activateOnHover() {
    fromEvent(this.popover.element, 'mouseover', {capture: true})
      .pipe(
        takeUntil(this.ngDestroy$),
        takeWhile(() => this.popoverOnHook === 'hover'),
        tap(() => this.popover.forceShow = true),
      )
      .subscribe();

    fromEvent(this.popover.element, 'mouseleave')
      .pipe(
        takeUntil(this.ngDestroy$),
        takeWhile(() => this.popoverOnHook === 'hover'),
        tap(() => this.popover.forceShow = false),
        tap(() => this.popover.updatePopOverPosition()),
      )
      .subscribe();

    fromEvent(this.elementRef.nativeElement, 'mouseover', {capture: true})
      .pipe(
        takeUntil(this.ngDestroy$),
        takeWhile(() => this.popoverOnHook === 'hover'),
      )
      .subscribe(() => this.popover.show = true);
    fromEvent(this.elementRef.nativeElement, 'mouseleave')
      .pipe(
        takeUntil(this.ngDestroy$),
        takeWhile(() => this.popoverOnHook === 'hover'),
      )
      .subscribe(() => this.popover.show = false);
    fromEvent(window, 'click')
      .pipe(
        takeUntil(this.ngDestroy$),
        takeWhile(() => this.popoverOnHook === 'hover'),
      )
      .subscribe((event) =>
        !this.popover.element.contains(event.target as Node) ?
          this.popover.show = this.popover.forceShow = false
          : null
      );
  }

  private activateOnClick() {
    fromEvent(this.elementRef.nativeElement, 'click')
      .pipe(
        takeUntil(this.ngDestroy$),
        takeWhile(() => this.popoverOnHook === 'click'),
      )
      .subscribe(() => this.popover.show = !this.popover.show);
    fromEvent(window, 'click')
      .pipe(
        takeUntil(this.ngDestroy$),
        takeWhile(() => this.popoverOnHook === 'click'),
      )
      .subscribe((event) =>
        !this.popover.element.contains(event.target as Node)
        &&
        !this.elementRef.nativeElement.contains(event.target as Node)
          ? this.popover.show = this.popover.forceShow = false
          : null
      );
  }

  ngOnDestroy(): void {
    this.ngDestroy$.next();
    this.popoverService.removePopover(this.popover?.id);
  }

}

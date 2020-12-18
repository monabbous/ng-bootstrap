import {
  AfterContentInit,
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injectable,
  Injector,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {BehaviorSubject, fromEvent, merge, Observable, of, Subject} from 'rxjs';
import {debounceTime, filter, takeUntil} from 'rxjs/operators';


const popoverStyleElement = `
  <style>
    popover-container {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 2000;
    }

    popover-container flying-popover {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 0;
        background-color: #fff;
        will-change: transform;
        filter: opacity(0);
        pointer-events: none;
        border-radius: 0.25rem;
        border-color: white;
    }

    popover-container flying-popover.show {
        filter: opacity(1) drop-shadow(0 0 0.5rem rgba(0, 0, 0, 0.3));
        pointer-events: auto;
    }

    popover-container flying-popover::before {
        content: '';
        display: block;
        border-color: inherit;
        position: absolute;
        z-index: -1;
    }

    popover-container flying-popover.arrow.top-left {
        border-bottom-right-radius: 0;
        margin-top: -.5rem;
    }

    popover-container flying-popover.arrow.top-left::before {
        top: calc(100%);
        left: calc(100% - .5rem);
        border-bottom: .5rem solid transparent;
        border-right: .5rem solid;
        border-right-color: inherit;
    }

    popover-container flying-popover.arrow.bottom-left {
        border-top-right-radius: 0;
        margin-top: .5rem;
    }

    popover-container flying-popover.arrow.bottom-left::before {
        bottom: calc(100%);
        left: calc(100% - .5rem);
        border-top: .5rem solid transparent;
        border-right: .5rem solid;
        border-right-color: inherit;
    }

    popover-container flying-popover.arrow.middle-left {
        margin-left: -.5rem;
    }

    popover-container flying-popover.arrow.middle-left::before {
        top: calc(50% - 0.25rem);
        left: calc(100%);
        border-top: .25rem solid transparent;
        border-bottom: .25rem solid transparent;
        border-left: .5rem solid;
        border-left-color: inherit;
    }

    popover-container flying-popover.arrow.top-right {
        border-bottom-left-radius: 0;
        margin-top: -.5rem;
    }

    popover-container flying-popover.arrow.top-right::before {
        top: calc(100%);
        right: calc(100% - .5rem);
        border-bottom: .5rem solid transparent;
        border-left: .5rem solid;
        border-left-color: inherit;
    }

    popover-container flying-popover.arrow.bottom-right {
          border-top-left-radius: 0;
          margin-top: .5rem;
    }

    popover-container flying-popover.arrow.bottom-right::before {
        bottom: calc(100%);
        right: calc(100% - .5rem);
        border-top: .5rem solid transparent;
        border-left: .5rem solid;
        border-left-color: inherit;
    }

    popover-container flying-popover.arrow.middle-right {
        margin-left: .5rem;
    }

    popover-container flying-popover.arrow.middle-right::before {
        top: calc(50% - 0.25rem);
        right: calc(100%);
        border-top: .25rem solid transparent;
        border-bottom: .25rem solid transparent;
        border-right: .5rem solid;
        border-right-color: inherit;
    }

    popover-container flying-popover.arrow.bottom-center {
        margin-top: .5rem;
    }

    popover-container flying-popover.arrow.bottom-center::before {
        bottom: calc(100%);
        left: calc(50% - .25rem);
        border-left: .25rem solid transparent;
        border-right: .25rem solid transparent;
        border-bottom: .5rem solid;
        border-bottom-color: inherit;
    }

    popover-container flying-popover.arrow.top-center {
        margin-top: -.5rem;
    }

    popover-container flying-popover.arrow.top-center::before {
        top: calc(100%);
        left: calc(50% - .25rem);
        border-left: .25rem solid transparent;
        border-right: .25rem solid transparent;
        border-top: .5rem solid;
        border-top-color: inherit;
    }

    popover-container flying-popover .popover-body {
        padding: .5rem;
        width: max-content;
    }
  </style>
`;

export type PopoverVerticalPlacement = 'top' | 'bottom' | 'middle' | 'top-baseline' | 'bottom-baseline' | 'auto';
export type PopoverHorizontalPlacement =
  'left'
  | 'right'
  | 'left-baseline'
  | 'right-baseline'
  | 'start'
  | 'end'
  | 'start-baseline'
  | 'end-baseline'
  | 'center'
  | 'auto';

interface PopoverBaseConstructor {
  content: string | HTMLElement | HTMLElement[] | TemplateRef<any>;
  element?: HTMLElement;
  anchorElement: HTMLElement;
  horizontal: PopoverHorizontalPlacement;
  vertical: PopoverVerticalPlacement;
  popoverComponentRef?: ComponentRef<FlyingPopoverComponent>;
}

type PopoverConstructor = PopoverBaseConstructor;

export class Popover {
  private readonly arrowClassValue = 'arrow';
  private arrowClass = this.arrowClassValue;
  readonly element: HTMLElement;
  private showValue = false;
  private anchorElement: HTMLElement;
  id: string;
  horizontal: PopoverHorizontalPlacement;
  vertical: PopoverVerticalPlacement;
  forceShow = false;
  customClass = '';
  matchWidth: boolean | 'min-width' = false;
  ready: Observable<this> = new Subject();
  popoverComponentRef: ComponentRef<FlyingPopoverComponent>;
  maxWindowHeight: boolean;

  set show(showValue) {
    this.showValue = showValue;
    this.updatePopOverPosition();
  }

  get show() {
    return this.showValue || this.forceShow;
  }

  set arrow(b: boolean) {
    this.arrowClass = b ? this.arrowClassValue : '';
  }

  set content(content) {
    if (typeof content === 'string') {
      this.element.innerHTML = `<div class="popover-body">${content}</div>`;
    } else if (content instanceof HTMLElement) {
      this.element.innerHTML = ``;
      this.element.appendChild(content);
    } else if (Array.isArray(content)) {
      this.element.innerHTML = ``;
      content.forEach(c => {
        if (c instanceof HTMLElement) {
          this.element.appendChild(c);
        }
      });
    } else if (content instanceof TemplateRef && this.popoverComponentRef) {
      this.popoverComponentRef.instance.setContent(content);
    }
  }

  constructor({
                content,
                anchorElement,
                horizontal,
                vertical,
                element,
                popoverComponentRef,
              }: PopoverConstructor) {
    if (element) {
      this.element = element;
    } else if (popoverComponentRef) {
      this.popoverComponentRef = popoverComponentRef;
      this.element = (popoverComponentRef.hostView as EmbeddedViewRef<any>).rootNodes[0];
    } else {
      this.element = document.createElement('flying-popover');
    }
    this.id = btoa(Math.random().toString());
    this.anchorElement = anchorElement;
    this.content = content;
    this.horizontal = horizontal || this.horizontal;
    this.vertical = vertical || this.vertical;

    (this.ready as Subject<this>).next(this);
    this.ready = of(this);
  }

  getPosition() {
    const anchorRect = this.anchorElement.getBoundingClientRect();
    if (this.matchWidth === 'min-width') {
      this.element.style.minWidth = anchorRect.width + 'px';
    } else if (this.matchWidth) {
      this.element.style.width = anchorRect.width + 'px';
    } else {
      delete this.element.style.width;
    }

    if (this.maxWindowHeight) {
      this.element.style.maxHeight = `calc(70vh - ${anchorRect.height}px - 2em)`;
      this.element.style.overflowY = 'auto';
    } else {
      this.element.style.maxHeight = ``;
      this.element.style.overflowY = '';
    }
    const popoverRect = this.element.getBoundingClientRect();
    let horizontal = this.horizontal;
    let vertical = this.vertical;
    let top: number | string = anchorRect.top;
    let left: number | string = anchorRect.left;
    const rtl = document.documentElement.getAttribute('dir') === 'rtl';
    switch (horizontal) {
      case 'center':
        left += (anchorRect.width * .5) - (popoverRect.width * .5);
        break;
      case 'start':
        left += rtl ? anchorRect.width + popoverRect.width : -popoverRect.width;
        horizontal = rtl ? 'right' : 'left';
        break;
      case 'end':
        left += rtl ? -popoverRect.width : anchorRect.width;
        horizontal = rtl ? 'left' : 'right';
        break;
      case 'left':
        left += -popoverRect.width;
        break;
      case 'right':
        left += anchorRect.width;
        break;
      case 'left-baseline':
        left += 0;
        horizontal = 'right';
        break;
      case 'right-baseline':
        left += anchorRect.width - popoverRect.width;
        horizontal = 'left';
        break;
      case 'start-baseline':
        left += rtl ? anchorRect.width - popoverRect.width : 0;
        horizontal = rtl ? 'left' : 'right';
        break;
      case 'end-baseline':
        left += rtl ? 0 : anchorRect.width - popoverRect.width;
        horizontal = rtl ? 'right' : 'left';
        break;
      case 'auto':
        if (!rtl) {
          if (left + anchorRect.width >= window.innerWidth) {
            left += -popoverRect.width;
            horizontal = 'left';
          } else {
            left += anchorRect.width;
            horizontal = 'right';
          }
        } else {
          if (left < 0) {
            left += anchorRect.width;
            horizontal = 'right';
          } else {
            left += -popoverRect.width;
            horizontal = 'left';
          }
        }
        break;
    }

    left = Math.max(0, Math.min(window.innerWidth - popoverRect.width, left));
    left = left + 'px';

    switch (vertical) {
      case 'middle':
        top += (anchorRect.height * .5) - (popoverRect.height * .5);
        break;
      case 'top':
        top += -popoverRect.height;
        break;
      case 'bottom':
        top += anchorRect.height;
        break;
      case 'top-baseline':
        top += 0;
        break;
      case 'bottom-baseline':
        top += anchorRect.height - popoverRect.height;
        break;
      case 'auto':
        if (top + anchorRect.height + popoverRect.height > window.innerHeight) {
          top += -popoverRect.height;
          vertical = 'top';
        } else {
          top += anchorRect.height;
          vertical = 'bottom';
        }
        break;
    }
    top = Math.max(0, Math.min(window.innerHeight - popoverRect.height, top));
    top = top + 'px';

    return {
      top,
      left,
      horizontal,
      vertical,
    };
  }

  updatePopOverPosition() {

    const position = this.getPosition();
    requestAnimationFrame(() => {
      this.element.style.transform = `translate(${position.left}, ${position.top})`;
      this.element.className = this.show ?
        `show ${position.vertical}-${position.horizontal} ${this.customClass} ${this.arrowClass}`
        : this.customClass;
    });
  }
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'flying-popover',
  template: '<ng-template #container></ng-template>',
  styles: [''],
})
class FlyingPopoverComponent implements AfterContentInit, OnDestroy {

  @ViewChild('container', {static: true, read: ViewContainerRef}) container: ViewContainerRef;

  private content$ = new BehaviorSubject(null);
  private ngDestroy$ = new Subject();

  setContent(template: TemplateRef<any>) {
    this.content$.next(template);
  }

  ngAfterContentInit(): void {
    this.content$
      .pipe(
        takeUntil(this.ngDestroy$),
        filter(template => template)
      )
      .subscribe((template) => {
        this.container.clear();
        this.container.createEmbeddedView(template);
      });
  }

  ngOnDestroy(): void {
    this.ngDestroy$.next();
  }
}

@Injectable({
  providedIn: 'root'
})
export class PopoverService {

  constructor(
    public componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {
    this.containerElement = document.createElement('popover-container');
    this.containerElement.innerHTML = (popoverStyleElement);
    document.body.append(this.containerElement);
    merge(
      fromEvent(window, 'scroll', {capture: true}),
      fromEvent(window, 'resize')
        .pipe(
          debounceTime(1000)
        ),
    )
      .subscribe(() => {
        this.underObservation.forEach((popover) => popover.updatePopOverPosition());
      });
  }

  private readonly containerElement: HTMLElement;

  popovers: Popover[] = [];
  underObservation: Popover[] = [];

  async addPopover(popover: PopoverConstructor) {
    const popoverComponentRef = this.componentFactoryResolver.resolveComponentFactory(FlyingPopoverComponent).create(this.injector);
    this.appRef.attachView(popoverComponentRef.hostView);
    delete popover.element;
    popover.popoverComponentRef = popoverComponentRef;
    const service = this;
    const newPopover = new Proxy(new Popover(popover), {
      set(target: Popover, p: string | number | symbol, value: any): boolean {
        if (p === 'show') {
          target[p] = value;
          if (!target.show) {
            const index = service.underObservation.findIndex(pop => pop.id === target.id);
            if (index > -1) {
              service.underObservation.splice(index, 1);
            }
          } else {
            const index = service.underObservation.findIndex(pop => pop.id === target.id);
            if (index === -1) {
              service.underObservation.push(target);
            }
          }
        }

        target[p] = value;
        return true;
      }
    });
    this.containerElement.append((popoverComponentRef.hostView as EmbeddedViewRef<any>).rootNodes[0]);
    this.popovers.push(newPopover);

    if (!newPopover.show) {
      this.underObservation.push(newPopover);
    }
    newPopover.updatePopOverPosition();
    return (newPopover);

  }

  removePopover(id: string) {
    const index = this.popovers.findIndex(pop => pop.id === id);
    const index2 = this.underObservation.findIndex(pop => pop.id === id);
    if (index !== -1) {
      this.popovers[index].element.remove();
      delete this.popovers[index];
      this.popovers.splice(index, 1);
    }

    if (index2 !== -1) {
      delete this.underObservation[index];
      this.underObservation.splice(index, 1);
    }
  }
}

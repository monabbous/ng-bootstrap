import {Directive, Input, Renderer2, TemplateRef, ViewContainerRef} from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[loading]'
})
export class LoadingDirective {

  @Input()
  // tslint:disable-next-line:variable-name
  set loading(context) {
    if (context) {
      this.viewContainerRef.clear();
      if (this.loadingElement) {
        this.renderer.removeChild(this.loadingElement.parentNode, this.loadingElement);
      }
      this.context.$implicit = this.context.loading = context;
      this.viewContainerRef.createEmbeddedView(this.templateRef, this.context);
    } else {
      this.loadingElement = this.renderer.createElement(`div`) as HTMLDivElement;
      this.loadingElement.innerHTML = `<span class="sr-only">Loading...</span>`;
      this.loadingElement.className = 'spinner-grow text-primary m-auto';
      const elem = this.viewContainerRef.element.nativeElement;
      this.renderer.insertBefore(elem.parentNode, this.loadingElement, elem);
    }
  }

  context: any = {};
  loadingElement: HTMLDivElement;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef,
    private renderer: Renderer2,
  ) {
  }

}

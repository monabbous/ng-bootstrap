import {Injectable} from '@angular/core';
import {fromEvent, merge} from 'rxjs';
import {debounceTime} from 'rxjs/operators';


interface Trigeree {
  element: HTMLElement;
  callback: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class TriggerOnViewportService {
  elements: Trigeree[] = [];

  constructor() {
    merge(
      fromEvent(window, 'scroll'),
      fromEvent(window, 'resize'),
    )
      .pipe(
        debounceTime(1000)
      ).subscribe(() => {
        this.elements.forEach((element, i) => this.processElement(element, i));
    });
  }

  addElement(element: Trigeree) {
    if (this.elements.find(e => e.element.isSameNode(element.element))) {
      return;
    }
    this.elements.push(element);
    window.dispatchEvent(new Event('resize'));
  }

  processElement(element: Trigeree, i: number) {
    const rect = element.element.getBoundingClientRect();
    if (
      rect.top >= 0
      && rect.top <= window.innerHeight
      && rect.left >= 0
      && rect.left <= window.innerWidth
    ) {
      element.callback();
      this.elements.splice(i, 1);
    }
  }
}

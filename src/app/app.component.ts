import {Component} from '@angular/core';
import {mergeMap} from 'rxjs/operators';
import {ImageInputValue} from 'ng-bootstrap';
import {of, throwError} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'monabbous-ng-bootstrap';

  modifier() {
    return mergeMap((v: ImageInputValue) => {
      if (confirm()) {
        return of(v);
      } else {
        return throwError(null);
      }
    });
  }
}

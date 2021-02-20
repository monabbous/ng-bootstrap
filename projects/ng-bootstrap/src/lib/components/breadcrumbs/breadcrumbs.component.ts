import {Attribute, Component, Input, OnInit, TemplateRef} from '@angular/core';
import {BreadcrumbsService} from '../../services/breadcrumbs.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'nav[breadcrumbs]',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {

  @Input() linkTemplate: TemplateRef<any>;

  breadcrumbListClassValue = '';

  @Attribute('breadcrumbListClass') @Input() set breadcrumbListClass(breadcrumbListClass) {
    this.breadcrumbListClassValue = breadcrumbListClass;
  }

  get breadcrumbListClass() {
    return this.breadcrumbListClassValue;
  }

  breadcrumbListItemClassValue = '';

  @Attribute('breadcrumbListItemClass') @Input() set breadcrumbListItemClass(breadcrumbListItemClass) {
    this.breadcrumbListItemClassValue = breadcrumbListItemClass;
  }

  get breadcrumbListItemClass() {
    return this.breadcrumbListItemClassValue;
  }


  constructor(
    public breadcrumbsService: BreadcrumbsService
  ) {
  }

  ngOnInit(): void {
  }


}

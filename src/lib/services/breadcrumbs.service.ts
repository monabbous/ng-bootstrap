import {Injectable} from '@angular/core';
import {ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Route, Router} from '@angular/router';
import {BehaviorSubject, merge, Subject} from 'rxjs';
import {debounceTime, filter} from 'rxjs/operators';

export interface Breadcrumb {
  id: string;
  label?: string;
  url: string;
  index: number;
}

export interface BreadcrumbRoute extends Route {
  breadcrumb?: string;
  breadcrumbPatched?: string;
  id?: string;
  children?: BreadcrumbRoute[];
}

export type BreadcrumbRoutes = BreadcrumbRoute[];

@Injectable({
  providedIn: 'any',
})
export class BreadcrumbsService {
  breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);
  private refresh$ = new Subject();
  firstRun = true;
  private previousUrl = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
    merge(
      router.events
        .pipe(
          filter(event => event instanceof NavigationEnd),
          debounceTime(200),
        ),
      this.refresh$
    ).subscribe(async (event: NavigationEnd) => {
      const url = this.router.url.replace(/\?.*/, '');
      if (event && !this.firstRun) {
        if (url === this.previousUrl) {
          return;
        }
      }
      this.previousUrl = url;
      this.breadcrumbs$.next(await this.digBreadcrumbs(activatedRoute.root.snapshot, !event));
      this.firstRun = false;
    });
  }

  async digBreadcrumbs(route: ActivatedRouteSnapshot, patched = false, breadcrumbs: Breadcrumb[] = []) {
    const config = (route.routeConfig || {}) as BreadcrumbRoute;
    const breadcrumb: Breadcrumb = {
      id: btoa(Math.random().toString()),
      url: '/' + route.pathFromRoot.map(o => o.url[0]).filter(u => !!u?.path).join('/'),
      index: breadcrumbs.length,
    };
    // @ts-ignore
    route.routeConfig?.id = breadcrumb.id;

    if (patched && config?.breadcrumbPatched) {
      breadcrumb.label = config.breadcrumbPatched;
    } else if (config?.breadcrumb || config?.data?.breadcrumb) {
      delete config.breadcrumbPatched;
      breadcrumb.label = config?.breadcrumb || config?.data?.breadcrumb;
    }

    breadcrumbs.push(breadcrumb);
    const child = route.children.find(r => r.outlet === 'primary');
    if (child) {
      return this.digBreadcrumbs(child, patched, breadcrumbs);
    }

    return breadcrumbs;
  }

  updateBreadcrumb(route: ActivatedRoute | ActivatedRouteSnapshot, label) {
    const config = route.routeConfig as BreadcrumbRoute;
    config.breadcrumbPatched = label;
    this.refresh$.next(null);
  }
}

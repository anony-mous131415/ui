import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AppConstants } from '../_constants/AppConstants';
import { AlertService } from './alert.service';
import { ErrorHandler } from './error-handler.service';
import { RequestCache } from './request.cache.service';


@Injectable({
  providedIn: 'root'
})
export class HttpinterceptorService implements HttpInterceptor {

  @BlockUI() blockUI: NgBlockUI;

  constructor(
    public alertService: AlertService,
    public errorHandler: ErrorHandler,
    private cache: RequestCache
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // this.blockUI.start();

    const masterToken: string = localStorage.getItem(AppConstants.CACHED_MASTER_TOKEN);
    const token: string = localStorage.getItem(AppConstants.CACHED_TOKEN);

    //clearing the alert in every api call
    this.alertService.clear();

    let requestUrl: string[] = request.url.split("/" + AppConstants.API_VERSION + "/");
    let useMasterToken = false;

    for (let i in AppConstants.APIS_USES_MASTER_TOKEN) {
      if (requestUrl[1] && requestUrl[1].indexOf(AppConstants.APIS_USES_MASTER_TOKEN[i]) !== -1) {
        useMasterToken = true; break;
      }
    }
    // (AppConstants.APIS_USES_MASTER_TOKEN.indexOf(requestUrl[1]) !== -1)?true:false;

    if (useMasterToken && masterToken) {
      request = request.clone({
        headers: request.headers.set('token', masterToken)
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
      });
    } else if (token && token !== 'undefined') {

      if (!request.headers.has('Content-Type')) {
        request = request.clone({
          headers: request.headers.set('token', token)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
        });
      } else {
        request = request.clone({
          headers: request.headers.set('token', token)
        });
      }
    }

    if (!request.headers.has('Content-Type')) {
      request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });
    }

    if (!request.headers.has('Accept')) {
      request = request.clone({ headers: request.headers.set('Accept', 'application/json') });
    }

    if (request.headers.get('Content-Type') === 'multipart/form-data') {
      request = request.clone({
        headers: request.headers.delete('Content-Type').delete('Accept')
      });
    }

    const cachedResponse = this.cache.get(request);
    // console.log("cachedResponse ", cachedResponse);
    return cachedResponse && cachedResponse !== undefined ? of(cachedResponse) : this.sendRequest(request, next, this.cache);

    // return next.handle(request).pipe(
    //   map((event: HttpEvent<any>) => {
    //     if (event instanceof HttpResponse) {
    //       // console.log('event--->>>', event);
    //       // this.errorDialogService.openDialog(event);
    //     }
    //     // this.blockUI.stop();
    //     return event;
    //   }),
    //   catchError((error: HttpErrorResponse) => {
    //     // this.blockUI.stop();
    //     let data = {};
    //     this.errorHandler.apiError(error);
    //     return throwError(error);
    //   }));
  }

  sendRequest(req: HttpRequest<any>, next: HttpHandler, cache: RequestCache): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          cache.put(req, event);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        // this.blockUI.stop();
        // let data = {};
        this.errorHandler.apiError(error);
        return throwError(error);
      })
    );
  }

}

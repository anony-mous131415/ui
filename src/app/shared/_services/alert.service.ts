import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AlertService {
    private subject = new Subject<any>();
    private nativeSubject = new Subject<any>();
    private keepAfterNavigationChange: boolean = false;

    constructor(private router: Router) {
        // clear alert message on route change
        router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                if (this.keepAfterNavigationChange) {
                    // only keep for a single location change
                    this.keepAfterNavigationChange = false;
                } else {
                    // clear alert
                    this.subject.next();
                }
            }
        });
    }

    success(message: string, keepAfterNavigationChange = false, isNative = false) {
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        if (isNative) {
            this.nativeSubject.next({ type: 'success', text: message });
        } else {
            this.subject.next({ type: 'success', text: message });
        }
    }

    warning(message: string, keepAfterNavigationChange = false, isNative = false) {
        this.keepAfterNavigationChange = keepAfterNavigationChange;

        if (isNative) {
            this.nativeSubject.next({ type: 'warning', text: message });
        } else {
            this.subject.next({ type: 'warning', text: message });
        }

    }

    error(message: string, keepAfterNavigationChange = false, isNative = false) {
        this.keepAfterNavigationChange = keepAfterNavigationChange;

        if (isNative) {
            this.nativeSubject.next({ type: 'error', text: message });
        } else {
            this.subject.next({ type: 'error', text: message });
        }
    }

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }


    clear(isNative = false) {
        if(isNative){
            this.nativeSubject.next();
        }else{
            this.subject.next();
        }
    }

    getNativeMessage(): Observable<any> {
        return this.nativeSubject.asObservable();
    }

}
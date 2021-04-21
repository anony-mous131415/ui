import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertService } from '@app/shared/_services/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  message: any;
  nativeMessage: any;

  constructor(private alertService: AlertService) { }

  ngOnInit() {
    this.subscription = this.alertService.getMessage().subscribe(message => {
      this.message = message;
    });

    this.subscription = this.alertService.getNativeMessage().subscribe(message => {
      this.nativeMessage = message;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  clearAlert() {
    this.alertService.clear();
  }

}

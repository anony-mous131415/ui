import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, Inject, OnDestroy, OnInit } from '@angular/core';
import { AppConstants } from '@app/shared/_constants/AppConstants';
import { Themes } from '@app/shared/_constants/theme-constants';
import { ThemeService } from '@app/startup/_services/theme.service';
import { WhitelabelingEntity } from '@revxui/api-client-ts';
import { Subscription } from 'rxjs';
import { CommonService } from '@app/shared/_services/common.service';

@Directive({
  selector: '[appTheme]'
})

export class ThemeDirective implements OnInit, OnDestroy {

  themeEntities = {} as WhitelabelingEntity;
  themeSubscription: Subscription;

  constructor(
    private elementRef: ElementRef,
    @Inject(DOCUMENT) private document: any,
    private themeService: ThemeService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    // console.log("theme called");
    /**
     * Watch theme is subscribed
     * If the theme will change it will automatically called
     */
    this.themeSubscription = this.themeService.watchTheme().subscribe(response => {
      if (response) {
        this.themeEntities = response;
        // this.logger.debug('theme id ', this.themeEntities.theme.id);
        this.updateTheme(this.themeEntities.theme.id);
      }
    });

    if (this.checkWithLocalCache() === false) {
      const subDomain = this.getSubdomain() ? this.getSubdomain() : 'default';
      // if (subDomain) {
      this.themeService.populateThemeSettings(null, subDomain).then(
        (val) => {
          // this.logger.debug('val ', val);
          if (val === true) {
            this.checkWithLocalCache();
          } else {
            // this.logger.debug('val is false');
            this.updateTheme(1);
          }
        },
        (err) => {
          // this.logger.error('error ', err);
        }
      );
      // } else { // for no subdomain
      //   this.updateTheme(1);
      // }
    }

  }

  ngOnDestroy() {
    this.themeSubscription.unsubscribe();
  }

  checkWithLocalCache(): boolean {
    const themeSettigns = JSON.parse(localStorage.getItem(AppConstants.CACHED_THEME_SETTINGS));
    if (themeSettigns) {
      const themeSettingsObj = themeSettigns;
      this.updateTheme(themeSettingsObj.theme.id);
      return true;
    }
    return false;
  }

  updateTheme(themeId: number) {
    const element = this.elementRef.nativeElement;
    const theme = Themes[themeId];
    // console.log("theme ", theme);
    // tslint:disable-next-line: forin
    for (const key in theme) {
      // console.log("kye ", key);
      element.style.setProperty(key, theme[key]);
      this.document.body.style.setProperty(key, theme[key]);
    }
  }

  getSubdomain() {
    const domain = window.location.hostname;
    return this.commonService.getSubdomain(domain);
  }
}

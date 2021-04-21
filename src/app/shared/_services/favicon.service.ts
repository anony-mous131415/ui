import { Injectable, InjectionToken, Inject } from '@angular/core';
import { environment } from '@env/environment';

export abstract class Favicons {
  abstract activate(name: string): void;
  abstract reset(): void;
}

@Injectable({
  providedIn: 'root'
})
export class FaviconService implements Favicons {

  private elementId: string;
  private useCacheBusting: boolean;
  private defaultFaviconHref = environment.theme.FAV_ICON;
  private defaultFaviconType = 'image/x-icon';

  // I initialize the Favicons service.
  constructor() {
    this.elementId = 'fs-injected-node';
    this.useCacheBusting = true;
    this.removeExternalLinkElements();

  }

  public activate(href: string): void {
    this.setNode(href);
  }

  // Ativate the default favicon (with isDefault set to True).
  public reset(): void {
    this.removeExternalLinkElements();
    this.removeNode();

    this.setNode(this.defaultFaviconHref);
  }

  // Inject the favicon element into the document header.
  private addNode(href: string): void {
    const linkElement = document.createElement('link');
    linkElement.setAttribute('id', this.elementId);
    linkElement.setAttribute('rel', 'icon');
    linkElement.setAttribute('type', this.defaultFaviconType);
    linkElement.setAttribute('href', href);
    document.head.appendChild(linkElement);
  }

  // Return an augmented HREF value with a cache-busting query-string parameter.
  private cacheBustHref(href: string): string {
    const augmentedHref = (href.indexOf('?') === -1)
      ? `${href}?faviconCacheBust=${Date.now()}`
      : `${href}&faviconCacheBust=${Date.now()}`
      ;
    return (augmentedHref);
  }

  // Removing all favicon nodes that are not controlled by this service.
  private removeExternalLinkElements(): void {
    const linkElements = document.querySelectorAll("link[ rel ~= 'icon' i]");
    for (const linkElement of Array.from(linkElements)) {
      linkElement.parentNode.removeChild(linkElement);
    }
  }


  // Remove favicon node from the document header.
  private removeNode(): void {
    const linkElement = document.head.querySelector('#' + this.elementId);
    if (linkElement) {
      document.head.removeChild(linkElement);
    }
  }

  // Removing the existing favicon node and inject a new favicon node with the given
  // element settings.
  private setNode(href: string): void {
    const augmentedHref = this.useCacheBusting ? this.cacheBustHref(href) : href;
    this.removeNode();
    this.addNode(augmentedHref);
  }

}

import { Injectable } from '@angular/core';

interface Scripts {
  name: string;
  src: string;
}

export const ScriptStore: Scripts[] = [
  { name: 'helpscout', src: "../../../assets/js/helpscout.js" },
];

declare var document: any;

@Injectable({
  providedIn: 'root'
})
export class DynamicScriptLoaderService {

  private scripts: any = {};

  constructor() {
    ScriptStore.forEach((script: any) => {
      this.scripts[script.name] = {
        loaded: false,
        src: script.src
      };
    });
  }

  load(...scripts: string[]) {
    const promises: any[] = [];
    scripts.forEach((script) => promises.push(this.loadScript(script)));
    return Promise.all(promises);
  }

  remove(...scripts: string[]) {
    // console.log('removing scripts');
    const promises: any[] = [];
    scripts.forEach((script) => promises.push(this.removeScript(script)));
    return Promise.all(promises);
  }

  removeScript(name: string) {
    return new Promise((resolve, reject) => {
      const fileName = this.scripts[name].src;
      const tags = document.getElementsByTagName('script');
      for (let i = tags.length; i >= 0; i--) {
        if (tags[i] && tags[i].getAttribute('src') !== null && tags[i].getAttribute('src').indexOf('helpscout') !== -1) {
          tags[i].parentNode.removeChild(tags[i]);
        }
      }
    });
  }

  loadScript(name: string) {
    return new Promise((resolve, reject) => {
      if (!this.scripts[name].loaded) {
        //load script
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = this.scripts[name].src;
        if (script.readyState) {  //IE
          script.onreadystatechange = () => {
            if (script.readyState === 'loaded' || script.readyState === 'complete') {
              script.onreadystatechange = null;
              this.scripts[name].loaded = true;
              resolve({ script: name, loaded: true, status: 'Loaded' });
            }
          };
        } else {  //Others
          script.onload = () => {
            this.scripts[name].loaded = true;
            resolve({ script: name, loaded: true, status: 'Loaded' });
          };
        }
        script.onerror = (error: any) => resolve({ script: name, loaded: false, status: 'Loaded' });
        document.getElementsByTagName('head')[0].appendChild(script);
      } else {
        resolve({ script: name, loaded: true, status: 'Already Loaded' });
      }
    });
  }

}

import { HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConstants } from '../_constants/AppConstants';

const maxAge = AppConstants.REQUEST_CACHE_DURATION;

@Injectable({
  providedIn: 'root'
})
export class RequestCache {

    cache = new Map();
    groupCache = new Map();

    /**
     * If the cache is present in the map we will get the data from the cache, if it is not expired
     * @param req
     */
    get(req: HttpRequest<any>): HttpResponse<any> | undefined {
        let url = req.urlWithParams;
        if (req.method === 'POST') {
            url = this.getUpdatedUrl(req);
        }
        const cached = this.cache.get(url);
        // console.log("url ", url, cached);
        // console.log("this cache", this.cache);

        if (!cached) {
            return undefined;
        }

        const isExpired = cached.lastRead < (Date.now() - maxAge);
        // const expired = isExpired ? 'expired ' : '';
        if(isExpired){
            return undefined;
        }
        return cached.response;
    }

    /**
     * This is to save the cache into the map, key is url and value is the response
     * Here we are also maintaining one more cache to group the urls with a different key
     * @param req
     * @param response
     */
    put(req: HttpRequest<any>, response: HttpResponse<any>): void {
        if (!this.groupingCacheableUrls(req)) {
            return;
        }
        // console.log("request ", req);
        let url = req.urlWithParams;

        if (req.method == 'POST') {
            url = this.getUpdatedUrl(req);
        }

        const entry = { url, response, lastRead: Date.now() };
        this.cache.set(url, entry);

        const expired = Date.now() - maxAge;
        this.cache.forEach(expiredEntry => {
            if (expiredEntry.lastRead < expired) {
                this.cache.delete(expiredEntry.url);
            }
        });
    }

    /**
     * If the request is post, we are updating the url and appending the
     * payload data to the url to create the key.
     * @param req
     */
    getUpdatedUrl(req: HttpRequest<any>): string {
        let url = req.urlWithParams;
        // console.log("request url ", req);
        if (req.body && req.body.duration) {
            url += req.body.duration.startTimeStamp +''+ req.body.duration.endTimeStamp;
        }
        if (req.body && req.body.filters) {
            for(let i in req.body.filters){
                url += req.body.filters[i].column +''+ req.body.filters[i].value ;
            }
        }
        // console.log("request url updated ", url);
        return url;
    }

    /**
     * Here we are grouping the urls and save it into another cache
     * if the url contains refresh=true, meaning we have to delete the saved urls which present in that group
     * TODO : Grouping should be improvised. Here we are deleting all group if url containing refresh=true is called.
     *
     * @param req
     */
    groupingCacheableUrls(req: HttpRequest<any>): boolean {
        let url = req.urlWithParams;

        for (let i in AppConstants.REQUEST_URLS_FOR_CACHING) {

            //Checking if the url contains clear cache parameters or not
            if (url.indexOf('refresh=true') > -1) {
                //delete the cached group
                let cachedGroup = this.groupCache.get(AppConstants.REQUEST_URLS_FOR_CACHING[i]);
                // console.log("cachedGroup ", cachedGroup);
                let urlsList = [];
                if (url.indexOf(AppConstants.REQUEST_URLS_FOR_CACHING[i]) > -1) {
                    urlsList = cachedGroup.urlsList;
                    for (let u in urlsList) {
                        //deleting all urls present in the group
                        this.cache.delete(u);
                        // console.log("deleting url", urlsList[u]);
                    }
                }
            } else if (url.indexOf(AppConstants.REQUEST_URLS_FOR_CACHING[i]) !== -1) {
                if (req.method == 'POST') {
                    url = this.getUpdatedUrl(req);
                }
                let cachedGroup = this.groupCache.get(AppConstants.REQUEST_URLS_FOR_CACHING[i]);
                let urlsList = [];
                if (cachedGroup) {
                    urlsList = cachedGroup.urlsList;
                }
                urlsList.push(url);
                const entry = { urlsList };
                this.groupCache.set(AppConstants.REQUEST_URLS_FOR_CACHING[i], entry);

                return true;
            }
        }
        return false;
    }
}

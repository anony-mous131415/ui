import { AdvBasicDetails } from './basic-details.model';
import { AdvAppInfo } from './app-info.model';
import { AdvContactInfo } from './contact-info.model';

export interface AdvUIModel {
    basicDetails: AdvBasicDetails;
    appInfo: AdvAppInfo;
    contactInfo: AdvContactInfo;
}


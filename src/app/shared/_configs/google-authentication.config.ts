import { AuthServiceConfig } from "angularx-social-login";
import { GoogleLoginProvider } from "angularx-social-login";
import { environment } from '@env/environment';

export function GoogleAuthConfig() {
    let config = new AuthServiceConfig([
        {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(environment.authentication.GOOGLE_CLIENT_ID)
        }
    ]);
    return config;
}

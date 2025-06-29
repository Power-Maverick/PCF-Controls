import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import * as React from "react";
import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import * as config from "../config/PBIConfig";
import { PBIApp } from "./PBIApp";

export interface IPBIContainerProps {
    name?: string;
}

export class PBIContainer extends React.Component<IPBIContainerProps> {
    msalInstanceProvider = new PublicClientApplication(this.generateMsalConfig());

    generateMsalConfig() {
        const msalConfig = {
            auth: {
                clientId: config.clientId,
                authority: `${config.authorityUrl}${config.tenantId}`,
                redirectUri: "http://localhost:3000",
            },
            cache: {
                cacheLocation: "sessionStorage", // This configures where your cache will be stored
                storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
            },
        };

        return msalConfig;
    }

    public render(): React.ReactNode {
        return (
            <MsalProvider instance={this.msalInstanceProvider}>
                <PBIApp />
            </MsalProvider>
        );
    }
}

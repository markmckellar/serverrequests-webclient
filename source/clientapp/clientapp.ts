///<reference path="../../build/node_modules/@types/jquery/index.d.ts"/>
///<reference path="../../build/node_modules/@types/datatables.net/index.d.ts"/>
///<reference path="../../build/node_modules/@types/jqueryui/index.d.ts"/>

import { ServerRequests } from "../common/server/serverrequests";
import { UserManagement } from "../common/user/usermanagement";
import { ClientVersion } from "./clientversion";
import { UserManagementOAuth2 } from "../common/user/usermanagementoauh2";
import { ServerRequestsOAuth2 } from "../common/server/serverrequestsoauth2";
import { BaseApp } from "../common/ui/baseapp";

export class ClientApp extends BaseApp {

	private _serverRequestsOAuth2: ServerRequestsOAuth2;	
	private _userManagementOAuth2: UserManagementOAuth2;

	constructor(name:string,window:Window)
	{
		super(name,window,new ClientVersion());
		console.log("ClientApp constructor");
		let self = this;
		
		this.serverRequestsOAuth2 = new ServerRequestsOAuth2(
            this.serverInfo,
            "#ServerRequestsLoadingDiv",
            "#ServerRequestsLoadingListDiv",
            "#ServerRequestsRetry-template",
            "#ServerRequestsClear-template",
            "#ServerRequestsRedirect-template",
            ".common_server_error_wrapper",
            ".common_error_message",
			".common_error_button",
			function() { return("time="+new Date().getTime()+"&clientversion="+self.clientVersion.version); },
			function(message:string):string { return(self.showLoginRedirectWithMessage(message)); } ,
		);
		
        this.userManagementOAuth2 = new UserManagementOAuth2(
            this.serverRequestsOAuth2,
            "#UserLoginMessage",
            "/oauth/token",//"/service/validateuser",
            "/service/isvalidsession",
			"/service/logout",
			"/service/users",
			// post validated user function		
			"tutorialspoint",
			"my-secret-key",	
            function(validLogin:boolean):void {
                if(validLogin) {
					// do whatever we do when we are validated
                    $("#UserLoginUserDiv").hide();
					$("#ValidatedUserDiv").show(); 
					self.validateSession(validLogin);                
                }
                else{
                    $("#UserLoginUserDiv").show();
					$("#ValidatedUserDiv").hide();
					self.validateSession(validLogin);                
				}
			},
			function() {
				self.logOutFunction("");
			}
		);
	}

	public initClientAppPost():void {

	}

	public initServerRequests():ServerRequests {
		return(this.serverRequestsOAuth2);
	}
	public initUserManagement():UserManagement {
		return(this.userManagementOAuth2);

	}

	public get serverRequestsOAuth2(): ServerRequestsOAuth2 {
		return this._serverRequestsOAuth2;
	}
	public set serverRequestsOAuth2(value: ServerRequestsOAuth2) {
		this._serverRequestsOAuth2 = value;
	}

	public get userManagementOAuth2(): UserManagementOAuth2 {
		return this._userManagementOAuth2;
	}
	public set userManagementOAuth2(value: UserManagementOAuth2) {
		this._userManagementOAuth2 = value;
	}

}

window['clientApp'] = new ClientApp("clientApp",window);

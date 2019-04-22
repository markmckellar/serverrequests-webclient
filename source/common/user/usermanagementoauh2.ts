import { User } from "./user";
import { UserManagementBase } from "./usermanagementbase";
import { ServerRequestsOAuth2 } from "../server/serverrequestsoauth2";
import { AuthToken } from "../server/authtoken";

export class UserManagementOAuth2 extends UserManagementBase {

    private _serverRequestsOAuth2: ServerRequestsOAuth2;
    private _clientId: string;
    private _clientSecrent: string;


    constructor(serverRequests:ServerRequestsOAuth2,
        loginFailureMessageDiv:string,
        validateLoginEndpoint:string,
        validateSessionEndpoint:string,
        logoutEndpoint:string,
        userInfoEndpoint: string,
        clientId: string,
        lientSecrent: string,
        postValidatedLoginFunction: (validLogin:boolean) => void,
        logoutFunction:(message:string) => void)
    {
        super(
            serverRequests,
            loginFailureMessageDiv,
            validateLoginEndpoint,
            validateSessionEndpoint,
            logoutEndpoint,
            userInfoEndpoint,
            postValidatedLoginFunction,
            logoutFunction
        );
        this.serverRequestsOAuth2 = serverRequests;
        this.clientId = clientId;
        this.clientSecrent = this.clientSecrent;
        this.user = new User(
            {
                userName:"guest",
                password:"",
                roleList:[]
            } );
    }

    public validateLogin(userName:string,password:string):void {
	    let urlArgs = "&grant_type=password&username="+userName+"&password="+password;
        let self = this;
        $(self.loginFailureMessageDiv).html("");
        
        let clientInfo = new Buffer("tutorialspoint:my-secret-key").toString('base64');

        let extraHeaderMap:Map<string,string> = new Map<string,string>();
        extraHeaderMap["Authorization"] = "Basic "+clientInfo;        

        this.serverRequestsOAuth2.executeServerPostWithArgs("validate login",this.validateLoginEndpoint,urlArgs,extraHeaderMap,
            function(serverResponse)
            {
                self.serverRequestsOAuth2.authToken = serverResponse;

                if(serverResponse.success)
                {
                    self.setSessionAsValid(userName);
                }
                else
                {
                    $(self.loginFailureMessageDiv).html(serverResponse.message);		
                }
                self.validateSession(userName);
            }	);
    }

    
    public validateSession(userName:string):void {
        let self = this;
        this.serverRequests.executeServerGet(
			"validate session",
			this.validateSessionEndpoint,
            function(results)
            {
                if(results.success) 
                {
                    self.serverRequests.executeServerGet(
                        "get user info",
                        self.userInfoEndpoint+"/"+userName,
                        function(results)
                        {
                            self.user = new User(results);
                            self.user.password = "xxxxxxx";
                            self.user.validated = true;
                            self.postValidatedLoginFunction(true);
                        } );
                }
                else 
                {                    
                    self.user = new User(
                        {
                            userName:"guest",
                            password:"",
                            roleList:[]
                        } ); 
                    self.postValidatedLoginFunction(false);
                }
            });
    }

    public logout():void {
        this.serverRequestsOAuth2.authToken = <AuthToken>{};
        this.logoutFunction("log out");
        this.user = new User(
            {
                userName:"guest",
                password:"",
                roleList:[]
            } );  
            /*		
        let self = this;
        this.serverRequests.executeServerPostJson("logout",true,this.logoutEndpoint,{},function(results)
            {
                self.logoutFunction(results.message);
                self.user = new User(
                    {
                        userName:"guest",
                        password:"",
                        roleList:[]
                    } );  		
                
            });
            */
    }

    public get serverRequestsOAuth2(): ServerRequestsOAuth2 {
        return this._serverRequestsOAuth2;
    }
    public set serverRequestsOAuth2(value: ServerRequestsOAuth2) {
        this._serverRequestsOAuth2 = value;
    }

    public get clientId(): string {
        return this._clientId;
    }
    public set clientId(value: string) {
        this._clientId = value;
    }
    public get clientSecrent(): string {
        return this._clientSecrent;
    }
    public set clientSecrent(value: string) {
        this._clientSecrent = value;
    }
}
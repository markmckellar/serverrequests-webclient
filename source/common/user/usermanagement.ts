import { ServerRequests } from "../server/serverrequests";
import { User } from "./user";
import { UserManagementBase } from "./usermanagementbase";

export class UserManagement extends UserManagementBase {


    constructor(serverRequests:ServerRequests,
        loginFailureMessageDiv:string,
        validateLoginEndpoint:string,
        validateSessionEndpoint:string,
        logoutEndpoint:string,
        userInfoEndpoint:string,
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
        this.user = new User(
            {
                userName:"guest",
                password:"",
                roleList:[]
            } );
    }

    public validateLogin(userName:string,password:string):void {
	    let json = {"userName":userName,"password":password};
        let self = this;
        $(self.loginFailureMessageDiv).html("");		

        this.serverRequests.executeServerPostJson("validate login",true,this.validateLoginEndpoint,json,
            function(serverResponse)
            {
                console.log("validateLogin:serverResponse="+JSON.stringify(serverResponse));
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
                    let userJson =  JSON.parse(results.results);
                    self.user = new User( userJson.user );
                    
                    self.user = new User( JSON.parse(results.results) );
                    self.user.password = "xxxxxxx";
                    self.user.validated = true;
                    self.postValidatedLoginFunction(true);
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
    }

   
}
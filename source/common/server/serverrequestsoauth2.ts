///<reference path="../../../build/node_modules/@types/jquery/index.d.ts"/>

import { ServerInfo } from "./serverinfo";
import { ServerRequestsBase } from "./serverrequestsbase";
import { AuthToken } from "./authtoken";

export class ServerRequestsOAuth2 extends ServerRequestsBase {

    private _authToken: AuthToken;

    constructor(
            serverInfo:ServerInfo,
            loadingDiv:string,
            loadingListDiv:string,
            retryTemplateName:string,
            clearTemplateName:string,
            redirectTemplateName:string,
            errorWrapperClassName:string,
            errorMessageClassName:string,
            errorButtonClassName:string,
            standardUrlExtensionFunction: () => string,
            signInfunction: (message:string) => string) 
    {
        super(
            serverInfo,
            loadingDiv,
            loadingListDiv,
            retryTemplateName,
            clearTemplateName,
            redirectTemplateName,
            errorWrapperClassName,
            errorMessageClassName,
            errorButtonClassName,
            standardUrlExtensionFunction,
            signInfunction
        );
    }

    public getExtraHeaderMap():Map<string,string> {
        let extraHeaderMap = new Map<string,string>();
        //console.log("ServerRequestsOAuth2:getExtraHeaderMap:authToken="+JSON.stringify(this.authToken));
        if(this.authToken)
        {
            if(this.authToken.access_token)
            {
                extraHeaderMap["Authorization"] = "Bearer "+this.authToken.access_token;
            }
        }
        return(extraHeaderMap);
    }

    public executeServerGetWithArgs(
        loadingMessage:string,
        serviceUrl:string,
        urlArgs:string,
        successFunction:(responseJson:any)=>void

        ): void 
    {	
		let serverPromise = this.getServerPromiseWithArgs(serviceUrl,urlArgs,this.getExtraHeaderMap());
        if(loadingMessage) this.showLoading(loadingMessage);
        let self = this;
		
		$.when(serverPromise).done(
			function(responseJson:any)
			{
                if(loadingMessage) self.hideLoading(loadingMessage);
                successFunction(responseJson);
        }).fail(
            this.getHandleServerError(loadingMessage,
            function()
            {
                self.executeServerGetWithArgs(loadingMessage,serviceUrl,urlArgs,successFunction);
            }
        ));		
    }

    
    
    public executeServerPostWithArgs(
        loadingMessage:string,
        serviceUrl:string,
        urlArgs:string,
        extraHeaderMap:Map<string,string>,
        successFunction:(responseJson:any)=>void

        ): void 
    {	
        let serverPromise = this.getServerPostPromiseWithArgs(serviceUrl,urlArgs,extraHeaderMap);
        if(loadingMessage) this.showLoading(loadingMessage);
        let self = this;
		
		$.when(serverPromise).done(
			function(responseJson:any)
			{
                if(loadingMessage) self.hideLoading(loadingMessage);
                successFunction(responseJson);
        }).fail(
            this.getHandleServerError(loadingMessage,
            function()
            {
                self.executeServerGetWithArgs(loadingMessage,serviceUrl,urlArgs,successFunction);
            }
        ));		
	}


    
    public uploadFile(url:string,file:File,
        callbackFunction:(responseText: string)=>void,
        errorFunction:(xMLHttpRequest: XMLHttpRequest)=>void):void
	{
	    let xhr = new XMLHttpRequest();
	    let fd = new FormData();
        xhr.open("POST", url, true);
        if(this.authToken)
        {
            if(this.authToken.access_token)
            {
                xhr.setRequestHeader("Authorization","Bearer "+this.authToken.access_token);
            }
        }
        
	    xhr.onreadystatechange = function()
	    {
	    	if (xhr.readyState === 4)
	    	{                // 4 = Response from server has been completely loaded.
	            if (xhr.status == 200 && xhr.status < 300)  // http status between 200 to 299 are all successful
	            {
	            	// Every thing ok, file uploaded
		            console.log("uploadFile:file upoaded:"+xhr.responseText); // handle response.
		            callbackFunction(xhr.responseText);
	            }
	            else
	            {
                    errorFunction(xhr);
	            }
	        }
	    };
	    fd.append("upload_file", file);
	    xhr.send(fd);
	}

    
    public postJSON(endPoint:string,data:any):JQueryXHR {
        let url = encodeURI( this.getServiceURL(endPoint) );
        let o:any = {
                url: url,
                type: "POST",
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                headers:(<any>this.getExtraHeaderMap())
            };
        if (data !== undefined) {            
            o.data = JSON.stringify(data);
        }
        return $.ajax(o);
    }



     
    public executeServerPostJson(loadingMessage:string,showLoadingMessage:boolean,serviceUrl:string,data:any,
        successFunction:(responseJson:any)=>void): void 
    {	
        console.log("ServerRequestsOAuth2:executeServerPostJson:loadingMessage="+loadingMessage+":serviceUrl="+serviceUrl);
        if(showLoadingMessage) this.showLoading(loadingMessage);
        let srSelf = this;
        $.when(this.postJSON(serviceUrl,data)).always(
            function(arg1,textStatus,arg3) {				
                let message = null;
                let results = null;
                if(arg3.hasOwnProperty("readyState") && arg3.hasOwnProperty("status")) {
                    message = arg3;	
                    results = arg1;	
                }
                else {
                    message = arg1;	
                    results = arg3;			
                }
                // In response to a successful request, the function's arguments are the same as those of 
                // * .done(): data, textStatus, and the jqXHR object.
                //
                // For failed requests the arguments are the same as those of 
                // * .fail(): the jqXHR object, textStatus, and errorThrown. 
                //
                // Refer to deferred.always() for implementation details.
                //
                // with a failure the order of the args is diffrent :/
                // this means we can not grab results right away
                if(showLoadingMessage) srSelf.hideLoading(loadingMessage);
                if(message.readyState==4 && message.status==200) {
                    successFunction(results);
                }
                else {
                    if(!loadingMessage) loadingMessage = new Date().toISOString()+":"+serviceUrl;
                    srSelf.showLoading(loadingMessage);
                    srSelf.handleServerError(loadingMessage,message,
                        function() { 
                            srSelf.executeServerPostJson(loadingMessage,true,serviceUrl,data,successFunction); 
                        });	
                    
                }
        }); 
//        	new Date().toISOString();
    }
    


    public handleUILogout(message:string):void {
        console.log("ServerRequests:message="+message);
    }
    public get authToken(): AuthToken {
        return this._authToken;
    }
    public set authToken(value: AuthToken) {
        this._authToken = value;
    }

  


}
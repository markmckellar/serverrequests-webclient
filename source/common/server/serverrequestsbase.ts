///<reference path="../../../node_modules/@types/jquery/index.d.ts"/>

import { ServerRequest } from "./serverrequest";
import { ServerInfo } from "./serverinfo";
import { ServerRequestError } from "./serverrequesterror";
import { ServerRequestHolder } from "./serverrequestholder";

export abstract class ServerRequestsBase {

    private _serverInfo:ServerInfo;
    private _serverRequestHolder: ServerRequestHolder;
    private standardUrlExtensionFunction: () => string;
    private signInfunction: (message:string) => string

    constructor(
        
        serverInfo:ServerInfo,
        serverRequestHolder:ServerRequestHolder,
        standardUrlExtensionFunction: () => string,
        signInfunction: (message:string) => string        
    )
    {
        this.serverInfo = serverInfo;
        this.serverRequestHolder = serverRequestHolder;
        this.standardUrlExtensionFunction = standardUrlExtensionFunction;
        this.signInfunction = signInfunction;
    }

    public abstract executeServerGetWithArgs(
        loadingMessage:string,
        serviceUrl:string,
        urlArgs:string,
        successFunction:(responseJson:any)=>void

        ): void ;

    public abstract uploadFile(url:string,file:File,
            callbackFunction:(responseText: string)=>void,
            errorFunction:(xMLHttpRequest: XMLHttpRequest)=>void):void;      
            
    public abstract executeServerPostJson(loadingMessage:string,showLoadingMessage:boolean,serviceUrl:string,data:any,
           successFunction:(responseJson:any)=>void): void ;

    public abstract handleUILogout(message:string):void;

    public clearLoading():void {
        this.serverRequestHolder.clearLoading();
    }

    public showLoading(itemName:string):void {
        this.serverRequestHolder.showLoading(itemName);
    }

    public hideLoading(itemName:string):void {
        this.serverRequestHolder.hideLoading(itemName);
    }


    public executeServerGet(
        loadingMessage:string,
        serviceUrl:string,
        successFunction:(responseJson:any)=>void

        ): void 
    {	
        this.executeServerGetWithArgs(loadingMessage,serviceUrl,"",successFunction);	
    }            

    public executeWhenTrue(logName:string,testForExecutiion:()=>boolean,exucuteFunction:()=>void,sleepTime:number):void {

        console.log("ServerRequests:not ready to execute:"+logName+":sleepTime="+sleepTime);
        let self = this;
        if(!testForExecutiion()) {

            self.sleep(sleepTime).then(() => 
            {
                console.log("ServerRequests:not ready to execute:"+logName+":"+new Date().toISOString());
                self.executeWhenTrue(logName,testForExecutiion,exucuteFunction,sleepTime);
            });
        }
        else
        {
            exucuteFunction();
        }
    }

    public async sleep(ms: number) {
        await this.sleepPromise(ms);
    }
    
    private sleepPromise(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }


    public zzzsleep (time:number)
    {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    public getStandardExtenstionString():string {
        return( this.standardUrlExtensionFunction() );
    }


    public getServerPostPromiseWithArgs(endPoint:string,paramString:string,extraHeaderMap:Map<string,string>):JQueryXHR{     
        return( $.post(
            {
                url:this.getServiceURL(endPoint)+paramString,
                headers:(<any>extraHeaderMap)
            }
            ));
    }

    public getServerPostPromise(endPoint:string,extraHeaderMap:Map<string,string>):JQueryXHR{     
        return( this.getServerPostPromiseWithArgs(endPoint,"",extraHeaderMap) );
    }

    public getServerPromiseWithArgs(endPoint:string,paramString:string,extraHeaderMap:Map<string,string>):JQueryXHR{     
        return( $.get(
            {
                url:this.getServiceURL(endPoint)+paramString,
                headers:(<any>extraHeaderMap)
            }
            ) );
    }

    public getServerPromise(endPoint:string,extraHeaderMap:Map<string,string>):JQueryXHR{     
        return( this.getServerPromiseWithArgs(endPoint,"",extraHeaderMap) );
    }
       
    public getServiceURL(endPoint:string):string {
        return(
                this.serverInfo.origin+
                this.serverInfo.servicepath+
                endPoint+"?"+
                this.standardUrlExtensionFunction()
            );
    }

    public getHandleServerError(itemName:string,retryFunction:() => void) {
        let self = this;
        return(
            function(error:JQueryXHR)
            {
                self.handleServerRequestError(itemName,new ServerRequestError(error),retryFunction);               	
            }
        );
    }
    

    public handleServerError(itemName:string,error:JQueryXHR,retryFunction:() => void) {
        this.handleServerRequestError(itemName,new ServerRequestError(error),retryFunction);
    }

    public handleServerRequestError(itemName:string,serverRequestErroror:ServerRequestError,retryFunction:() => void)
    {
        console.log("*****ERROR:getHandleServerError:"+JSON.stringify(serverRequestErroror));

        if(!retryFunction)
        {
            alert(itemName+" failed with a "+serverRequestErroror.status+" and not retry function exisits");
                        console.log("ServerRequests:getHandleServerErrorXMLHttpRequest:No error handler passed for : "+
                            "error code:"+itemName+":errorText="+serverRequestErroror.responseText);
        }
        else 
        {
            if(serverRequestErroror.status==403)
                serverRequestErroror.responseText = "You do not have access to :\""+itemName+"\"";
            else if(serverRequestErroror.status==401)
                //serverRequestErroror.responseText = "You are logged out -- sign in again";
                {
                    serverRequestErroror.responseText = this.signInfunction("It appears you are not authenticated. Please sign in again<br><br><br>");        
                    return;
                }
            
            this.serverRequestHolder.setError(itemName,serverRequestErroror,retryFunction);
        }		
    }    

    public getHandleServerErrorXMLHttpRequest(itemName:string,
        retryFunction:() => void):(xhr:  XMLHttpRequest)=>void {
        let self = this;
        return(
            function(error: XMLHttpRequest)
            {
                self.handleServerRequestError(itemName,new ServerRequestError(error),retryFunction);               
            }
            
        );
    }


    /**
     * Getter serverInfo
     * @return {ServerInfo}
     */
	public get serverInfo(): ServerInfo {
		return this._serverInfo;
	}

    /**
     * Setter serverInfo
     * @param {ServerInfo} value
     */
	public set serverInfo(value: ServerInfo) {
		this._serverInfo = value;
	}

    public get serverRequestHolder(): ServerRequestHolder {
        return this._serverRequestHolder;
    }
    public set serverRequestHolder(value: ServerRequestHolder) {
        this._serverRequestHolder = value;
    }

}
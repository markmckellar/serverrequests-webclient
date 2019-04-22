///<reference path="../../../build/node_modules/@types/jquery/index.d.ts"/>

import { ServerRequest } from "./serverrequest";
import { ServerInfo } from "./serverinfo";
import { ServerRequestError } from "./serverrequesterror";

export abstract class ServerRequestsBase {

    private _loadingItems:Array<ServerRequest>;
    private _loadingDiv:string;
    private _loadingListDiv:string;
    private _retryTemplateName:string;
    private _clearTemplateName:string;
    private _redirectTemplateName:string;
    private _errorWrapperClassName:string;
    private _errorMessageClassName:string;
    private _errorButtonClassName:string;
    private _serverInfo:ServerInfo;
    private standardUrlExtensionFunction: () => string;
    private signInfunction: (message:string) => string

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
        signInfunction: (message:string) => string        
    )
    {
        this.serverInfo = serverInfo;
        this.loadingDiv = loadingDiv;
        this.loadingListDiv = loadingListDiv;
        this.loadingItems = new Array<ServerRequest>();
        this.retryTemplateName = retryTemplateName;
        this.clearTemplateName = clearTemplateName;
        this.redirectTemplateName = redirectTemplateName;
        this.errorWrapperClassName = errorWrapperClassName;
        this.errorMessageClassName = errorMessageClassName;
        this.standardUrlExtensionFunction = standardUrlExtensionFunction;
        this.errorButtonClassName = errorButtonClassName;
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

    public getNumbeExecuting():number {
        return(this.loadingItems.length);
    }    


    public renderLoadingItemDiv():void {
        let listHtml = "";
        let retryDiv = $(this.retryTemplateName).find(this.errorWrapperClassName).clone();
        let clearDiv = $(this.clearTemplateName).find(this.errorWrapperClassName).clone();
        let redirectDiv = $(this.redirectTemplateName).find(this.errorWrapperClassName).clone();
        let foundIssue:boolean = false;        

        for(let i=0;i<this.loadingItems.length;i++)
        {
            let item = this.loadingItems[i];
            let errorHtml = "";
            
            if(item.retryFunction) {
                $(retryDiv).find(this.errorMessageClassName).html(item.errorResponseText);
                $(retryDiv).find(this.errorButtonClassName).attr('itemName',item.name);
                errorHtml = $(retryDiv).get(0).outerHTML ;                                
                foundIssue = true;
            }            
            else if(item.error) {
                $(clearDiv).find(this.errorMessageClassName).html(item.errorResponseText);
                $(clearDiv).find(this.errorMessageClassName).data('itemName',item.name);
                errorHtml = $(clearDiv).get(0).outerHTML ;                
                foundIssue = true;
            }            
            //console.log("ServerRequests:renderLoadingItemDiv:item.name="+item.name+":errorHtml="+errorHtml);
            listHtml +="<li><div>"+item.name+"</div><div>"+errorHtml+"</div></li>";	            
        }

        if(foundIssue) listHtml = 	$(redirectDiv).html()+listHtml;
        listHtml = "<ul>"+listHtml+"</ul>";	

        $(this.loadingListDiv).html(listHtml);	
        if(this.loadingItems.length==0) $(this.loadingDiv).hide();
        else $(this.loadingDiv).show();
    }

    public setError(itemName:string,error:ServerRequestError,retryFunction:() => void) {
        console.log("ServerRequests:setError:itemName="+itemName)
        let errorResonseText = "";
        //if(error.hasOwnProperty("responseText"))
        if(error.responseText)
        {
            errorResonseText = error.responseText;
            errorResonseText = errorResonseText.replace(/([\s]*\n<br.>)+/ig, "<div></div>");
            errorResonseText = errorResonseText.replace(/<h1>/ig, "<div>");
            errorResonseText = errorResonseText.replace(/<\/h1>/ig, "</div>");
            errorResonseText = errorResonseText.replace(/<strong>/ig, "<div>");
            errorResonseText = errorResonseText.replace(/<\/strong>/ig, "</div>");
        }
        else
        {
            errorResonseText = "(No response. Is the server reachable?)";
        }
            
        let item = this.getItemFromName(itemName);
        if(item)
        {
            item.error = error;		
            item.retryFunction = retryFunction;		
            item.errorResponseText = errorResonseText;
            console.log("ServerRequests:setError:itemName="+itemName);

        }
        else
        {
            if(!item) console.log("ServerRequests:setError:NOT FOUND TO SET!:itemName="+itemName);
        }
        this.renderLoadingItemDiv();
    }
    
    public retry(element:HTMLElement):void {   
        console.log("ServerRequests:retry...");     
        let itemName:string = $(element).attr('itemName');
        console.log("ServerRequests:retry:itemName="+itemName);
        this.retryError(itemName);
    }

    public clear(element:HTMLElement):void {
        this.clearError($(element).data('itemName'));
    }

    public getItemFromName(itemName:string):ServerRequest {
        console.log("ServerRequests:getItemFromName:itemName="+itemName);
        let foundItem:ServerRequest = null;
        for(let i=0;i<this.loadingItems.length;i++)
        {
            let item = this.loadingItems[i];

            if(item.name==itemName)
            {
                foundItem = item;
                break;   
            }
        }
        if(foundItem==null) {
            console.log("ServerRequests:getItemFromName:itemName="+itemName);
            throw new Error("ServerRequests:getItemFromName:itemName="+itemName+":NOT FOUND");
        }
        return(foundItem);
    }


    public retryError(itemName:string) {
        console.log("SeverRequests:retryError:itemName="+itemName)
        let item = this.getItemFromName(itemName);
        if(item.retryFunction)
        {
            console.log("SeverRequests:retryError:retrying...:itemName="+JSON.stringify(item));
            console.log("SeverRequests:retryError:function string:"+item.retryFunction.toString());

            this.clearError(itemName);
            item.retryFunction();
        }
        else
        {
            console.log("SeverRequestsretryError:can not retry, missing retry function:itemName="+JSON.stringify(item));
        }
    }

    public clearError(itemName:string) {
        console.log("clearError:itemName="+itemName)
        let item = this.getItemFromName(itemName);
        if(item) item.error = null;		
        this.hideLoading(itemName);
    }

    public clearLoading() {
        this.loadingItems = new Array<ServerRequest>();
        this.renderLoadingItemDiv();
    }


    public showLoading(itemName:string):void {
        this.loadingItems.push(new ServerRequest(itemName,null));
        this.renderLoadingItemDiv();
    }


    public hideLoading(itemName:string) {
        console.log("SeverRequests:hideLoading:itemName="+itemName)

        let newList = new Array();
        for(let i=0;i<this.loadingItems.length;i++)
        {
            let item = this.loadingItems[i];
            if(item.name!=itemName) newList.push(this.loadingItems[i]);
            else if(item.error) newList.push(this.loadingItems[i]);
        }
        if(!itemName) newList = new Array();
        this.loadingItems = newList;
        this.renderLoadingItemDiv();
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
            
            this.setError(itemName,serverRequestErroror,retryFunction);
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
     * Getter errorButtonClassName
     * @return {string}
     */
	public get errorButtonClassName(): string {
		return this._errorButtonClassName;
	}

    /**
     * Setter errorButtonClassName
     * @param {string} value
     */
	public set errorButtonClassName(value: string) {
		this._errorButtonClassName = value;
	}



    /**
     * Getter loadingListDiv
     * @return {string}
     */
	public get loadingListDiv(): string {
		return this._loadingListDiv;
	}

    /**
     * Setter loadingListDiv
     * @param {string} value
     */
	public set loadingListDiv(value: string) {
		this._loadingListDiv = value;
	}


    /**
     * Getter loadingDiv
     * @return {string}
     */
	public get loadingDiv(): string {
		return this._loadingDiv;
	}

    /**
     * Setter loadingDiv
     * @param {string} value
     */
	public set loadingDiv(value: string) {
		this._loadingDiv = value;
	}


    /**
     * Getter loadingItems
     * @return {Array<ServerRequest>}
     */
	public get loadingItems(): Array<ServerRequest> {
		return this._loadingItems;
	}

    /**
     * Setter loadingItems
     * @param {Array<ServerRequest>} value
     */
	public set loadingItems(value: Array<ServerRequest>) {
		this._loadingItems = value;
    }
    
   
    /**
     * Getter errorMessageClassName
     * @return {string}
     */
	public get errorMessageClassName(): string {
		return this._errorMessageClassName;
	}

    /**
     * Setter errorMessageClassName
     * @param {string} value
     */
	public set errorMessageClassName(value: string) {
		this._errorMessageClassName = value;
	}


    /**
     * Getter clearTemplateName
     * @return {string}
     */
	public get clearTemplateName(): string {
		return this._clearTemplateName;
	}

    /**
     * Setter clearTemplateName
     * @param {string} value
     */
	public set clearTemplateName(value: string) {
		this._clearTemplateName = value;
	}



    /**
     * Getter retryTemplateName
     * @return {string}
     */
	public get retryTemplateName(): string {
		return this._retryTemplateName;
	}

    /**
     * Setter retryTemplateName
     * @param {string} value
     */
	public set retryTemplateName(value: string) {
		this._retryTemplateName = value;
	}


    /**
     * Getter redirectTemplateName
     * @return {string}
     */
	public get redirectTemplateName(): string {
		return this._redirectTemplateName;
	}

    /**
     * Setter redirectTemplateName
     * @param {string} value
     */
	public set redirectTemplateName(value: string) {
		this._redirectTemplateName = value;
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


    /**
     * Getter errorWrapperClassName
     * @return {string}
     */
	public get errorWrapperClassName(): string {
		return this._errorWrapperClassName;
	}

    /**
     * Setter errorWrapperClassName
     * @param {string} value
     */
	public set errorWrapperClassName(value: string) {
		this._errorWrapperClassName = value;
	}


}
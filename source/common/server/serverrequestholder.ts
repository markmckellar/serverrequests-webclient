import { ServerRequest } from "./serverrequest";
import { ServerRequestError } from "./serverrequesterror";


export class ServerRequestHolder {

    private _loadingItems:Array<ServerRequest>;
    private _loadingDiv:string;
    private _loadingListDiv:string;
    private _retryTemplateName:string;
    private _clearTemplateName:string;
    private _redirectTemplateName:string;
    private _errorWrapperClassName:string;
    private _errorMessageClassName:string;
    private _errorButtonClassName:string;
    constructor(
        loadingDiv:string,
        loadingListDiv:string,
        retryTemplateName:string,
        clearTemplateName:string,
        redirectTemplateName:string,
        errorWrapperClassName:string,
        errorMessageClassName:string,
        errorButtonClassName:string,
    )
    {
        this.loadingDiv = loadingDiv;
        this.loadingListDiv = loadingListDiv;
        this.loadingItems = new Array<ServerRequest>();
        this.retryTemplateName = retryTemplateName;
        this.clearTemplateName = clearTemplateName;
        this.redirectTemplateName = redirectTemplateName;
        this.errorWrapperClassName = errorWrapperClassName;
        this.errorMessageClassName = errorMessageClassName;
        this.errorButtonClassName = errorButtonClassName;
    }
    public getNumbeExecuting():number {
        return(this.loadingItems.length);
    }    

    public renderLoadingItemDiv():void {
        let listHtml = "";
        let retryDiv = $(this.retryTemplateName).find(this.errorWrapperClassName).clone();
        if(retryDiv==null) throw Error("Did not find element="+this.retryTemplateName+" class="+this.errorWrapperClassName);
        let clearDiv = $(this.clearTemplateName).find(this.errorWrapperClassName).clone();
        if(retryDiv==null) throw Error("Did not find element="+this.clearTemplateName+" class="+this.errorWrapperClassName);
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

    public retry(element:HTMLElement):void {   
        console.log("ServerRequests:retry...");     
        let itemName:string = $(element).attr('itemName');
        console.log("ServerRequests:retry:itemName="+itemName);
        this.retryError(itemName);
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
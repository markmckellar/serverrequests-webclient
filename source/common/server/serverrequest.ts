import { ServerRequestError } from "./serverrequesterror";

export class ServerRequest {
    private _name:string;
    private _error:ServerRequestError;
    private _errorResponseText:string;
    private _retryFunction:() => void
    

    constructor(name:string,error:ServerRequestError) {
        this.name = name;
        this.error = error;
        this.errorResponseText = "";
    }


    /**
     * Getter errorResponseText
     * @return {string}
     */
	public get errorResponseText(): string {
		return this._errorResponseText;
	}

    /**
     * Setter errorResponseText
     * @param {string} value
     */
	public set errorResponseText(value: string) {
		this._errorResponseText = value;
	}


    /**
     * Getter name
     * @return {string}
     */
	public get name(): string {
		return this._name;
	}

    /**
     * Setter name
     * @param {string} value
     */
	public set name(value: string) {
		this._name = value;
	}


    /**
     * Getter error
     * @return {ServerRequestError}
     */
	public get error(): ServerRequestError {
		return this._error;
	}

    /**
     * Setter error
     * @param {ServerRequestError} value
     */
	public set error(value: ServerRequestError) {
		this._error = value;
	}
   

    /**
     * Getter retryFunction
     * @return {() => void}
     */
	public get retryFunction():() => void {
		return(this._retryFunction);
	}

    /**
     * Setter retryFunction
     * @param {retryFunction:() => void} value
     */
	public set retryFunction(retryFunction:() => void) {
		this._retryFunction = retryFunction;
	}


}
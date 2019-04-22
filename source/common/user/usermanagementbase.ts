import { User } from "./user";
import { ServerRequestsBase } from "../server/serverrequestsbase";

export abstract class UserManagementBase {
    private _serverRequests:ServerRequestsBase;
    private _userName:string;
    private _userIsValidated:boolean;
    private _loginFailureMessageDiv:string;
    private _validateLoginEndpoint:string;
    private _validateSessionEndpoint:string;
    private _logoutEndpoint:string;
    private _userInfoEndpoint: string;
    private _postValidatedLoginFunction: (validLogin: boolean) => void;
    protected logoutFunction:(message:string) => void;
    private _user: User;


    constructor(serverRequests:ServerRequestsBase,
        loginFailureMessageDiv:string,
        validateLoginEndpoint:string,
        validateSessionEndpoint:string,
        logoutEndpoint:string,
        userInfoEndpoint:string,
        postValidatedLoginFunction: (validLogin:boolean) => void,
        logoutFunction:(message:string) => void)
    {
        this.serverRequests = serverRequests;
        this.userName = "";
        this.userIsValidated = false;
        this.loginFailureMessageDiv = loginFailureMessageDiv;
        this.validateLoginEndpoint = validateLoginEndpoint;
        this.validateSessionEndpoint = validateSessionEndpoint;
        this.logoutEndpoint = logoutEndpoint;
        this.userInfoEndpoint = userInfoEndpoint;
        this.postValidatedLoginFunction = postValidatedLoginFunction;
        this.logoutFunction = logoutFunction;
        this.user = new User(
            {
                userName:"guest",
                password:"",
                roleList:[]
            } );
    }

    public abstract validateLogin(userName:string,password:string):void;

    public abstract logout():void;

    public abstract validateSession(userName:string):void;


    protected setSessionAsValid(userName:string) {
        this.userName = userName;
        this.userIsValidated = true;
        this.user = new User(
            {
                userName:userName,
                password:"",
                roleList:[]
            } ); 
        this.user.validated = true;

    }

    public get user(): User {
        return this._user;
    }
    public set user(value: User) {
        this._user = value;
    }

    /**
     * Getter validateSessionEndpoint
     * @return {string}
     */
	public get validateSessionEndpoint(): string {
		return this._validateSessionEndpoint;
	}

    /**
     * Setter validateSessionEndpoint
     * @param {string} value
     */
	public set validateSessionEndpoint(value: string) {
		this._validateSessionEndpoint = value;
	}


    /**
     * Getter validateLoginEndpoint
     * @return {string}
     */
	public get validateLoginEndpoint(): string {
		return this._validateLoginEndpoint;
	}

    /**
     * Setter validateLoginEndpoint
     * @param {string} value
     */
	public set validateLoginEndpoint(value: string) {
		this._validateLoginEndpoint = value;
	}


    /**
     * Getter loginFailureMessageDiv
     * @return {string}
     */
	public get loginFailureMessageDiv(): string {
		return this._loginFailureMessageDiv;
	}

    /**
     * Setter loginFailureMessageDiv
     * @param {string} value
     */
	public set loginFailureMessageDiv(value: string) {
		this._loginFailureMessageDiv = value;
	}


    /**
     * Getter userIsValidated
     * @return {boolean}
     */
	public get userIsValidated(): boolean {
		return this._userIsValidated;
	}

    /**
     * Setter userIsValidated
     * @param {boolean} value
     */
	public set userIsValidated(value: boolean) {
		this._userIsValidated = value;
	}


    /**
     * Getter userName
     * @return {string}
     */
	public get userName(): string {
		return this._userName;
	}

    /**
     * Setter userName
     * @param {string} value
     */
	public set userName(value: string) {
		this._userName = value;
	}


    /**
     * Getter serverRequests
     * @return {ServerRequests}
     */
	public get serverRequests(): ServerRequestsBase {
		return this._serverRequests;
	}

    /**
     * Setter serverRequests
     * @param {ServerRequests} value
     */
	public set serverRequests(value: ServerRequestsBase) {
		this._serverRequests = value;
	}

    /**
     * Getter logoutEndpoint
     * @return {string}
     */
	public get logoutEndpoint(): string {
		return this._logoutEndpoint;
	}

    /**
     * Setter logoutEndpoint
     * @param {string} value
     */
	public set logoutEndpoint(value: string) {
		this._logoutEndpoint = value;
	}
    public get userInfoEndpoint(): string {
        return this._userInfoEndpoint;
    }
    public set userInfoEndpoint(value: string) {
        this._userInfoEndpoint = value;
    }

    public get postValidatedLoginFunction(): (validLogin: boolean) => void {
        return this._postValidatedLoginFunction;
    }
    public set postValidatedLoginFunction(value: (validLogin: boolean) => void) {
        this._postValidatedLoginFunction = value;
    }

}
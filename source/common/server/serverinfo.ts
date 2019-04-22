export class ServerInfo {
    private _host:string;
    private _hostname:string;
    private _origin:string;
    private _pathname:string;
    private _port:string;
    private _protocol:string;
    private _servicepathbase:string;
    private _servicepath:string;

    constructor(servicepathbase:string,window:Window) {
        this.host = window.location.host;
        this.hostname = window.location.hostname;
        this.origin = window.location.origin;
        this.pathname = window.location.pathname;
        this.port = window.location.port;
        this.protocol = window.location.protocol;
        this.servicepathbase = servicepathbase;
        this.servicepath = "/"+this.pathname.split("/")[1];
    }


    /**
     * Getter host
     * @return {string}
     */
	public get host(): string {
		return this._host;
	}

    /**
     * Setter host
     * @param {string} value
     */
	public set host(value: string) {
		this._host = value;
	}


    /**
     * Getter hostname
     * @return {string}
     */
	public get hostname(): string {
		return this._hostname;
	}

    /**
     * Setter hostname
     * @param {string} value
     */
	public set hostname(value: string) {
		this._hostname = value;
	}


    /**
     * Getter servicepath
     * @return {string}
     */
	public get servicepath(): string {
		return this._servicepath;
	}

    /**
     * Setter servicepath
     * @param {string} value
     */
	public set servicepath(value: string) {
		this._servicepath = value;
	}


    /**
     * Getter origin
     * @return {string}
     */
	public get origin(): string {
		return this._origin;
	}

    /**
     * Setter origin
     * @param {string} value
     */
	public set origin(value: string) {
		this._origin = value;
    }
    

    /**
     * Getter pathname
     * @return {string}
     */
	public get pathname(): string {
		return this._pathname;
	}

    /**
     * Setter pathname
     * @param {string} value
     */
	public set pathname(value: string) {
		this._pathname = value;
    }
    

    /**
     * Getter port
     * @return {string}
     */
	public get port(): string {
		return this._port;
	}

    /**
     * Setter port
     * @param {string} value
     */
	public set port(value: string) {
		this._port = value;
	}


    /**
     * Getter protocol
     * @return {string}
     */
	public get protocol(): string {
		return this._protocol;
	}

    /**
     * Setter protocol
     * @param {string} value
     */
	public set protocol(value: string) {
		this._protocol = value;
	}


    /**
     * Getter servicepathbase
     * @return {string}
     */
	public get servicepathbase(): string {
		return this._servicepathbase;
	}

    /**
     * Setter servicepathbase
     * @param {string} value
     */
	public set servicepathbase(value: string) {
		this._servicepathbase = value;
	}


}
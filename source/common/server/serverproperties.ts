import { JSON2TS } from "../util/json2ts";
import { ServerProperty } from "./serverproperty";

export class ServerProperties {
    private _tomcatServletApiVersionMajorVersion: string;
    private _tomcatServletApiVersionMinorVersion: string;
    private _tomcatServerTime: string;
    private _serverPropertyArray: Array<ServerProperty>;

    constructor(object:any) {
        this.tomcatServletApiVersionMajorVersion = JSON2TS.getString("tomcatServletApiVersionMajorVersion",object);
        this.tomcatServletApiVersionMinorVersion = JSON2TS.getString("tomcatServletApiVersionMinorVersion",object);
        this.tomcatServerTime = JSON2TS.getString("tomcatServerTime",object);
        this.serverPropertyArray = <Array<ServerProperty>>object.properties._properties;
    }

    public getPropertyValue(category:string,name:string):string {
        let foundValue = "property with category="+category+" name="+name+" not found";
		for(let i:number=0;i<this.serverPropertyArray.length;i++)
		{
            let p = this.serverPropertyArray[i];
			if(p._category==category && p._name==name)
			{
				foundValue = p._value;
				break;
			}
		}
		return(foundValue);
	}

    public get serverPropertyArray(): Array<ServerProperty> {
        return this._serverPropertyArray;
    }
    public set serverPropertyArray(value: Array<ServerProperty>) {
        this._serverPropertyArray = value;
    }

    public get tomcatServerTime(): string {
        return this._tomcatServerTime;
    }
    public set tomcatServerTime(value: string) {
        this._tomcatServerTime = value;
    }

    public get tomcatServletApiVersionMinorVersion(): string {
        return this._tomcatServletApiVersionMinorVersion;
    }
    public set tomcatServletApiVersionMinorVersion(value: string) {
        this._tomcatServletApiVersionMinorVersion = value;
    }

    public get tomcatServletApiVersionMajorVersion(): string {
        return this._tomcatServletApiVersionMajorVersion;
    }
    public set tomcatServletApiVersionMajorVersion(value: string) {
        this._tomcatServletApiVersionMajorVersion = value;
    }
}
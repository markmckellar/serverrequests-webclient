import { JSON2TS } from "../util/json2ts";
import { Role } from "./role";

export class User {
    userName:string;
    password: string;
    roleArray: Array<Role>;
    validated: boolean;

    constructor(object:any) {
        this.userName = JSON2TS.getString("userName",object);
        this.password = JSON2TS.getString("password",object);
        this.roleArray = <Array<Role>>object.roleList;
        this.validated = false;
    }

    public doesUserHaveRole(roleCategory:string,roleName:string):boolean	{
        let hasRole = false;
		for(let i:number=0;i<this.roleArray.length;i++)
		{
            let r:Role = this.roleArray[i];
			if(r._category==roleCategory && r._name==roleName)
			{
				hasRole = true;
				break;
			}
		}
        return(hasRole);
	}
}
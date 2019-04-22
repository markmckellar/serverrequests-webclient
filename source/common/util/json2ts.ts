export class JSON2TS {

    public static getObjectByTag(key:string,object:any):any {
        let value:any = null;
        if(key==null || key=="") value = object;
        else if(object.hasOwnProperty(key)) value = object[key];
        else throw new Error("Error occured covnerting JSON to TS becasue a key was missing, key :"+key);
        return(value);
    }

    public static hasTag(key:string,object:any):boolean {
        return( (object.hasOwnProperty(key)) );
    }

    public static getString(key:string,object:any):string {
        let value:string = JSON2TS.getObjectByTag(key,object);
        return(value);
    }

    public static getNumber(key:string,object:any):number {
        let value:number = JSON2TS.getObjectByTag(key,object);
        return(value);
    }

    public static getDate(key:string,object:any):Date {
        let value:Date = JSON2TS.getObjectByTag(key,object);
        return(value);
    }

    public static getBoolean(key:string,object:any):boolean {
        let value:boolean = JSON2TS.getObjectByTag(key,object);
        return(value);
    }

    public static getArray(key:string,object:any):Array<any> {
        let value:Array<any> = JSON2TS.getObjectByTag(key,object);
        return(value);
    }

    public static getMap(key:string,object:any):Map<string,any> {
        console.log("getMap:key="+key);
        console.log("getMap:object="+JSON.stringify(object));
        let value:Map<string,any> = JSON2TS.getObjectByTag(key,object);
        console.log("getMap:value="+JSON.stringify(value));
        return(value);
    }

    public static getTypeArray<T>(key:string,object:any,typeFiller: (object:any) => T):Array<T> {
        let typeArray:Array<T> = new Array<T>();        
        let anyArray:Array<any> = 
            (key) ?
                JSON2TS.getArray(key,object) :
                object;
        for(let i=0;i<anyArray.length;i++) typeArray.push( typeFiller(anyArray[i]) );
        return(typeArray);
    }

    public static getTypeMap<T>(key:string,object:any,typeFiller: (object:any) => T):Map<string,T> {
        let typeMap:Map<string,T> = new Map<string,T>();
        let anyObject = JSON2TS.getObjectByTag(key,object);
        var keys = Object.keys(anyObject);
        for(let i=0;i<keys.length;i++) {
            let key:string = keys[i];
            let obj:any = anyObject[key];
            typeMap.set(key,typeFiller(obj))
        }
        return(typeMap);
    }
}
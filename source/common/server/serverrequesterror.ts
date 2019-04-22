export class ServerRequestError {
    public responseText: string;
    public errorObject: any;
    public status:number;


    public constructor(errorObject:any) {
        this.responseText = errorObject.responseText;
        this.errorObject = errorObject;
        this.status=errorObject.status;
    }

   
}


export class VersionBase {
    public versionOrg:string;
    public version:string;

    constructor(version:string) {
        this.versionOrg = version;
        this.version = version;        
        this.version = this.version.replace(/ /g,"_");
        this.version = this.version.replace(/\(/g,"_");
        this.version = this.version.replace(/\)/g,"_");
    }
}
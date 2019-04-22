///<reference path="../../../build/node_modules/@types/jquery/index.d.ts"/>
///<reference path="../../../build/node_modules/@types/datatables.net/index.d.ts"/>
///<reference path="../../../build/node_modules/@types/jqueryui/index.d.ts"/>

import { ServerInfo } from "../server/serverinfo";
import { ServerRequests } from "../server/serverrequests";
import { UserManagement } from "../user/usermanagement";
import { ServerProperties } from "../server/serverproperties";

import { ColumnData } from "./columndata";
import { VersionBase } from "../server/versionbase";

export abstract class BaseApp {



	private _serverInfo: ServerInfo;
	private _serverRequests: ServerRequests;
	private _userManagement: UserManagement;
	private _clientVersion: VersionBase;
	private _serverProperties: ServerProperties;
	private _documentDataIdLookup: any;
	private _loginDetails: any;
	
	constructor(name:string,window:Window,clientVersion:VersionBase) {
		console.log("BaseApp constructor");

		this.clientVersion = clientVersion;

		this.serverInfo = new ServerInfo(name,window);
		console.log("BaseApp constructor:"+this.serverInfo.servicepath);
		this.serverInfo.servicepath = "";

		this.documentDataIdLookup = {};
		this.loginDetails = {};
	}

	public abstract initServerRequests():ServerRequests;
	public abstract initUserManagement():UserManagement;
	public abstract initClientAppPost():void;



	public initClientApp():void
	{
		this.serverRequests = this.initServerRequests();
		this.userManagement = this.initUserManagement();

		this.initServerProperties();
		
		this.validateSession(false);	
		
		let self = this;

		this.checkServerInfo();
		window.history.pushState('forward', null,this.serverInfo.pathname);
		$(window).on('popstate', function()
		{
			self.userManagement.logout();
		});
		this.userManagement.logout();
		window.onbeforeunload = function() {
			return "Leaving the site casue any unsaved data to be lost";
		}
		this.initClientAppPost();
	}



	public get loginDetails(): any {
		return this._loginDetails;
	}
	public set loginDetails(value: any) {
		this._loginDetails = value;
	}	
	public get documentDataIdLookup(): any {
		return this._documentDataIdLookup;
	}
	public set documentDataIdLookup(value: any) {
		this._documentDataIdLookup = value;
	}
	
	public get clientVersion(): VersionBase {
		return this._clientVersion;
	}
	public set clientVersion(value: VersionBase) {
		this._clientVersion = value;
	}

	public get serverProperties(): ServerProperties {
		return this._serverProperties;
	}
	public set serverProperties(value: ServerProperties) {
		this._serverProperties = value;
	}
	public get userManagement(): UserManagement {
		return this._userManagement;
	}
	public set userManagement(value: UserManagement) {
		this._userManagement = value;
	}

	public get serverRequests(): ServerRequests {
		return this._serverRequests;
	}
	public set serverRequests(value: ServerRequests) {
		this._serverRequests = value;
	}

	public get serverInfo(): ServerInfo {
		return this._serverInfo;
	}
	public set serverInfo(value: ServerInfo) {
		this._serverInfo = value;
	}

	public initServerProperties(): void {	
        let self = this;
		this.serverRequests.executeServerGet(
			"init server info",
			"/service/serverproperties",
			function(sessionDetails)
			{
				self.serverProperties = new ServerProperties(sessionDetails);
			}
		);
	}

	public checkServerInfo(): void {	
		let self = this;
		this.serverRequests.executeServerGet(
			"check server info",
			"/service/serverproperties",
			function(sessionDetails)
			{
				console.log("checkServerInfo:sessionDetails="+sessionDetails);

				let serverProperties:ServerProperties = new ServerProperties(sessionDetails);

				let serverInfoJson = JSON.parse( serverProperties.getPropertyValue('telegc','server_info_json') );					
				let configName:string = serverProperties.getPropertyValue('General','Configuration Name');	
				let message = "";
				
				if(serverInfoJson.headerText) message = "<b>"+serverInfoJson.headerText+"</b>";
				
				if( (self.serverInfo.origin+self.serverInfo.pathname)!=serverInfoJson.serverUrl) 
				{
					if(message!="") message += "<b> : </b>";
					message += "<i><b>Non standard access URL for "+configName+" enviroment, standard URL is :</b> " +serverInfoJson.serverUrl+"</i>";
				}
				if(message!="")
				{				
					$( ".common_server_message" ).html(message);
					$( ".common_server_message" ).css( "color",serverInfoJson.fgcolor);
					$( ".common_server_message" ).css( "background-color",serverInfoJson.bgcolor);
					$( ".common_server_message" ).css( "border", "3px solid "+serverInfoJson.fgcolor );
				}
			}
		);
	}

	public isInformaticsUser():boolean {
		return( this.userManagement.user.doesUserHaveRole("telegc","informatics") );
	}

	public showInformaticsText(templateDiv:JQuery,textDiv:string,showDiv:string,text:string) {
		if(this.isInformaticsUser())
		{
			$(templateDiv).find(textDiv).val(text);
			$(templateDiv).find(showDiv).show();
		}
	}
	
	public addTemplate(object:any,
		addToDiv:JQuery,
		templateDiv:string,
		tagPrefix:string,
		append:boolean,
		postEditFunction:(template:JQuery)=>void):JQuery
	{
		let template:JQuery = $(templateDiv).clone();		
		let tags:any = Object.keys(object);
		for(let i:number=0;i<tags.length;i++)
		{
			let tag:any = tags[i];
			let id:string = "#"+tagPrefix+tag;
			//console.log("replacing "+id+" with:"+object[tag]+" type is:"+typeof(object[tag]));		
			$(template).find(id).html(object[tag]);
		}
		postEditFunction(template);
		template.show();
		if(!append)
		{
			$(addToDiv).empty();
		}
		let html:string = $(addToDiv).html();
		$(addToDiv).html(html+template.html());
		return(addToDiv);
	}


	public  showSessionInfoDialog():void {
		let self = this;
		this.serverRequests.executeServerGet(
			"session details",
			"/service/serverinfo",
			function(sessionDetails)
			{
				let detailMap:any = 
				{
					/*
					userName:sessionDetails.tgWebSessionInfo.userName,
					clientVersion:"clientApp : v"+self.clientVersion.version,
					enviorment:self.serverProperties.getPropertyValue('General','Configuration Name'),
					serverVersion:sessionDetails.serverVersion,
					sessionCreationTime:sessionDetails.sessionCreationTime,
					*/
				};
				let templateDiv = self.addTemplate(
					detailMap,
					$('#sessionInfoDialog'),
					'#sessionInfoDialogTemplate',
					'sessionInfoDialogTemplate-',
					false,
					function(templateJQuery){});
					
				//sessionDetails.tgServer = self.serverInfo;
				self.showInformaticsText( templateDiv,"#currentSessionJsonText","#currentSessionJsonDiv",JSON.stringify(sessionDetails) );				
					
				$('#sessionInfoDialog').dialog({
					title: "session info",
					height:'auto',
					width:'auto',
					modal:true,	    	   
				});			
		});	
	}


public showInformaticsDivs(parentDiv:string):void
{	
	if(this.isInformaticsUser())
	{
		$(parentDiv).find(".common_informatics_only").show();
	}
}


public logOutFunction(message:string):void {
	$("#UserLoginUserDiv").show();
	$("#ValidatedUserDiv").hide();
}

public showLoginRedirectWithMessage(message:string):string {
	$('#loginRedirectInnerText').html(message);				    	
	this.showLoginRedirect();
	return(message);
}

public showLoginRedirect():void
{
	window.onbeforeunload = function() {};
	this.serverRequests.clearLoading();
    $('#loginRedirect').show();				    	
}


public validateSession(isValid:boolean):void
{
	if(isValid)
	{
		$("#username_input").attr("value","");
		$("#password_input").attr("value","");
	}
	else
	{
		if(this.userManagement.user.validated)
		{
			this.showLoginRedirectWithMessage("Your session has expired<br>")
		}
		else
		{			
		}			
	}
}

public setLoginDetails(afterFunction:()=>void):void
{	
	let self= this;		
	this.serverRequests.executeServerGet(
		"session details",
		"/service/serverinfo",
		function(sessionDetails)
		{
			self.loginDetails =  sessionDetails;	
			if(afterFunction) afterFunction();						
	});	
}

    public translateObjectsToTableArray(data,columnData:Array<ColumnData>):any
	{
		let dataRows = new Array();
		for(let i=0;i<data.length;i++)
		{			
			let current = data[i];
			let rowData = [];
			for(var j=0;j<columnData.length;j++)
			{
				let column = columnData[j];
				rowData.push(current[column.name]);				
			}
			rowData.push(current); // and the whole object in for reference
			dataRows.push(rowData);
		}
		return({
			columns: columnData,
	        data:dataRows,
		});	        		
	}

	
	public logSession(logMessage:string,session:any)
	{
		console.log("--- logSession start : " + logMessage + " ---------------------------------------------------");
		console.log(JSON.stringify(session.activeTgSessionVersion));
		console.log("--- logSession end : " + logMessage + " ---------------------------------------------------");
	}

	public logJson(logMessage:string,json:any)
	{
		console.log("--- logJson start : " + logMessage + " ---------------------------------------------------");
		console.log(JSON.stringify(json));
		console.log("--- logJson end : " + logMessage + " ---------------------------------------------------");
	}

	public logString(logMessage:string,string:string)
	{
		console.log("--- logString start : " + logMessage + " ---------------------------------------------------");
		console.log(string);
		console.log("--- logString end : " + logMessage + " ---------------------------------------------------");
	}
}
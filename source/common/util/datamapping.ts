export class DataMapping {

    constructor() {
        
    }
    /**
     * mapObjectArrayToTemplate
     * @param {Array<any>} objectArray A object that will have its attribues mapped to a element based upon its keys
     * @param {HTMLElement} addToDiv A #id of an object that the mapped to element will be added to
     * @param {string} templateDiv The #id of template element to clone and use for the mapping
     * @param {string} tagPrefix Text to be added to each key in the object before attempting a mapping
     * @param {boolean} append Determins if the #addToDiv should be appended to or emptied
     * @param {string} newIdProperty as each object is mapped to the template this property is copped from the object into the id property of the cloned object
     * @param {para:JQuery)=>void} postEditFunction A function to be ran to do any post processing on the filled out template 
     * @return {void}
     */
    public mapObjectArrayToTemplate(objectArray:Array<any>,addToDiv:HTMLElement,templateDiv:string,
        tagPrefix:string,append:boolean,newIdProperty:string,postEditFunction:(para:JQuery)=>void):void {
            if(!append) $(addToDiv).empty();
            for(let i=0;i<objectArray.length;i++)
            {
                this.mapObjectToTemplate(objectArray[i],addToDiv,templateDiv,
                    tagPrefix,true,objectArray[i][newIdProperty],postEditFunction);
            }
        }

    /**
     * mapObjectToTemplate
     * @param {any} object A object that will have its attribues mapped to a element based upon its keys
     * @param {HTMLElement} addToDiv A #id of an object that the mapped to element will be added to
     * @param {string} templateDiv The #id of template element to clone and use for the mapping
     * @param {string} tagPrefix Text to be added to each key in the object before attempting a mapping
     * @param {boolean} append Determins if the #addToDiv should be appended to or emptied
     * @param {string} newId what id should be given to the new object
     * @param {para:JQuery)=>void} postEditFunction A function to be ran to do any post processing on the filled out template 
     * @return {void}
     */
    public mapObjectToTemplate(object:any,addToDiv:HTMLElement,templateDiv:string,
        tagPrefix:string,append:boolean,newId:string,postEditFunction:(para:JQuery)=>void):void {
        console.log("mapObjectToTemplate:addToDiv="+addToDiv+":templateDiv="+templateDiv);
        let template = $(templateDiv).clone();		
        let tags = Object.keys(object);
        for(let i=0;i<tags.length;i++)
        {
            let tag = tags[i];
            let id = "#"+tagPrefix+tag;
            //console.log("replacing "+id+" with:"+object[tag]+" type is:"+typeof(object[tag]));		
            $(template).find(id).html(object[tag]);
        }
        if(postEditFunction) postEditFunction(template);
        if(newId) {
            template.prop('mapObjectToTemplate:id',newId);
            console.log("Setting id to:"+newId);
        }
        template.show();
        if(!append) $(addToDiv).empty();
        let html = $(addToDiv).html();
        $(addToDiv).html(html+template.html());
        //return(addToDiv);
    }
}
(function(window){window.Helper=Helper;var prototype=Helper.prototype=new Object;Helper.TIMELINE="timeline";Helper.MOVIECLIP="movieclip";Helper.ELEMENT="element";Helper.GRAPHIC="graphic";Helper.LIBRARY_ITEM="library item";Helper.SPRITE="sprite";Helper.INSTANCE="instance";Helper.TEXTFIELD="textfield";Helper.TEXT="text";function Helper(){}Helper.getItemType=function(object){var type=null;if(object.libraryItem&&object.libraryItem.itemType==Helper.GRAPHIC)type=Helper.GRAPHIC;else if(object instanceof Timeline)type=Helper.TIMELINE;else if(object instanceof Element){switch(object.elementType){case Helper.INSTANCE:type=Helper.INSTANCE;break;case Helper.TEXT:type=Helper.TEXT;break}}else if(object instanceof LibraryItem)type=Helper.LIBRARY_ITEM;return type};Helper.getExportType=function(object){}})(window);(function(window){window.Monitor=Monitor;var prototype=Monitor.prototype=new Object;prototype.constructor=Monitor;function Monitor(autoStart){autoStart=autoStart!==undefined?autoStart:true;Object.call(this);if(autoStart)this.start()}prototype.start=function(){this.timeStart=(new Date).getTime()};prototype.log=function(message){this.timeEnd=(new Date).getTime();this.time=this.timeEnd-this.timeStart;flash.trace(this.toString(message))};prototype.toString=function(message){message=message!==undefined?message:"";return"Monitor.time: "+message+" "+String(this.time)+"ms"}})(window);(function(window){var prototype=JSON.prototype=new Object;prototype.constructor=JSON;JSON.OBJECT="object";JSON.NUMBER="number";JSON.STRING="string";JSON.ARRAY="array";JSON.BOOLEAN="boolean";function JSON(){}JSON.decode=function(string){var value=JSON.encodeStringValues(string);var value=JSON.removeFormat(value);var object=JSON.stringToObject(value);return object};JSON.stringToObject=function(string){var type=JSON.getStringType(string);var value=null;string=decodeURIComponent(string);switch(type){case JSON.OBJECT:value=JSON.parseObject(string);break;case JSON.ARRAY:value=JSON.parseArray(string);break;case JSON.STRING:value=JSON.parseString(string);break;case JSON.NUMBER:value=Number(string);break;case JSON.BOOLEAN:value=string=="true"?true:false;break}return value};JSON.parseObject=function(string){var object={};var stringValue=JSON.removeStartAndEnd(string);var split=JSON.splitTopElements(stringValue);for(var j=0;j<split.length;++j){var splitString=split[j];var splitColon=splitString.split(":");var property=splitColon.splice(0,1);var value=splitColon.join(":");object[property]=JSON.stringToObject(value)}return object};JSON.parseArray=function(string){var array=[];var stringValue=JSON.removeStartAndEnd(string);var split=JSON.splitTopElements(stringValue);for(var j=0;j<split.length;++j){var splitString=split[j];array.push(JSON.stringToObject(splitString))}return array};JSON.parseString=function(string){return JSON.removeStartAndEnd(string)};JSON.encode=function(object,format){format=format!==undefined?format:true;var json=JSON.objectToJSON(object);if(format)json=JSON.format(json);json=decodeURIComponent(json);return json};JSON.format=function(json){json=JSON.formatNewLine(json);json=JSON.formatIndent(json);return json};JSON.objectToJSON=function(object){var string=object?"{":'"';var index=0;var numOfProperties=JSON.numOfProperties(object);for(var property in object){index++;var value=object[property];var type=JSON.getType(value);var end=index<numOfProperties-1?",":"";switch(type){case JSON.OBJECT:string+=JSON.propertyPair(property,JSON.objectToJSON(value),end);break;case JSON.ARRAY:string+=JSON.propertyPair(property,JSON.arrayToJSON(value),end);break;case JSON.STRING:string+=JSON.propertyPair(property,'"'+encodeURIComponent(value)+'"',end);break;case JSON.NUMBER:string+=JSON.propertyPair(property,value,end);break;case JSON.BOOLEAN:string+=JSON.propertyPair(property,value,end);break}}string+=object?"}":'"';return string};JSON.arrayToJSON=function(array){var string=array?"[":'"';for(var i=0;i<array.length;++i){var value=array[i];var type=JSON.getType(value);var split=i<array.length-1?",":"";switch(type){case JSON.OBJECT:string+=JSON.objectToJSON(value)+split;break;case JSON.ARRAY:string+=JSON.arrayToJSON(value)+split;break;case JSON.STRING:string+='"'+value+'"'+split;break;case JSON.NUMBER:string+=value+split;break}}string+=array?"]":'"';return string};JSON.removeStartAndEnd=function(string){return string.slice(1,string.length-1)};JSON.removeFormat=function(string){var value=string;value=value.replace(/(\r\n|\n|\r)/gm,"");value=value.split(" ").join("");value=value.split("\n").join("");value=value.split("\t").join("");return value};JSON.formatNewLine=function(json){json=json.split(",").join(",\n");json=json.split("{").join("\n{\n");json=json.split("}").join("\n}");json=json.split('["').join('[\n"');json=json.split("[").join("\n[");json=json.split("]").join("\n]");json=json.split("]}").join("]\n}");json=json.split(":").join(": ");json=json.split("},\n\n{").join("},\n{");json=json.split("\n").splice(1).join("\n");return json};JSON.formatIndent=function(json){var list=json.split("\n");for(var i=0;i<list.length;++i){var line=list[i];var string=list.slice(0,i).join("\n");var numIndents=JSON.getNumOfOpeningObjects(string);for(var j=0;j<numIndents;++j)line="\t"+line;list[i]=line}json=list.join("\n");json=json.split("\t}").join("}").split("\t]").join("]");return json};JSON.getNumOfOpeningObjects=function(string){var s="_°$§!";var numOpen=string.split("{").join(s).split("[").join(s).split(s).length;var numClosed=string.split("}").join(s).split("]").join(s).split(s).length;return numOpen-numClosed};JSON.encodeStringValues=function(string){var regex=/"([^"]*)"/;while(string.match(regex)!=null)string=string.replace(regex,JSON.replaceHandler);return string};JSON.replaceHandler=function(p1){return encodeURIComponent(p1)};JSON.splitTopElements=function(string){var split=string.split(",");for(var i=split.length-2;i>=0;--i){var current=split[i];var previous=split[i+1];var nested=JSON.getIsNested(previous);if(nested!=0){split[i]=current+","+previous;split.splice(i+1,1)}}return split};JSON.getIsNested=function(string){var countOpen0=JSON.getCharCount(string,"{");var countClosed0=JSON.getCharCount(string,"}");var countOpen1=JSON.getCharCount(string,"[");var countClosed1=JSON.getCharCount(string,"]");var isNested=countOpen0-countClosed0+countOpen1-countClosed1;return isNested};JSON.getCharCount=function(string,character){return string.split(character).length-1};JSON.propertyPair=function(type,string,end){return'"'+type+'"'+":"+string+end};JSON.getType=function(object){if(object instanceof Array)return JSON.ARRAY;else if(typeof object=="boolean")return JSON.BOOLEAN;else return typeof object};JSON.getStringType=function(value){var character=value.charAt(0);switch(character){case"{":return JSON.OBJECT;break;case"[":return JSON.ARRAY;break;case'"':return JSON.STRING;break}switch(value){case"true":case"false":return JSON.BOOLEAN;break;default:return JSON.NUMBER;break}};JSON.numOfProperties=function(object){var num=0;for(var property in object)num++;num=num>0?num+1:num;return num};window.JSON=JSON})(window);(function(window){window.JSONTimelineParser=JSONTimelineParser;var prototype=JSONTimelineParser.prototype=new Object;prototype.constructor=JSONTimelineParser;JSONTimelineParser.JOIN_FONTFACE=false;function JSONTimelineParser(setup){Object.call(this);this.timeline=setup.timeline;this.init()}prototype.getLibraryObject=function(id){return this.library[id]};prototype.init=function(){this.initVariables();this.initTimelineRecursion()};prototype.initVariables=function(){this.data={meta:{},library:{},resources:[]};this.symbols=[];this.timelines=[];this.library=this.data.library;this.numTextFields=0};prototype.initTimelineRecursion=function(){flash.outputPanel.clear();this.parse(this.timeline)};prototype.parse=function(item){var type=Helper.getItemType(item);var object=null;switch(type){case Helper.TIMELINE:object=this.parseTimeline(item);break;case Helper.LIBRARY_ITEM:object=this.parseTimeline(item.timeline);break;case Helper.INSTANCE:object=this.parseTimeline(item.libraryItem.timeline);break;case Helper.GRAPHIC:object=this.parseGraphic(item);break;case Helper.TEXT:object=this.parseText(item);break}this.addToLibrary(object);return object};prototype.parseTimeline=function(timeline,id){var libraryItem=timeline.libraryItem||{name:"root"};var object={type:Helper.TIMELINE,id:libraryItem.name,totalFrames:timeline.frameCount};var layers=timeline.layers;var objectLayers=[];for(var i=layers.length-1;i>=0;--i){var layer=layers[i];if(layer.layerType=="normal"){var item=this.parseLayer(layer);if(item!=null)objectLayers.push(item)}}if(objectLayers.length>0)object.layers=objectLayers;this.timelines.push(timeline);return object};prototype.parseLayer=function(layer){var object={name:layer.name,frames:{}};var frames=layer.frames;var numFrames=0;for(var i=0;i<frames.length;++i){var frame=frames[i];var isKeyframe=frame.startFrame==i;if(isKeyframe){var item=this.parseFrame(frame,i);if(item!=null){numFrames++;object.frames[i]=item}}}if(numFrames>0)return object;else return null};prototype.parseFrame=function(frame,index){var object={elements:[]};var elements=frame.elements;object=this.parseAnimation(object,frame);for(var i=0;i<elements.length;++i){var element=elements[i];var item=this.parse(element);if(item!=null){var itemIsInLibrary=this.getLibraryObject(item.id);if(itemIsInLibrary)item={id:item.id};item=this.addItemTransformData(item,element);object.elements.push(item)}}return object};prototype.parseAnimation=function(object,frame){if(frame.tweenType!="none"){var ease=frame.getCustomEase("all");var animation=ease.splice(1,ease.length-2);for(var property in animation){var value=animation[property];value.x=this.getFixedValue(value.x,4);value.y=this.getFixedValue(value.y,4)}object.animation=animation}return object};prototype.parseGraphic=function(item){var libraryItem=item.libraryItem;var timeline=libraryItem.timeline;var isMovieClip=timeline.frameCount>1;var type=isMovieClip?Helper.MOVIECLIP:Helper.SPRITE;var object={type:type,id:libraryItem.name};if(isMovieClip)object.totalFrames=timeline.frameCount;var isInLibrary=this.getLibraryObject(object.id);if(!isInLibrary){this.symbols.push(libraryItem);this.timelines.push(timeline)}return object};prototype.parseText=function(element){var id="text"+this.numTextFields++;var object={type:Helper.TEXTFIELD,id:id};var text=element.getTextString().split('"').join('\\"').split(/\r\n|\r|\n/g).join("\\n");var style={font:this.getTextElementStyle(element),fill:element.getTextAttr("fillColor"),align:element.getTextAttr("alignment")};var margin={width:element.width,height:element.height};this.addProperty(object,"text",text,"");this.addProperty(object,"style",style,null);this.addProperty(object,"margin",margin,null);return object};prototype.getTextElementStyle=function(element){var string="";var bold=element.getTextAttr("bold");string+=bold?"bold ":"";string+=element.getTextAttr("size")+"px ";string+=JSONTimelineParser.JOIN_FONTFACE?element.getTextAttr("face").split(" ").join("_"):element.getTextAttr("face").split(" ")[0];return string};prototype.addToLibrary=function(object){if(object){var isInLibrary=this.getLibraryObject(object.id);if(!isInLibrary){var item=this.deepCopyObject(object);delete item.id;this.library[object.id]=item}}};prototype.deepCopyObject=function(object){var parse=function(object,item){for(var property in object){var value=object[property];if(value instanceof Array)item[property]=parse(value,[]);else if(typeof value=="object")item[property]=parse(value,{});else item[property]=value}return item};var item=parse(object,{});return item};prototype.addItemTransformData=function(object,element){var object=this.addAnimationTransformData(object,element);object=this.addTextFieldsLineSpacingDisplacement(object,element);object=this.addGraphicLoopFrames(object,element);return object};prototype.addAnimationTransformData=function(object,element){var inputIsValid=element!==null&&object!==null;var elementHasPropertys=typeof element=="object";var transform=element.getTransformationPoint();var pivot=transform.x||transform.y?{x:transform.x,y:transform.y}:null;var alpha=isNaN(element.colorAlphaPercent)?1:element.colorAlphaPercent/100;if(inputIsValid&&elementHasPropertys){this.addProperty(object,"type",Helper.getExportType(element));this.addProperty(object,"name",element.name,"");this.addProperty(object,"x",element.x,null);this.addProperty(object,"y",element.y,null);this.addProperty(object,"alpha",alpha,1);this.addProperty(object,"visible",element.visible,true);this.addProperty(object,"rotation",element.rotation,function(value){return isNaN(value)});this.addProperty(object,"scaleX",element.scaleX,null,4);this.addProperty(object,"scaleY",element.scaleY,null,4)}return object};prototype.addTextFieldsLineSpacingDisplacement=function(object,element){if(element.getTextAttr)object.y+=element.getTextAttr("lineSpacing");return object};prototype.addGraphicLoopFrames=function(object,element){this.addProperty(object,"loop",element.loop||"loop","loop");this.addProperty(object,"firstFrame",element.firstFrame||0,function(value){return isNaN(value)});return object};prototype.addProperty=function(object,name,value,ignore,fixed){var bool=true;if(typeof ignore=="function")bool=!ignore(value);else bool=value!==ignore;if(bool)object[name]=value;return object};prototype.getFixedValue=function(value,position){var object=value.toFixed(position);while(object[object.length-1]=="0")object=object.slice(0,object.length-1);if(object[object.length-1]==".")object=object.slice(0,object.length-1);return Number(object)}})(window);(function(window){window.AtlasExporter=AtlasExporter;var prototype=AtlasExporter.prototype=new Object;prototype.constructor=AtlasExporter;AtlasExporter.allowRotate=false;AtlasExporter.borderPadding=0;AtlasExporter.shapePadding=2;AtlasExporter.allowTrimming=true;AtlasExporter.autoSize=true;AtlasExporter.maxSheetWidth=2048;AtlasExporter.maxSheetHeight=1024;AtlasExporter.stackDuplicateFrames=true;AtlasExporter.layoutFormat="JSON";AtlasExporter.algorithm="maxRects";AtlasExporter.exportFormat={format:"png",bitDepth:32,backgroundColor:"#00000000"};AtlasExporter.imageFolder="img/";function AtlasExporter(setup){Object.call(this);this.id=setup.id;this.path=setup.path;this.symbols=setup.symbols;this.json=setup.json;this.init()}prototype.getSpriteSheetExporter=function(){spriteSheetExporter=new SpriteSheetExporter;spriteSheetExporter.allowRotate=AtlasExporter.allowRotate;spriteSheetExporter.borderPadding=AtlasExporter.borderPadding;spriteSheetExporter.shapePadding=AtlasExporter.shapePadding;spriteSheetExporter.allowTrimming=AtlasExporter.allowTrimming;spriteSheetExporter.autoSize=AtlasExporter.autoSize;spriteSheetExporter.maxSheetWidth=AtlasExporter.maxSheetWidth;spriteSheetExporter.maxSheetHeight=AtlasExporter.maxSheetHeight;spriteSheetExporter.stackDuplicateFrames=AtlasExporter.stackDuplicateFrames;spriteSheetExporter.layoutFormat=AtlasExporter.layoutFormat;spriteSheetExporter.algorithm=AtlasExporter.algorithm;return spriteSheetExporter};prototype.getLibraryItemSize=function(libraryItem){var timeline=libraryItem.timeline;var length=timeline.frameCount;var width=0;var height=0;for(var i=1;i<=length;i++){var rect=timeline.getBounds(i,true);if(rect!=0){var w=rect.right-rect.left;var h=rect.bottom-rect.top;width+=w;height+=h}}return width*height};prototype.getSortedList=function(list){var self=this;list.sort(function(a,b){var sizeA=self.getLibraryItemSize(a);var sizeB=self.getLibraryItemSize(b);if(sizeA>sizeB)return-1;if(sizeA<sizeB)return 1;return 0});return list};prototype.addSymbolToExporter=function(exporter,symbol){exporter.addSymbol(symbol);var overflowed=exporter.overflowed;if(overflowed)exporter.removeSymbol(symbol);return overflowed?true:false};prototype.init=function(){this.initAddOriginKeyframeToSymbols();this.initParsingByMode();this.initResourceExport();this.initRemoveOriginKeyframeFromSymbols();this.initDocumentRoot()};prototype.initAddOriginKeyframeToSymbols=function(){var that=this;this.symbols.forEach(function(symbol){that.addNullingRectangleToLastFrame(symbol)})};prototype.initRemoveOriginKeyframeFromSymbols=function(){var that=this;this.symbols.forEach(function(symbol){that.removeLastFrame(symbol.timeline)})};prototype.initDocumentRoot=function(){document.exitEditMode()};prototype.initParsingByMode=function(mode){this.symbols=this.getSortedList(this.symbols);this.spriteSheetExporters=null;switch(mode){default:this.spriteSheetExporters=this.parseAssetsCombined(this.symbols);break}};prototype.parseAssetsCombined=function(symbols){var that=this;var list=[];var addToSpriteSheetExporters=function(symbols,overflows){var spriteSheetExporter=that.getSpriteSheetExporter();list.push(spriteSheetExporter);var symbolOverflowsExporter=false;for(var i=0;i<symbols.length;++i){var symbol=symbols[i];symbolOverflowsExporter=that.addSymbolToExporter(spriteSheetExporter,symbol);if(symbolOverflowsExporter){if(overflows<1){addToSpriteSheetExporters(symbols.slice(i),overflows+1);break}else return alert("Symbol to big for atlas of size "+AtlasExporter.maxSheetWidth+"x"+AtlasExporter.maxSheetHeight+": "+symbol.name)}}};addToSpriteSheetExporters(symbols,0);return list};prototype.addNullingRectangleToLastFrame=function(symbol){this.addEmptyKeyframeToTimeline(symbol.timeline);this.setFillColorIfBlank();this.drawRect()};prototype.addEmptyKeyframeToTimeline=function(timeline){var frameCount=timeline.frameCount;document.library.editItem(timeline.name);timeline.insertBlankKeyframe(frameCount)};prototype.setFillColorIfBlank=function(){var fill=document.getCustomFill("toolbar");if(fill.color===undefined){fill.color="#000000";fill.style="solid";document.setCustomFill(fill)}};prototype.drawRect=function(){var drawingLayer=fl.drawingLayer;var path=drawingLayer.newPath();path.addPoint(0,0);path.addPoint(1,0);path.addPoint(0,1);var shape=path.makeShape()};prototype.removeLastFrame=function(timeline){var frameCount=timeline.frameCount;timeline.removeFrames(frameCount-1)};prototype.initResourceExport=function(){this.resources=this.exportSpriteSheets(this.spriteSheetExporters);this.json.resources=this.resources};prototype.exportSpriteSheets=function(spriteSheetExporters){var list=[];for(var i=0;i<spriteSheetExporters.length;++i){var spriteSheetExporter=spriteSheetExporters[i];var id=this.id+"-"+i;var name=this.path+id;var imageFolder=AtlasExporter.imageFolder;spriteSheetExporter.exportSpriteSheet(name,AtlasExporter.exportFormat);list.push({img:imageFolder+id+"."+AtlasExporter.exportFormat.format,json:imageFolder+id+".json"})}return list}})(window);(function(window){window.FrameLabelExporter=FrameLabelExporter;var prototype=FrameLabelExporter.prototype=new Object;prototype.constructor=FrameLabelExporter;function FrameLabelExporter(setup){Object.call(this);this.json=setup.json;this.timelines=setup.timelines;this.init()}prototype.getLabelDurationObject=function(timeline,parseComments){parseComments=parseComments!==undefined?parseComments:false;var duration=null;var hasAnimations=null;var frameCount=timeline.frameCount;var durationObject={};for(var i=0;i<frameCount;++i){var objectList=this.getFrameObjects(timeline,i,parseComments);for(var j=0;j<objectList.length;++j){var object=objectList[j];hasAnimations=hasAnimations||object.name;if(object.name)durationObject[object.name]=i}}return hasAnimations?durationObject:null};prototype.getFrameObjects=function(timeline,index,parseComments){parseComments=parseComments!==undefined?parseComments:false;var list=[];for(var i=0;i<timeline.layers.length;++i){var layer=timeline.layers[i];var frame=layer.frames[index];if(frame){var isKeyFrame=frame.startFrame==index;var name=frame.name;var isComment=frame.labelType=="comment";if(isComment&&parseComments||!isComment&&!parseComments){if(name&&isKeyFrame){var object={index:index,name:name};list.push(object)}}}}if(list.length==0)list.push({});return list};prototype.init=function(){var list=this.parseList(this.timelines)};prototype.parseList=function(timelines){for(var i=0;i<timelines.length;++i){var timeline=timelines[i];var labelObject=this.getLabelDurationObject(timeline);var commmentObject=this.getLabelDurationObject(timeline,true);var libraryItem=timeline.libraryItem;if(libraryItem){var name=libraryItem.name;var libraryObject=this.json.library[name];if(libraryObject){if(labelObject)libraryObject.labels=labelObject;if(commmentObject)libraryObject.comments=commmentObject}}}return[]}})(window);(function(window){window.JSONExporter=JSONExporter;var prototype=JSONExporter.prototype=new Object;prototype.constructor=JSONExporter;function JSONExporter(setup){Object.call(this);this.id=setup.id;this.json=setup.json;this.path=setup.path;this.init()}prototype.init=function(){this.initSave()};prototype.initSave=function(){var outputPanel=flash.outputPanel;outputPanel.clear();outputPanel.trace(JSON.encode(this.json));outputPanel.save(this.path+this.id+".json",false,false)}})(window);(function(window){window.MetadataExporter=MetadataExporter;var prototype=MetadataExporter.prototype=new Object;prototype.constructor=MetadataExporter;function MetadataExporter(setup){Object.call(this);this.json=setup.json;this.init()}prototype.init=function(){this.initMetadataObject()};prototype.initMetadataObject=function(){this.meta=this.json.meta;this.meta.name=document.name;this.meta.frameRate=document.frameRate;this.meta.backgroundColor=document.backgroundColor;this.meta.size={width:document.width,height:document.height}}})(window);(function(window){window.PixiJSAnimationExport=PixiJSAnimationExport;var prototype=PixiJSAnimationExport.prototype=new Object;function PixiJSAnimationExport(setup){Object.call(this);this.init()}prototype.getUniversalPath=function(path){return path.split("/").slice(0,-1).join("/")+"/"};prototype.init=function(){this.initVariables();this.initIdleMessage();this.initJSONTimelineParser();this.initAtlasExporter();this.initFrameLabelExporter();this.initMetadataExporter();this.initJSONExporter();this.initCompleteAlert()};prototype.initIdleMessage=function(){fl.showIdleMessage(false)};prototype.initVariables=function(){this.documentName=document.name.split(".fla")[0];this.documentPath=this.getUniversalPath(document.pathURI);this.libraryItem=document.getTimeline().libraryItem;this.timelineID=this.libraryItem?this.libraryItem.name:this.documentName;this.atlasID=this.documentName+"-atlas"};prototype.initJSONTimelineParser=function(){this.jsonTimelineParser=new JSONTimelineParser({timeline:document.getTimeline()})};prototype.initAtlasExporter=function(){this.atlasExporter=new AtlasExporter({id:this.timelineID,path:this.documentPath,symbols:this.jsonTimelineParser.symbols,json:this.jsonTimelineParser.data})};prototype.initFrameLabelExporter=function(){this.frameLabelExporter=new FrameLabelExporter({timelines:this.jsonTimelineParser.timelines,json:this.jsonTimelineParser.data})};prototype.initMetadataExporter=function(){this.metadataExporter=new MetadataExporter({json:this.jsonTimelineParser.data})};prototype.initJSONExporter=function(){this.jsonExporter=new JSONExporter({id:this.timelineID,path:this.documentPath,json:this.jsonTimelineParser.data})};prototype.initCompleteAlert=function(){alert("Export complete!")}})(window);if(!window.ExecuteSetupScript)var pixiJSAnimationExport=new PixiJSAnimationExport;
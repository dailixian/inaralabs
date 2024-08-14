/**
 * Copyright @ 2024 Esri.
 * All rights reserved under the copyright laws of the United States and applicable international laws, treaties, and conventions.
 */
define(["dojo/_base/lang","esri/core/has","dojo/_base/array","esri/request","esri/PopupTemplate","esri/core/lang","esri/rest/support/Query","esri/layers/FeatureLayer","esri/layers/support/fieldUtils","esri/renderers/support/styleUtils","esri/layers/support/arcgisLayerUrl","esri/geometry/SpatialReference","../views/3d/support/fx3dUtils","../views/3d/layers/FxLayerView3D"],function(e,i,s,t,r,n,l,a,o,u,d,h,p,y){function f(e){var i=[],t=[],r=["small-integer","integer","single","long","double"],n=["lat","latitude","y","ycenter","latitude83","latdecdeg","POINT-Y","lon","lng","long","longitude","x","xcenter","longitude83","longdecdeg","POINT-X","alt","altitude","z","POINT-Z","zcenter","altitude83","altdecdeg"];return s.forEach(e,function(e){i.push(e.name);var s=e.name.toLowerCase();r.indexOf(e.type)>-1&&n.indexOf(s)===-1&&t.push(e.name)}),{displayFields:i,vizFields:t}}var v=a.createSubclass({declaredClass:"esri.layers.FxLayer",viewModulePaths:{"3d":"fx3d/views/3d/layers/FxLayerView3D"},properties:{renderingInfo:{value:null,set:function(i){var s=this._get("renderingInfo");e.isObject(i)&&!p.isEqual(i,s)&&this._set("renderingInfo",i)}},vizType:{value:null,set:function(i){var s=this._get("vizType");e.isString(i)&&!p.isEqual(i,s)&&this._set("vizType",i)}},displayField:{type:String,value:null,json:{ignore:!0},set:function(i){var s=this._get("displayField");e.isString(i)&&!p.isEqual(i,s)&&this._set("displayField",i)}},vizFields:{value:null,set:function(i){i=e.isString(i)?[i]:i;var s=this._get("vizFields");e.isArray(i)&&!p.isEqual(i,s)&&this._set("vizFields",i)}},spinTag:{value:!1,set:function(e){var i=this._get("spinTag");"boolean"==typeof e&&e!==i&&this._set("spinTag",e)}},pauseTag:{value:!1,set:function(e){var i=this._get("pauseTag");"boolean"==typeof e&&e!==i&&this._set("pauseTag",e)}}},constructor:function(e,i){this.importLayerViewModule(i.view),this.url=e,Object.keys(i).forEach(function(e){this[e]=i[e]}.bind(this)),this.outFields=["*"],this.listMode="hide"},normalizeCtorArgs:function(i,s){if(e.isString(i)&&p.isUrl(i)){var t=d.parse(i);return t&&null!=t.sublayer&&null==this.layerId&&(this.layerId=t.sublayer),e.mixin({},{url:t.url.path},s)}return console.warn("Data source must be a FeatureService url."),null},remove:function(){this.pauseAnimation(),this.pauseSpinning(),this.emit("destroy-fxlayer"),this.fxLayerView&&!1===this.fxLayerView.destroyed&&(this.fxLayerView.destroy(),this.fxLayerView=null)},_initLayerProperties:function(t){this.source||(this.source=t),t.url&&(this.url=t.url);var l=this.source.relatedFeaturesInfo,a=n.mixin({},t.sourceJSON,l?{objectIdField:l.joinField}:{});if(l&&(this.source.relatedFeaturesInfo.outFields=this.outFields?this.outFields.splice(0):null),this.sourceJSON=t.sourceJSON,this.read(a,{origin:"service",url:this.parsedUrl}),l&&l.outFields&&"*"!==l.outFields[0]&&(l.outFields=l.outFields.map(function(e){return e.toLowerCase()})),this._verifySource(),this._verifyFields(),this.useQueryTimestamp=i("ie")||i("safari"),this.listMode="hide",this.disablePopup=!0,this.visible=!0,!e.isArray(this.fields))return void console.warn("Fileds from source is invalid.");var o=f(this.fields),d=o.vizFields,h=o.displayFields,y=null,v=null;if(e.isString(this.displayField)&&0!==this.displayField.length?(v=null,y=s.some(h,function(e){if(e.toLowerCase()===this.displayField.toLowerCase())return v=e,!0}.bind(this)),y?this.set("displayField",v):this.set("displayField",h[0])):this.set("displayField",h[0]),e.isArray(this.vizFields)&&0!==this.vizFields.length){var c=[];s.forEach(d,function(e){c.push(e.toLowerCase())}),y=[],s.forEach(this.vizFields,function(e){var i=c.indexOf(e.toLowerCase());i>-1&&y.push(d[i])}.bind(this)),y.length>0?this.set("vizFields",y):this.set("vizFields",d[0])}else this.set("vizFields",d[0]);return this.availableVizTypes=p.availableVizTypes(this.geometryType,this.timeInfo),e.isString(this.vizType)&&0!==this.vizType.length?(v=null,y=s.some(this.availableVizTypes,function(e){if(e.name.toLowerCase()===this.vizType.toLowerCase())return v=e.name,!0}.bind(this)),y?this.vizType=v:this.vizType=this.availableVizTypes[0]?this.availableVizTypes[0].name:null):this.vizType=this.availableVizTypes[0]?this.availableVizTypes[0].name:null,this.popupTemplate||(this.popupTemplate=new r({title:this.name,fieldInfos:this.fields?s.map(this.fields,function(e){return{fieldName:e.name,label:e.name,visible:!0}}):[],content:"{*}"})),this.vizType&&0!=this.vizType.length&&this.displayField&&0!=this.displayField.length&&e.isArray(this.vizFields)&&0!=this.vizFields.length?(this.set("visible",!0),u.loadStyleRenderer(this,{origin:"service"})):(this.set("visible",!1),this.set("loaded",!1),this.emit("fxlayer-error",{msg:"Properties of vizType, displayField, vizFields, renderingInfo, or popupTemplate is missing."}),void console.warn("Properties of vizType, displayField, vizFields, renderingInfo, or popupTemplate is missing."))},createQuery:function(){var e=new l,i=this.capabilities?this.capabilities.data:void 0;return e.returnGeometry=!0,e.returnZ=i&&i.supportsZ&&this.returnZ||null,e.returnM=i&&i.supportsM&&this.returnM||null,e.outFields=this.outFields,e.where=this.definitionExpression||"1=1",e.multipatchOption="multipatch"===this.geometryType?"xyFootprint":null,e.outFields=["*"],e},createQueryParameters:function(){var e=new l;return e.outSpatialReference=h.WGS84,Object.defineProperty(e,"outSpatialReference",{configurable:!0,writable:!1}),e.returnGeometry=!0,e.returnZ=this.hasZ&&this.returnZ||null,e.returnM=this.hasM&&this.returnM||null,e.outFields=this.outFields,e.where=this.definitionExpression||"1=1",e.multipatchOption="multipatch"===this.geometryType?"xyFootprint":null,queryParams.outFields=["*"],e},importLayerViewModule:function(e){"3d"===e.type&&(this.fxLayerView=new y({layer:this,view:e}))},showLabel:function(e){e&&this.emit("show-feature-label",{feature:e})},hideLabel:function(){this.emit("hide-feature-label")},startAnimation:function(){return this.visible?void(this.pauseTag=!1):void console.warn("The FxLayer is invisible now.")},pauseAnimation:function(){this.pauseTag=!0},startSpinning:function(){return this.visible?void(this.spinTag=!0):void console.warn("The FxLayer is invisible now.")},pauseSpinning:function(){this.spinTag=!1},switchVizField:function(i,t){function r(e){e>-1&&e<n.vizFields.length?(n.emit("hide-feature-label"),n.emit("fx3d-active-viz-field",{currentVizPage:e,newRenderingInfo:t})):console.warn("invalid viz page in switchVizField(vizField).")}if(!this.visible)return void console.warn("The FxLayer is invisible now.");var n=this;if(e.isString(i)){var l=[];s.forEach(this.vizFields,function(e){l.push(e.toLowerCase())});var a=l.indexOf(i.toLowerCase());r(a)}else"number"==typeof i?r(i):console.warn("switchVizField(vizField) needs a integer id or string name as parameter.")}});return e.mixin(v,p.EffectType),v});
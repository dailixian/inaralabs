/**
 * Copyright @ 2024 Esri.
 * All rights reserved under the copyright laws of the United States and applicable international laws, treaties, and conventions.
 */
define(["dojo/_base/lang","dojo/_base/array","esri/views/layers/LayerView","./SnapshotController","esri/geometry/Point","esri/geometry/Extent","esri/geometry/projection","esri/geometry/projection/projectXYZToVector","esri/core/libs/gl-matrix-2/vec3f64","esri/core/libs/gl-matrix-2/vec3","esri/geometry/SpatialReference","esri/core/reactiveUtils","esri/core/Collection","esri/Graphic","esri/symbols/PictureMarkerSymbol","esri/geometry/support/centroid","../effects/FxEffectRendererManager","../effects/FxEffectFactory","../support/fx3dUtils"],function(e,t,i,a,r,l,n,s,o,h,c,u,y,d,p,f,m,g,v){var _=1e3,w=1e4,x=o.vec3f64,h=h.vec3,b=x.create(),z=x.create(),M=x.create(),F=x.create(),L=x.create(),T=i.createSubclass({declaredClass:"esri.views.3d.layers.FxLayerView3D",constructor:function(e){this.supportsDraping=!1,this._fx3dSpatialReference=c.WGS84,e.layer&&(this.layer=e.layer),e.view&&(this.view=e.view),this.availableFields=["*"]},initialize:function(){m.init(this.view),this.layer.when().then(function(){this._eventHandles=[],this.loadedGraphics=null,this._graphicsLoading=!0,this._graphicsCollectionEventHandle=null,this._graphicsControllerEventHandles=[];var t=this._initEffect();t.then(e.hitch(this,this._initGraphicsController)),this.layer.addResolvingPromise(t),this._eventHandles.push(this.layer.on("destroy-fxlayer",function(){m.pause(),m.destroy(this._layerVizType,this._layerId),this.view.map.remove(this.layer)}.bind(this))),this._eventHandles.push(this.layer.on("show-feature-label",e.hitch(this,this._onShowFeatureLabel))),this._eventHandles.push(this.layer.on("hide-feature-label",function(){this.layer&&this.layer._labelsLayer&&(this.layer._labelsLayer.removeAll(),this._selectedFeature=null)}.bind(this))),this._eventHandles.push(this.view.on("click",e.hitch(this,this._viewClicked)))}.bind(this))},destroy:function(){this._viewModelHandler&&(this._viewModelHandler.remove(),this._viewModelHandler=null);var e=function(e){e.remove()};this.controller&&(this.controller.destroy(),this.controller=null),this._graphicsCollectionEventHandle&&this._graphicsCollectionEventHandle.remove(),this._graphicsControllerEventHandles&&this._graphicsControllerEventHandles.forEach(e),this._tilingSchemeHandle&&this._tilingSchemeHandle.remove(),this._eventHandles&&this._eventHandles.forEach(e),this.inherited(arguments)},getLoadedGraphics:function(){return this.loadedGraphics&&this.loadedGraphics.toArray?[].concat(this.loadedGraphics.toArray()):[]},_initEffect:function(){return g.make({layer:this.layer,layerView:this,view:this.view})},_calculateExtentCenter:function(e){var t=e.length;if(t){var i,a,r,n,s,o,h;if("point"==this.layer.geometryType)for(i=a=e[0].geometry.longitude,r=n=e[0].geometry.latitude,o=1;o<t;o++)s=e[o],null!=s.geometry&&(s.geometry.longitude<i&&(i=s.geometry.longitude),s.geometry.longitude>a&&(a=s.geometry.longitude),s.geometry.latitude<r&&(r=s.geometry.latitude),s.geometry.latitude>n&&(n=s.geometry.latitude));else if("polyline"==this.layer.geometryType||"polygon"==this.layer.geometryType)for(h=e[0].geometry.extent,i=h.xmin,a=h.xmax,r=h.ymin,n=h.ymax,o=1;o<t;o++)s=e[o],null!=s.geometry&&null!=s.geometry.extent&&(h=s.geometry.extent,h.xmin<i&&(i=h.xmin),h.xmax>a&&(a=h.xmax),h.ymin<r&&(r=h.ymin),h.ymax>n&&(n=h.ymax));return this._minDelta=111e3*Math.min(a-i,n-r)*.0625,new l(i,r,a,n,this._fx3dSpatialReference)}return null},_getGeomZFromPolyline:function(e,t){return h.set(z,e[0],e[1],e[2]||1),v.wgs84ToSphericalEngineCoords(z,0,z,0),h.set(M,t[0],t[1],t[2]||1),v.wgs84ToSphericalEngineCoords(M,0,M,0),h.subtract(L,z,M),h.add(F,z,M),h.scale(F,F,.5),h.length(F)+.6*h.length(L)-6378137},_calculatePerfectPosition:function(e){var t={};if(null==e||null==e.geometry)return console.warn("Feature or geometry is invalid."),t;var i,a,r,l=e.geometry;if("point"===this.layer.geometryType){t.x=l.longitude,t.y=l.latitude;var n=this.layer._labelDefaultHeight;t.z=5e3,n&&this.layer._currentVizFieldMinMax&&(r=this.layer._currentVizFieldMinMax.max-this.layer._currentVizFieldMinMax.min,isNaN(r)||"number"==typeof this.layer._currentVizPage&&(i=this.layer.vizFields[this.layer._currentVizPage],a=e.attributes[i],null!=a&&(0===n.flag?(t.z+=n.max,0!=r?t.z*=(a-this.layer._currentVizFieldMinMax.min)/r:t.z=n.min):1===n.flag&&(n.max===n.min?t.z+=n.max:0!=r?t.z+=1.2*(n.min+(n.max-n.min)*(a-this.layer._currentVizFieldMinMax.min)/r):0!=this.layer._currentVizFieldMinMax.max?t.z+=n.max:t.z=n.min))))}else if("polyline"===this.layer.geometryType){if(null==l.paths)return console.warn("Paths of feature is invalid."),t;var s=l.paths[0],o=s.length;t.x=(s[0][0]+s[o-1][0])/2,t.y=(s[0][1]+s[o-1][1])/2,t.z=1.1*this._getGeomZFromPolyline(s[0],s[o-1])}else if("polygon"===this.layer.geometryType){if(null==l.rings)return console.warn("Rings of feature is invalid."),t;var h={rings:l.rings,hasZ:!1},c=f.polygonCentroid(h);if(isNaN(c[0])||isNaN(c[1]))return null;t.x=c[0],t.y=c[1];var n=this.layer._labelDefaultHeight;t.z=10,r=this.layer._currentVizFieldMinMax.max-this.layer._currentVizFieldMinMax.min,isNaN(r)||(i=this.layer.vizFields[this.layer._currentVizPage],a=e.attributes[i],null!=a&&(0===n.flag?(t.z+=n.max,0!=r?t.z*=(a-this.layer._currentVizFieldMinMax.min)/r:t.z=n.min):1===n.flag&&(n.max===n.min?t.z+=n.max:0!=r?t.z+=1.3*(n.min+(n.max-n.min)*(a-this.layer._currentVizFieldMinMax.min)/r):0!=this.layer._currentVizFieldMinMax.max?t.z+=n.max:t.z=n.min)))}return isNaN(t.z)&&(t.z=null),t},_calculatePerfectHeight:function(){var e=this.layer._labelDefaultHeight,t=10;this.layer._currentVizFieldMinMax.max==this.layer._currentVizFieldMinMax.min&&0==this.layer._currentVizFieldMinMax.max?t=e&&e.min||1e3:e&&(0===e.flag?t+=e.max:1===e.flag&&(t+=e.max===e.min?e.max:1.2*(e.min+(e.max-e.min))));var i=Math.abs(t)/111e3;return"local"==this.view.viewModel&&(i=Math.abs(t)/235596.8),i>10&&(i=10),{z:t,lonD:i}},_onShowFeatureLabel:function(e){if(this.layer._labelsLayer&&this.layer._labelsLayer.visible){if(this._selectedFeature=null,e.feature){var t=e.feature.geometry;if(null==t)return void console.warn("The feature with FID has no geometry content.");this.layer._labelsLayer.removeAll();var i=this._calculatePerfectPosition(e.feature);if(null==i.x||null==i.y)return;null==i.z?i.z=10:i.z+=1e3;var a=""+e.feature.attributes[this.layer.displayField],n=v.createTextTexture(a,14,"#ffffff","center","Arial","rgba(0,0,0,0.5)"),s=new p({url:n.toDataURL(),width:n.width,height:n.height,contentType:"image/png"}),o=new r(i.x,i.y,i.z,this._fx3dSpatialReference),h=new d(o,s,e.feature.attributes,this.layer.popupTemplate);this.layer._labelsLayer.add(h);var c=Math.abs(i.z)/111e3,u=Math.abs(i.z)/(111e3*Math.cos(i.y*Math.PI/180));"local"==this.view.viewModel&&(c=Math.abs(i.z)/111319.5,u=Math.abs(i.z)/235596.8),u>10&&(u=10),c>20&&(c=20);var y=new l(i.x-c,i.y-u,i.x+c,i.y+u,this._fx3dSpatialReference);this._fixCameraPosition(i,y),this._animateTo(y)}else this.layer._labelsLayer.removeAll();this._selectedFeature=e.feature}},_updateSelectedFeatureLabel:function(){if(this.layer._labelsLayer){var e=this.layer._labelsLayer.graphics.toArray().length>0;this.layer._labelsLayer.removeAll(),e&&this._selectedFeature&&this._onShowFeatureLabel({feature:this._selectedFeature})}},_viewClicked:function(t){if(t.graphic){if(this.layer._labelsLayer&&t.graphic.layer===this.layer._labelsLayer)0==this.layer._labelsLayer.graphics.length&&this._onShowFeatureLabel({feature:t.graphic});else if(t.graphic.layer===this.layer&&this.view&&this.view.popup.viewModel&&this.view.popup.viewModel.selectedFeature){var i=this.view.popup.viewModel.selectedFeature,a=new d({attributes:e.clone(i.attributes),geometry:i.geometry&&i.geometry.clone()||null,popupTemplate:i.popupTemplate||null,symbol:i.symbol||null,visible:i.visible});if(null==a)return;this._onShowFeatureLabel({feature:a}),this.layer.emit("selected-feature-from-globe",{selectedFeature:a}),this.view.popup.viewModel._set("selectedFeature",null)}}else if(this.layer&&this.layer._labelsLayer&&this.layer._labelsLayer.graphics.length>0&&(this.layer._labelsLayer.removeAll(),this._selectedFeature=null,this.layer.emit("abandon-selected-feature"),this.view&&this.view.popup.viewModel&&this.view.popup.viewModel._set("selectedFeature",null)),this.view&&this.view.popup.viewModel&&this.view.popup.viewModel.selectedFeature)try{this.view.popup.viewModel.selectedFeature.symbol=null,this.view.popup.viewModel.selectedFeature.popupTemplate=null;var a=this.view.popup.viewModel.selectedFeature.clone();this._onShowFeatureLabel({feature:a}),this.layer.emit("selected-feature-from-globe",{selectedFeature:a})}finally{this.view.popup.viewModel._set("selectedFeature",null)}},_fixCameraPosition:function(e,t){var i=e.z;i>=w&&(i=_);var a=e.z;a>=w&&(t.center.z=_),a=v.clamp(a,_,w),t.zmin=i,t.zmax=a},_animateTo:function(e,t,i){if(this.view){var a=29.32;"local"==this.view.viewingMode&&(a=70.05),this.view.goTo({target:e,heading:this.view.camera.heading,tilt:this.view.camera.tilt})}},_initGraphicsController:function(t){if(this._layerId=this.layer.id,this._layerVizType=this.layer.vizType,m.addEffect(this.layer,t)){var i=this.view.map.layers.find(function(e){return e.url===this.layer.url&&"esri.layers.FeatureLayer"===e.declaredClass&&"Feature Layer"===e.type&&e.loaded===!0}.bind(this)),r=this,l=function(){var t=y.ofType(d),i={layer:r.layer,layerView:r,graphics:new t};r.controller=new a(i),u.whenOnce(e.hitch(this,function(){return r.view.basemapTerrain.ready===!0})).then(e.hitch(this,function(){r.controller.when().then(function(){var e=null;r.loadedGraphics=r.controller.graphics,r._graphicsCollectionEventHandle=r.loadedGraphics.on("change",r._collectionChangeHandler.bind(r)),r.loadedGraphics.length>0&&(e=r.loadedGraphics.toArray(),r._add([].concat(e))),r._graphicsControllerEventHandles.push(r.controller.on("query-end",function(){r._graphicsLoading=!1})),r.controller.startup()},function(e){console.log(e)})}))};if(i){var n=this.view.layerViews.find(function(e){return e.layer.url===i.url&&e.layer.id===i.id}.bind(this));n?(i.source&&this.layer._initLayerProperties(i.source),this.loadedGraphics=n.loadedGraphics,this.loadedGraphics.length>0&&this._add([].concat(this.loadedGraphics.toArray())),this.layer.emit("all-features-loaded",{graphics:[].concat(this.loadedGraphics.toArray())})):l()}else l()}},_collectionChangeHandler:function(e){this._add([].concat(e.added)),this._remove([].concat(e.removed))},_add:function(i){function a(e){var i,a,l=[].concat(e);t.forEach(l,function(e){if(i=e.geometry){if("point"==r.layer.geometryType)s.projectXYZToVector(i.x,i.y,i.z,i.spatialReference,b,r._fx3dSpatialReference),i.longitude=b[0],i.latitude=b[1],i.altitude=isNaN(b[2])?null:b[2];else if("polyline"==r.layer.geometryType||"polygon"==r.layer.geometryType){a=i.paths||i.rings;for(var t=0;t<a.length;t++)for(var l=0;l<a[t].length;l++)s.projectXYZToVector(a[t][l][0],a[t][l][1],a[t][l][2],i.spatialReference,b,r._fx3dSpatialReference),a[t][l][0]=b[0],a[t][l][1]=b[1],a[t][l][2]=isNaN(b[2])?null:b[2]}}else console.warn("No geometry information found in feature: "+e.attributes.FID)}),r.layer.emit("fx3d-add-graphics",{graphics:l}),r._graphicsLoading||(r.layer.on("can-locating-now",function(){var e=r._calculateExtentCenter(r.getLoadedGraphics());if(e){var t=r._calculatePerfectHeight();e.zmax=t.z,e.zmin=t.z-1,e.xmax+=2+t.lonD,e.xmin-=2+t.lonD,e.ymax+=1+t.lonD,e.ymin-=1+t.lonD,r._animateTo(e)}}),r.layer.emit("all-features-loaded",{graphics:r.getLoadedGraphics()}))}if(e.isArray(i)&&i.length>0){var r=this;this.isResolved()?a(i):this.when().then(function(){a(i)})}},_remove:function(t){e.isArray(t)&&t.length>0}});return T});
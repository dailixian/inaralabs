/**
 * Copyright @ 2024 Esri.
 * All rights reserved under the copyright laws of the United States and applicable international laws, treaties, and conventions.
 */
define(["dojo/_base/lang","dojo/_base/array","dojo/_base/declare","esri/core/scheduling","esri/core/reactiveUtils","../webgl-engine-extensions/ShaderSnippets","esri/core/libs/gl-matrix-2/vec3f64","esri/core/libs/gl-matrix-2/mat4f64","esri/core/libs/gl-matrix-2/vec3","esri/core/libs/gl-matrix-2/mat4","esri/views/3d/externalRenderers","esri/views/3d/webgl/RenderContext","esri/layers/GraphicsLayer","./Effect","../support/fx3dUtils","dojo/text!./CommonShaders.xml"],function(e,t,i,n,s,r,a,o,l,c,h,d,f,_,x,u){var g=o.mat4f64,c=c.mat4,m=a.vec3f64,l=l.vec3,w=null,p=i(null,{declaredClass:"esri.views.3d.effects.FxEffectRenderer",canRender:!0,constructor:function(){this._sceneView=null,this._internallyReady=!1,this._effects=[],this._fx3dFrameTask=null,this._shaderSnippets=null,this._normalMatrix=g.create(),this._viewDirection=m.create()},_init:function(t){return e.isObject(t)?(this._sceneView=t,void(this._internallyReady?this._viewReadyHandler():this._sceneView.when(e.hitch(this,function(){this._viewReadyHandler()})))):void console.error("FxEffectRenderer: no sceneView")},_viewReadyHandler:function(){if(this._sceneView._stage){var e=[x.constants.RenderSlot.OPAQUE_EXTERNAL,x.constants.RenderSlot.TRANSPARENT_EXTERNAL];this.context=new d(this._sceneView),this._sceneView._stage.addRenderPlugin(e,this),this._labelsLayer=new f({id:"-labelinfo-layer",listMode:"hide"}),this._sceneView.map.add(this._labelsLayer),this._sceneView._stage.renderView.setNeedsRender()}},_enableExtensions:function(e){var t=null;return window.WebGLRenderingContext&&this._gl instanceof window.WebGLRenderingContext?t=this._gl.getExtension("OES_texture_float")||this._gl.getExtension("OES_texture_float_linear")||this._gl.getExtension("OES_texture_half_float")||this._gl.getExtension("OES_texture_half_float_linear"):window.WebGL2RenderingContext&&this._gl instanceof window.WebGL2RenderingContext&&(t={}),null==t?console.error("Float texture extension is not supported in this browser."):this._vaoExt=e.vao,!!t},initializeRenderContext:function(e){if(this.context.gl=e.renderContext.rctx.gl,this.context.rctx=e.renderContext.rctx,this.needsRender=!1,this._gl=this.context.gl,this._internallyReady!==!0){var t=e.renderContext.rctx._capabilities;this._enableExtensions(t)?(this._shaderSnippets||(this._shaderSnippets=new r,this._shaderSnippets._parse(u)),this._internallyReady=!0,this.needsRender=!0,this.canRender=!0,this._webglStateReset()):(this._sceneView._stage&&this._sceneView._stage.removeRenderPlugin(this),x.extensionsMessage())}},uninitializeRenderContext:function(e){},_updateContext:function(e){this.context.camera.copyFrom(e.camera);var t={};t.direction=e.scenelightingData.old.direction,t.ambient=e.scenelightingData.old.ambient.color,t.diffuse=e.scenelightingData.old.diffuse.color,t.specular=[.2,.2,.2,.2],t.ambient[3]=e.scenelightingData.old.ambient.intensity,t.diffuse[3]=e.scenelightingData.old.diffuse.intensity,this.context.lightingData=t,this.context._renderTargetHelper=e.offscreenRenderingHelper,c.copy(this._normalMatrix,e.camera.viewInverseTransposeMatrix),this._normalMatrix[3]=this._normalMatrix[7]=this._normalMatrix[11]=0,this.context.rctx=e.rctx},_webglStateReset:function(){this.context.rctx.resetState()},intersect:function(){},prepareRender:function(e){this._updateContext(context)},render:function(e){return w=e.rctx||this._sceneView._stage.view._rctx,this._effects.forEach(function(e){e.effect.preRender(),e.effect.render({zoom:this._sceneView.zoom,proj:this.context.camera.projectionMatrix,view:this.context.camera.viewMatrix,viewInvTransp:this.context.camera.viewInverseTransposeMatrix,normalMat:this._normalMatrix,camPos:this.context.camera.eye,lightingData:this.context.lightingData,viewport:this.context.camera.viewport},w),e.effect.update()}.bind(this)),!0},dispose:function(){},_add:function(i,n){if(e.isObject(i)&&"esri.layers.FxLayer"===i.declaredClass&&n instanceof _){var s=t.filter(this._effects,function(e){return e.id===i.id&&e.effect.effectName==n.effectName});if(s.length>0)return console.warn("Layer "+i.id+" in "+n.effectName+" effect has already existed."),!1;if(e.isObject(n))return i.emit("hide-feature-label"),this._labelsLayer.id=i.id+this._labelsLayer.id,i._labelsLayer=this._labelsLayer,this._labelsLayer.visible=i.visible,i.watch("visible",function(e,t,n){this._labelsLayer&&(i.emit("hide-feature-label"),this._labelsLayer.set("visible",!!e))}.bind(this)),this._effects.push({id:i.id,effect:n}),"function"==typeof n.setContext&&n.setContext({gl:this._gl,vaoExt:this._vaoExt,shaderSnippets:this._shaderSnippets}),!0}return!1},_remove:function(e,i){if(e&&i){var n=-1,s=t.filter(this._effects,function(t,s){return t.id===i&&e==t.effect.effectName&&(n=s,!0)});s.length>0&&n>-1&&(s[0].effect.destroy(),this._effects.splice(n,1)),0===this._effects.length&&(this._fx3dFrameTask&&(this._fx3dFrameTask.remove(),this._fx3dFrameTask=null),this._internallyReady=!1,this._sceneView._stage&&this._sceneView._stage.removeRenderPlugin(this),this._labelsLayer&&(this._labelsLayer.removeAll(),this._sceneView.map.remove(this._labelsLayer)))}},_showGround:function(e){if("boolean"==typeof e&&this._sceneView.map&&this._sceneView.map.ground){var t=this._sceneView.map.ground.layers;t.forEach(function(t){t&&t.set("visible",e)})}}}),b=null;return p.init=function(e){b||(b=new p),b._init(e)},p.add=function(e,t){return!!b&&b._add(e,t)},p.destroy=function(e,t){b&&b._remove(e,t)},p.pause=function(){b&&(b._fx3dFrameTask&&b._fx3dFrameTask.pause(),b.needsRender=!1)},p});
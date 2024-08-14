/**
 * Copyright @ 2024 Esri.
 * All rights reserved under the copyright laws of the United States and applicable international laws, treaties, and conventions.
 */
define(["dojo/text!./AreaExtrudeMaterial.xml","dojo/_base/declare","../../webgl-engine-extensions/GLSLShader","../../webgl-engine-extensions/GLSLProgramExt","../../support/fx3dUtils","../Materials"],function(e,i,t,r,s,n){var a=i([n],{declaredClass:"esri.views.3d.effects.AreaExtrude.AreaExtrudeMaterial",constructor:function(e){this._gl=e.gl,this._shaderSnippets=e.shaderSnippets,this._program=null,this._viewingMode=e.viewingMode,this._pushState=e.pushState,this._restoreState=e.restoreState},destroy:function(){this._program&&(this._program.dispose(),delete this._program,this._program=null)},_addDefines:function(e,i){var t="";if(null!=i)if(Array.isArray(i))for(var r=0,s=i.length;r<s;r++){var n=i[r];t+="#define "+n+"\n"}else for(var n in i)t+="#define "+n+"\n";return this._shaderSnippets.defines+"\n"+t+e},loadShaders:function(){if(this._shaderSnippets){null!=this._shaderSnippets.areaExtrudeVS&&null!=this._shaderSnippets.areaExtrudeFS||this._shaderSnippets._parse(e);var i=[];"global"==this._viewingMode?i.push("GLOBAL"):i.push("LOCAL");var s=this._addDefines(this._shaderSnippets.areaExtrudeVS,i),n=new t(35633,s,this._gl),a=new t(35632,this._shaderSnippets.areaExtrudeFS,this._gl);this._program=new r([n,a],this._gl),this._program.init()}return this._initResources()},getProgram:function(){return this._program},_initResources:function(){return!0},bind:function(e,i){this._program.use(),this._program.uniformMatrix4fv("sp",e.proj),this._program.uniformMatrix4fv("pm",e.view),this._program.uniform3fv("ml",e.camPos),this._program.uniform3fv("op",e.camPos),this._program.uniform4fv("ps",e.viewport),this._program.uniform3fv("ii",e.lightingData.direction),this._program.uniform4fv("es",e.lightingData.ambient),this._program.uniform4fv("sl",e.lightingData.diffuse),this._program.uniform4fv("lm",e.lightingData.specular),this._oldTex=this._gl.getParameter(32873);var t=this.getOldActiveUnit(i);e.se.bind(t+1),this._program.uniform1i("se",t+1),e.so.bind(t+2),this._program.uniform1i("so",t+2),this._program.uniform2fv("is",e.is),this._program.uniform2fv("mm",[e.mm,e.ss]),this._program.uniform2fv("ep",e.ep),this._gl.activeTexture(33984+t+3),this._gl.bindTexture(3553,e.mi),this._program.uniform1i("mi",t+3),this._program.uniform1f("im",e.im),this._program.uniform1f("lp",e.lp),this._program.uniform3fv("ll",e.ll),this._program.uniform1f("ms",e.time),this._program.uniform1i("eo",e.reachedRepeatLimit),1!=i._depthTestEnabled&&(this._pushState(["setDepthTestEnabled",i._depthTestEnabled]),i.setDepthTestEnabled(!0)),1!=i._polygonCullingEnabled&&(this._pushState(["setFaceCullingEnabled",i._polygonCullingEnabled]),i.setFaceCullingEnabled(!0)),1!=i._blendEnabled&&(this._pushState(["setBlendingEnabled",i._blendEnabled]),i.setBlendingEnabled(!0))},bindVec3:function(e,i){this._program.uniform3fv(e,i)},release:function(e){this._gl.activeTexture(33984+e._state.activeTexture+1),this._gl.bindTexture(3553,this._oldTex),this._restoreState(e),this._gl.useProgram(null)}});return a});
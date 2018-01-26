// <!-- Copyright (c) 2017 Siemens Product Lifecycle Management Software Inc. Licensed under the "MPL 2.0 License" -->

define(["app", "js/eventBus", "js/dateTimeService", "js/appCtxService"], function (app, eventBus, dateTimeSvc) {
	"use strict";
	
	var _appCtxSvc = null,
	_tcServerVersion = null,
	exports = {};
	return exports.createStyleSheet = function (data) {
		_appCtxSvc.ctx.at4create = {};
		console.log(_appCtxSvc.ctx.userSession.props.group.uiValues[0]);
		_appCtxSvc.ctx.at4create.userGroup = _appCtxSvc.ctx.userSession.props.group.uiValues[0];
		
		_appCtxSvc.ctx.at4create.selectedPanel = "CREATE";
		_appCtxSvc.ctx.at4create.showFileAttachments = true;		
		_appCtxSvc.ctx.at4create.createTypeName = data.dataProviders.awTypeSelector.selectionModel.selectedObjects[0].props.type_name.dbValue;
		_appCtxSvc.ctx.at4create.createTypeDisplayValue = data.dataProviders.awTypeSelector.selectionModel.selectedObjects[0].props.type_name.displayValues[0];		
        _appCtxSvc.ctx.at4create.homeFolder = _appCtxSvc.ctx.locationContext.modelObject;						
			
        console.log ( JSON.stringify (_appCtxSvc.ctx.at4create) );
		//alert(JSON.stringify (_appCtxSvc.ctx.at4create));
		var context = {
			destPanelId: "AT4ShowCreate"
		};
		eventBus.publish("awPanel.navigate", context);
		_appCtxSvc.ctx.at4create.selectedPanel = "TYPES";
		
	},
	app.factory("at4Create", ["appCtxService", "TcServerVersion", function (appCtxSvc, tcServerVersion) {
				return _appCtxSvc = appCtxSvc,
				_tcServerVersion = tcServerVersion,
				exports
			}
		]), {
		moduleServiceNameToInject: "at4Create"
	}
});

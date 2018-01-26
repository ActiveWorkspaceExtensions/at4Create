// <!-- Copyright (c) 2017 Siemens Product Lifecycle Management Software Inc. Licensed under the "MPL 2.0 License" -->

define(["app", "js/eventBus", "lodash", "js/appCtxService", "js/viewModelService", "js/messagingService", "soa/kernel/clientDataModel"], function (app, eventBus, _) {
	"use strict";
	function resetFileInputs() {
		_createInProgress = !1,
		_numInputFiles = 0,
		_datasetInfoIndex = -1
	}
	function setAttachmentInputs(data) {
		var i,
		attachArray = [];
		for (i = 0; i < data.fileInputForms.length; i++)
			data.fileInputForms[i].selectedFile && attachArray.push(data.fileInputForms[i].selectedFile);
		_numInputFiles = attachArray.length,
		data.dataToBeRelated = _numInputFiles > 0 ? {
			attachFiles: attachArray
		}
		 : {}
	}
	function setWorkflowInputs(data) {
		var selection = data.workflowTemplates.dbValue,
		boolValue = selection && "" !== selection && "No Template Available" !== selection,
		propValue = boolValue ? "1" : "0";
		data.workflowData = boolValue ? {
			submitToWorkflow: [propValue],
			workflowTemplateName: [selection.props.template_name.getDisplayValue()]
		}
		 : {}
	}
	function setFmsTicketVar(data, fileName, ticketValue) {
		var i;
		for (i = 0; i < data.fileInputForms.length; i++)
			if (data.fileInputForms[i].selectedFile && "" !== data.fileInputForms[i].selectedFile && data.fileInputForms[i].selectedFile === fileName) {
				data.fileInputForms[i].fmsTicket = ticketValue;
				var formElement = $("#" + data.fileInputForms[i].id);
				return data.formData = new FormData($(formElement)[0]),
				data.formData.append("fmsTicket", data.fileInputForms[i].fmsTicket),
				!0
			}
		return !1
	}
	var _appCtxSvc = null,
	_viewModelSvc = null,
	_messagingSvc = null,
	_cdm = null,
	_createInProgress = !1,
	_numInputFiles = 0,
	_datasetInfoIndex = 0,
	_fmsUrl = "",
	exports = {};
	return exports.isFetchFilteredTemplates = function (data) {
		var isFetchFilteredTemplates = !0;
		return data.isAllowAlternateProcedures.dbValue = !0,
		"none" === data.preferences.CR_allow_alternate_procedures[0] ? data.isAllowAlternateProcedures.dbValue = !1 : "any" === data.preferences.CR_allow_alternate_procedures[0] ? (isFetchFilteredTemplates = !1, data.allowAlternateProcedures.dbValue = !0) : "Assigned" === data.preferences.CR_allow_alternate_procedures[0] && (data.allowAlternateProcedures.dbValue = !1),
		isFetchFilteredTemplates
	},
	exports.getFiltered = function (isAll) {
		return !isAll
	},
	exports.initCreateIRDC = function (data) {
		if (!_createInProgress) {
			_createInProgress = !0,
			setAttachmentInputs(data),
			setWorkflowInputs(data);
			_appCtxSvc.ctx.at4create.showFileAttachments ? eventBus.publish("ShowCreateDocument.callCreateIRDC") : eventBus.publish("ShowCreateDocument.oldCallCreateIRDC")
		}
	},
	exports.createIRDCFailed = function () {
		_createInProgress = !1
	},
	exports.checkForFileUploads = function (data, fmsUrl) {
		_fmsUrl = fmsUrl,
		(_numInputFiles > 0 && !data.datasetInfos || data.datasetInfos && _numInputFiles > data.datasetInfos.length) && _messagingSvc.reportNotyMessage(data, data._internal.messages, "failureToAttachFiles"),
		data.datasetInfos && 0 !== data.datasetInfos.length ? (_datasetInfoIndex = -1, eventBus.publish("ShowCreateDocument.initNextUpload")) : (eventBus.publish("ShowCreateDocument.addToFolder"), resetFileInputs())
	},
	exports.initNextUpload = function (data) {
		if (_datasetInfoIndex >= 0 && data.formData && (data.formData.value = "", data.formData = null, eventBus.publish("progress.end", {
					endPoint: _fmsUrl
				})), ++_datasetInfoIndex >= data.datasetInfos.length)
			return eventBus.publish("ShowCreateDocument.addToFolder"), void resetFileInputs();
		var commitInfo = data.datasetInfos[_datasetInfoIndex].commitInfo[0],
		datasetModel = _cdm.getObject(commitInfo.dataset.uid),
		objNameProp = _.get(datasetModel, "props.object_name");
		data.fileName = objNameProp.getDisplayValue();
		var fmsTicket = commitInfo.datasetFileTicketInfos[0].ticket;
		setFmsTicketVar(data, data.fileName, fmsTicket) ? (data.commitInfo = commitInfo, eventBus.publish("progress.start", {
				endPoint: _fmsUrl
			}), eventBus.publish("ShowCreateDocument.uploadReady")) : (_messagingSvc.reportNotyMessage(data, data._internal.messages, "uploadFailed"), data.commitInfo = {}, exports.initNextUpload(data))
	},
	app.factory("AT4ShowCreateObjectService", ["appCtxService", "viewModelService", "messagingService", "soa_kernel_clientDataModel", function (appCtxSvc, viewModelSvc, messagingService, cdm) {
				return _appCtxSvc = appCtxSvc,
				_viewModelSvc = viewModelSvc,
				_messagingSvc = messagingService,
				_cdm = cdm,
				resetFileInputs(),
				eventBus.subscribe("ShowCreateDocument.workflowTemplatesLoaded", function (eventData) {
					if (eventData.scope) {
						var declViewModel = _viewModelSvc.getViewModel(eventData.scope, !1);
						declViewModel && declViewModel.templates && declViewModel.templates.length > 0 && (declViewModel.workflowTemplates.dbValue = declViewModel.templates[0])
					}
				}, "AT4ShowCreateObjectService"),
				eventBus.subscribe("ShowCreateDocument.updatePanel", function (eventData) {
					if (eventData.element) {
						var scrollPanel = document.getElementsByName("awPanelBody")[0],
						workflowSection = $("#workflowSection")[0];
						scrollPanel.clientHeight + scrollPanel.scrollTop < scrollPanel.scrollHeight - workflowSection.clientHeight && (eventData.element.scrollIntoView(!1), eventData.offset && (scrollPanel.scrollTop += eventData.offset))
					}
				}, "AT4ShowCreateObjectService"),
				exports
			}
		]), {
		moduleServiceNameToInject: "AT4ShowCreateObjectService"
	}
});

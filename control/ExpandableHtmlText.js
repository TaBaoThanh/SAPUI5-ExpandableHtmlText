/*!
 * Expandable Html Text v.1.0
 * Author: Ta Bao Thanh
 * Git: https://github.com/TaBaoThanh
 * Build-on: 1.71 SAPUI5 version
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/m/Link",
	"sap/m/FormattedText",
	"sap/m/ResponsivePopover",
	"sap/ui/Device",
	"sap/m/Button"
], function (Control, Core, Link, Text, ResponsivePopover, Device, Button) {
	"use strict";

	var oRb = Core.getLibraryResourceBundle("sap.m");

	var TEXT_SHOW_MORE = oRb.getText("TEXT_SHOW_MORE");
	// var TEXT_SHOW_LESS = oRb.getText("TEXT_SHOW_LESS");
	var CLOSE_TEXT = oRb.getText("MSGBOX_CLOSE");

	var ExpandableHtmlText = Control.extend("thanh.m.ExpandableHtmlText", {
		metadata: {
			properties: {
				text: {
					type: "string",
					defaultValue: ""
				}, // Initial text
				maxLength: {
					type: "int",
					defaultValue: 100
				}, // Maximum length before truncation
				highlightText: {
					type: "string",
					defaultValue: ""
				}
			},
			aggregations: {
				_link: {
					type: "sap.m.Link",
					multiple: false,
					visibility: "hidden"
				},
				_text: {
					type: "sap.m.FormattedText",
					multiple: false,
					visibility: "hidden"
				}
			},
			events: {
				// Define custom events here if needed
			}
		},

		init: function () {
			// Create the internal Link and Text controls
			this.setAggregation("_link", new Link({
				text: TEXT_SHOW_MORE,
				press: this._onLinkPress.bind(this)
			}));

			this.setAggregation("_text", new Text());
		},

		_onLinkPress: function () {
			// Open a popover to show the full text
			var text = this._highlighText(this.getProperty("text"));
			var oPopover, oText;

			oText = new Text({
				htmlText: text,
			}).addStyleClass("sapUiSmallMargin").addStyleClass("sapMExTextPopover").addStyleClass("sapMText");

			oPopover = this._oPopover;
			if (oPopover && oPopover.isOpen()) {
				oPopover.close();
				return;
			}

			if (!oPopover) {
				oPopover = this._oPopover = new ResponsivePopover({
					placement: sap.m.PlacementType.Auto,
					showHeader: false,
				});
				if (Device.system.phone) {
					oPopover.setEndButton(new Button({
						text: CLOSE_TEXT,
						press: function () {
							oPopover.close();
						}
					}));
				}
				this.addDependent(oPopover);
			}

			oPopover.removeAllAriaLabelledBy();
			oPopover.destroyContent();

			oPopover.addAriaLabelledBy(oText);
			oPopover.addContent(oText);
			oPopover.openBy(this.getAggregation("_link"));
		},

		renderer: function (oRm, oText) {
			oRm.write("<div");
			oRm.writeControlData(oText);
			oRm.addClass("sapMFT"); // Add custom CSS class
			oRm.writeClasses();
			oRm.write(">");

			var text = oText.getProperty("text");
			var maxLength = oText.getProperty("maxLength");
			var oAriaLabelledByControl = oText.getAggregation("_ariaLabelledBy");

			if (text.length <= maxLength) {
				oText.getAggregation("_text").setText(text);
				oRm.renderControl(oText.getAggregation("_text"));
			} else {
				var truncatedText = text.substring(0, maxLength) + " ... ";

				truncatedText = oText._highlighText(truncatedText);
				oText.getAggregation("_text").setHtmlText(truncatedText);
				
				oRm.openStart("span", oText.getId() + "-string");
				oRm.openEnd();
				oRm.write(truncatedText);
				oRm.close("span");
				
				oRm.write("<div style='vertical-align: bottom'");
				oRm.renderControl(oText.getAggregation("_link"));
				oRm.write("</div>");
			}
			oRm.write("</div>");
		}
	});

	/**
	 * Called when the control is destroyed.
	 */
	ExpandableHtmlText.prototype.exit = function () {
		if (this._oPopover) {
			this._oPopover.destroy();
			this._oPopover = null;
		}
	};

	/**
	 * Highlight the specific text if provided
	 *
	 * @private
	 * @returns {string} html text.
	 */
	ExpandableHtmlText.prototype._highlighText = function (text) {
		var highlightText = this.getProperty("highlightText");
		return text.replace(new RegExp(highlightText, 'g'), "<span class='highlight'>" + highlightText + "</span>");
	};

	return ExpandableHtmlText;
});
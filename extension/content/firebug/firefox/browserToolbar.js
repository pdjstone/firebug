/* See license.txt for terms of usage */

define([
    "firebug/lib/trace",
    "firebug/lib/options",
    "firebug/lib/locale",
    "firebug/firefox/browserOverlayLib",
],
function(FBTrace, Options, Locale, BrowserOverlayLib) {
with (BrowserOverlayLib) {

// ********************************************************************************************* //
// Constants

// ********************************************************************************************* //
// Firefox Toolbar Buttons

var BrowserToolbar =
{
    overlay: function(doc, version)
    {
        this.overlayToolbarButtons(doc, version);
        this.customizeToolbar(doc);
    },

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // Firebug Start Button Popup Menu

    overlayToolbarButtons: function(doc, version)
    {
        $toolbarButton(doc, "firebug-inspectorButton", {
            label: "firebug.Inspect",
            tooltiptext: "firebug.InspectElement",
            observes: "cmd_firebug_toggleInspecting",
            style: "list-style-image: url(chrome://firebug/skin/inspect.png);" +
                "-moz-image-region: rect(0, 16px, 16px, 0);"
        });

        // Start Button Tooltip. As soon as Firebug is fully loaded, the tooltip content will be
        // generated by firebug/firefox/start-button/startButtonOverlay module.
        $menupopupOverlay(doc, $(doc, "mainPopupSet"), [
            $tooltip(doc, {
                "class": "firebugButtonTooltip",
                id: "firebug-buttonTooltip",
                orient: "vertical",
            }, [
                $label(doc, {
                    "class": "version",
                    "value": "Firebug " + version
                }),
                $label(doc, {
                    "class": "status",
                    "value": Locale.$STR("startbutton.tip.deactivated")
                })
            ])
        ]);

        // TODO: why contextmenu doesn't work without cloning
        $toolbarButton(doc, "firebug-button", {
            label: "firebug.Firebug",
            tooltip: "firebug-buttonTooltip",
            type: "menu-button",
            command: "cmd_firebug_toggleFirebug",
            contextmenu: "fbStatusContextMenu",
            observes: "firebugStatus",
            style: "list-style-image: url(chrome://firebug/skin/firebug16.png)"
        }, [$(doc, "fbStatusContextMenu").cloneNode(true)]);
    },

    customizeToolbar: function(doc)
    {
        // Appends Firebug start button into Firefox toolbar automatically after installation.
        // The button is appended only once - if the user removes it, it isn't appended again.
        // TODO: merge into $toolbarButton?
        // toolbarpalette check is for seamonkey, where it is in the document
        if ((!$(doc, "firebug-button") ||
            $(doc, "firebug-button").parentNode.tagName == "toolbarpalette")
            && !Options.get("toolbarCustomizationDone"))
        {
            Options.set("toolbarCustomizationDone", true);

            // Get the current navigation bar button set (a string of button IDs) and append
            // ID of the Firebug start button into it.
            var startButtonId = "firebug-button";
            var navBarId = "nav-bar";
            var navBar = $(doc, navBarId);
            var currentSet = navBar.currentSet;

            if (FBTrace.DBG_INITIALIZE)
                FBTrace.sysout("Startbutton; curSet (before modification): " + currentSet);

            // Append only if the button is not already there.
            var curSet = currentSet.split(",");
            if (curSet.indexOf(startButtonId) == -1)
            {
                navBar.insertItem(startButtonId);
                navBar.setAttribute("currentset", navBar.currentSet);
                navBar.ownerDocument.persist("nav-bar", "currentset");

                // Check whether insertItem really works
                var curSet = navBar.currentSet.split(",");
                if (curSet.indexOf(startButtonId) == -1)
                    FBTrace.sysout("Startbutton; navBar.insertItem doesn't work", curSet);

                if (FBTrace.DBG_INITIALIZE)
                {
                    FBTrace.sysout("Startbutton; curSet (after modification): " +
                        navBar.currentSet);
                }

                try
                {
                    // The current global scope is browser.xul.
                    BrowserToolboxCustomizeDone(true);
                }
                catch (e)
                {
                    if (FBTrace.DBG_ERRORS)
                        FBTrace.sysout("startButton; appendToToolbar EXCEPTION " + e, e);
                }
            }

            // Don't forget to show the navigation bar - just in case it's hidden.
            navBar.removeAttribute("collapsed");
            doc.persist(navBarId, "collapsed");
        }
    },
}

// ********************************************************************************************* //
// Registration

return BrowserToolbar;

// ********************************************************************************************* //
}});

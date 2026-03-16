// This file is used for all right click context menu functions in page 193


// Enabble Context menu on right click
function onContextMenu(p_event) {
    p_event.preventDefault();
    logDebug("function : onContextMenu", "S");
    var valid = "N";
    if (p_event.target.nodeName == "CANVAS" && g_scene_objects.length > 0) {
        set_curr_canvas(p_event);
        g_canvas = p_event.target;
        g_pog_index = parseInt(g_canvas.getAttribute("data-indx"));
        g_context_opened = "Y";
        var is_divider = "N";
        var canvas_width = 0,
            border = 0,
            g_duplicate_fixel_flag = "N";
        if (g_compare_pog_flag == "Y") {
            border = 5;
        }
        console.log("event", p_event.target, g_pog_index);
        //getting the canvas bounding area and find out the client x and y where right click was done.
        var r = g_canvas.getBoundingClientRect();
        var start_x = r.left;
        var start_y = r.top;
        var x = p_event.clientX - r.left;
        var y = p_event.clientY - r.top;
        prevX = startX = x;
        prevY = startY = y;
        g_selected_block = ""
        //Pass that to doMouseDown function to find out which object was hit.
        g_dragging = doMouseDown(x, y, start_x, start_y, p_event, g_canvas, "Y", g_pog_index);
        g_dragging = false;
        console.log("return from MouseDown", g_dragging);
        console.log("constext ", g_start_canvas, g_ComViewIndex, g_compare_view, g_compare_pog_flag);
        if (g_carpark_item_flag == "N" && g_carpark_edit_flag == "N" &&  (g_module_edit_flag == "Y" || g_shelf_edit_flag == "Y" || g_item_edit_flag == "Y" || ((g_multiselect == "Y" || g_ctrl_select == "Y") && g_delete_details.length > 0)) && ((g_start_canvas == g_ComViewIndex && g_compare_view == "POG" && g_compare_pog_flag == "Y") || (g_start_canvas !== g_ComViewIndex && g_compare_pog_flag == "Y") || g_compare_pog_flag == "N")) {
            p_event.preventDefault();
            new_details = JSON.parse(JSON.stringify(g_delete_details));
            for (const objects of new_details) {
                objects.ShelfInfo = "";
            }
            valid = "Y";
        }
        //Below block will set the position of the context menu and the submenus for example Edit Facings. according to the mouse right click location.
        if (valid == "Y") {
            var header = document.getElementById("t_Header");
            var breadcrumb = document.getElementById("t_Body_title");
            var top_bar = document.getElementById("top_bar");
            var side_nav = document.getElementById("t_Body_nav");
            var button_cont = document.getElementById("side_bar");
            var canvas_btn = document.getElementById("maincanvas-btns");
            var canvas_btn_height = typeof canvas_btn !== "undefined" && canvas_btn !== null ? canvas_btn.offsetHeight : 0;
            var devicePixelRatio = window.devicePixelRatio;
            var padding = parseFloat($(".t-Body-contentInner").css("padding-left").replace("px", ""));

            var header_height = header.offsetHeight; // devicePixelRatio;
            var breadcrumb_height = breadcrumb.offsetHeight; // devicePixelRatio;
            var top_bar_height = top_bar.offsetHeight; // devicePixelRatio;
            var side_nav_width = side_nav.offsetWidth; // devicePixelRatio;
            var btn_cont_width = button_cont.offsetWidth; //devicePixelRatio;
            var contextElement = document.getElementById("context-menu");

            var inner_width_edit = parseInt(p_event.clientX - $(".t-Region-body").scrollLeft() + contextElement.offsetWidth);
            var window_width = parseInt($(window).width() - (side_nav_width + btn_cont_width));
            var inner_width_noedit = parseInt(p_event.clientX - $(".t-Region-body").scrollLeft() + contextElement.offsetWidth);

            //if (event.clientY + contextElement.offsetHeight > window.innerHeight) { beacuse when we click shelf or item from bottom second last shelf its show the context menu not properly in biottom
            if (p_event.clientY > (window.innerHeight / 2)) { //ASA-1236
                contextElement.style.top = p_event.clientY - $(document).scrollTop() - contextElement.offsetHeight + "px"; //+ (header_height + breadcrumb_height + top_bar_height + padding) - contextElement.offsetHeight + border + canvas_btn_height + "px";
            } else {
                contextElement.style.top = p_event.clientY - $(document).scrollTop() + "px"; //+ (header_height + breadcrumb_height + top_bar_height + padding) + border + canvas_btn_height + "px";
            }

            if (inner_width_edit > window_width && (g_shelf_edit_flag == "Y" || g_item_edit_flag == "Y")) {
                contextElement.style.left = p_event.clientX - $(".t-Region-body").scrollLeft() - contextElement.offsetWidth + "px"; // + (side_nav_width + btn_cont_width + padding)) + border - contextElement.offsetWidth + "px";
            } else if (inner_width_noedit > window_width) {
                contextElement.style.left = p_event.clientX - $(".t-Region-body").scrollLeft() - contextElement.offsetWidth + "px"; // + (side_nav_width + btn_cont_width + padding)) + border - contextElement.offsetWidth + "px";              
            }
            else {
                contextElement.style.left = p_event.clientX - $(".t-Region-body").scrollLeft() + "px"; // + (side_nav_width + btn_cont_width + padding)) + border + "px";               
            }
            console.log("contextElement.style.top", contextElement.style.top, contextElement.style.left, p_event);

           // Show Edit / Modify / Delete when a block was hit; show only Add otherwise.
            var cm = document.getElementById("context-menu");
            var elAdd    = cm ? cm.querySelector("#add")                  : null;
            var elEdit   = cm ? cm.querySelector("#edit")                 : null;
            var elModify = cm ? cm.querySelector('a[onclick*="modify"]') : null;
            var elDelete = cm ? cm.querySelector("#blk_delete")          : null;

            var menuItems = [elAdd, elEdit, elModify, elDelete];

            if (g_selected_block) {
                toggleDisabled(elAdd, true);
                toggleDisabled(elEdit, false);
                toggleDisabled(elModify, false);
                toggleDisabled(elDelete, false);
            } else {
                toggleDisabled(elAdd, false);
                toggleDisabled(elEdit, true);
                toggleDisabled(elModify, true);
                toggleDisabled(elDelete, true);
            }
            contextElement.classList.add("active");
        }
    }
    logDebug("function : onContextMenu", "E");
}

async function context_func(p_action) {
    logDebug("function : context_func; action : " + p_action, "S");
    g_dragging = false;
    if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
        if (p_action != "copy_pogc_image" && p_action != "zoom_selected_pogc" && g_module_edit_flag == "N" && g_shelf_edit_flag == "N" && g_item_edit_flag == "N" && p_action !== "edit" && g_multiselect !== "Y" && p_action !== "muledit") {
            alert(get_message("NO_OBJECT_ERROR"));
        } else {
            if (p_action == "add") {
                context_add();
            } else if (p_action == "delete") {
                delete_blk_details(g_selected_block);
            } else if (p_action == "edit") {
                if (g_multiselect === "Y" && g_intersected.length > 0) {
                    open_multiselect_blk_details();
                } else {
                    open_blk_details(g_selected_block, 'Y');
                }
            } else if (p_action == "modify") {
                enable_blk_resize_modify();
            }
        }

    }
    g_taskItemInContext = "";
    g_context_opened = "N";
    logDebug("function : context_func", "E");
}

// Arms "drag-to-add" mode for a new autofill block.
// The existing doMouseUp → getAutofillModShelf → openInlineDialog("block_details") flow
// fires automatically when the user drags across the module — no coordinate work needed here.
// Cancel by pressing Escape 
function context_add() {
    try {
        // Remove any leftover hint from a previous call.
        var existing = document.getElementById('blockAddHint');
        if (existing) existing.remove();

        // Visual hint (bottom-right corner, same style as resize mode).
        var hint = document.createElement('div');
        hint.id = 'blockAddHint';
        hint.style.cssText = 'position:fixed;right:20px;bottom:20px;z-index:99999;' +
            'background:rgba(0,0,0,0.75);color:#fff;padding:8px 12px;' +
            'border-radius:6px;font-size:13px;pointer-events:none;';
        hint.innerText = 'Drag Mode - Esc to cancel';
        document.body.appendChild(hint);

        // Crosshair cursor on the canvas so the user knows to drag.
        try { document.getElementById('maincanvas').style.cursor = 'crosshair'; } catch (e) {}

        function _cleanup() {
            var el = document.getElementById('blockAddHint');
            if (el) el.remove();
            try { document.getElementById('maincanvas').style.cursor = 'auto'; } catch (e) {}
            window.removeEventListener('keyup', _keyHandler, true);
            window.removeEventListener('mouseup', _mouseupHandler, true);
        }

        // Escape cancels the mode — capture phase so we intercept before
        // the global $(document).keyup() handler that clears autofill blocks.
        function _keyHandler(e) {
            if (e.key === 'Escape') {
                e.stopPropagation();
                _cleanup();
            }
        }

        // After the user releases the mouse, doMouseUp runs getAutofillModShelf and
        // opens block_details automatically — clean up the hint with a short delay.
        function _mouseupHandler() {
            setTimeout(_cleanup, 300);
        }

        window.addEventListener('keyup', _keyHandler, true);
        window.addEventListener('mouseup', _mouseupHandler, true);

    } catch (err) {
        error_handling(err);
    }
}

function delete_blk_details(p_old_blk_name) {
    confirm(get_message("SHCT_DELETE_CONFIRM_MSG"), get_global_ind_values("AI_CONFIRM_OK_TEXT"), get_global_ind_values("AI_CONFIRM_CANCEL_TEXT"), function () {
        async function doSomething() {
            var i = 0;
            for (const obj of g_mod_block_list) {
                if (obj.BlkName == p_old_blk_name) {
                    for (const child of obj.BlockDim.ColorObj.children) {
                        if (child.uuid == p_old_blk_name) {
                            obj.BlockDim.ColorObj.remove(child);
                            break;
                        }
                    }
                    g_mod_block_list.splice(i, 1);
                    break;
                }
                i++;
            }
            render(g_pog_index);
            var retval = await save_blk_dtl_coll("D", p_old_blk_name, []);
            closeInlineDialog("block_details");
            g_autofill_edit = "N";
            apex.event.trigger(g_page_no + "POG_RULE", "apexrefresh");
            if (g_page_no == 'P25_') {
                apex.theme.openRegion("auto_fill_reg");
                g_auto_fill_reg_open = "Y";
            } else {
                apex.region("mod_block_details").refresh();
            }
            return "SUCCESS";
        }
        doSomething();
    });
    //Task_29818 - End
}


function open_multiselect_blk_details() {
    try {
        logDebug("function : open_multiselect_blk_details", "S");

        // Collect all selected BLOCK entries from g_delete_details
        var selectedBlocks = g_delete_details.filter(function (d) {
            return d.Object === "BLOCK";
        });

        if (selectedBlocks.length === 0) {
            logDebug("open_multiselect_blk_details: no BLOCK entries in g_delete_details", "W");
            return;
        }

        // Build colon-separated list of BlkNames (same format update_module_block_list reads)
        var blkNameList = selectedBlocks.map(function (d) { return d.BlkName; }).join(":");

        $s(g_page_no + "EDIT_BLK", blkNameList);
        g_autofill_edit = "Y";

        // BLK_NAME / BLK_COLOR / BLK_RULE are disabled (readonly) fields — $s() won't update them.
        // Use jQuery .val() directly to bypass the disabled-item guard.
        // BLK_NAME shows "Mixed" to indicate multiple blocks are selected.
        // BLK_COLOR and BLK_RULE are taken from the first selected block.
        var firstBlk = selectedBlocks[0];
        var firstColor = firstBlk.BlkColor || "";
        var firstRule = "";
        for (var i = 0; i < g_mod_block_list.length; i++) {
            if (g_mod_block_list[i].BlkName === firstBlk.BlkName) {
                firstRule = g_mod_block_list[i].BlkRule || "";
                break;
            }
        }
        // BLK_NAME: plain text input — jQuery .val() + prop("disabled") is enough
        $("#" + g_page_no + "BLK_NAME").val("Mixed").prop("disabled", true);

        // BLK_COLOR: APEX color-picker widget (input + swatch + trigger button).
        // $s sets the value across all widget elements; apex.item().disable() disables the whole widget.
        $s(g_page_no + "BLK_COLOR", firstColor);
        apex.item(g_page_no + "BLK_COLOR").disable();

        // BLK_RULE: try $s() directly (options already in DOM from a prior open).
        // Fallback: if the option isn't found (fresh page load, LOV not yet populated),
        // trigger apexrefresh and set the value once options arrive.
        var blkRuleId = "#" + g_page_no + "BLK_RULE";
        $s(g_page_no + "BLK_RULE", firstRule);
        if (firstRule && $(blkRuleId).val() !== firstRule) {
            // Option not in DOM yet — load LOV then select and disable
            apex.item(g_page_no + "BLK_RULE").enable();
            $(blkRuleId).one("apexafterrefresh", function () {
                $s(g_page_no + "BLK_RULE", firstRule);
                apex.item(g_page_no + "BLK_RULE").disable();
            });
            apex.event.trigger(blkRuleId, "apexrefresh");
        } else {
            apex.item(g_page_no + "BLK_RULE").disable();
        }

        // On Cancel / X close: remove blinking borders and restore all fields.
        // closeInlineDialog uses apex.theme.closeRegion which fires "apexafterclosedialog"
        // on the region element — NOT jQuery UI's "dialogclose".
        var _pog_index = g_pog_index;
        $("#block_details").one("apexafterclosedialog", function () {
            clear_blinking();
            cleanupBlockBorders(_pog_index);
            render(_pog_index);
            g_delete_details = [];
            // Use apex.item().enable() for all three — jQuery .prop("disabled",false) only
            // updates the DOM but APEX still treats the item as disabled, so $s() and $v()
            // continue to use the stale cached value on the next open.
            apex.item(g_page_no + "BLK_NAME").enable();
            apex.item(g_page_no + "BLK_COLOR").enable();
            apex.item(g_page_no + "BLK_RULE").enable();
        });

        var model = apex.region("block_filters").widget().interactiveGrid("getViews", "grid").model;
        model.clearChanges();
        apex.region("block_filters").refresh();

        $("#ADD_BLK").css("display", "none");
        $("#SAVE_BLK").css("display", "none");
        $("#UPDATE_BLK").css("display", "inline");
        g_auto_fill_reg_open = "N";
        openInlineDialog("block_details", 40, 65);

        logDebug("open_multiselect_blk_details: opened modal for " + selectedBlocks.length + " blocks: " + blkNameList, "I");
        logDebug("function : open_multiselect_blk_details", "E");
    } catch (err) {
        error_handling(err);
    }
}

//ASA-1986 Common function to open dialogue on edit icon from GRID.
function open_blk_details(p_blk_name, p_edit_ind) {
    console.log(p_blk_name);
    $s(g_page_no + "EDIT_BLK", p_blk_name);
    g_autofill_edit = p_edit_ind == "Y" ? "Y" : "N";
    var model = apex.region("block_filters").widget().interactiveGrid("getViews", "grid").model;
    //model.clearChanges(); //ASA-1727 ISSUE-1
    //apex.region("block_filters").refresh(); //ASA-1727 ISSUE-1

    for (const obj of g_mod_block_list) {
        if (obj.BlkName == p_blk_name) {
            $s(g_page_no + "BLK_NAME", obj.BlkName.slice(0, -4));
            $s(g_page_no + "BLK_COLOR", obj.BlkColor);
            $s(g_page_no + "BLK_RULE", obj.BlkRule);
            var row$,
                region = apex.region("block_filters"),
                view = region.call("getCurrentView");
            if (p_edit_ind == "N") { //Regression Issue 5 autofill EDIT
                if (obj.FilterVal.length > 0) {
                    //ASA-1727 ISSUE-1 change 1 to 0  and remove if (i > 0) {
                    var i = 0;
                    for (const fil of obj.FilterVal) {
                        // if (i > 0) {
                        if (view.internalIdentifier === "grid") {
                            row$ = region.widget().find(".a-GV-row").last();
                            view.view$.grid("setSelection", row$);
                            region.call("getActions").invoke("selection-add-row");
                        }
                        //  }
                        i++;
                    }
                }
                var i = 0;

                model.forEach(function (igrow) {
                    console.log(obj.FilterVal[i], igrow);
                    if (typeof obj.FilterVal[i] !== "undefined") {
                        var details = obj.FilterVal[i].split("#");
                        model.setValue(igrow, "FILTER", `${details[0]}`);
                        model.setValue(igrow, "VALUE", `${details[1]}`);
                    }
                    i++;
                });
            } else {
                model.clearChanges(); //ASA-1727 ISSUE-1
                apex.region("block_filters").refresh(); //ASA-1727 ISSUE-1
            }

            // Ensure fields are never stuck disabled from a previous multiselect open
            apex.item(g_page_no + "BLK_NAME").enable();
            apex.item(g_page_no + "BLK_COLOR").enable();
            apex.item(g_page_no + "BLK_RULE").enable();
            $("#ADD_BLK").css("display", "none");
            $("#SAVE_BLK").css("display", "none");
            $("#UPDATE_BLK").css("display", "inline");
            g_auto_fill_reg_open = "N";
            openInlineDialog("block_details", 40, 65);
            break;
        }
    }
}

// Modify block - Enable resize option
async function enable_blk_resize_modify() {
    try {
        if (!g_selected_block || g_selected_block.length === 0) {
            alert(get_message ? get_message('POGCR_BLK_SELECT') : 'Please select a block to modify');
            return;
        }
        // find block reference
        var blk = null;
        for (const b of g_mod_block_list) {
            if (b.BlkName == g_selected_block) {
                blk = b;
                break;
            }
        }
        if (!blk) {
            alert('Block details not found');
            return;
        }

        // set resize mode to armed; user should click the selected block edge and drag
        g_block_resize_state.armed = true;
        g_block_resize_state.active = false;
        g_block_resize_state.blkName = g_selected_block;
        g_block_resize_state.blkRef = blk;

        // visual hint
        var existingHint = document.getElementById('blockResizeHint');
        if (existingHint) existingHint.remove();
        var hint = document.createElement('div');
        hint.id = 'blockResizeHint';
        hint.style.position = 'fixed';
        hint.style.right = '20px';
        hint.style.bottom = '20px';
        hint.style.zIndex = 99999;
        hint.style.background = 'rgba(0,0,0,0.75)';
        hint.style.color = '#fff';
        hint.style.padding = '8px 10px';
        hint.style.borderRadius = '6px';
        hint.style.fontSize = '13px';
        hint.innerText = 'Resize mode';
        document.body.appendChild(hint);

        // Keep default cursor; ew-resize will be shown only when pointer is on block edge.
        try { $('#maincanvas').css('cursor', 'auto'); } catch (e) { }

        // add a key handler to cancel/arrow nudge while armed/active
        function _blkResizeKeyHandler(e) {
            if (!g_block_resize_state.armed && !g_block_resize_state.active) return;
            if (e.key === 'Escape') {
                // cancel
                g_block_resize_state.armed = false;
                g_block_resize_state.active = false;
                g_block_resize_state.blkName = null;
                g_block_resize_state.blkRef = null;
                g_block_resize_state.edge = null;
                g_block_resize_state.hoverEdge = null;
                var el = document.getElementById('blockResizeHint'); if (el) el.remove();
                try { $('#maincanvas').css('cursor', 'auto'); } catch (e) { }
                window.removeEventListener('keydown', _blkResizeKeyHandler);
                render(g_pog_index);
            } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && g_block_resize_state.blkRef) {
                // nudge while active/armed
                var delta = e.key === 'ArrowRight' ? 0.5 : -0.5;
                var blkRef = g_block_resize_state.blkRef;
                var currW = Number(blkRef.BlockDim && blkRef.BlockDim.BlkWidth ? blkRef.BlockDim.BlkWidth : 0);
                var newW = Math.max(0.1, currW + delta);
                blkRef.BlockDim.BlkWidth = newW;
                // update visuals using update-mode
                colorAutofillBlock(null, null, blkRef.mod_index, blkRef.BlkColor || '#FFFFFF', blkRef.BlkName, 'U', blkRef, g_pog_index, 'N').then((ret) => { if (ret) blkRef.BlockDim = Object.assign(blkRef.BlockDim || {}, ret); render(g_pog_index); });
            }
        }
        window.addEventListener('keydown', _blkResizeKeyHandler);
    } catch (err) {
        error_handling(err);
    }
}
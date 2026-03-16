
// This file is used for POG comparison in Page 193

async function comparePOG(p_compare_ind, p_pog_code, p_pog_version, p_draft_id, p_prev_version, p_compare_pog = 'N', p_show_change_blocks = []) { //ASA-1803 Issue 1 added p_compare_pog  //ASA-1986 
    logDebug("function : comparePOG", "S");
    await get_compare_pog(p_compare_ind, p_pog_code, p_pog_version, p_draft_id, p_prev_version, p_compare_pog, p_show_change_blocks);  //ASA-1986 
    logDebug("function : comparePOG", "E");
}

async function get_compare_pog(p_compare_ind, p_pog_code, p_pog_version, p_draft_id, p_prev_version, p_compare_pog = "N", p_show_change_blocks = []) {// ASA-1986 
    //ASA-1803 Issue 1 added p_compare_pog
    logDebug("function : get_compare_pog; compare_ind : " + p_compare_ind + "; pog_code : " + p_pog_code + "; pog_version : " + p_pog_version + "; draft_id : " + p_draft_id + "; prev_version : " + p_prev_version, "S");
    try {
        if (p_prev_version == "Y") {
            $(".item_color_legends").css("display", "none");
        }
        addLoadingIndicator();
        var new_pog_ind,
            pog_opened,
            old_pog_index = g_pog_index;
        if (p_compare_ind == "1") {
            new_pog_ind = "N";
            pog_opened = "E";
        } else {
            new_pog_ind = "Y";
            pog_opened = "N";
        }

        var p = apex.server.process(
            "GET_COMPARE_JSON", {
            x01: p_compare_ind,
            x02: p_pog_code,
            x03: p_pog_version,
            x04: p_draft_id,
        }, {
            dataType: "html",
        });
        // When the process is done, set the value to the page item
        p.done(function (data) {
            var return_data = $.trim(data);
            if (return_data.match(/ERROR.*/)) {
                raise_error(return_data);
                removeLoadingIndicator(regionloadWait);
            } else if (return_data !== "") {
                g_json = JSON.parse($.trim(data));
                var TEMP_POG = JSON.parse(JSON.stringify(g_pog_json));
                g_pog_json_data = g_json;
                var module_details = g_pog_json_data[0].ModuleInfo;
                i = 0;
                for (const modules of module_details) {
                    if (modules.ShelfInfo == null || typeof modules.ShelfInfo == "undefined") {
                        modules.ShelfInfo = [];
                    }

                    if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                        if (modules.SubDept !== null && typeof modules.SubDept !== "undefined") {
                            subdept = modules.SubDept;
                        }

                        j = 0;

                        for (const shelfs of modules.ShelfInfo) {
                            if (typeof shelfs.ItemInfo == "undefined" || shelfs.ItemInfo == null) {
                                shelfs.ItemInfo = [];
                            }
                            j = j + 1;
                        }
                    }

                    i = i + 1;
                }               

                async function doSomething() {
                    g_pog_json_data[0].PreVersion = "";
                    var new_pog_json = g_pog_json_data[0];
                    g_comp_base_code = new_pog_json.POGCode;
                    new_pog_json.PreVersion = "Y";
                    if (p_compare_pog != "Y") {
                        //ASA-1803 Issue 2
                        new_pog_json.POGCode = new_pog_json.POGCode + "-" + "PREV_VERSION";
                    } else {
                        new_pog_json.POGCode = new_pog_json.POGCode;
                    }
                    g_ComBaseIndex = old_pog_index;
                    g_colorBackup = "N";
                    g_comp_view_code = new_pog_json.POGCode;

                    if (g_compare_pog_flag == "Y" && g_compare_view == "PREV_VERSION") {
                        g_pog_json[g_ComViewIndex] = new_pog_json;
                        g_ComViewIndex = g_ComViewIndex;
                        init(g_ComViewIndex);
                        var objects = {};
                        objects["scene"] = g_scene;
                        objects["renderer"] = g_renderer;
                        g_scene_objects[g_ComViewIndex] = objects;
                    } else {
                        g_pog_json.push(new_pog_json);
                        g_ComViewIndex = g_pog_json.length - 1;
                        appendMultiCanvasRowCol(g_pog_json.length, $v("P193_POGCR_TILE_VIEW"));
                        init(g_ComViewIndex);
                        var objects = {};
                        objects["scene"] = g_scene;
                        objects["renderer"] = g_renderer;
                        g_scene_objects.push(objects);
                    }

                    var POG_JSON = JSON.parse(JSON.stringify(g_pog_json));
                    g_json = [g_pog_json[g_ComViewIndex]]; //ASA-1418

                    g_compare_view = p_prev_version == "Y" ? "PREV_VERSION" : "POG";
                    g_compare_pog_flag = "Y";
                    set_indicator_objects(g_ComViewIndex);
                    modifyWindowAfterMinMax(g_scene_objects);
                    g_pog_index = g_ComViewIndex;
                    g_multi_pog_json = [];
                    g_world = g_scene_objects[g_ComViewIndex].scene.children[2];
                    g_camera = g_scene_objects[g_ComViewIndex].scene.children[0];

                    var return_val = await create_module_from_json(POG_JSON, new_pog_ind, "F", $v("P193_PRODUCT_BTN_CLICK"), pog_opened, "N", "N", "Y", "Y", "", "Y", g_scene_objects[g_ComViewIndex].scene.children[0], g_scene_objects[g_ComViewIndex].scene, g_pog_index, g_ComViewIndex);
                    if (p_compare_pog == "Y") {
                        var l_old_pog_edited_ind = g_pog_edited_ind;
                        await clear_item("N", "N", g_ComViewIndex);
                        g_pog_edited_ind = l_old_pog_edited_ind;
                    }
                    removeLoadingIndicator(regionloadWait);
                    render(g_ComViewIndex);
                    if (p_compare_pog == "Y") { // ASA-1986 start
                        await render_compare_pog_blocks(new_pog_json.POGCode, new_pog_json.Version, g_ComViewIndex, p_show_change_blocks);
                        fit_pog_to_canvas_default(g_ComBaseIndex);
                        fit_pog_to_canvas_default(g_ComViewIndex);
                        if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
                            window.requestAnimationFrame(function () {
                                fit_pog_to_canvas_default(g_ComBaseIndex);
                                fit_pog_to_canvas_default(g_ComViewIndex);
                            });
                        }
                        await apply_changes_blk_diff_colors(g_ComBaseIndex, g_ComViewIndex, g_mod_block_list, p_show_change_blocks);
                    }

                    if (p_prev_version == "Y") {
                        if (g_show_item_color == "Y") {
                            var res = await showItemColor("OFF", g_ComViewIndex);
                        }
                        var res1 = await two_pog_diff_checker(g_ComBaseIndex, g_ComViewIndex, p_compare_pog); //ASA-1803 issue 1 Added p_compare_pog
                        var res = await calculateFixelAndSupplyDays("N", g_ComViewIndex);
                    }

                    render(g_pog_index);
                    g_pog_index = old_pog_index;
                    add_pog_code_header();
                }
                doSomething();

                $s("P193_OPEN_DRAFT", "Y");
                g_auto_position_ind = "N";
                g_dblclick_opened = "N";
            }
        });
    } catch (err) {
        error_handling(err);
        removeLoadingIndicator(regionloadWait);
    }
}

async function render_compare_pog_blocks_from_snapshot(p_blocks_snapshot, p_compare_index) {
    var blocksToRender = Array.isArray(p_blocks_snapshot) ? build_changes_blk_snapshot(p_blocks_snapshot) : [];
    if (blocksToRender.length === 0) {
        return;
    }
    g_mod_block_list = [];
    for (const blkDet of blocksToRender) {
        if (typeof blkDet === "undefined" || blkDet == null) {
            continue;
        }
        g_DragMouseStart = {
            x: Number(blkDet.DragMouseStart && typeof blkDet.DragMouseStart.x !== "undefined" ? blkDet.DragMouseStart.x : 0),
            y: Number(blkDet.DragMouseStart && typeof blkDet.DragMouseStart.y !== "undefined" ? blkDet.DragMouseStart.y : 0)
        };
        g_DragMouseEnd = {
            x: Number(blkDet.DragMouseEnd && typeof blkDet.DragMouseEnd.x !== "undefined" ? blkDet.DragMouseEnd.x : 0),
            y: Number(blkDet.DragMouseEnd && typeof blkDet.DragMouseEnd.y !== "undefined" ? blkDet.DragMouseEnd.y : 0)
        };
        if (Array.isArray(blkDet.BlkModInfo) && blkDet.BlkModInfo.length > 0 && Array.isArray(blkDet.BlkShelfInfo) && blkDet.BlkShelfInfo.length > 0) {
            g_autofillModInfo = JSON.parse(JSON.stringify(blkDet.BlkModInfo));
            g_autofillShelfInfo = JSON.parse(JSON.stringify(blkDet.BlkShelfInfo));
        } else {
            [g_autofillModInfo, g_autofillShelfInfo] = getAutofillModShelf(g_DragMouseStart, g_DragMouseEnd, g_pog_json, p_compare_index);
        }
        if (!Array.isArray(g_autofillModInfo) || g_autofillModInfo.length === 0 || !Array.isArray(g_autofillShelfInfo) || g_autofillShelfInfo.length === 0) {
            continue;
        }
        await setAutofillBlock("A", blkDet.BlkName, "N", "N", blkDet.BlkColor || "#FFFFFF");
    }
}

async function render_compare_pog_blocks(p_pog_code, p_pog_version, p_compare_index, p_show_change_blocks = []) {
    var oldPogIndex = g_pog_index;
    var oldModBlockList = g_mod_block_list;
    var oldAutoFillActive = g_auto_fill_active;
    var oldDragMouseStart = g_DragMouseStart;
    var oldDragMouseEnd = g_DragMouseEnd;
    var oldAutofillDetail = g_autofill_detail;
    try {
        g_pog_index = p_compare_index;
        g_auto_fill_active = "Y";
        g_mod_block_list = [];
        g_autofill_detail = {};
        var l_snapshot_blocks = Array.isArray(p_show_change_blocks) ? p_show_change_blocks : [];
        if (l_snapshot_blocks.length > 0) {
            await render_compare_pog_blocks_from_snapshot(l_snapshot_blocks, p_compare_index);
        } else {
            await auto_fill_setup(1);
            if (!g_mod_block_list || g_mod_block_list.length === 0) {
                await createDynamicBlocks(p_pog_code, "N", p_pog_version, "N", $v('P193_EXISTING_DRAFT_VER'));
            } else {
                apex.region("mod_block_details").refresh();
            }
        }
        // Keep Show Changes compare canvas at default fitted view on open.
        fit_pog_to_canvas_default(p_compare_index);

        // Keep Show Changes compare canvas at default fitted view on open.
        var details = get_min_max_xy(p_compare_index);
        var details_arr = details.split("###");
        var compareCamera = g_scene_objects[p_compare_index].scene.children[0];
        set_camera_z(compareCamera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), false, p_compare_index);

        render(p_compare_index);
    } catch (err) {
        error_handling(err);
    } finally {
        g_pog_index = oldPogIndex;
        g_auto_fill_active = oldAutoFillActive;
        g_mod_block_list = oldModBlockList;
        g_autofill_detail = oldAutofillDetail;
        g_DragMouseStart = oldDragMouseStart;
        g_DragMouseEnd = oldDragMouseEnd;
    }
}

function fit_pog_to_canvas_default(p_pog_index) {
    try {
        if (typeof p_pog_index === "undefined" || p_pog_index === null || p_pog_index < 0) {
            return;
        }
        if (!Array.isArray(g_scene_objects) || typeof g_scene_objects[p_pog_index] === "undefined") {
            return;
        }
        var details = get_min_max_xy(p_pog_index);
        var details_arr = details.split("###");
        var fitCamera = g_scene_objects[p_pog_index].scene.children[0];
        set_camera_z(fitCamera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), false, p_pog_index);
        render(p_pog_index);
    } catch (err) {
        error_handling(err);
    }
}

async function modifyWindowAfterMinMax(p_scene_objects) {
    g_scene_objects = [];
    console.log("modify");
    g_canvas_objects = [];
    var old_pogIndex = g_pog_index;
    for (var i = 0; i < p_scene_objects.length; i++) {
        init(i);
        var canvasName = "maincanvas";
        if (i > 0) {
            canvasName = "maincanvas" + (i + 1);
        }
        g_camera = p_scene_objects[i].scene.getObjectByProperty("type", "PerspectiveCamera");
        g_scene = p_scene_objects[i].scene;
        g_pog_index = i;
        console.log("scene", g_scene.uuid);
        var canvasContainerH = $("#" + canvasName).parent()[0].offsetHeight;
        var canvasContainerW = $("#" + canvasName).parent()[0].offsetWidth;
        var canvasBtns = $("#" + canvasName + "-btns")[0];
        var canvasBtns_height;
        if (typeof canvasBtns !== "undefined") {
            canvasBtns_height = canvasBtns.offsetHeight;
        } else {
            canvasBtns_height = 0;
        }
        var canvasWidthOrg = canvasContainerW;
        var canvasHeightOrg = canvasContainerH - canvasBtns_height;
        $("#" + canvasName)
            .css("height", canvasHeightOrg + "px !important")
            .css("width", canvasWidthOrg + "px !important");
        $("#" + canvasName).height(canvasHeightOrg); //ASA-1107
        $("#" + canvasName).width(canvasWidthOrg); //ASA-1107
        g_camera.aspect = canvasWidthOrg / canvasHeightOrg;
        g_camera.fov = (360 / Math.PI) * Math.atan(g_tanFOV);
        g_camera.updateProjectionMatrix();

        var details = get_min_max_xy(i);
        var details_arr = details.split("###");
        set_camera_z(g_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, i);

        objects = {};
        objects["scene"] = g_scene;
        objects["renderer"] = g_renderer;
        console.log("objects", objects);
        g_scene_objects.push(objects);
        set_indicator_objects(i);
        render(i);
    }
    g_pog_index = old_pogIndex;
}

// Utilities functions
function build_changes_blk_snapshot(p_block_list) {
    var snapshot = [];
    if (!Array.isArray(p_block_list)) {
        return snapshot;
    }
    for (const blk of p_block_list) {
        if (typeof blk === "undefined" || blk == null) {
            continue;
        }
        var dragStartX = blk.DragMouseStart && typeof blk.DragMouseStart.x !== "undefined" ? Number(blk.DragMouseStart.x) : 0;
        var dragStartY = blk.DragMouseStart && typeof blk.DragMouseStart.y !== "undefined" ? Number(blk.DragMouseStart.y) : 0;
        var dragEndX = blk.DragMouseEnd && typeof blk.DragMouseEnd.x !== "undefined" ? Number(blk.DragMouseEnd.x) : 0;
        var dragEndY = blk.DragMouseEnd && typeof blk.DragMouseEnd.y !== "undefined" ? Number(blk.DragMouseEnd.y) : 0;
        var blkSnapshot = {};
        blkSnapshot["BlkName"] = blk.BlkName;
        blkSnapshot["BlkColor"] = blk.BlkColor;
        blkSnapshot["BlkRule"] = blk.BlkRule;
        blkSnapshot["DragMouseStart"] = { x: dragStartX, y: dragStartY };
        blkSnapshot["DragMouseEnd"] = { x: dragEndX, y: dragEndY };
        blkSnapshot["BlkModInfo"] = Array.isArray(blk.BlkModInfo) ? JSON.parse(JSON.stringify(blk.BlkModInfo)) : [];
        blkSnapshot["BlkShelfInfo"] = Array.isArray(blk.BlkShelfInfo) ? JSON.parse(JSON.stringify(blk.BlkShelfInfo)) : [];
        blkSnapshot["mod_index"] = Array.isArray(blk.mod_index) ? JSON.parse(JSON.stringify(blk.mod_index)) : [];
        //ASA 1986  compare
          blkSnapshot["BlockFilters"] = Array.isArray(blk.BlockFilters)
            ? JSON.parse(JSON.stringify(blk.BlockFilters))
            : (typeof blk.BlockFilters === "string" && blk.BlockFilters !== "" ? [blk.BlockFilters] : []);
        blkSnapshot["FilterVal"] = Array.isArray(blk.FilterVal) ? JSON.parse(JSON.stringify(blk.FilterVal)) : [];
        var blockDimSnapshot = extract_blk_dim_snapshot(blk);
        if (blockDimSnapshot !== null) {
            blkSnapshot["BlockDim"] = blockDimSnapshot;
        }
        snapshot.push(blkSnapshot);
    }
    return snapshot;
}
//ASA-1986  end
function capture_changes_blk_snapshot(p_block_list, p_force = "N") {
    if (p_force == "Y" || !Array.isArray(g_show_changes_block_snapshot) || g_show_changes_block_snapshot.length === 0) {
        g_show_changes_block_snapshot = build_changes_blk_snapshot(p_block_list);
    }
}

function extract_blk_dim_snapshot(p_block) {
    var blockDim = p_block && p_block.BlockDim ? p_block.BlockDim : null;
    if (!blockDim) {
        return null;
    }
    function toFiniteNum(p_val) {
        var num = Number(p_val);
        return Number.isFinite(num) ? num : null;
    }
    var dimSnapshot = {};
    dimSnapshot["CalcX"] = toFiniteNum(blockDim.CalcX);
    dimSnapshot["CalcY"] = toFiniteNum(blockDim.CalcY);
    dimSnapshot["BlkWidth"] = toFiniteNum(blockDim.BlkWidth);
    dimSnapshot["BlkHeight"] = toFiniteNum(blockDim.BlkHeight);
    dimSnapshot["FinalTop"] = toFiniteNum(blockDim.FinalTop);
    dimSnapshot["FinalBtm"] = toFiniteNum(blockDim.FinalBtm);
    if (
        dimSnapshot["CalcX"] === null &&
        dimSnapshot["CalcY"] === null &&
        dimSnapshot["BlkWidth"] === null &&
        dimSnapshot["BlkHeight"] === null &&
        dimSnapshot["FinalTop"] === null &&
        dimSnapshot["FinalBtm"] === null
    ) {
        return null;
    }
    return dimSnapshot;
}

function roundoff_number(p_value, p_precision = 4) {
    var num = Number(p_value);
    if (!Number.isFinite(num)) {
        return "";
    }
    return Number(num.toFixed(p_precision)).toString();
}

function normalize_hex_color(p_color, p_default = "#FFFFFF") {
    var defaultVal = typeof p_default === "string" && p_default !== "" ? p_default : "#FFFFFF";
    if (typeof p_color === "undefined" || p_color === null) {
        return defaultVal.toUpperCase();
    }
    var normalized = String(p_color).trim();
    if (normalized === "") {
        return defaultVal.toUpperCase();
    }
    normalized = normalized.replace(/^0x/i, "").replace(/^#/i, "");
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
        return defaultVal.toUpperCase();
    }
    return ("#" + normalized).toUpperCase();
}

function normalize_blk_name(p_block_name) {
    if (typeof p_block_name === "undefined" || p_block_name === null) {
        return "";
    }
    return String(p_block_name).trim().toUpperCase();
}

function normalize_string_array(p_arr) {
    if (!Array.isArray(p_arr)) {
        return [];
    }
    var normalized = [];
    for (const val of p_arr) {
        if (typeof val === "undefined" || val === null) {
            continue;
        }
        normalized.push(String(val).trim().toUpperCase());
    }
    normalized.sort();
    return normalized;
}

function normalize_numeric_array(p_arr) {
    if (!Array.isArray(p_arr)) {
        return [];
    }
    var normalized = [];
    for (const val of p_arr) {
        var num = Number(val);
        if (Number.isFinite(num)) {
            normalized.push(num);
        }
    }
    normalized.sort(function (left, right) {
        return left - right;
    });
    return normalized;
}

function get_blk_filter_signature(p_block) {
    if (!p_block || typeof p_block !== "object") {
        return "";
    }
    if (Array.isArray(p_block.FilterVal) && p_block.FilterVal.length > 0) {
        return normalize_string_array(p_block.FilterVal).join("|");
    }
    if (Array.isArray(p_block.BlockFilters) && p_block.BlockFilters.length > 0) {
        return normalize_string_array(p_block.BlockFilters).join("|");
    }
    if (typeof p_block.BlkFilters === "string" && p_block.BlkFilters !== "") {
        return normalize_string_array(p_block.BlkFilters.split("AND")).join("|");
    }
    return "";
}

function get_blk_edit_signature(p_block) {
    var dragStart = p_block && p_block.DragMouseStart ? p_block.DragMouseStart : {};
    var dragEnd = p_block && p_block.DragMouseEnd ? p_block.DragMouseEnd : {};
    var blockDim = p_block && p_block.BlockDim ? p_block.BlockDim : {};

    var signature = {
        BlkName: normalize_blk_name(p_block && p_block.BlkName),
        BlkColor: normalize_hex_color(p_block && p_block.BlkColor, "#FFFFFF"),
        BlkRule: typeof (p_block && p_block.BlkRule) === "undefined" || (p_block && p_block.BlkRule) === null ? "" : String(p_block.BlkRule).trim().toUpperCase(),
        DragStartX: roundoff_number(dragStart.x),
        DragStartY: roundoff_number(dragStart.y),
        DragEndX: roundoff_number(dragEnd.x),
        DragEndY: roundoff_number(dragEnd.y),
        ModIndex: normalize_numeric_array(p_block && p_block.mod_index),
        Filters: get_blk_filter_signature(p_block),
        CalcX: roundoff_number(blockDim.CalcX),
        CalcY: roundoff_number(blockDim.CalcY),
        BlkWidth: roundoff_number(blockDim.BlkWidth),
        BlkHeight: roundoff_number(blockDim.BlkHeight),
        FinalTop: roundoff_number(blockDim.FinalTop),
        FinalBtm: roundoff_number(blockDim.FinalBtm)
    };
    return JSON.stringify(signature);
}

function build_named_blk_map(p_block_list) {
    var namedMap = {};
    if (!Array.isArray(p_block_list)) {
        return namedMap;
    }
    for (const blk of p_block_list) {
        if (!blk) {
            continue;
        }
        var blockName = normalize_blk_name(blk.BlkName);
        if (blockName === "") {
            continue;
        }
        if (typeof namedMap[blockName] === "undefined") {
            namedMap[blockName] = blk;
        }
    }
    return namedMap;
}

function get_changes_block_diffrence(p_working_blocks, p_baseline_blocks) {
    var workingSnapshot = build_changes_blk_snapshot(p_working_blocks);
    var baselineSnapshot = build_changes_blk_snapshot(p_baseline_blocks);
    var workingMap = build_named_blk_map(workingSnapshot);
    var baselineMap = build_named_blk_map(baselineSnapshot);
    var addedBlocks = [];
    var deletedBlocks = [];
    var editedBlocks = [];

    for (var wName in workingMap) {
        if (!Object.prototype.hasOwnProperty.call(workingMap, wName)) {
            continue;
        }
        if (typeof baselineMap[wName] === "undefined") {
            addedBlocks.push(workingMap[wName]);
        } else {
            var workingSig = get_blk_edit_signature(workingMap[wName]);
            var baselineSig = get_blk_edit_signature(baselineMap[wName]);
            if (workingSig !== baselineSig) {
                editedBlocks.push({
                    Name: wName,
                    Working: workingMap[wName],
                    Baseline: baselineMap[wName]
                });
            }
        }
    }

    for (var bName in baselineMap) {
        if (!Object.prototype.hasOwnProperty.call(baselineMap, bName)) {
            continue;
        }
        if (typeof workingMap[bName] === "undefined") {
            deletedBlocks.push(baselineMap[bName]);
        }
    }

    return {
        WorkingSnapshot: workingSnapshot,
        BaselineSnapshot: baselineSnapshot,
        AddedBlocks: addedBlocks,
        DeletedBlocks: deletedBlocks,
        EditedBlocks: editedBlocks
    };
}

function resolve_compare_blk_color(p_color_key) {
    var fallbackColors = {
        ADD: "#d4e3b4",
        RETAIN_CHANGE: "#ffff00",
        REMOVE: "#d06161"
    };
    var fallback = fallbackColors[p_color_key] || "#FFFFFF";
    try {
        if (typeof g_compareColObj !== "undefined" && g_compareColObj !== null && typeof g_compareColObj[p_color_key] !== "undefined") {
            return normalize_hex_color(g_compareColObj[p_color_key], fallback);
        }
    } catch (err) {
        console.warn("resolve_compare_blk_color fallback used:", err);
    }
    return fallback;
}

function has_blk_dim_update(p_block) {
    if (!p_block || !p_block.BlockDim) {
        return false;
    }
    var blockDim = p_block.BlockDim;
    var width = Number(blockDim.BlkWidth);
    var height = Number(blockDim.BlkHeight);
    var calcX = Number(blockDim.CalcX);
    var calcY = Number(blockDim.CalcY);
    var finalTop = Number(blockDim.FinalTop);
    var finalBtm = Number(blockDim.FinalBtm);
    return Number.isFinite(width) && width > 0 &&
        Number.isFinite(height) && height > 0 &&
        Number.isFinite(calcX) &&
        Number.isFinite(calcY) &&
        Number.isFinite(finalTop) &&
        Number.isFinite(finalBtm);
}

function get_blk_module_index_list(p_block) {
    var modIndexList = Array.isArray(p_block && p_block.mod_index) ? p_block.mod_index.slice() : [];
    if (modIndexList.length === 0 && Array.isArray(p_block && p_block.BlkModInfo) && p_block.BlkModInfo.length > 0) {
        var modIdx = Number(p_block.BlkModInfo[0].modIdx);
        if (Number.isFinite(modIdx)) {
            modIndexList.push(modIdx);
        }
    }
    return modIndexList;
}

async function execute_pog_Context(p_pog_index, p_callback) {
    if (typeof p_callback !== "function") {
        return null;
    }
    if (!Array.isArray(g_scene_objects) || typeof g_scene_objects[p_pog_index] === "undefined") {
        return null;
    }
    var oldContext = {
        pogIndex: g_pog_index,
        world: g_world,
        camera: g_camera,
        scene: g_scene,
        canvas: g_canvas,
        renderer: g_renderer
    };
    try {
        g_pog_index = p_pog_index;
        g_scene = g_scene_objects[p_pog_index].scene;
        if (g_scene && Array.isArray(g_scene.children) && g_scene.children.length > 2) {
            g_camera = g_scene.children[0];
            g_world = g_scene.children[2];
        }
        if (g_scene_objects[p_pog_index].renderer) {
            g_renderer = g_scene_objects[p_pog_index].renderer;
        }
        var canvasName = p_pog_index > 0 ? "maincanvas" + (p_pog_index + 1) : "maincanvas";
        var currCanvas = Array.isArray(g_canvas_objects) && g_canvas_objects[p_pog_index]
            ? g_canvas_objects[p_pog_index]
            : document.getElementById(canvasName);
        if (currCanvas) {
            g_canvas = currCanvas;
        }
        return await p_callback();
    } finally {
        g_pog_index = oldContext.pogIndex;
        g_world = oldContext.world;
        g_camera = oldContext.camera;
        g_scene = oldContext.scene;
        g_canvas = oldContext.canvas;
        g_renderer = oldContext.renderer;
    }
}

async function repaint_blk_canvas(p_pog_index, p_block, p_color, p_render_opts = null) {
    if (!p_block) {
        return false;
    }
    var modIndexList = get_blk_module_index_list(p_block);
    if (!Array.isArray(modIndexList) || modIndexList.length === 0) {
        return false;
    }
    var repaintColor = normalize_hex_color(p_color, "#FFFFFF");
    var blockName = p_block.BlkName || "BLOCK_AFP";
    var dragStart = p_block.DragMouseStart || { x: 0, y: 0 };
    var dragEnd = p_block.DragMouseEnd || { x: 0, y: 0 };
    return await execute_pog_Context(p_pog_index, async function () {
        var oldAutofillModInfo = Array.isArray(g_autofillModInfo) ? JSON.parse(JSON.stringify(g_autofillModInfo)) : [];
        var oldAutofillShelfInfo = Array.isArray(g_autofillShelfInfo) ? JSON.parse(JSON.stringify(g_autofillShelfInfo)) : [];
        try {
            var updateMode = "U";
            if (!has_blk_dim_update(p_block)) {
                if (Array.isArray(p_block.BlkModInfo) && p_block.BlkModInfo.length > 0) {
                    updateMode = "Y";
                    g_autofillModInfo = JSON.parse(JSON.stringify(p_block.BlkModInfo));
                    g_autofillShelfInfo = Array.isArray(p_block.BlkShelfInfo) ? JSON.parse(JSON.stringify(p_block.BlkShelfInfo)) : [];
                } else {
                    return false;
                }
            }
            var blockPayload = JSON.parse(JSON.stringify(p_block));
            var retDtl = await colorAutofillBlock(dragStart, dragEnd, modIndexList, repaintColor, blockName, updateMode, blockPayload, p_pog_index, "N", p_render_opts);
            if (retDtl && typeof p_block === "object") {
                p_block.BlockDim = Object.assign({}, p_block.BlockDim || {}, retDtl);
            }
            return !!retDtl;
        } finally {
            g_autofillModInfo = oldAutofillModInfo;
            g_autofillShelfInfo = oldAutofillShelfInfo;
        }
    });
}

async function reset_changes_blk_diff_colors(p_base_index, p_base_blocks) {
    if (!Array.isArray(p_base_blocks) || p_base_index < 0) {
        return false;
    }
    if (!Array.isArray(g_scene_objects) || typeof g_scene_objects[p_base_index] === "undefined") {
        return false;
    }
    for (const blk of p_base_blocks) {
        if (!blk) {
            continue;
        }
        await repaint_blk_canvas(p_base_index, blk, normalize_hex_color(blk.BlkColor, "#FFFFFF"));
    }
    render(p_base_index);
    g_show_changes_block_diff_state.active = "N";
    g_show_changes_block_diff_state.baseIndex = -1;
    g_show_changes_block_diff_state.compareIndex = -1;
    g_show_changes_block_diff_state.diffSummary = { Added: [], Deleted: [], Edited: [] };
    return true;
}

async function apply_changes_blk_diff_colors(p_base_index, p_compare_index, p_working_blocks, p_baseline_blocks) {
    if (
        typeof p_base_index === "undefined" || p_base_index < 0 ||
        typeof p_compare_index === "undefined" || p_compare_index < 0 ||
        !Array.isArray(g_scene_objects) ||
        typeof g_scene_objects[p_base_index] === "undefined" ||
        typeof g_scene_objects[p_compare_index] === "undefined"
    ) {
        return;
    }
    var diffResult = get_changes_block_diffrence(p_working_blocks, p_baseline_blocks);
    await reset_changes_blk_diff_colors(p_base_index, diffResult.WorkingSnapshot);

    var addColor = resolve_compare_blk_color("ADD");
    var editColor = resolve_compare_blk_color("RETAIN_CHANGE");
    var deleteColor = resolve_compare_blk_color("REMOVE");

    var diffOpaqueStyle = { forceOpaque: "Y" };
    for (const blk of diffResult.AddedBlocks) {
        await repaint_blk_canvas(p_base_index, blk, addColor, diffOpaqueStyle);
    }
    for (const blk of diffResult.DeletedBlocks) {
        await repaint_blk_canvas(p_compare_index, blk, deleteColor, diffOpaqueStyle);
    }
    for (const editBlk of diffResult.EditedBlocks) {
        await repaint_blk_canvas(p_compare_index, editBlk.Baseline, editColor, diffOpaqueStyle);
    }

    render(p_base_index);
    render(p_compare_index);

    g_show_changes_block_diff_state.active = "Y";
    g_show_changes_block_diff_state.baseIndex = p_base_index;
    g_show_changes_block_diff_state.compareIndex = p_compare_index;
    g_show_changes_block_diff_state.diffSummary = {
        Added: diffResult.AddedBlocks.map(function (blk) { return normalize_blk_name(blk.BlkName); }),
        Deleted: diffResult.DeletedBlocks.map(function (blk) { return normalize_blk_name(blk.BlkName); }),
        Edited: diffResult.EditedBlocks.map(function (blk) { return normalize_blk_name(blk.Name); })
    };
}

function show_blk_changes_close_hook() {
    if (typeof window !== "undefined" && window.__wpd193ShowChangesCloseHookInstalled === true) {
        return;
    }
    if (typeof closePog !== "function") {
        if (typeof window !== "undefined" && window.__wpd193ShowChangesCloseHookRetry !== true) {
            window.__wpd193ShowChangesCloseHookRetry = true;
            setTimeout(function () {
                window.__wpd193ShowChangesCloseHookRetry = false;
                show_blk_changes_close_hook();
            }, 250);
        }
        return;
    }

    var originalClosePog = closePog;
    closePog = function (p_pog_index, p_type) {
        var closeIndex = parseInt(p_pog_index);
        var shouldWatchShowChangesClose = (
            g_compare_pog_flag == "Y" &&
            g_compare_view == "POG" &&
            closeIndex === g_ComViewIndex &&
            g_ComBaseIndex > -1
        );
        var baseIndex = g_ComBaseIndex;
        var baseBlocksSnapshot = build_changes_blk_snapshot(Array.isArray(g_mod_block_list) ? g_mod_block_list : []);

        var returnVal = originalClosePog.apply(this, arguments);

        if (shouldWatchShowChangesClose) {
            var attempts = 0;
            var closeWatcher = setInterval(function () {
                attempts++;
                var isShowChangesStillOpen = g_compare_pog_flag == "Y" && g_compare_view == "POG" && g_ComViewIndex > -1;
                if (!isShowChangesStillOpen) {
                    reset_changes_blk_diff_colors(baseIndex, baseBlocksSnapshot)
                        .then(function (resetDone) {
                            if (resetDone || attempts >= 80) {
                                clearInterval(closeWatcher);
                            }
                        })
                        .catch(function (resetErr) {
                            console.warn("Show Changes block reset skipped:", resetErr);
                            if (attempts >= 80) {
                                clearInterval(closeWatcher);
                            }
                        });
                } else if (attempts >= 80) {
                    clearInterval(closeWatcher);
                }
            }, 125);
        }
        return returnVal;
    };

    if (typeof window !== "undefined") {
        window.__wpd193ShowChangesCloseHookInstalled = true;
    }
}
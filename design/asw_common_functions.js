// This file is used for common functions is used in page 25 and page 193

var g_page_no = (function () {
    var htmlClass = document.documentElement.className || "";
    var match = htmlClass.match(/page-(\d+)/);
    var page = match ? match[1] : "0";
    return "P" + page + "_";
})();

console.log(g_page_no);

//this function is used under setUpMouseHander in asw_common_main.js. as this function is used only in page 25.
//this function will be called on mouse down. it will find out on which canvas user clicked and assing g_pog_index and all other indicators for the clicked POG canvas.
function set_curr_canvas(p_event) {
    var new_camera = {};
    var new_world;
    if (p_event.target.nodeName == "CANVAS") {
        if (p_event.type !== "mousemove") {
            g_canvas = p_event.target;
            if (p_event.type == "mousedown") {
                g_all_pog_flag = "N";
            }
            g_pog_index = parseInt(g_canvas.getAttribute("data-indx"));
            if (g_pog_index == null) {
                g_pog_index = 0;
            }
        } else {
            var canvas_drag = p_event.target;
        }

        if (g_scene_objects.length > 0) {
            if (typeof g_scene_objects[g_pog_index] !== "undefined") {
                g_scene = g_scene_objects[g_pog_index].scene;
                g_camera = g_scene.children[0];
                g_world = g_scene.children[2];
                g_renderer = g_scene_objects[g_pog_index].renderer;
                if (typeof g_pog_json[g_pog_index] !== "undefined" && g_all_pog_flag == "N") {
                    // $s(g_page_no + "OPEN_POG_CODE", g_pog_json[g_pog_index].POGCode);
                    //$s(g_page_no + "OPEN_POG_VERSION", g_pog_json[g_pog_index].Version);
                    $s(g_page_no + "OPEN_POG_CODE", g_pog_json[g_pog_index].POGCode);
                    $s(g_page_no + "OPEN_POG_VERSION", g_pog_json[g_pog_index].Version);
                }

                if (typeof g_scene_objects[g_pog_index].Indicators !== "undefined") {
                    g_show_fixel_label = g_scene_objects[g_pog_index].Indicators.FixelLabel;
                    g_show_item_label = g_scene_objects[g_pog_index].Indicators.ItemLabel;
                    g_show_notch_label = g_scene_objects[g_pog_index].Indicators.NotchLabel;
                    g_show_max_merch = g_scene_objects[g_pog_index].Indicators.MaxMerch;
                    g_show_item_color = g_scene_objects[g_pog_index].Indicators.ItemColor;
                    g_show_item_desc = g_scene_objects[g_pog_index].Indicators.ItemDesc;
                    g_show_live_image = g_scene_objects[g_pog_index].Indicators.LiveImage;
                    g_show_days_of_supply = g_scene_objects[g_pog_index].Indicators.DaysOfSupply;
                    g_overhung_shelf_active = g_scene_objects[g_pog_index].Indicators.OverhungShelf; //ASA-1138
                    g_itemSubLabelInd = g_scene_objects[g_pog_index].Indicators.ItemSubLabelInd; //ASA-1182
                    g_itemSubLabel = g_scene_objects[g_pog_index].Indicators.ItemSubLabel; //ASA-1182
                }

                if (p_event.type == "mousedown" || p_event.type == "contextmenu" || p_event.type == "dblclick") {
                    var canvas_id = g_canvas.getAttribute("id");
                    $("[data-pog]").removeClass("multiPogList_active");
                    $(".canvas_highlight").removeClass("canvas_highlight");
                    $("#" + canvas_id + "-btns").addClass("canvas_highlight");
                    $("[data-indx=" + g_pog_index + "]").addClass("multiPogList_active");
                    g_all_pog_flag = "N";
                }
            }
        }
    }
}

//this function is used when minimize and maximize or close button when open more than one POG in same page. 
//This will set the opened POG details into global variables.
function set_select_canvas(p_pog_index) {
    if (g_scene_objects.length > 0) {
        if (typeof g_scene_objects[p_pog_index] !== "undefined") {
            g_scene = g_scene_objects[p_pog_index].scene;
            g_camera = g_scene.children[0];
            g_world = g_scene.children[2];
            g_renderer = g_scene_objects[p_pog_index].renderer;
            // $s(g_page_no + "OPEN_POG_CODE", g_pog_json[p_pog_index].POGCode);
            // $s(g_page_no + "OPEN_POG_VERSION", g_pog_json[p_pog_index].Version);
            $s(g_page_no + "OPEN_POG_CODE", g_pog_json[g_pog_index].POGCode);
            $s(g_page_no + "OPEN_POG_VERSION", g_pog_json[g_pog_index].Version);
            if (typeof g_scene_objects[p_pog_index].Indicators !== "undefined") {
                g_show_fixel_label = g_scene_objects[p_pog_index].Indicators.FixelLabel;
                g_show_item_label = g_scene_objects[p_pog_index].Indicators.ItemLabel;
                g_show_notch_label = g_scene_objects[p_pog_index].Indicators.NotchLabel;
                g_show_max_merch = g_scene_objects[p_pog_index].Indicators.MaxMerch;
                g_show_item_color = g_scene_objects[p_pog_index].Indicators.ItemColor;
                g_show_item_desc = g_scene_objects[p_pog_index].Indicators.ItemDesc;
                g_show_live_image = g_scene_objects[p_pog_index].Indicators.LiveImage;
                g_show_days_of_supply = g_scene_objects[p_pog_index].Indicators.DaysOfSupply;
                g_overhung_shelf_active = g_scene_objects[p_pog_index].Indicators.OverhungShelf; //ASA-1138
                g_itemSubLabelInd = g_scene_objects[g_pog_index].Indicators.ItemSubLabelInd; //ASA-1182
                g_itemSubLabel = g_scene_objects[g_pog_index].Indicators.ItemSubLabel; //ASA-1182
            }

            if (typeof g_canvas_objects[p_pog_index] !== "undefined") {
                var canvas_id = g_canvas_objects[p_pog_index].getAttribute("id");
                $("[data-pog]").removeClass("multiPogList_active");
                $(".canvas_highlight").removeClass("canvas_highlight");
                $("#" + canvas_id + "-btns").addClass("canvas_highlight");
                $("[data-indx=" + p_pog_index + "]").addClass("multiPogList_active");
                g_all_pog_flag = "N";
            }
        }
    }
}

async function switchCanvasView(p_view, p_product_list_check = "N") {
    var containerH,
        containerW,
        renderFlag = "Y",
        rowCount,
        old_pogIndex = g_pog_index,
        colCount;
    rowCount = $("[data-row]").length;
    colCount = $("[data-col]").length;
    if ($(".a-Splitter-thumb").attr("title") == "Collapse") {
        p_product_list_check = "Y";
    }
    // [Task_22091], Start
    var drawRegW = $("#drawing_region").width();
    var sidebarW = $("#side_bar").width();
    var holderW = $("#canvas-holder").width();
    containerW = holderW;
    if (!containerW || containerW <= 0) {
        containerW = drawRegW - sidebarW;
    }
    if (!containerW || containerW <= 0) {
        containerW = $("#canvas-holder .container").width();
    }
    containerH = $("#canvas-holder .container").height();
    $s(g_page_no + "POGCR_TILE_VIEW", p_view);
    // [Task_22091], End
    if (p_view == "H" && (($("#canvas-holder .container").hasClass("v-view") && p_product_list_check == "N") || p_product_list_check == "Y")) {
        $("#canvas-holder .container").css("display", "flex").addClass("h-view").removeClass("v-view");
        $(".viewH").addClass("view_active");
        $(".viewV").removeClass("view_active");

        for (var i = 1; i <= rowCount; i++) {
            var currColCOunt = $("[data-row=" + i + "] [data-col]").length;
            $("[data-row=" + i + "] .canvas-content")
                .css("height", parseFloat((containerH / currColCOunt).toFixed(2)))
                .css("width", parseFloat((containerW / rowCount).toFixed(2)));
        }
    } else if (p_view == "V" && (($("#canvas-holder .container").hasClass("h-view") && p_product_list_check == "N") || p_product_list_check == "Y")) {
        $("#canvas-holder .container").css("display", "grid").addClass("v-view").removeClass("h-view");
        $(".viewV").addClass("view_active");
        $(".viewH").removeClass("view_active");

        for (var i = 1; i <= rowCount; i++) {
            var currColCOunt = $("[data-row=" + i + "] [data-col]").length;
            $("[data-row=" + i + "] .canvas-content")
                .css("height", parseFloat((containerH / rowCount).toFixed(2)))
                .css("width", parseFloat((containerW / currColCOunt).toFixed(2)));
        }
    } else {
        renderFlag = "N";
    }
    if (renderFlag == "Y") {
        if (g_pog_json.length > 0) {
            //20240708 Regression issue 5
            g_canvas_objects = [];
            for (var i = 1; i <= g_pog_json.length; i++) {
                const pRenderer = g_renderer; //g_scene_objects[i - 1].renderer;
                const pScene = g_scene_objects[i - 1].scene;
                const pCamera = g_scene_objects[i - 1].scene.children.find((obj) => {
                    return obj.type === "PerspectiveCamera";
                });
                var canvasName = "maincanvas" + (i == 1 ? "" : i);
                g_canvas = document.getElementById(canvasName);
                var canvasContainerH = $("#" + canvasName)
                    .parent()
                    .height();
                var canvasContainerW = $("#" + canvasName)
                    .parent()
                    .width();
                var canvasBtns = $("#" + canvasName + "-btns")[0];
                var canvasBtns_height = g_scene_objects.length > 1 ? canvasBtns.offsetHeight : 0;
                var canvasWidthOrg = canvasContainerW;
                var canvasHeightOrg = canvasContainerH - canvasBtns_height;

                $("#" + canvasName)
                    .css("height", canvasHeightOrg + "px !important")
                    .css("width", canvasWidthOrg + "px !important");
                $("#" + canvasName).height(canvasHeightOrg); //ASA-1107
                $("#" + canvasName).width(canvasWidthOrg); //ASA-1107

                g_canvas.width = canvasWidthOrg;
                g_canvas.height = canvasHeightOrg;
                g_canvas_objects.push($("#" + canvasName)[0]);

                var pTanFOV = Math.tan(((Math.PI / 180) * pCamera.fov) / 2);
                pCamera.aspect = canvasWidthOrg / canvasHeightOrg;
                pCamera.fov = (360 / Math.PI) * Math.atan(pTanFOV);
                pCamera.updateProjectionMatrix();
                pRenderer.setSize(canvasWidthOrg, canvasHeightOrg);
                var details = get_min_max_xy(i - 1);
                var details_arr = details.split("###");
                set_camera_z(pCamera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, i - 1);
                //pRenderer.render(pScene, pCamera);
                g_pog_index = i - 1;
                g_scene = pScene;
                g_camera = pCamera;
                render(i - 1);
            }
        } //20240708 Regression issue 5
    }
    g_pog_index = old_pogIndex;
}

function generateCanvasListHolder(p_pog_json) {
    $("#canvas-list-holder").html("");
    if (p_pog_json.length > 0) {
        $("#canvas-list-holder").css({
            display: "flex",
            width: "auto",
        });
        $("#canvas-list-holder").append('<div class="canvas-holder-div"><span class="canvas-holder-code expand-tab" onclick="expandAllPog()">' + g_expand_all_pog + "</span></div>");

        for (i = 0; i < p_pog_json.length; i++) {
            console.log("generage", i);
            $("#canvas-list-holder").append('<div class="canvas-holder-div"><span class="canvas-holder-code">' + p_pog_json[i].POGCode + '</span><span class="fa fa-window-arrow-up canvas-expand" onClick=expandPog(' + i + ')></span><span class="fa fa-window-maximize canvas-max" onclick="maximizePog(' + i + ', 0)"></span><span class="fa fa-close canvas-close" onclick="closePog(' + i + ', 0)"></span></div>');
        }
        if ($("#canvas-list-holder").width() >= window.innerWidth) {
            $("#canvas-list-holder").css("width", "100%");
        }
    } else {
        $("#canvas-list-holder").css({
            display: "none",
            width: "auto",
        });
    }
}

//This function is assigned to event mousewheel.  this is majorly used to zoom in and out when ctrl key is pressed and do mouse scroll.
function onDocumentMouseWheel(p_event) {
    logDebug("function : onDocumentMouseWheel", "S");
    var jselector = g_canvas.getAttribute("id");
    console.log("jselector", jselector, p_event.target.nodeName, p_event.ctrlKey);
    if (p_event.target.nodeName == "CANVAS") {
        if (p_event.ctrlKey) {
            g_duplicating = "N";
            p_event.preventDefault();
            p_event.stopPropagation();
            g_manual_zoom_ind = "Y";
            var r = g_canvas.getBoundingClientRect();
            var x = p_event.clientX - r.left;
            var y = p_event.clientY - r.top;
            // var factor = parseFloat($v(g_page_no + "POGCR_CAMERA_ZOOM_FACTOR"));
            var factor = parseFloat($v(g_page_no + "POGCR_CAMERA_ZOOM_FACTOR"));
            var width = g_canvas.width / window.devicePixelRatio;
            var height = g_canvas.height / window.devicePixelRatio;
            var mX = (2 * x) / width - 1;
            var mY = 1 - (2 * y) / height;
            var vector = new THREE.Vector3(mX, mY, p_event.deltaY / 500);
            vector.unproject(g_camera);
            vector.sub(g_camera.position);
            if (p_event.deltaY < 0) {
                $(jselector).css("cursor", "zoom-in");
                g_camera.position.addVectors(g_camera.position, vector.setLength(factor));
            } else {
                $(jselector).css("cursor", "zoom-out");
                g_camera.position.subVectors(g_camera.position, vector.setLength(factor));
            }
            render(g_pog_index);
        } else {
            if (g_manual_zoom_ind == "Y") {
                // var scroll_interval = parseFloat($v(g_page_no + "POGCR_WHEEL_UP_DOWN_INTER"));
                var scroll_interval = parseFloat($v(g_page_no + "POGCR_WHEEL_UP_DOWN_INTER"));

                if (p_event.deltaY < 0) {
                    //up
                    g_camera.position.set(g_camera.position.x, g_camera.position.y + scroll_interval, g_camera.position.z);
                } else if (p_event.deltaY > 0) {
                    //down
                    g_camera.position.set(g_camera.position.x, g_camera.position.y - scroll_interval, g_camera.position.z);
                }
                render(g_pog_index);
            }
        }
    }
    logDebug("function : onDocumentMouseWheel", "E");
}

//This function will fire on event onwindowresize. this will check if the devicepixelratio is changed from previous. will try to recreated the 
//POG according to new screen ratio.
async function onWindowResize(p_event) {
    logDebug("function : onWindowResize", "S");
    try {
        var header = document.getElementById("t_Header");
        var breadcrumb = document.getElementById("t_Body_title");
        var top_bar = document.getElementById("top_bar");
        var side_nav = document.getElementById("t_Body_nav");
        var button_cont = document.getElementById("wpdSplitter_splitter_first");
        var wtbar = document.querySelector(".wtbar");
        var devicePixelRatio = window.devicePixelRatio;

        var header_height = header.offsetHeight * devicePixelRatio;
        var breadcrumb_height = breadcrumb.offsetHeight * devicePixelRatio;
        var top_bar_height = top_bar.offsetHeight * devicePixelRatio;
        var side_nav_width = side_nav.offsetWidth * devicePixelRatio;
        var btn_cont_width = button_cont.offsetWidth * devicePixelRatio;
        var wtbar_height = wtbar.offsetHeight * devicePixelRatio;
        var padding = parseFloat($(".t-Body-contentInner").css("padding-left").replace("px", ""));
        if (devicePixelRatio > 2.5) {
            g_windowHeight = window.innerHeight - (header_height + breadcrumb_height + top_bar_height / 2);
            windowWidth = window.innerWidth - (side_nav_width + btn_cont_width + padding);
        } else {
            g_windowHeight = window.innerHeight - (header_height + breadcrumb_height + top_bar_height + top_bar_height + 10);
            windowWidth = window.innerWidth - (side_nav_width + btn_cont_width + padding + 10);
        }
        g_tanFOV = Math.tan(((Math.PI / 180) * g_camera.fov) / 2);
        var devicePixelRatio = window.devicePixelRatio;
        console.log(" resizing ", g_start_pixel_ratio, devicePixelRatio);

        //g_start_pixel_ratio will hold the devicepixelration when the POG was opened and also set this after ratio change.
        if (g_start_pixel_ratio !== devicePixelRatio) {
            var TEMP_POG = JSON.parse(JSON.stringify(g_pog_json));
            g_pog_json = [];
            //reset all the canvas with new ratio.
            appendMultiCanvasRowCol(TEMP_POG.length, $v(g_page_no + "POGCR_TILE_VIEW"));

            g_pog_index = 0;
            g_multi_pog_json = [];
            g_scene_objects = [];
            g_canvas_objects = [];
            addLoadingIndicator();
            //loop through all the POG and recreate them in resized canvas.
            for (var p = 0; p <= TEMP_POG.length - 1; p++) {
                g_pog_index = p;
                init(p);
                objects = {};
                objects["scene"] = g_scene;
                objects["renderer"] = g_renderer;
                g_scene_objects.push(objects);
                var return_val = await create_module_from_json(TEMP_POG, sessionStorage.getItem("new_pog_ind"), "F", $v(g_page_no + "PRODUCT_BTN_CLICK"), sessionStorage.getItem("pog_opened"), "N", "N", "Y", "Y", "", "N", g_scene_objects[p].scene.children[0], g_scene_objects[p].scene, g_pog_index, p);
                g_pog_index = p;
                render(p);
                animate_pog(p);
            }
            removeLoadingIndicator(regionloadWait);
            g_pog_json = g_multi_pog_json;
        }
        g_renderer.render(g_scene, g_camera);
        logDebug("function : onWindowResize", "E");
    } catch (err) {
        error_handling(err);
    }
}

function set_indicator_objects(p_pog_index) {
    var ind_objects = {};
    ind_objects["FixelLabel"] = g_show_fixel_label;
    ind_objects["ItemLabel"] = g_show_item_label;
    ind_objects["NotchLabel"] = g_show_notch_label;
    ind_objects["MaxMerch"] = g_show_max_merch;
    ind_objects["ItemColor"] = g_show_item_color;
    ind_objects["ItemDesc"] = g_show_item_desc;
    ind_objects["LiveImage"] = g_show_live_image;
    ind_objects["DaysOfSupply"] = g_show_days_of_supply;
    ind_objects["OverhungShelf"] = g_overhung_shelf_active; //ASA-1138
    ind_objects["ItemSubLabelInd"] = g_itemSubLabelInd; //ASA-1182
    ind_objects["ItemSubLabel"] = g_itemSubLabel; //ASA-1182
    g_scene_objects[p_pog_index].Indicators = ind_objects;
}

function add_pog_code_header() {
    $("#canvas-holder #block_title").remove();
    for (var i = 0; i < g_scene_objects.length; i++) {
        var canvas_id = g_canvas_objects[i].getAttribute("id");
        $("#" + canvas_id + "-btns").append('<span id="block_title" style="float:left">'+  (i == 1 
        ? g_pog_json[i].POGCode + "_" + g_pog_json[i].Version + "_Previous"
        : g_pog_json[i].POGCode + "_" + g_pog_json[i].Version
    ) +"</span>");
    }
}

//this function is used in the mousedown function. this is crucial function to find out the object that is hit on the mouse pointer
//and setting all basic global variables of which is that object. module or shelf or item etc looping through g_pog_json.
function get_object_identity(p_pog_index, p_multiSelect, p_multiCopydone, p_a, p_y) {
    logDebug("function : get_object_identity", "S");
    try {
        //checking which object has been clicked for drag or delete.
        var i = 0;
        for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
            if (g_carpark_edit_flag == "Y") {
                break; //return false;
            }
            if (modules.ParentModule == null && typeof modules.Carpark !== "undefined" && modules.Carpark.length > 0) {
                if (modules.Carpark[0].ItemInfo.length > 0) {
                    var j = 0;
                    for (const carparks of modules.Carpark) {
                        if (carparks.SObjID == g_objectHit_id) {
                            g_module_index = i;
                            g_shelf_index = j;
                            g_carpark_edit_flag = "Y";
                            break; //return false;
                        } else {
                            g_carpark_edit_flag = "N";
                        }
                        j++;
                    }
                }
            }
            i++;
        }
        if (g_carpark_edit_flag == "N") {
            var i = 0;
            for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
                if (g_taskItemInContext || g_compare_view == "POG" || g_compare_view == "EDIT_PALLET") {
                    //ASA-1085
                    if (modules.MObjID == g_objectHit_id && modules.ParentModule == null) {
                        g_module_index = i;
                        g_module_cnt = i;
                        g_module_width = modules.W;
                        g_module_X = modules.X;
                        g_module_edit_flag = "Y";
                        comp_obj_id = modules.CompMObjID;
                        g_wireframe_id = modules.WFrameID;
                        // apex.item(g_page_no + "MODULE_DISP").setValue(modules.Module);
                        apex.item(g_page_no + "MODULE_DISP").setValue(modules.Module);
                        break; //return false;
                    } else {
                        g_module_edit_flag = "N";
                    }
                } else {
                    if (modules.CompMObjID == g_objectHit_id && modules.ParentModule == null) {
                        g_module_index = i;
                        g_module_cnt = i;
                        g_module_width = modules.W;
                        g_module_X = modules.X;
                        g_module_edit_flag = "Y";
                        comp_obj_id = modules.MObjID;
                        g_wireframe_id = modules.WFrameID;
                        // apex.item(g_page_no + "MODULE_DISP").setValue(modules.Module);
                        apex.item(g_page_no + "MODULE_DISP").setValue(modules.Module);
                        break; //return false;
                    } else {
                        g_module_edit_flag = "N";
                    }
                }
                i++;
            }
        }

        if (g_module_edit_flag == "N" && g_carpark_edit_flag == "N") {
            var j = 0;
            for (const Modules of g_pog_json[p_pog_index].ModuleInfo) {
                if (g_shelf_edit_flag == "Y") {
                    break; //return false;
                }
                if (Modules.ParentModule == null) {
                    $.each(Modules.ShelfInfo, function (i, Shelf) {
                        if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER") {
                            if (g_taskItemInContext || g_compare_view == "POG" || g_compare_view == "EDIT_PALLET") {
                                //ASA-1085
                                if (Shelf.SObjID == g_objectHit_id) {
                                    g_module_index = j;
                                    g_shelf_index = i;
                                    g_shelf_max_merch = Shelf.MaxMerch;
                                    g_shelf_basket_spread = Shelf.BsktSpreadProduct;
                                    g_shelf_edit_flag = "Y";
                                    g_wireframe_id = Shelf.WFrameID;
                                    g_shelf_object_type = Shelf.ObjType;
                                    comp_obj_id = Shelf.CompShelfObjID;
                                    g_rotation = Shelf.Rotation;
                                    if (Shelf.Slope > 0) {
                                        g_slope = 0 - Shelf.Slope;
                                    } else if (Shelf.Slope < 0) {
                                        g_slope = -Shelf.Slope;
                                    } else {
                                        g_slope = 0;
                                    }
                                    return false;
                                } else {
                                    g_shelf_edit_flag = "N";
                                }
                            } else {
                                if (Shelf.CompShelfObjID == g_objectHit_id) {
                                    g_module_index = j;
                                    g_shelf_index = i;
                                    g_shelf_max_merch = Shelf.MaxMerch;
                                    g_shelf_edit_flag = "Y";
                                    g_wireframe_id = Shelf.WFrameID;
                                    g_shelf_object_type = Shelf.ObjType;
                                    g_shelf_basket_spread = Shelf.BsktSpreadProduct;
                                    g_rotation = Shelf.Rotation;
                                    comp_obj_id = Shelf.SObjID;
                                    if (Shelf.Slope > 0) {
                                        g_slope = 0 - Shelf.Slope;
                                    } else if (Shelf.Slope < 0) {
                                        g_slope = -Shelf.Slope;
                                    } else {
                                        g_slope = 0;
                                    }
                                    return false;
                                } else {
                                    g_shelf_edit_flag = "N";
                                }
                            }
                        }
                    });
                }
                j++;
            }
        }
        if (g_shelf_edit_flag == "N" && g_module_edit_flag == "N" && g_carpark_edit_flag == "N") {
            var k = 0;
            for (const Modules of g_pog_json[p_pog_index].ModuleInfo) {
                if (g_item_edit_flag == "Y") {
                    break; //return false;
                }
                if (Modules.ParentModule == null) {
                    if (typeof Modules.Carpark !== "undefined" && typeof Modules.Carpark[0] !== "undefined" && Modules.Carpark.length > 0) {
                        if (Modules.Carpark[0].ItemInfo.length > 0) {
                            var j = 0;
                            for (const items of Modules.Carpark[0].ItemInfo) {
                                if (g_taskItemInContext || g_compare_view == "POG" || g_compare_view == "EDIT_PALLET") {
                                    //ASA-1085
                                    if (items.ObjID == g_objectHit_id) {
                                        g_module_index = k;
                                        g_shelf_index = 0;
                                        g_item_index = j;
                                        g_item_edit_flag = "Y";
                                        g_shelf_object_type = Modules.Carpark[0].ObjType;
                                        g_wireframe_id = items.WFrameID;
                                        comp_obj_id = items.CompItemObjID;
                                        g_carpark_item_flag = "Y";
                                        break; //return false;
                                    } else {
                                        g_item_edit_flag = "N";
                                    }
                                } else {
                                    if (items.ObjID == g_objectHit_id) {
                                        g_module_index = k;
                                        g_shelf_index = 0;
                                        g_item_index = j;
                                        g_item_edit_flag = "Y";
                                        g_shelf_object_type = Modules.Carpark[0].ObjType;
                                        g_wireframe_id = items.WFrameID;
                                        comp_obj_id = items.ObjID;
                                        g_carpark_item_flag = "Y";
                                        break; //return false;
                                    } else {
                                        g_item_edit_flag = "N";
                                    }
                                }
                                j++;
                            }
                        }
                    }
                    var i = 0;
                    for (const Shelf of Modules.ShelfInfo) {
                        if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                            if (g_item_edit_flag == "Y") {
                                break; //return false;
                            }
                            var j = 0;
                            for (const items of Shelf.ItemInfo) {
                                if (g_taskItemInContext || g_compare_view == "POG" || g_compare_view == "EDIT_PALLET" || g_compare_view == "PREV_VERSION") {
                                    //ASA-1085
                                    if (items.ObjID == g_objectHit_id) {
                                        g_module_index = k;
                                        g_shelf_index = i;
                                        g_item_index = j;
                                        g_item_edit_flag = "Y";
                                        g_shelf_object_type = Shelf.ObjType;
                                        g_wireframe_id = items.WFrameID;
                                        comp_obj_id = items.CompItemObjID;
                                        break; //return false;
                                    } else {
                                        g_item_edit_flag = "N";
                                    }
                                } else {
                                    if (items.CompItemObjID == g_objectHit_id) {
                                        g_module_index = k;
                                        g_shelf_index = i;
                                        g_item_index = j;
                                        g_item_edit_flag = "Y";
                                        comp_obj_id = items.ObjID;
                                        g_shelf_object_type = Shelf.ObjType;
                                        g_wireframe_id = items.WFrameID;
                                        break; //return false;
                                    } else {
                                        g_item_edit_flag = "N";
                                    }
                                }
                                j++;
                            }
                        }
                        i++;
                    }
                }
                k++;
            }
        }
        //Note: we always populate g_delete_details with even single click to maintain the common behaviour.
        if (p_multiSelect == "N" && p_multiCopydone == "N") {
            // Task 21828
            g_delete_details = [];
            var Module = g_pog_json[p_pog_index].ModuleInfo[g_module_index];
            if (g_shelf_index !== -1 && g_item_index == -1 && g_carpark_item_flag == "N") {
                var Shelf = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
                var details = {};
                details["ObjID"] = Shelf.SObjID;
                details["MIndex"] = g_module_index;
                details["SIndex"] = g_shelf_index;
                details["ObjWidth"] = Shelf.W;
                details["ObjHeight"] = Shelf.H;
                details["XAxis"] = Shelf.X;
                details["YAxis"] = Shelf.Y;
                details["ZAxis"] = Shelf.Z;
                details["IIndex"] = -1;
                details["ObjType"] = Shelf.ObjType;
                details["IsDivider"] = "N";
                details["Object"] = "SHELF";
                details["MObjID"] = Module.MObjID;
                details["SObjID"] = Shelf.SObjID;
                details["ItemID"] = Shelf.Shelf; //ASA-1471 issue 1
                details["Item"] = "";
                details["Exists"] = "N";
                details["Rotation"] = Shelf.Rotation;
                details["Slope"] = Shelf.Slope;
                details["Distance"] = 0;
                details["TopObjID"] = "";
                details["BottomObjID"] = "";
                details["StartCanvas"] = g_start_canvas;
                details["g_present_canvas"] = g_present_canvas;
                details["p_pog_index"] = p_pog_index;
                //ASA-1471 issue 1 S
                details["W"] = Shelf.W;
                details["H"] = Shelf.H;
                details["D"] = Shelf.D;
                details["AllowAutoCrush"] = Shelf.AllowAutoCrush;
                details["Rotation"] = Shelf.Rotation;
                details["Slope"] = Shelf.Slope;
                details["Color"] = Shelf.Color;
                details["Combine"] = Shelf.Combine;
                details["LOverhang"] = Shelf.LOverhang;
                details["ROverhang"] = Shelf.ROverhang;
                details["DivHeight"] = typeof Shelf.DivHeight == "undefined" ? 0 : Shelf.DivHeight;
                details["DivWidth"] = typeof Shelf.DivWidth == "undefined" ? 0 : Shelf.DivWidth;
                details["DivPst"] = typeof Shelf.DivPst == "undefined" ? "N" : Shelf.DivPst;
                details["DivPed"] = typeof Shelf.DivPed == "undefined" ? "N" : Shelf.DivPed;
                details["DivPbtwFace"] = typeof Shelf.DivPbtwFace == "undefined" ? "N" : Shelf.DivPbtwFace;
                details["NoDivIDShow"] = Shelf.NoDivIDShow;
                details["DivFillCol"] = typeof Shelf.DivFillCol == "undefined" ? "#3D393D" : Shelf.DivFillCol;
                details["SpreadItem"] = Shelf.SpreadItem;
                details["MaxMerch"] = Shelf.MaxMerch;
                //ASA-1471 issue 1 E
                //ASA-1669 Start
                details["FBold"] = Shelf.FBold;
                details["FSize"] = Shelf.FSize;
                details["FStyle"] = Shelf.FStyle;
                details["InputText"] = Shelf.InputText;
                details["TextImg"] = Shelf.TextImg;
                details["TextImgMime"] = Shelf.TextImgMime;
                details["TextImgName"] = Shelf.TextImgName;
                details["ReduceToFit"] = Shelf.ReduceToFit;
                details["TextDirection"] = Shelf.TextDirection;
                details["WrapText"] = Shelf.WrapText;
                //ASA-1669 End
                g_delete_details.multi_delete_shelf_ind = "";
                g_delete_details.push(details);
            } else if (g_shelf_index !== -1 && g_item_index !== -1 && g_carpark_item_flag == "N") {
                var Shelf = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
                var Item = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index];
                var details = {};
                var is_divider = "N";
                var object = "ITEM";
                if (Item.Item == "DIVIDER") {
                    is_divider = "Y";
                    object = "SHELF";
                }
                details["ObjID"] = Item.ObjID;
                details["MIndex"] = g_module_index;
                details["SIndex"] = g_shelf_index;
                details["ObjWidth"] = Item.W;
                details["ObjHeight"] = Item.H;
                details["XAxis"] = Item.X;
                details["YAxis"] = Item.Y;
                details["ZAxis"] = Item.Z;
                details["IIndex"] = g_item_index;
                details["ObjType"] = Shelf.ObjType;
                details["IsDivider"] = is_divider;
                details["Object"] = object;
                details["MObjID"] = Module.MObjID;
                details["SObjID"] = Shelf.SObjID;
                details["ItemID"] = Item.ItemID;
                details["Item"] = Item.Item;
                details["W"] = Item.W;
                details["H"] = Item.H;
                details["X"] = Item.X;
                details["Y"] = Item.Y;
                details["Exists"] = "N";
                details["Rotation"] = 0;
                details["Slope"] = 0;
                details["Distance"] = Item.Distance;
                details["TopObjID"] = Item.TopObjID;
                details["BottomObjID"] = Item.BottomObjID;
                details["StartCanvas"] = g_start_canvas;
                details["g_present_canvas"] = g_present_canvas;
                details["p_pog_index"] = p_pog_index;
                details["Color"] = Item.Color; //20240806
                //ASA-1471 issue 13 S
                if (Item.Item == "DIVIDER") {
                    details["DivHeight"] = typeof Item.DivHeight == "undefined" ? 0 : Item.DivHeight;
                    details["DivWidth"] = typeof Item.DivWidth == "undefined" ? 0 : Item.DivWidth;
                    details["DivPst"] = typeof Item.DivPst == "undefined" ? "N" : Item.DivPst;
                    details["DivPed"] = typeof Item.DivPed == "undefined" ? "N" : Item.DivPed;
                    details["DivPbtwFace"] = typeof Item.DivPbtwFace == "undefined" ? "N" : Item.DivPbtwFace;
                    details["NoDivIDShow"] = Item.NoDivIDShow;
                    details["DivFillCol"] = typeof Item.DivFillCol == "undefined" ? "#3D393D" : Item.DivFillCol;
                    details["LOverhang"] = 0;
                    details["ROverhang"] = 0;
                    details["MaxMerch"] = 0;
                }
                details["D"] = Item.D;
                //ASA-1471 issue 13 E
                g_delete_details.multi_delete_shelf_ind = "";
                g_delete_details.push(details);
            } else if (g_shelf_index !== -1 && g_item_index !== -1 && g_carpark_item_flag == "Y") {
                var Carpark = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark;
                var Item = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[g_item_index];
                var details = {};
                details["ObjID"] = Item.ObjID;
                details["MIndex"] = g_module_index;
                details["SIndex"] = 0;
                details["ObjWidth"] = Item.W;
                details["ObjHeight"] = Item.H;
                details["XAxis"] = Item.X;
                details["YAxis"] = Item.Y;
                details["ZAxis"] = Item.Z;
                details["IIndex"] = g_item_index;
                details["ObjType"] = Carpark.ObjType;
                details["IsDivider"] = "N";
                details["Object"] = "CARPARK_ITEM";
                details["MObjID"] = Module.MObjID;
                details["SObjID"] = Carpark.SObjID;
                details["ItemID"] = Item.ItemID;
                details["Item"] = Item.Item;
                details["W"] = Item.W;
                details["H"] = Item.H;
                details["X"] = Item.X;
                details["Y"] = Item.Y;
                details["Exists"] = "N";
                details["Rotation"] = 0;
                details["Slope"] = 0;
                details["Distance"] = Item.Distance;
                details["TopObjID"] = Item.TopObjID;
                details["BottomObjID"] = Item.BottomObjID;
                details["IsCarpark"] = "Y";
                details["StartCanvas"] = g_start_canvas;
                details["g_present_canvas"] = g_present_canvas;
                details["p_pog_index"] = p_pog_index;
                details["Color"] = Item.Color; //20240806
                g_delete_details.multi_delete_shelf_ind = "";
                g_delete_details.multi_carpark_ind = "Y";
                g_delete_details.push(details);
            }
            g_delete_details.StartCanvas = g_start_canvas;
            g_delete_details.g_present_canvas = g_present_canvas;
            update_item_xy_distance("N", p_pog_index, p_a, p_y);
        }

        logDebug("function : get_object_identity", "E");
    } catch (err) {
        error_handling(err);
    }
}

function clear_blinking() {
    if (g_intersected) {
        for (var i = 0; i < g_intersected.length; i++) {
            g_select_color = g_intersected[i].BorderColour;
            g_intersected[i].WireframeObj.material.color.setHex(g_intersected[i].BorderColour);
            if (g_intersected[i].ImageExists == "Y" && g_show_live_image == "Y") {
                g_intersected[i].WireframeObj.material.transparent = true;
                g_intersected[i].WireframeObj.material.opacity = 0.0025;
            }
        }
        clearInterval(g_myVar);
        g_select_color = 0x000000;
        render(g_pog_index);
        g_intersected = [];
        g_select_zoom_arr = [];
    }
}

function clearUndoRedoInfo() {
    try {
        logDebug("function : clearUndoRedoInfo", "S");
        g_undo_final_obj_arr = [];
        g_redo_final_obj_arr = [];
        g_undo_all_obj_arr = [];
        g_redo_all_obj_arr = [];
        g_undo_details = [];
        g_delete_details = [];
        g_multi_drag_shelf_arr = [];
        g_multi_drag_item_arr = [];
        g_cut_support_obj_arr = [];
        g_cut_loc_arr = [];
        g_cut_copy_arr = [];
        g_undoRedoAction = "REDO";
        logDebug("function : clearUndoRedoInfo", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function create_shelf_edit_pog(p_mod_index, p_json_array, p_module_width, p_draft_ind, p_new_pog_ind, p_pog_type, p_carpark_ind, p_recreate, p_create_json, p_pog_index) {
    logDebug("function : create_shelf_edit_pog; mod_index : " + p_mod_index + "; p_module_width : " + p_module_width + "; draft_ind : " + p_draft_ind + "; new_pog_ind : " + p_new_pog_ind + "; pog_type : " + p_pog_type + "; carpark_ind : " + p_carpark_ind + "; recreate : " + p_recreate, "S");
    try {
        var newObjectID = create_shelf_edit_pog_lib(p_mod_index, p_json_array, p_module_width, p_draft_ind, p_new_pog_ind, p_pog_type, p_carpark_ind, p_recreate, p_create_json, $v(g_page_no + "POGCR_DFT_SPREAD_PRODUCT"), $v(g_page_no + "POG_SHELF_DEFAULT_COLOR"), $v(g_page_no + "DIV_COLOR"), $v(g_page_no + "SLOT_DIVIDER"), $v(g_page_no + "SLOT_ORIENTATION"), $v(g_page_no + "DIVIDER_FIXED"), $v(g_page_no + "POG_ITEM_DEFAULT_COLOR"), $v(g_page_no + "POGCR_DELIST_ITEM_DFT_COL"), $v(g_page_no + "POG_CP_SHELF_DFLT_COLOR"), 3, $v(g_page_no + "MERCH_STYLE"), $v(g_page_no + "POGCR_LOAD_IMG_FROM"), $v(g_page_no + "BU_ID"), $v(g_page_no + "POGCR_DELIST_ITEM_DFT_COL"), $v(g_page_no + "POGCR_ITEM_NUM_LBL_COLOR"), $v(g_page_no + "POGCR_DISPLAY_ITEM_INFO"), $v(g_page_no + "POGCR_ITEM_NUM_LBL_COLOR"), $v(g_page_no + "POGCR_ITEM_NUM_LABEL_POS"), $v(g_page_no + "NOTCH_HEAD"), "Y", g_camera, p_pog_index, p_pog_index, $v('P193_POGCR_MANUAL_CRUSH_ITEM')); //ASA-1300

        return newObjectID;
    } catch (err) {
        error_handling(err);
    }
}

function add_pog_base(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_edit_ind, p_pog_index) {
    logDebug("function : add_pog_base; uuid : " + p_uuid + "; width : " + p_width + "; height : " + p_height + "; depth : " + p_depth + "; color : " + p_color + "; x : " + p_x + "; y : " + p_y + "; p_edit_ind : " + p_edit_ind, "S");
    try {
        if (p_edit_ind == "Y") {
            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].BaseObjID);
            g_scene_objects[p_pog_index].scene.children[2].remove(selectedObject);
        }

        g_pog_base = new THREE.Mesh(
            new THREE.BoxGeometry(p_width, p_height, 0.001),
            new THREE.MeshStandardMaterial({
                color: p_color,
            }));
        var l_wireframe_id = add_wireframe(g_pog_base, 2);
        g_pog_base.position.x = p_x;
        g_pog_base.position.y = p_y;
        g_pog_base.position.z = 0;
        g_pog_base.uuid = p_uuid;
        g_scene_objects[p_pog_index].scene.children[2].add(g_pog_base);
        g_pog_json[p_pog_index].BaseObjID = g_pog_base.id;
        g_pog_json[p_pog_index].BaseX = p_x;
        g_pog_json[p_pog_index].BaseY = p_y;
        g_pog_json[p_pog_index].BaseZ = 0;
        g_pog_json[p_pog_index].WFrameID = l_wireframe_id;
        logDebug("function : add_pog_base", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function add_module(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_edit_ind, p_pog_flag, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, p_recreate, p_camera, p_module_ind) {
    try {
        logDebug("function : add_module; uuid : " + p_uuid + "; width : " + p_width + "; height : " + p_height + "; depth : " + p_depth + "; color : " + p_color + "; x : " + p_x + "; y : " + p_y + "; p_edit_ind : " + p_edit_ind + "; pog_flag : " + p_pog_flag + "; vert_start : " + p_vert_start + "; vert_spacing : " + p_vert_spacing + "; horz_start : " + p_horz_start + "; horz_spacing : " + p_horz_spacing + "; recreate : " + p_recreate + "; module_ind : " + p_module_ind, "S");
        var result;
        result = await add_module_lib(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_edit_ind, p_pog_flag, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, p_recreate, p_camera, p_module_ind, $v(g_page_no + "POGCR_DFT_SPREAD_PRODUCT"), parseFloat($v(g_page_no + "PEGB_DFT_HORIZ_SPACING")), parseFloat($v(g_page_no + "PEGBOARD_DFT_VERT_SPACING")), parseFloat($v(g_page_no + "BASKET_DFT_WALL_THICKNESS")), parseFloat($v(g_page_no + "CHEST_DFT_WALL_THICKNESS")), $v(g_page_no + "POGCR_PEGB_MAX_ARRANGE"), $v(g_page_no + "POGCR_DEFAULT_WRAP_TEXT"), parseInt($v(g_page_no + "POGCR_TEXT_DEFAULT_SIZE")), $v(g_page_no + "POG_TEXTBOX_DEFAULT_COLOR"), $v(g_page_no + "POG_SHELF_DEFAULT_COLOR"), $v(g_page_no + "DIV_COLOR"), $v(g_page_no + "SLOT_DIVIDER"), $v(g_page_no + "SLOT_ORIENTATION"), $(g_page_no + "DIVIDER_FIXED"), $v(g_page_no + "POG_ITEM_DEFAULT_COLOR"), $v(g_page_no + "POGCR_DELIST_ITEM_DFT_COL"), g_peg_holes_active, $v(g_page_no + "POG_CP_SHELF_DFLT_COLOR"), 3, $v(g_page_no + "MERCH_STYLE"), $v(g_page_no + "POGCR_LOAD_IMG_FROM"), $v(g_page_no + "BU_ID"), $v(g_page_no + "POGCR_DELIST_ITEM_DFT_COL"), $v(g_page_no + "POGCR_ITEM_NUM_LBL_COLOR"), $v(g_page_no + "POGCR_DISPLAY_ITEM_INFO"), $v(g_page_no + "POGCR_ITEM_NUM_LBL_COLOR"), $v(g_page_no + "POGCR_ITEM_NUM_LABEL_POS"), $v(g_page_no + "NOTCH_HEAD"), "Y", g_pog_index, $v(g_page_no + "POGCR_DFT_BASKET_FILL"), $v(g_page_no + "POGCR_DFT_BASKET_SPREAD"), $v('P193_POGCR_MANUAL_CRUSH_ITEM'));
        $s(g_page_no + "MODULE_EDIT_IND", "N");
        return result;
    } catch (err) {
        error_handling(err);
    }
}


function clear_search_fields() {
    logDebug("function : clear_search_fields", "S");
    $s(g_page_no + "ITEM", "");
    $s(g_page_no + "SUPP_NAME", "");
    $s(g_page_no + "SUPPLIER_CODE", "");
    $s(g_page_no + "MAIN_BRAND", "");
    $s(g_page_no + "ITEM_DESCRIPTION", "");
    $s(g_page_no + "DESCRIPTION_SEC", "");
    $s(g_page_no + "GROUP", "");
    $s(g_page_no + "DEPARTMENT", "");
    $s(g_page_no + "ITEM_BRAND", "");
    $s(g_page_no + "ITEM_WITHOUT_DIM", "N");
    $s(g_page_no + "USED_ITEM", "A");
    $s(g_page_no + "CLASS", "");        //ASA-1558 Task 1
    $s(g_page_no + "SUB_CLASS", "");    //ASA-1558 Task 1
    logDebug("function : clear_search_fields", "E");
}

function set_pog_page_items(p_pog_index) {
    try {
        logDebug("function : set_pog_page_items", "S");
        apex.item(g_page_no + "POG_WIDTH").setValue((g_pog_json[p_pog_index].W * 100).toFixed(2));
        apex.item(g_page_no + "POG_DEPTH").setValue((g_pog_json[p_pog_index].D * 100).toFixed(2));
        apex.item(g_page_no + "BACK_DEPTH").setValue((g_pog_json[p_pog_index].BackDepth * 100).toFixed(2));
        if ((g_pog_json[p_pog_index].SegmentW * 100).toFixed(2) !== "NaN") {
            apex.item(g_page_no + "POG_SEGMENT_WIDTH").setValue((g_pog_json[p_pog_index].SegmentW * 100).toFixed(2));
        }
        apex.item(g_page_no + "TRAFFIC_FLOW").setValue(g_pog_json[p_pog_index].TrafficFlow);
        apex.item(g_page_no + "POG_BASE_HEIGHT").setValue((g_pog_json[p_pog_index].BaseH * 100).toFixed(2));
        apex.item(g_page_no + "POG_BASE_WIDTH").setValue((g_pog_json[p_pog_index].BaseW * 100).toFixed(2));
        apex.item(g_page_no + "POG_BASE_DEPTH").setValue((g_pog_json[p_pog_index].BaseD * 100).toFixed(2));
        apex.item(g_page_no + "POG_NOTCH_WIDTH").setValue((g_pog_json[p_pog_index].NotchW * 100).toFixed(2));
        apex.item(g_page_no + "POG_NOTCH_START").setValue((g_pog_json[p_pog_index].NotchStart * 100).toFixed(2));
        apex.item(g_page_no + "POG_NOTCH_SPACING").setValue((g_pog_json[p_pog_index].NotchSpacing * 100).toFixed(2));
        apex.item(g_page_no + "POG_COLOR").setValue(g_pog_json[p_pog_index].Color);
        apex.item(g_page_no + "HORZ_START").setValue((g_pog_json[p_pog_index].HorzStart * 100).toFixed(2));
        apex.item(g_page_no + "HORZ_SPACING").setValue((g_pog_json[p_pog_index].HorzSpacing * 100).toFixed(2));
        apex.item(g_page_no + "POG_VERT_START").setValue((g_pog_json[p_pog_index].VertStart * 100).toFixed(2));
        apex.item(g_page_no + "POG_VERT_SPACING").setValue((g_pog_json[p_pog_index].VertSpacing * 100).toFixed(2));
        apex.item(g_page_no + "ALLOW_OVERLAP").setValue(g_pog_json[p_pog_index].AllowOverlap);
        apex.item(g_page_no + "SPECIAL_TYPE").setValue(g_pog_json[p_pog_index].SpecialType);
        apex.item(g_page_no + "SPECIAL_TYPE_DESC").setValue(g_pog_json[p_pog_index].SpecialTypeDesc);
        apex.item(g_page_no + "DISPLAY_METERAGE").setValue(g_pog_json[p_pog_index].DisplayMeterage);
        apex.item(g_page_no + "RPT_METERAGE").setValue(g_pog_json[p_pog_index].RPTMeterage);
        apex.item(g_page_no + "EFF_START_DATE").setValue(g_pog_json[p_pog_index].EffStartDate);
        apex.item(g_page_no + "BRAND_GROUP_ID").setValue(g_pog_json[p_pog_index].BrandGroupID);
        apex.item(g_page_no + "REMARKS").setValue(g_pog_json[p_pog_index].Remarks);
        apex.item(g_page_no + "STORE_SEGMENT").setValue(g_pog_json[p_pog_index].StoreSegment);
        apex.item(g_page_no + "DESC_7").setValue(g_pog_json[p_pog_index].Desc7);
        apex.item(g_page_no + "AREA").setValue(g_pog_json[p_pog_index].Area);
        apex.item(g_page_no + "PLN_DEPT").setValue(g_pog_json[p_pog_index].PLNDept);
        g_isPogItemsSet = "Y";
        logDebug("function : set_pog_page_items", "E");
    } catch (err) {
        error_handling(err);
    }
}

function setPogActive(p_pog_index) {
    $("[data-pog]").removeClass("multiPogList_active");
    $(".canvas-buttons").removeClass("canvas_highlight");
    $("[data-indx=" + p_pog_index + "]").addClass("multiPogList_active");
    var canvas_id = $('#canvas-holder [data-indx="' + p_pog_index + '"]').attr("id");
    $("#" + canvas_id + "-btns").addClass("canvas_highlight");
    if (p_pog_index !== "ALL_POG") {
        g_all_pog_flag = "N";
        g_pog_index = p_pog_index;
        $s(g_page_no + "OPEN_POG_CODE", g_pog_json[p_pog_index].POGCode);
        $s(g_page_no + "OPEN_POG_VERSION", g_pog_json[p_pog_index].Version);
    } else {
        $s(g_page_no + "SELECTED_CANVAS", "ALL_POG");
        g_all_pog_flag = "Y";
        g_pog_index = 0;
        $s(g_page_no + "OPEN_POG_CODE", "");
        $s(g_page_no + "OPEN_POG_VERSION", "");
    }
}

function closePog(p_pog_index, p_type) {
   if (p_type == 0) {
      g_scene_objects_backup.splice(p_pog_index, 1);
      g_pogjson_backup.splice(p_pog_index, 1);
      g_pogjson_data_backup.splice(p_pog_index, 1);
      generateCanvasListHolder(g_pogjson_backup);
   } else {
      confirm(get_message("POGCR_CLOSE_POG_WARN"), get_message("SHCT_YES"), get_message("SHCT_NO"), function() {
         g_scene_objects.splice(p_pog_index, 1);
         g_pog_json.splice(p_pog_index, 1);
         g_pog_json_data.splice(p_pog_index, 1);
         appendMultiCanvasRowCol(g_scene_objects.length, $v(g_page_no + "POGCR_TILE_VIEW"));
         modifyWindowAfterMinMax(g_scene_objects);
         if (p_pog_index == g_ComViewIndex && g_compare_pog_flag == "Y") {
            g_compare_view = "NONE";
            g_compare_pog_flag = "N";
            g_edit_pallet_mod_ind = -1;
            g_edit_pallet_shelf_ind = -1;
            g_ComViewIndex = -1;
            g_ComBaseIndex = -1;
            g_comp_view_code = "";
            g_comp_base_code = "";
         } else {
            reset_compare_index(p_pog_index);
         }
         add_pog_code_header();
         generateMultiPogDropdown();
         if (g_pog_json.length > 0) {
            g_pog_index = 0;
            set_select_canvas(g_pog_index); //Regression Issue 9 20240802				
         }
         $(".wt-analysis").removeClass('disable');
      });
      //Task_29818 - End
   }
}
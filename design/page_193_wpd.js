var g_splitter_resize_bound = "N";
var g_analysis_view_active = "N";
var g_analysis_prev_state = null;
var g_analysis_chart_instance = null;

var g_page_no = (function() {
   var htmlClass = document.documentElement.className || "";
   var match = htmlClass.match(/page-(\d+)/);
   var page = match ? match[1] : "0";
   return "P" + page + "_";
})();

function runCanvasReflow() {
   try {
      if (typeof window.reset_canvas_region === "function") {
         window.reset_canvas_region();
      } else {
         var l_view = $v(g_page_no + "POGCR_TILE_VIEW");
         switchCanvasView(l_view == "" ? "V" : l_view, "Y");
      }
   } catch (err) {
      error_handling(err);
   }
}

function bindSplitterResizeSync() {
   try {
      if (g_splitter_resize_bound == "Y") {
         return;
      }
      g_splitter_resize_bound = "Y";
      $(document).off("click.aswSplitterResize").on("click.aswSplitterResize", ".a-Splitter-thumb", function() {
         setTimeout(runCanvasReflow, 80);
         setTimeout(runCanvasReflow, 260);
         setTimeout(runCanvasReflow, 520);
      });
      $(document).off("transitionend.aswSplitterResize").on("transitionend.aswSplitterResize", "#side_bar, #drawing_region, #wpdSplitter_splitter_first", function() {
         setTimeout(runCanvasReflow, 30);
      });
      // Hide the splitter container immediately so the open→collapse flash is invisible
      var splitterContainer = document.getElementById("wpdSplitter");
      // Safety: stop polling after 5 seconds
      setTimeout(function() {
         // Always restore visibility even if thumb was never found
         if (splitterContainer) {
            splitterContainer.style.transition = "opacity 0.2s ease";
            splitterContainer.style.opacity = "1";
         }
      }, 10);
   } catch (err) {
      error_handling(err);
   }
}
if (typeof window.reset_canvas_region !== "function") {
   window.reset_canvas_region = async function() {
      try {
         if (typeof g_show_plano_rate === "undefined") g_show_plano_rate = "N";
         if (typeof g_open_productlist === "undefined") g_open_productlist = "Y";
         if ($("#par_region").length > 0 && $("#draggable_table").length > 0) {
            if (g_show_plano_rate == "N" || g_open_productlist == "Y") {
               $("#par_region").hide();
               $("#draggable_table").show();
               $("#wpdSplitter_splitter_second").css("overflow", "hidden");
               if ($(".a-Splitter-thumb").attr("aria-label") == "Collapse" && apex.region("draggable_table").widget() !== null) {
                  apex.region("draggable_table").widget().interactiveGrid("getActions").set("edit", false);
                  apex.region("draggable_table").widget().interactiveGrid("getViews", "grid").model.clearChanges();
                  apex.region("draggable_table").widget().interactiveGrid("getViews").grid.curInst._refreshGrid();
               }
            } else {
               $("#draggable_table").hide();
               $("#par_region").show();
               $("#wpdSplitter_splitter_second").css("scrollbar-width", "thin").css("overflow", "auto");
            }
            if ($(".a-Splitter-thumb").attr("aria-label") !== "Collapse") {
               g_show_plano_rate = "N";
               g_open_productlist = "Y";
            }
         }
         var l_view = $v(g_page_no + "POGCR_TILE_VIEW");
         // switchCanvasView(l_view == "" ? "V" : l_view, "Y");
      } catch (err) {
         error_handling(err);
      }
   };
}
async function appendMultiCanvasRowCol(p_pog_count, p_type = $v("P193_POGCR_TILE_VIEW"), p_appendFlag = "N", p_compareWith) {
   console.log("dynamic rows cols");
   if (typeof bindSplitterResizeSync === "function") {
      bindSplitterResizeSync();
   }
   if (p_type == "H") {
      $(".viewH").addClass("view_active");
      $(".viewV").removeClass("view_active");
   } else {
      $(".viewV").addClass("view_active");
      $(".viewH").removeClass("view_active");
   }
   g_windowHeight = window.innerHeight - 167;
   // g_windowWidth = window.innerWidth - (side_nav_width + btn_cont_width);
   //.css('width',windowWidth)
   $("#canvas-holder .container").css("height", g_windowHeight + "px")
   var containerH = $("#canvas-holder .container").height();;
   var containerW = $("#canvas-holder .container").width();
   console.log('appendMultiCanvasRowCol: p_pog_count=', p_pog_count, 'p_type=', p_type, 'containerH=', containerH, 'containerW=', containerW);
   var rowCount = 1,
      colCount = 1,
      calcFlag = "Y",
      pogCount = 0;
   var currColCount,
      pendingPogCount = p_pog_count,
      compareApended = 0;
   var divs = [];
   $("[data-col]").each(function() {
      var element = $(this)[0];
      divs.push(element);
   });
   if (p_pog_count <= 3) {
      calcFlag = "N";
      currColCount = p_pog_count;
      colCount = p_pog_count;
   } else if (p_pog_count == 4) {
      calcFlag = "N";
      currColCount = 2;
      colCount = 2;
      rowCount = 2;
   } else if (p_pog_count == 5 || p_pog_count == 6 || p_pog_count == 9) {
      colCount = 3;
      rowCount = Math.ceil(p_pog_count / colCount);
   } else if (p_pog_count == 7 || p_pog_count == 8 || p_pog_count == 10 || p_pog_count == 11 || p_pog_count == 12 || p_pog_count == 16) {
      colCount = 4;
      rowCount = Math.ceil(p_pog_count / colCount);
   } else if (p_pog_count == 13 || p_pog_count == 14 || p_pog_count == 15 || p_pog_count == 17 || p_pog_count == 18 || p_pog_count == 19 || p_pog_count == 20) {
      colCount = 5;
      rowCount = Math.ceil(p_pog_count / colCount);
   } else {
      colCount = 5;
      rowCount = 5;
   }
   $("#canvas-holder .container").html("");
   // g_canvas_objects = [];
   // g_scene_objects = [];
   if (p_type == "H") {
      $("#canvas-holder .container").addClass("h-view").removeClass("v-view");
   } else {
      $("#canvas-holder .container").addClass("v-view").removeClass("h-view");
   }
   for (var i = 1; i <= rowCount; i++) {
      $("#canvas-holder .container").append('<div class="row" data-row="' + i + '"></div>');
      if (calcFlag == "Y") {
         var res = pendingPogCount % (rowCount - i + 1);
         if (res > 0) {
            currColCount = colCount;
         } else {
            currColCount = pendingPogCount / (rowCount - i + 1);
            calcFlag = "N";
         }
         pendingPogCount = pendingPogCount - currColCount; //colCount;
      }
      for (var j = 1; j <= currColCount; j++) {
         var pogNo = pogCount == 0 ? "" : pogCount + 1;
         var canvasName = "maincanvas" + pogNo;
         if (p_appendFlag == "Y") {
            if (p_compareWith == pogCount - 1) {
               $("[data-row=" + i + "]").append('<div class="canvas-content" id="' + canvasName + '-container" data-col="' + j + '" style="height:' + parseFloat((containerH / rowCount).toFixed(2)) + "px;width:" + parseFloat((containerW / currColCount).toFixed(2)) + 'px"><div class="canvas-buttons" id="' + canvasName + '-btns" ><span class="fa fa-close canvas-close" onClick="closePog(' + pogCount + ')"></span><span class="fa fa-window-maximize canvas-max" onClick="maximizePog(' + pogCount + ')"></span><span class="fa fa-minus canvas-min" onClick="minimizePog(' + pogCount + ')"></span></div><canvas class="canvasregion" data-canvas=true id="' + canvasName + '" ></canvas></div>');
               compareApended = 1;
               //ASA-1986  START
               try {
                  var el = document.getElementById(canvasName);
                  if (el) {
                     el.setAttribute('data-indx', pogCount);
                     if (g_canvas_objects.indexOf(el) === -1) g_canvas_objects.push(el);
                  }
               } catch (e) {}
               //ASA-1986  end
            } else {
               var currElmPos = pogCount - compareApended;
               var currElm = divs[currElmPos];
               $(currElm).attr("id", canvasName + "-container");
               $("[data-row=" + i + "]").append(currElm);
               var currElmId = $(currElm).attr("id");
               $("[data-row=" + i + "] #" + currElmId).css("height", parseFloat((containerH / rowCount).toFixed(2))).css("width", parseFloat((containerW / currColCount).toFixed(2))).attr("data-col", j);
               $("[data-row=" + i + "] #" + currElmId + " .canvas-buttons").attr("id", canvasName + "-btns");
               $("[data-row=" + i + "] #" + currElmId + " .canvasregion").attr("id", canvasName);
               //ASA-1986  START
               try {
                  var el = document.getElementById(canvasName);
                  if (el) {
                     el.setAttribute('data-indx', pogCount);
                     if (g_canvas_objects.indexOf(el) === -1) g_canvas_objects.push(el);
                  }
               } catch (e) {}
               //ASA-1986  end
            }
         } else {
            var buttonHtml = "";
            if (p_pog_count > 1) {
               buttonHtml = '<div class="canvas-buttons" id="maincanvas' + pogNo + '-btns" ><span class="fa fa-close canvas-close" onClick="closePog(' + pogCount + ')"></span></div>';
            }
            $("[data-row=" + i + "]").append('<div class="canvas-content" id="maincanvas' + pogNo + '-container" data-col="' + j + '" style="height:' + parseFloat((containerH / rowCount).toFixed(2)) + "px;width:" + parseFloat((containerW / currColCount).toFixed(2)) + 'px">' + buttonHtml + '<canvas class="canvasregion" data-canvas=true id="maincanvas' + pogNo + '" ></canvas></div>');
            //ASA-1986  START
            try {
               var el = document.getElementById(canvasName);
               if (el) {
                  el.setAttribute('data-indx', pogCount);
                  if (g_canvas_objects.indexOf(el) === -1) g_canvas_objects.push(el);
               }
            } catch (e) {}
            //ASA-1986  end
         }
         pogCount++;
      }
   }
   if (p_appendFlag == "Y") {
      var incr = 0;
      for (var i = 1; i <= g_pog_json.length; i++) {
         if (i !== 2) {
            const pRenderer = g_renderer; //g_scene_objects[i - 1 - incr].renderer;
            const pScene = g_scene_objects[i - 1 - incr].scene;
            const pCamera = g_scene_objects[i - 1 - incr].scene.children.find((obj) => {
               return obj.type === "PerspectiveCamera";
            });
            var canvasName = "maincanvas" + (i == 1 ? "" : i);
            var canvasContainerH = $("#" + canvasName).parent().height();
            var canvasContainerW = $("#" + canvasName).parent().width();
            var canvasBtns = $("#" + canvasName + "-btns")[0];
            var canvasBtns_height = canvasBtns.offsetHeight;
            var canvasWidthOrg = canvasContainerW;
            var canvasHeightOrg = canvasContainerH - canvasBtns_height;
            var pTanFOV = Math.tan(((Math.PI / 180) * pCamera.fov) / 2);
            pCamera.aspect = canvasWidthOrg / canvasHeightOrg;
            pCamera.fov = (360 / Math.PI) * Math.atan(pTanFOV);
            pCamera.updateProjectionMatrix();
            pRenderer.setSize(canvasWidthOrg, canvasHeightOrg);
            //pRenderer.render(pScene, pCamera);
            render(i);
         } else if (i == 2) {
            incr = 1;
         }
      }
   }
   makeResizableRow(); // Task 22510
}
//this function is called from open_existing, open_draft to get existing pog, draft pog, or template. it will get the json and create
//the skeleton.
async function getJson(p_new_pog_ind, p_pog_code, p_pog_version, p_recreate, p_create_json, p_camera, p_scene, p_canvasNo, p_imageLoadInd = "N", p_resetparam = "Y", p_pog_desc) {
   //ASA-1765 Added p_pog_desc #issue 5
   logDebug("function : getJson; new_pog_ind : " + p_new_pog_ind + "; pog_version : " + p_pog_version + "; recreate : " + p_recreate + "; create_json : " + p_create_json, "S");
   try {
      return new Promise(function(resolve, reject) {
         var process_name;
         var pog_opened = "N";
         var automate_ind = "N";
         var items_arr = [];
         if (p_new_pog_ind == "Y") {
            //getting draft POG sm_pog_design
            process_name = "GET_POG_JSON";
            pog_opened = "N";
            //$s("P193_OPEN_POG_CODE", "");
            $s(g_page_no + "OPEN_POG_CODE", "");
         } else if (p_new_pog_ind == "T") {
            //getting template from sm_pog_design
            process_name = "OPEN_TEMPLATE";
            pog_opened = "N";
            //$s("P193_OPEN_POG_CODE", "");
            $s(g_page_no + "OPEN_POG_CODE", "");
         } else {
            //getting existing pog(here it can be a pog already opened and saved in WPD so a copy of json will be saved in sm_pog_design else
            //if opening first time any pog when it will come from sm_pog, sm_pog_module,sm_pog_fixel, sm_pog_item_position)
            process_name = "GET_EXISTING_POG";
            pog_opened = "E";
            //recreate = 'N';
         }
         var seq_id = -1;
         if (p_new_pog_ind == "Y") {
            seq_id = p_pog_version;
         } else {
            seq_id = p_pog_code;
         }
         var p = apex.server.process(process_name, {
            x01: seq_id,
            x02: p_pog_version,
         }, {
            dataType: "html",
         });
         // When the process is done, set the value to the page item
         p.done(function(data) {
            var processed = "Y";
            var return_data = $.trim(data);
            try {
               g_json = JSON.parse($.trim(data));
            } catch {
               processed = "N";
            }
            if (processed == "N") {
               raise_error(return_data);
               //ASA-1500
               /*try {
               raise_error(return_data);
               } catch {
               removeLoadingIndicator(regionloadWait);
               }*/
            } else if (return_data !== "") {
               g_json = JSON.parse($.trim(data));
               if (p_create_json == "Y") {
                  // g_pog_json_data.push(g_json[0]);
                  g_pog_json_data.push(JSON.parse(JSON.stringify(g_json[0]))); //Regression Issue 12 05082024
                  // ASA-1924 Issue-1 Start
                  // if (typeof p_pog_desc !== "Undefined") { 
                  // 	//ASA-1765 Added if/else to set Desc7  #issue 5
                  // 	g_pog_json_data[0].Desc7 = p_pog_desc;
                  // }       
                  // ASA-1924 Issue-1 End                 
               } else {
                  g_pog_json_data = g_pog_json;
               }
               if (typeof g_pog_json_data !== "undefined") {
                  //recreate the orientation view if any present
                  async function recreate_view() {
                     if (p_new_pog_ind == "Y") {
                        automate_ind = await get_draft_ind(seq_id); //ASA-1710 $v("P193_DRAFT_LIST")
                        let draftVersion = await loadDraftVersion(seq_id); //ASA-1912
                        g_pog_json_data[g_pog_index].draftVersion = draftVersion; //ASA-1912
                        if (p_new_pog_ind == "Y" && automate_ind == "Y") {
                           pog_opened = "E";
                           p_new_pog_ind = "N";
                        }
                     }
                     sessionStorage.setItem("new_pog_ind", p_new_pog_ind);
                     sessionStorage.setItem("pog_opened", pog_opened);
                     sessionStorage.setItem("POGExists", "Y");
                     //this function is used to set labels indicators by default BU Param.
                     // 1655 Added new param p_resetparam= 'Y' to not reset flags when called from PLANO GRAPH
                     if (p_resetparam == "Y") {
                        await setDefaultState(p_new_pog_ind);
                     }
                     //this function will create the skeleton.
                     var return_val = await create_module_from_json(g_pog_json_data, p_new_pog_ind, "F", "N", pog_opened, "N" /* Stop Loading"Y"*/ , "N", p_recreate, p_create_json, p_pog_version, "Y", p_camera, p_scene, g_pog_index, p_canvasNo, p_imageLoadInd);
                     if (p_new_pog_ind == "N" && automate_ind == "Y") {
                        sessionStorage.setItem("new_pog_ind", "Y");
                     }
                     if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
                        backupPog("F", -1, -1, g_pog_index);
                     }
                     if (g_compare_pog_flag == "Y" && g_compare_view !== "POG") {
                        var returnval = await recreate_compare_views(g_compare_view, "N");
                     }
                     logDebug("function : getJson", "E");
                     resolve("SUCCESS");
                  }
                  recreate_view();
               }
               clearUndoRedoInfo();
               g_dblclick_opened = "N";
            }
         });
         console.log("blockList", g_mod_block_list);
      });
   } catch (err) {
      error_handling(err);
   }
   //Loading block after POG load
   try {
      if (Array.isArray(g_mod_block_list) && g_mod_block_list.length > 0) {
         for (const blkDet of g_mod_block_list) {
            try {
               // Draw only if BlockDim not present yet
               if (typeof blkDet.BlockDim === 'undefined' || Object.keys(blkDet.BlockDim).length === 0) {
                  g_autofillModInfo = blkDet.BlkModInfo || [];
                  g_autofillShelfInfo = blkDet.BlkShelfInfo || [];
                  var retdtl = await colorAutofillBlock(blkDet["DragMouseStart"], blkDet["DragMouseEnd"], blkDet["mod_index"], blkDet["BlkColor"], blkDet["BlkName"], "U", blkDet, p_pog_index, "N");
                  blkDet["BlockDim"] = retdtl;
               }
            } catch (innerErr) {
               error_handling(innerErr);
            }
         }
      }
   } catch (err2) {
      error_handling(err2);
   }
}
//this function is used to open draft POG.
async function get_json_data(p_pog_code, p_imageLoadInd = "N", p_pog_desc) {
   //ASA-1765 added parameter p_pog_desc  #issue 5
   logDebug("function : get_json_data; pog_code : " + p_pog_code, "S");
   g_ComBaseIndex = -1;
   g_ComViewIndex = -1;
   g_compare_pog_flag = "N";
   g_compare_view = "NONE";
   g_colorBackup = "N";
   l_new_pog_ind = "N";
   var items_arr = [];
   g_pog_json_data = [];
   try {
      //if validate = 'Y' then we create only the json and then try to call item height, width, depth validation also validate shelf.
      //if found errors we suggest methods to correct them.
      if ($v(g_page_no + "POGCR_VALIDATE_POG") == "Y" && p_pog_code.length == 1) {
         init(0);
         objects = {};
         objects["scene"] = g_scene;
         objects["renderer"] = g_renderer;
         g_scene_objects.push(objects);
         set_indicator_objects(g_scene_objects.length - 1);
         g_pog_index = 0;
         // addLoadingIndicator(); //ASA-1500
         var returnval = await getJson("Y", "", p_pog_code[0], "N", "Y", g_camera, g_scene, 0, p_imageLoadInd, p_pog_desc); //ASA-1765 Added p_pog_desc  #issue 5
         var failed = "N";
         //this logic is wrong we need to call this save_validate_items_coll. but current failed variable is hardcoded to N.
         if (failed == "Y") {
            var returnval = await save_validate_items_coll(g_errored_items);
            removeLoadingIndicator(regionloadWait);
            apex.region("ig_errored_item").refresh();
            // apex.event.trigger("#P193_ERROR_METHOD", "apexrefresh");
            apex.event.trigger("#" + g_page_no + "ERROR_METHOD", "apexrefresh");
            g_dblclick_opened = "Y";
            openInlineDialog("errored_items", 60, 65);
         } else {
            g_dblclick_opened = "N";
            var return_val = await create_module_from_json(g_pog_json, sessionStorage.getItem("new_pog_ind"), "F", "N", sessionStorage.getItem("pog_opened"), "Y", "N", "Y", "N", "", "Y", g_camera, g_scene, g_pog_index, g_pog_index);
            animate_all_pog();
            generateMultiPogDropdown();
         }
      } else {
         g_scene_objects = [];
         g_canvas_objects = [];
         //this will create canvas can be multiple or single.
         appendMultiCanvasRowCol(p_pog_code.length, $v(g_page_no + "POGCR_TILE_VIEW"));
         //this will set the view. can be horizontal or vertical.
         switchCanvasView($v(g_page_no + "POGCR_TILE_VIEW")); // Task-22510
         // addLoadingIndicator();//ASA-1500
         g_multi_pog_json = [];
         //this function is used to set labels indicators by default BU Param.
         await setDefaultState("Y");
         for (var i = 0; i <= p_pog_code.length - 1; i++) {
            init(i);
            objects = {};
            objects["scene"] = g_scene;
            objects["renderer"] = g_renderer;
            g_scene_objects.push(objects);
            g_seqArrDtl = {};
            g_seqArrDtl["seqId"] = p_pog_code[i];
            g_seqArrDtl["index"] = i;
            g_seqArrDtl["pogCode"] = "";
            g_seqArrDtl["pogVersion"] = "";
            g_seqArrDtl["pogType"] = "D";
            g_seqArr.push(g_seqArrDtl);
            g_pog_index = i;
            set_indicator_objects(g_scene_objects.length - 1);
            var returnval = await getJson("Y", "", p_pog_code[i], "Y", "Y", g_camera, g_scene, i, p_imageLoadInd, "Y", p_pog_desc); //ASA-1765 Added p_pog_desc  #issue 5
            render(i);
            var canvas_id = g_canvas_objects[i].getAttribute("id");
            $("#" + canvas_id + "-btns").append('<span id="block_title" style="float:left">' + g_pog_json[i].POGCode /*POGJSON[0].POGCode*/ + "</span>"); //HOTFIX               
         }
         g_pog_json = g_multi_pog_json;
         generateMultiPogDropdown();
         var retval = await animate_all_pog();
         if (p_imageLoadInd == "Y") {
            // addLoadingIndicator();
            var retval = await get_all_images(0, g_get_orient_images, "Y", $v(g_page_no + "POGCR_IMG_MAX_WIDTH"), $v(g_page_no + "POGCR_IMG_MAX_HEIGHT"), $v(g_page_no + "IMAGE_COMPRESS_RATIO"));
         }
         if (g_ItemImages.length > 0 && g_show_live_image == "Y" && p_imageLoadInd == "Y") {
            var pogIndx = 0;
            $(".live_image").addClass("live_image_active");
            for (const pogs of g_pog_json) {
               try {
                  g_renderer = g_scene_objects[pogIndx].renderer;
                  g_scene = g_scene_objects[pogIndx].scene;
                  g_camera = g_scene_objects[pogIndx].scene.children[0];
                  g_world = g_scene_objects[pogIndx].scene.children[2];
                  // var return_val = await recreate_image_items("Y", $v("P193_MERCH_STYLE"), $v("P193_POGCR_LOAD_IMG_FROM"), $v("P193_BU_ID"), $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_ITEM_NUM_LABEL_POS"), $v("P193_POGCR_DISPLAY_ITEM_INFO"), $v("P193_POGCR_DELIST_ITEM_DFT_COL"), $v("P193_NOTCH_HEAD"), pogIndx, g_show_days_of_supply, $v("P193_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label); //ASA-1427 $v('P193_POGCR_ITEM_DETAIL_LIST')
                  var return_val = await recreate_image_items("Y", $v(g_page_no + "MERCH_STYLE"), $v(g_page_no + "POGCR_LOAD_IMG_FROM"), $v(g_page_no + "BU_ID"), $v(g_page_no + "POGCR_ITEM_NUM_LBL_COLOR"), $v(g_page_no + "POGCR_ITEM_NUM_LABEL_POS"), $v(g_page_no + "POGCR_DISPLAY_ITEM_INFO"), $v(g_page_no + "POGCR_DELIST_ITEM_DFT_COL"), $v(g_page_no + "NOTCH_HEAD"), pogIndx, g_show_days_of_supply, $v(g_page_no + "POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label);
               } catch (err) {
                  error_handling(err);
                  // removeLoadingIndicator(regionloadWait); //ASA-1500
               }
               //ASA-1500
               // if (pogIndx == g_pog_json.length - 1) {
               //     removeLoadingIndicator(regionloadWait);
               // }
               pogIndx++;
            }
            g_imagesShown = "Y";
            animate_all_pog();
         }
         //ASA-1500
         // else if (p_imageLoadInd == "Y") {
         //     removeLoadingIndicator(regionloadWait);
         // }
         var j = 0;
         for (const r of g_pog_json) {
            if (j > 0) {
               await enableDisableFlags(j);
            }
            j++;
         }
         // await save_update_json_items(g_multi_pog_json);
         g_pog_index = 0;
         if (g_scene_objects.length > 0) {
            if (typeof g_scene_objects[g_pog_index] !== "undefined") {
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
               var canvas_id = g_canvas_objects[g_pog_index].getAttribute("id");
               $("[data-pog]").removeClass("multiPogList_active");
               $(".canvas_highlight").removeClass("canvas_highlight");
               $("#" + canvas_id + "-btns").addClass("canvas_highlight");
               $("[data-indx=" + g_pog_index + "]").addClass("multiPogList_active");
               g_all_pog_flag = "N";
            }
         }
      }
      var pindex = 0;
      for (const pog of g_pog_json) {
         items_arr = [];
         if (typeof g_pog_json[pindex].DeleteItems !== "undefined") {
            //ASA- S-1108
            if (g_pog_json[pindex].DeleteItems.length > 0) {
               var i = 0;
               for (var items of g_pog_json[pindex].DeleteItems) {
                  items_arr.push(items.Item);
                  i++;
               }
            }
         }
         if (typeof items_arr !== "undefined") {
            g_open_productlist = "D";
            // await deleted_items_log(items_arr, "D", pindex);
         } //ASA- E-1108
         pindex++;
      }
      logDebug("function : get_json_data", "E");
   } catch (err) {
      error_handling(err);
   }
}
// This function will call create_module_from_json_lib from asw_common_main.js. This function will take the complete json of the POG and build json for g_pog_json
//and create the skeleton on the screen.
// async function create_module_from_json(p_pog_json_arr, p_new_pog_ind, p_pog_type, p_product_open, p_pog_opened, p_stop_loading, p_create_pdf_ind, p_recreate, p_create_json, p_pog_version, p_save_pdf, p_camera, p_scene, p_pog_index, p_orgPogIndex, p_ImageLoadInd = "N", p_UpdateIndex = "N", p_old_POGJSON = []) {
//    try {
//       typeof p_save_pdf == "undefined" ? "Y" : p_save_pdf;
//       load_orientation_json();
//       $("#LIVE_IMAGE").addClass("apex_disabled");
//       //Start ASA-1371_26842
//       if ($v(g_page_no + 'POGCR_DFT_NOTCH_LABEL') == "Y") {
//          g_show_notch_label = 'Y';
//          //show_notch_labels("Y", $v("P36_NOTCH_HEAD"), "Y", p_pog_index);
//       }
//       if ($v(g_page_no + 'POGCR_DFT_FIXEL_LABEL') == "Y") {
//          g_show_fixel_label = 'Y';
//          //show_fixel_labels("Y", p_pog_index);
//       }
//       if ($v(g_page_no + 'POGCR_SHOW_DFLT_ITEM_LOC') == "Y") {
//          g_show_item_label = 'Y';
//          //show_item_labels("Y", $v("P36_POGCR_ITEM_NUM_LBL_COLOR"), $v("P36_POGCR_ITEM_NUM_LABEL_POS"), p_pog_index);
//       }
//       console.log("create_module_from_json:start", {
//          p_pog_index: p_pog_index,
//          g_canvas_objects_len: g_canvas_objects ? g_canvas_objects.length : 0,
//          g_scene_objects_len: g_scene_objects ? g_scene_objects.length : 0,
//          has_p_camera: typeof p_camera !== 'undefined',
//          has_p_scene: typeof p_scene !== 'undefined'
//       });
//       await create_module_from_json_lib(p_pog_json_arr, p_new_pog_ind, p_pog_type, p_product_open, p_pog_opened, p_recreate, p_create_json, $v(g_page_no + "VDATE"), $v(g_page_no + "POG_POG_DEFAULT_COLOR"), $v(g_page_no + "POG_MODULE_DEFAULT_COLOR"), p_pog_version, true, "N", null, $v(g_page_no + "POGCR_DFT_SPREAD_PRODUCT"), parseFloat($v(g_page_no + "PEGB_DFT_HORIZ_SPACING")), parseFloat($v(g_page_no + "PEGBOARD_DFT_VERT_SPACING")), parseFloat($v(g_page_no + "BASKET_DFT_WALL_THICKNESS")), parseFloat($v(g_page_no + "CHEST_DFT_WALL_THICKNESS")), $v(g_page_no + "POGCR_PEGB_MAX_ARRANGE"), $v(g_page_no + "POGCR_DEFAULT_WRAP_TEXT"), parseInt($v(g_page_no + "POGCR_TEXT_DEFAULT_SIZE")), $v(g_page_no + "POG_TEXTBOX_DEFAULT_COLOR"), $v(g_page_no + "POG_SHELF_DEFAULT_COLOR"), $v(g_page_no + "DIV_COLOR"), $v(g_page_no + "SLOT_DIVIDER"), $v(g_page_no + "SLOT_ORIENTATION"), $v(g_page_no + "DIVIDER_FIXED"), $v(g_page_no + "POG_ITEM_DEFAULT_COLOR"), $v(g_page_no + "POGCR_DELIST_ITEM_DFT_COL"), g_peg_holes_active, $v(g_page_no + "POG_CP_SHELF_DFLT_COLOR"), 3, $v(g_page_no + "MERCH_STYLE"), $v(g_page_no + "POGCR_LOAD_IMG_FROM"), $v(g_page_no + "BU_ID"), $v(g_page_no + "POGCR_DELIST_ITEM_DFT_COL"), $v(g_page_no + "POGCR_ITEM_NUM_LBL_COLOR"), $v(g_page_no + "POGCR_DISPLAY_ITEM_INFO"), $v(g_page_no + "POGCR_ITEM_NUM_LBL_COLOR"), $v(g_page_no + "POGCR_ITEM_NUM_LABEL_POS"), $v(g_page_no + "NOTCH_HEAD"), "N", $v(g_page_no + "POGCR_DFT_BASKET_FILL"), $v(g_page_no + "POGCR_DFT_BASKET_SPREAD"), p_camera, p_pog_index, p_orgPogIndex, $v(g_page_no + 'POGCR_NOTCH_START_VALUE'), $v(g_page_no + 'POGCR_MANUAL_CRUSH_ITEM'), 'Y', //ASA-1310 KUSH FIX
//          ""); //Regression 29(Portal Issue) added p_calc_dayofsupply
//       console.log("create_module_from_json:done", {
//          p_pog_index: p_pog_index,
//          g_pog_json_len: g_pog_json ? g_pog_json.length : 0
//       });
//       g_pog_json[p_pog_index].MassUpdate = "N"; //ASA-1809, Set this to N, as for saving POG draft or existing the coordinates in JSON has been update with respect to WPD
//       //This after refresh event is needed because Division/Dept/Subdept are cascading LOV and setting value is always removed by refresh
//       //due to setting value to master page item.
//       $("#" + g_page_no + "POG_SUBDEPT").on("apexafterrefresh", function() {
//          if (typeof g_pog_json[p_pog_index] != "undefined") apex.item(this).setValue(g_pog_json[p_pog_index].SubDept);
//       });
//       $("#" + g_page_no + "POG_DEPT").on("apexafterrefresh", function() {
//          if (typeof g_pog_json[p_pog_index] != "undefined") apex.item(this).setValue(g_pog_json[p_pog_index].Dept);
//       });
//       apex.item(g_page_no + "POG_DIVISION").setValue(g_pog_json[p_pog_index].Division);
//       if (p_recreate == "Y") {
//          if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
//             backupPog("F", -1, -1, p_pog_index);
//          }
//          if (p_stop_loading == "N" && p_create_pdf_ind == "Y") {
//             var draft_ind = p_pog_opened == "E" ? "E" : "D";
//             var p_pog_details = {
//                'SeqNo': '',
//                'POGCode': g_pog_json[p_pog_index].POGCode,
//                'POGVersion': g_pog_json[p_pog_index].Version,
//                'POGModule': '',
//                'Selection_Type': draft_ind,
//                'Print_Type': 'P',
//                'SequenceId': '',
//                'TemplateId': $v(g_page_no + "PDF_TEMPLATE").split('-')[0],
//                'TemplateDetails': $v(g_page_no + "PDF_TEMPLATE")
//             };
//             var return_val = create_pdf(p_pog_details, p_save_pdf, "N", p_camera, draft_ind, $v(g_page_no + "POGCR_ITEM_NUM_LBL_COLOR"), $v(g_page_no + "POGCR_ITEM_NUM_LABEL_POS"), $v(g_page_no + "POGCR_DISPLAY_ITEM_INFO"), $v(g_page_no + "NOTCH_HEAD"), "Y", p_pog_index, "Y", g_all_pog_flag, $v(g_page_no + "MERCH_STYLE"), $v(g_page_no + "POGCR_LOAD_IMG_FROM"), $v(g_page_no + "BU_ID"), $v(g_page_no + "POGCR_ITEM_NUM_LBL_COLOR"), $v(g_page_no + "POGCR_ITEM_NUM_LABEL_POS"), $v(g_page_no + "POGCR_DISPLAY_ITEM_INFO"), $v(g_page_no + "POGCR_DELIST_ITEM_DFT_COL"), "", "", g_hide_show_dos_label, "", $v(g_page_no + "POGCR_ENHANCE_PDF_IMG"), $v(g_page_no + "POGCR_PDF_IMG_ENHANCE_RATIO"), $v(g_page_no + "POGCR_PDF_CANVAS_SIZE"), $v(g_page_no + "VDATE"), $v(g_page_no + "POG_POG_DEFAULT_COLOR"), $v(g_page_no + "POG_MODULE_DEFAULT_COLOR"), $v(g_page_no + "POGCR_DFT_SPREAD_PRODUCT"), $v(g_page_no + "PEGB_DFT_HORIZ_SPACING"), $v(g_page_no + "PEGBOARD_DFT_VERT_SPACING"), $v(g_page_no + "BASKET_DFT_WALL_THICKNESS"), $v(g_page_no + "CHEST_DFT_WALL_THICKNESS"), $v(g_page_no + "POGCR_PEGB_MAX_ARRANGE"), $v(g_page_no + "POGCR_DEFAULT_WRAP_TEXT"), $v(g_page_no + "POGCR_TEXT_DEFAULT_SIZE"), $v(g_page_no + "POG_TEXTBOX_DEFAULT_COLOR"), $v(g_page_no + "POG_SHELF_DEFAULT_COLOR"), $v(g_page_no + "DIV_COLOR"), $v(g_page_no + "SLOT_DIVIDER"), $v(g_page_no + "SLOT_ORIENTATION"), $v(g_page_no + "DIVIDER_FIXED"), $v(g_page_no + "POG_ITEM_DEFAULT_COLOR"), $v(g_page_no + "POGCR_DFT_BASKET_FILL"), $v(g_page_no + "POGCR_DFT_BASKET_SPREAD"), $v(g_page_no + "POGCR_BAY_LIVE_IMAGE"), $v(g_page_no + "POGCR_BAY_WITHOUT_LIVE_IMAGE"), "N"); //ASA-1427 $v('P193_POGCR_ITEM_DETAIL_LIST')
//          }
//       }
//       if (g_ItemImages.length > 0 && g_show_live_image == "Y" && p_recreate == 'Y') {
//          try {
//             $(".live_image").addClass("live_image_active");
//             if (p_create_pdf_ind == "N" && p_product_open == "N" && $v(g_page_no + "POGCR_DFT_ITEM_DESC") == "N" && p_ImageLoadInd == "N") {
//                var return_val = await recreate_image_items("Y", $v(g_page_no + "MERCH_STYLE"), $v(g_page_no + "POGCR_LOAD_IMG_FROM"), $v(g_page_no + "BU_ID"), $v(g_page_no + "POGCR_ITEM_NUM_LBL_COLOR"), $v(g_page_no + "POGCR_ITEM_NUM_LABEL_POS"), $v(g_page_no + "POGCR_DISPLAY_ITEM_INFO"), $v(g_page_no + "POGCR_DELIST_ITEM_DFT_COL"), $v(g_page_no + "NOTCH_HEAD"), p_pog_index, g_show_days_of_supply, $v(g_page_no + "POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label);
//                g_imagesShown = "Y";
//             }
//          } catch (err) {
//             error_handling(err);
//          }
//       }
//       if (g_isPogItemsSet == "N") {
//          set_pog_page_items(p_pog_index);
//       }
//       var modIdx = 0;
//       for (const modInfo of g_pog_json[p_pog_index].ModuleInfo) {
//          if (typeof modInfo.ParentModule == "undefined" || modInfo.ParentModule == null) {
//             var shelfIdx = 0;
//             for (const shelf of modInfo.ShelfInfo) {
//                if (shelf.ObjType == "TEXTBOX") {
//                   var selObj = g_world.getObjectById(g_pog_json[p_pog_index].ModuleInfo[modIdx].ShelfInfo[shelfIdx].SObjID);
//                   if (typeof selObj !== "undefined") {
//                      selObj['ShelfInfo'] = g_pog_json[p_pog_index].ModuleInfo[modIdx].ShelfInfo[shelfIdx];
//                      textboxPriorityPlacing(selObj, p_pog_index, g_pog_json[p_pog_index].ModuleInfo[modIdx].ShelfInfo[shelfIdx].Z);
//                   }
//                }
//                shelfIdx++;
//             }
//          }
//          modIdx++;
//       }
//    } catch (err) {
//       error_handling(err);
//    }
//    return "SUCCESS";
// }

async function create_module_from_json(p_pog_json_arr, p_new_pog_ind, p_pog_type, p_product_open, p_pog_opened, p_stop_loading, p_create_pdf_ind, p_recreate, p_create_json, p_pog_version, p_save_pdf, p_camera, p_scene, p_pog_index, p_orgPogIndex, p_ImageLoadInd = "N", p_UpdateIndex = "N", p_old_POGJSON = []) {
    logDebug("function : create_module_from_json", "S");
    try {
        typeof p_save_pdf == "undefined" ? "Y" : p_save_pdf;
        load_orientation_json();

        //Start ASA-1371_26842
        if ($v('P193_POGCR_DFT_NOTCH_LABEL') == "Y") {
            g_show_notch_label = 'Y';
        }
        if ($v('P193_POGCR_DFT_FIXEL_LABEL') == "Y") {
            g_show_fixel_label = 'Y';
        }
        if ($v('P193_POGCR_SHOW_DFLT_ITEM_LOC') == "Y") {
            g_show_item_label = 'Y';
        }
        console.log("create_module_from_json:start", { p_pog_index: p_pog_index, g_canvas_objects_len: g_canvas_objects ? g_canvas_objects.length : 0, g_scene_objects_len: g_scene_objects ? g_scene_objects.length : 0, has_p_camera: typeof p_camera !== 'undefined', has_p_scene: typeof p_scene !== 'undefined' });
        console.log("value", p_pog_json_arr,
            p_new_pog_ind,
            p_pog_type,
            p_product_open,
            p_pog_opened,
            p_recreate,
            p_create_json,
            $v("P193_VDATE"),
            $v("P193_POG_POG_DEFAULT_COLOR"),
            $v("P193_POG_MODULE_DEFAULT_COLOR"),
            p_pog_version,
            true,
            "N",
            null,
            $v("P193_POGCR_DFT_SPREAD_PRODUCT"),
            parseFloat($v("P193_PEGB_DFT_HORIZ_SPACING")),
            parseFloat($v("P193_PEGBOARD_DFT_VERT_SPACING")),
            parseFloat($v("P193_BASKET_DFT_WALL_THICKNESS")),
            parseFloat($v("P193_CHEST_DFT_WALL_THICKNESS")),
            $v("P193_POGCR_PEGB_MAX_ARRANGE"),
            $v("P193_POGCR_DEFAULT_WRAP_TEXT"),
            parseInt($v("P193_POGCR_TEXT_DEFAULT_SIZE")),
            $v("P193_POG_TEXTBOX_DEFAULT_COLOR"),
            $v("P193_POG_SHELF_DEFAULT_COLOR"),
            $v("P193_DIV_COLOR"),
            $v("P193_SLOT_DIVIDER"),
            $v("P193_SLOT_ORIENTATION"),
            $v("P193_DIVIDER_FIXED"),
            $v("P193_POG_ITEM_DEFAULT_COLOR"),
            $v("P193_POGCR_DELIST_ITEM_DFT_COL"),
            g_peg_holes_active,
            $v("P193_POG_CP_SHELF_DFLT_COLOR"),
            3,
            $v("P193_MERCH_STYLE"),
            $v("P193_POGCR_LOAD_IMG_FROM"),
            $v("P193_BU_ID"),
            $v("P193_POGCR_DELIST_ITEM_DFT_COL"),
            $v("P193_POGCR_ITEM_NUM_LBL_COLOR"),
            $v("P193_POGCR_DISPLAY_ITEM_INFO"),
            $v("P193_POGCR_ITEM_NUM_LBL_COLOR"),
            $v("P193_POGCR_ITEM_NUM_LABEL_POS"),
            $v("P193_NOTCH_HEAD"),
            "N",
            $v("P193_POGCR_DFT_BASKET_FILL"),
            $v("P193_POGCR_DFT_BASKET_SPREAD"),
            p_camera,
            p_pog_index,
            p_orgPogIndex,
            $v('P193_POGCR_NOTCH_START_VALUE'),
            $v('P193_POGCR_MANUAL_CRUSH_ITEM'),
            'Y', //ASA-1310 KUSH FIX
            "");

        
        await create_module_from_json_lib(
            p_pog_json_arr,
            p_new_pog_ind,
            p_pog_type,
            p_product_open,
            p_pog_opened,
            p_recreate,
            p_create_json,
            $v("P193_VDATE"),
            $v("P193_POG_POG_DEFAULT_COLOR"),
            $v("P193_POG_MODULE_DEFAULT_COLOR"),
            p_pog_version,
            true,
            "N",
            null,
            $v("P193_POGCR_DFT_SPREAD_PRODUCT"),
            parseFloat($v("P193_PEGB_DFT_HORIZ_SPACING")),
            parseFloat($v("P193_PEGBOARD_DFT_VERT_SPACING")),
            parseFloat($v("P193_BASKET_DFT_WALL_THICKNESS")),
            parseFloat($v("P193_CHEST_DFT_WALL_THICKNESS")),
            $v("P193_POGCR_PEGB_MAX_ARRANGE"),
            $v("P193_POGCR_DEFAULT_WRAP_TEXT"),
            parseInt($v("P193_POGCR_TEXT_DEFAULT_SIZE")),
            $v("P193_POG_TEXTBOX_DEFAULT_COLOR"),
            $v("P193_POG_SHELF_DEFAULT_COLOR"),
            $v("P193_DIV_COLOR"),
            $v("P193_SLOT_DIVIDER"),
            $v("P193_SLOT_ORIENTATION"),
            $v("P193_DIVIDER_FIXED"),
            $v("P193_POG_ITEM_DEFAULT_COLOR"),
            $v("P193_POGCR_DELIST_ITEM_DFT_COL"),
            g_peg_holes_active,
            $v("P193_POG_CP_SHELF_DFLT_COLOR"),
            3,
            $v("P193_MERCH_STYLE"),
            $v("P193_POGCR_LOAD_IMG_FROM"),
            $v("P193_BU_ID"),
            $v("P193_POGCR_DELIST_ITEM_DFT_COL"),
            $v("P193_POGCR_ITEM_NUM_LBL_COLOR"),
            $v("P193_POGCR_DISPLAY_ITEM_INFO"),
            $v("P193_POGCR_ITEM_NUM_LBL_COLOR"),
            $v("P193_POGCR_ITEM_NUM_LABEL_POS"),
            $v("P193_NOTCH_HEAD"),
            "N",
            $v("P193_POGCR_DFT_BASKET_FILL"),
            $v("P193_POGCR_DFT_BASKET_SPREAD"),
            p_camera,
            p_pog_index,
            p_orgPogIndex,
            $v('P193_POGCR_NOTCH_START_VALUE'),
            $v('P193_POGCR_MANUAL_CRUSH_ITEM'),
            'Y', //ASA-1310 KUSH FIX
            ""); //Regression 29(Portal Issue) added p_calc_dayofsupply
        console.log("create_module_from_json:done", { p_pog_index: p_pog_index, g_pog_json_len: g_pog_json ? g_pog_json.length : 0 });
        
        g_pog_json[p_pog_index].MassUpdate = "N"; //ASA-1809, Set this to N, as for saving POG draft or existing the coordinates in JSON has been update with respect to WPD

        //This after refresh event is needed because Division/Dept/Subdept are cascading LOV and setting value is always removed by refresh
        //due to setting value to master page item.
        $("#P193_POG_SUBDEPT").on("apexafterrefresh", function () {
            if (typeof g_pog_json[p_pog_index] != "undefined")
                apex.item(this).setValue(g_pog_json[p_pog_index].SubDept);
        });
        $("#P193_POG_DEPT").on("apexafterrefresh", function () {
            if (typeof g_pog_json[p_pog_index] != "undefined")
                apex.item(this).setValue(g_pog_json[p_pog_index].Dept);
        });

        apex.item("P193_POG_DIVISION").setValue(g_pog_json[p_pog_index].Division);        
        if (p_recreate == "Y") {
            //this is the function will store the g_pog_json into a backup array for recreating the POG in any error.
            if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
                backupPog("F", -1, -1, p_pog_index);
            }                     
        }
        if (g_ItemImages.length > 0 && g_show_live_image == "Y" && p_recreate == 'Y') {
            try {
                if (p_create_pdf_ind == "N" && p_product_open == "N" && $v("P193_POGCR_DFT_ITEM_DESC") == "N" && p_ImageLoadInd == "N") {
                    var return_val = await recreate_image_items("Y", $v("P193_MERCH_STYLE"), $v("P193_POGCR_LOAD_IMG_FROM"), $v("P193_BU_ID"), $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_ITEM_NUM_LABEL_POS"), $v("P193_POGCR_DISPLAY_ITEM_INFO"), $v("P193_POGCR_DELIST_ITEM_DFT_COL"), $v("P193_NOTCH_HEAD"), p_pog_index, g_show_days_of_supply, $v("P193_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label);
                    g_imagesShown = "Y";
                }
            } catch (err) {
                error_handling(err);
            }
        }
        if (g_isPogItemsSet == "N") {
            set_pog_page_items(p_pog_index);
        }
        //ASA-1652 #3 Start
        var modIdx = 0;
        for (const modInfo of g_pog_json[p_pog_index].ModuleInfo) {
            if (typeof modInfo.ParentModule == "undefined" || modInfo.ParentModule == null) {
                var shelfIdx = 0;
                for (const shelf of modInfo.ShelfInfo) {
                    if (shelf.ObjType == "TEXTBOX") {
                        var selObj = g_world.getObjectById(g_pog_json[p_pog_index].ModuleInfo[modIdx].ShelfInfo[shelfIdx].SObjID);
                        //Regression Issue 7 20250117, added if condition
                        if (typeof selObj !== "undefined") {
                            selObj['ShelfInfo'] = g_pog_json[p_pog_index].ModuleInfo[modIdx].ShelfInfo[shelfIdx];
                            textboxPriorityPlacing(selObj, p_pog_index, g_pog_json[p_pog_index].ModuleInfo[modIdx].ShelfInfo[shelfIdx].Z);
                        }
                    }
                    shelfIdx++;
                }
            }
            modIdx++;
        }
    } catch (err) {
        error_handling(err);
    }
     logDebug("function : create_module_from_json", "E");
    return "SUCCESS";
}
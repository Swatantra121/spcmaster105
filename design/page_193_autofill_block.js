// This  file is used to all function related to Block autofill activity.

// Block Js
async function update_module_block_list(p_action_ind, p_old_blk_name, p_escape_ind = "N") {
   var block_detail = {};
   var filters_arr = [];
   var attr_arr = [];
   var filter_val = [];
   var blk_name_arr = [];
   var upd_block_dtl = {};
   var blockName = $v(g_page_no + "BLK_NAME") + "_AFP";
   if (p_escape_ind == "Y") {
      var block_details_arr = [];
      for (const obj of g_mod_block_list) {
         var details = {};
         details["BlkColor"] = obj.BlkColor;
         details["BlkName"] = obj.BlkName;
         details["BlkRule"] = obj.BlkRule;
         details["BlkFilters"] = obj.BlockFilters.join(" AND ");
         details["OldBlkName"] = obj.BlkName;
         obj["BlkFilters"] = details["BlkFilters"];
         block_details_arr.push(details);
      }
      closeInlineDialog("block_details");
      var retval = await save_blk_dtl_coll(p_action_ind, p_old_blk_name, block_details_arr);
   } else {
      if (p_old_blk_name == blockName && p_action_ind == "U") {
         blk_name_arr = [];
      } else {
         blk_name_arr = [blockName];
      }
      block_detail["BlkName"] = blockName;
      block_detail["BlkColor"] = $v(g_page_no + "BLK_COLOR");
      block_detail["BlkRule"] = $v(g_page_no + "BLK_RULE");
      var shelf_arr = [];
      var mod_index = [];
      var final_shelf_arr = [];
      if (p_action_ind !== "U") {
         var mod_ind = -1;
         for (const objects of g_delete_details) {
            if (objects.ObjType !== "TEXTBOX") {
               shelf_arr.push(objects);
               if (mod_ind !== objects.MIndex) {
                  mod_index.push(objects.MIndex);
               }
               objects.BlkName = block_detail["BlkName"];
               mod_ind = objects.MIndex;
            }
         }
         mod_index.sort();
         if (g_mod_block_list.length > 0) {
            for (const shelfs of shelf_arr) {
               var valid = true;
               for (const obj of g_mod_block_list) {
                  if (!valid) break;
                  for (const dtl of obj.g_delete_details) {
                     if (shelfs.MIndex == dtl.MIndex && shelfs.SIndex == dtl.SIndex) {
                        valid = false;
                        break;
                     }
                  }
               }
               if (valid) final_shelf_arr.push(shelfs);
            }
         } else {
            final_shelf_arr = shelf_arr;
         }
      } else {
         for (const obj of g_mod_block_list) {
            if (obj.BlkName == p_old_blk_name) {
               final_shelf_arr = obj.g_delete_details;
               mod_index = obj.mod_index;
               block_detail["DragMouseStart"] = obj.DragMouseStart;
               block_detail["DragMouseEnd"] = obj.DragMouseEnd;
               break;
            }
         }
         for (const obj of final_shelf_arr) {
            obj.BlkName = block_detail["BlkName"];
         }
         g_DragMouseStart = block_detail["DragMouseStart"];
         g_DragMouseEnd = block_detail["DragMouseEnd"];
      }
      block_detail["g_delete_details"] = final_shelf_arr;
      var model = apex.region("block_filters").widget().interactiveGrid("getViews", "grid").model;
      model.forEach(function(record) {
         var filters = typeof model.getValue(record, "FILTER") == "object" ? model.getValue(record, "FILTER").v : model.getValue(record, "FILTER");
         var value = model.getValue(record, "VALUE");
         filter_val.push(filters + "#" + value);
         if (filters !== "") {
            var filter_list = filters.split("-");
            attr_arr.push(filter_list[0]);
            filters_arr.push(filter_list[0] + " = " + (filter_list[1] == "C" ? '"' : "") + value + (filter_list[1] == "C" ? '"' : ""));
         }
      });
      for (const obj of g_mod_block_list) {
         blk_name_arr.push(obj.BlkName);
      }
      var blk_dup = findDuplicates(blk_name_arr);
      var dup_arr = findDuplicates(attr_arr);
      if (blk_dup.length > 0) {
         alert(get_message("POGCR_BLK_DUP"));
      } else if (dup_arr.length > 0) {
         alert(get_message("POGCR_DUP_REC_FOUND"));
      } else if (attr_arr.includes("SUBCLASS") && (!attr_arr.includes("CLASS") || !attr_arr.includes("DEPT"))) {
         alert(get_message("POGCR_DEPT_CLASS_MANDATE"));
      } else if (attr_arr.includes("CLASS") && !attr_arr.includes("DEPT")) {
         alert(get_message("POGCR_DEPT_MANDATE"));
      } else {
         block_detail["BlockFilters"] = filters_arr;
         block_detail["FilterVal"] = filter_val;
         block_detail["mod_index"] = mod_index;
         if (p_action_ind == "U") {
            for (const obj of g_mod_block_list) {
               if (obj.BlkName == p_old_blk_name) {
                  for (const child of obj.BlockDim.ColorObj.children) {
                     if (child.uuid == p_old_blk_name) {
                        obj.BlockDim.ColorObj.remove(child);
                        break;
                     }
                  }
               }
            }
            var i = 0;
            for (const obj of g_mod_block_list) {
               if (obj.BlkName == p_old_blk_name) {
                  upd_block_dtl = JSON.parse(JSON.stringify(obj));
                  g_mod_block_list.splice(i, 1);
               }
               i++;
            }
         }
         apex.region("block_filters").widget().interactiveGrid("getActions").set("edit", false);
         apex.region("block_filters").widget().interactiveGrid("getViews", "grid").model.clearChanges();
         apex.region("block_filters").refresh();
         clear_blinking();
         var ret_dtl = await colorAutofillBlock(g_DragMouseStart, g_DragMouseEnd, mod_index, $v(g_page_no + "BLK_COLOR"), blockName, p_action_ind, upd_block_dtl, g_pog_index, "N");
         block_detail["BlockDim"] = ret_dtl;
         g_mod_block_list.push(block_detail);
         closeInlineDialog("block_details");
         if (p_action_ind == "U") {
            var block_details_arr = [];
            for (const obj of g_mod_block_list) {
               if (obj.BlkName !== blockName && obj.BlkName !== p_old_blk_name) {
                  var details = {};
                  details["BlkColor"] = obj.BlkColor;
                  details["BlkName"] = obj.BlkName;
                  details["BlkRule"] = obj.BlkRule;
                  details["BlkFilters"] = obj.BlockFilters.join(" AND ");
                  details["OldBlkName"] = obj.BlkName;
                  obj["BlkFilters"] = details["BlkFilters"];
                  block_details_arr.push(details);
               } else if (obj.BlkName == p_old_blk_name || obj.BlkName == blockName) {
                  var details = {};
                  details["BlkColor"] = $v(g_page_no + "BLK_COLOR");
                  details["BlkName"] = blockName;
                  details["BlkRule"] = $v(g_page_no + "BLK_RULE");
                  details["BlkFilters"] = filters_arr.join(" AND ");
                  details["OldBlkName"] = p_old_blk_name;
                  obj["BlkFilters"] = details["BlkFilters"];
                  block_details_arr.push(details);
               }
            }
            var retval = await save_blk_dtl_coll(p_action_ind, p_old_blk_name, block_details_arr);
         } else if (p_action_ind == "Y" || p_action_ind == "A") {
            var block_details_arr = [];
            for (const obj of g_mod_block_list) {
               var details = {};
               details["BlkColor"] = obj.BlkColor;
               details["BlkName"] = obj.BlkName;
               details["BlkRule"] = obj.BlkRule;
               details["BlkFilters"] = obj.BlockFilters.join(" AND ");
               obj["BlkFilters"] = details["BlkFilters"];
               block_details_arr.push(details);
            }
            var retval = await save_blk_dtl_coll(p_action_ind, p_old_blk_name, block_details_arr);
         }
      }
   }
}


function normalize_block_name(p_blk_name) {
   if (typeof p_blk_name !== "string" || p_blk_name === "") {
      return "Block";
   }
   return p_blk_name.endsWith("_AFP") ? p_blk_name.slice(0, -4) : p_blk_name;
}

//ASA-1697 - Start
function getAutofillModShelf(p_dragMouseStart, p_dragMouseEnd, p_pog_json, p_pog_index, p_action_ind) {
    logDebug("function : getAutofillModShelf", "S");
    try {
        var dragStart = wpdSetFixed(Math.min(p_dragMouseStart.x, p_dragMouseEnd.x));
        var dragEnd = wpdSetFixed(Math.max(p_dragMouseStart.x, p_dragMouseEnd.x));
        var dragTop = wpdSetFixed(Math.max(p_dragMouseStart.y, p_dragMouseEnd.y));
        var dragBottom = wpdSetFixed(Math.min(p_dragMouseStart.y, p_dragMouseEnd.y));

        var selectedModule = [];
        var overlappingShelfs = [];
        var maxOverlapWidth = 0;
        var idx = 0;
        for (const module of p_pog_json[p_pog_index].ModuleInfo) {
            if (module.ParentModule == null) {
                const modStart = wpdSetFixed(module.X - module.W / 2);
                const modEnd = wpdSetFixed(module.X + module.W / 2);
                const modTop = wpdSetFixed(module.Y + module.H / 2);
                const modBottom = wpdSetFixed(module.Y - module.H / 2);

                const adjustedDragStart = Math.max(dragStart, modStart);
                const adjustedDragEnd = Math.min(dragEnd, modEnd);
                const adjustedDragTop = Math.min(dragTop, modTop);
                const adjustedDragBottom = Math.max(dragBottom, modBottom);

                if (adjustedDragStart < adjustedDragEnd && adjustedDragBottom < adjustedDragTop) {
                    const overlapWidth = adjustedDragEnd - adjustedDragStart;

                    if (overlapWidth > maxOverlapWidth) {
                        maxOverlapWidth = overlapWidth;
                        selectedModule[0] = {
                            moduleInfo: module,
                            dragStart: adjustedDragStart, dragEnd: adjustedDragEnd, dragTop: adjustedDragTop, dragBottom: adjustedDragBottom,
                            modStart: modStart, modEnd: modEnd, modTop: modTop, modBottom: modBottom,
                            modIdx: idx
                        };
                    }
                }
            }
            idx++;
        }
        idx = 0;
        if (selectedModule.length > 0) {
            for (const blkInfo of g_mod_block_list) {
                //ASA-1986 start
                if (
                    typeof blkInfo === "undefined" || blkInfo == null || typeof blkInfo.BlkModInfo === "undefined" || blkInfo.BlkModInfo == null || blkInfo.BlkModInfo.length == 0 || typeof blkInfo.BlkModInfo[0] === "undefined" || blkInfo.BlkModInfo[0] == null || typeof blkInfo.BlockDim === "undefined" || blkInfo.BlockDim == null || typeof blkInfo.BlockDim.FinalTop === "undefined" || typeof blkInfo.BlockDim.FinalBtm === "undefined"
                ) {
                    continue;
                } //ASA-1986  end 
                const prevBlk = blkInfo.BlkModInfo[0];
                if (typeof prevBlk.dragStart === "undefined" || typeof prevBlk.dragEnd === "undefined") { //ASA-1986 start
                    continue;
                }
                // if (prevBlk.dragStart < selectedModule[0].dragEnd && prevBlk.dragEnd > selectedModule[0].dragStart && prevBlk.dragTop > selectedModule[0].dragBottom && prevBlk.dragBottom < selectedModule[0].dragTop) {
                if (prevBlk.dragStart < selectedModule[0].dragEnd && prevBlk.dragEnd > selectedModule[0].dragStart && blkInfo.BlockDim.FinalTop > selectedModule[0].dragBottom && blkInfo.BlockDim.FinalBtm < selectedModule[0].dragTop) {  //ASA-1878
                    // normalize block and selection top/bottom so direction (top->bottom or bottom->top)
                    // does not affect the overlap test


                    // if(selectedModule[0].dragTop <= blkInfo.BlockDim.FinalBtm && selectedModule[0].dragBottom >= blkInfo.BlockDim.FinalBtm){
                    //     selectedModule[0].dragTop = blkInfo.BlockDim.FinalBtm;
                    // } 

                    // if(selectedModule[0].dragBottom <= blkInfo.BlockDim.FinalTop && selectedModule[0].dragTop >= blkInfo.BlockDim.FinalTop){
                    //     selectedModule[0].dragBottom = blkInfo.BlockDim.FinalTop;
                    // }

                    if (prevBlk.dragEnd > selectedModule[0].dragStart && prevBlk.dragEnd < selectedModule[0].dragEnd) {
                        selectedModule[0].dragStart = prevBlk.dragEnd;
                    }
                    if (prevBlk.dragStart < selectedModule[0].dragEnd && selectedModule[0].dragStart < prevBlk.dragStart) {
                        selectedModule[0].dragEnd = prevBlk.dragStart;
                    }

                    if (selectedModule[0].dragStart >= prevBlk.dragStart && selectedModule[0].dragEnd <= prevBlk.dragEnd
                        // && selectedModule[0].dragTop <= blkInfo.BlockDim.FinalTop && selectedModule[0].dragBottom >= blkInfo.BlockDim.FinalBtm
                    ) {
                        selectedModule = [];
                        overlappingShelfs = [];
                        return [selectedModule, overlappingShelfs];
                    }
                    g_DragMouseStart.x = selectedModule[0].dragStart;
                    // g_DragMouseStart.y = selectedModule[0].dragTop;
                    g_DragMouseEnd.x = selectedModule[0].dragEnd;
                    // g_DragMouseEnd.y = selectedModule[0].dragBottom; 
                }
            }


            for (const shelf of selectedModule[0].moduleInfo.ShelfInfo) {
                if (shelf.ObjType != 'TEXTBOX' && shelf.ObjType != 'DIVIDER' && shelf.ObjType != 'BASE' && shelf.ObjType != 'DIVIDER') {
                    const shelfStart = wpdSetFixed(shelf.X - shelf.W / 2);
                    const shelfEnd = wpdSetFixed(shelf.X + shelf.W / 2);
                    const shelfTop = wpdSetFixed(shelf.Y + shelf.H / 2);
                    const shelfBottom = wpdSetFixed(shelf.Y - shelf.H / 2);
                    if (dragStart < shelfEnd && dragEnd > shelfStart && dragTop > shelfBottom && dragBottom < shelfTop) {
                        const overlapWidth = Math.min(dragEnd, shelfEnd) - Math.max(dragStart, shelfStart);
                        overlappingShelfs.push({ ShelfInfo: shelf, OverlapWidth: overlapWidth, ShelfIdx: idx });
                    }
                }
                idx++;
            }
        } else {
            selectedModule = [];
            overlappingShelfs = [];
        }
        logDebug("function : getAutofillModShelf", "E");
        return [selectedModule, overlappingShelfs];
    } catch (err) {
        error_handling(err);
    }
}

async function setAutofillBlock(p_action_ind, p_old_blk_name, p_escape_ind = "N", p_new_ind = 'Y', p_color = '#ffffff', p_filters = '') {
    logDebug("function : setAutofillBlock", "S");
    try {
        // Multiselect update: EDIT_BLK contains colon-separated block names — delegate and return
        if (p_action_ind === "U" && g_multiselect === "Y" && p_old_blk_name && p_old_blk_name.indexOf(":") !== -1) {
            await update_multiselect_blk_filter(p_old_blk_name);
            return;
        }
        var block_detail = {};
        var filters_arr = [];
        var attr_arr = [];
        var filter_val = [];
        var blk_name_arr = [];
        var upd_block_dtl = {};

        var blockName = (p_action_ind !== "U" && (p_old_blk_name === "" || p_old_blk_name == null))
            ? $v("P193_BLK_NAME")?.toUpperCase() + "_AFP"
            : p_old_blk_name?.toUpperCase();

        if (p_escape_ind == "Y") {
            var block_details_arr = [];
            for (const obj of g_mod_block_list) {
                var details = {};
                details["BlkColor"] = obj.BlkColor.toUpperCase();
                details["BlkName"] = obj.BlkName.toUpperCase();
                details["BlkRule"] = obj.BlkRule;
                details["BlkShelfInfo"] = obj.BlkShelfInfo;
                details["BlkFilters"] = obj.BlockFilters.join(" AND ");
                details["OldBlkName"] = obj.BlkName.toUpperCase();
                obj["BlkFilters"] = details["BlkFilters"];
                block_details_arr.push(details);
            }
            closeInlineDialog("block_details");
            var retval = await save_blk_dtl_coll(p_action_ind, p_old_blk_name?.toUpperCase(), block_details_arr);
        }

        if (p_old_blk_name?.toUpperCase() == blockName && p_action_ind == "U") {
            blk_name_arr = [];
        } else {
            blk_name_arr = [blockName];
        }

        block_detail["BlkName"] = blockName;
        if (p_new_ind == 'N') {
            block_detail["BlkColor"] = p_color.toUpperCase();
        } else {
            block_detail["BlkColor"] = $v("P193_BLK_COLOR").toUpperCase();
        }
        block_detail["BlkRule"] = $v("P193_BLK_RULE");

        var shelf_arr = [];
        var mod_index = [];
        var final_shelf_arr = [];

        if (p_action_ind !== "U" && (!Array.isArray(g_autofillModInfo) || g_autofillModInfo.length == 0 || !Array.isArray(g_autofillShelfInfo) || g_autofillShelfInfo.length == 0)) {
            return false;
        }

        if (p_action_ind !== "U") {
            block_detail["DragMouseStart"] = g_DragMouseStart;
            block_detail["DragMouseEnd"] = g_DragMouseEnd;
            block_detail["BlkModInfo"] = g_autofillModInfo;
            block_detail["BlkShelfInfo"] = g_autofillShelfInfo;
            for (const shelf of g_autofillShelfInfo) {
                shelf.ShelfInfo.BlkName = blockName;
                shelf.ShelfInfo.MIndex = g_autofillModInfo[0].modIdx;
                shelf.ShelfInfo.SIndex = shelf.ShelfIdx;
                shelf_arr.push(shelf.ShelfInfo);
            }
            mod_index.push(g_autofillModInfo[0].modIdx);
            mod_index.sort();
            final_shelf_arr = shelf_arr;
        } else {
            for (const obj of g_mod_block_list) {
                if (obj.BlkName.toUpperCase() == p_old_blk_name?.toUpperCase()) {
                    final_shelf_arr = obj.g_delete_details;
                    mod_index = obj.mod_index;
                    block_detail["DragMouseStart"] = obj.DragMouseStart;
                    block_detail["DragMouseEnd"] = obj.DragMouseEnd;
                    break;
                }
            }
            for (const obj of final_shelf_arr) {
                obj.BlkName = block_detail["BlkName"];
            }
            g_DragMouseStart = block_detail["DragMouseStart"];
            g_DragMouseEnd = block_detail["DragMouseEnd"];
        }

        block_detail["g_delete_details"] = final_shelf_arr;

        if (p_new_ind != 'N') {
            var model = apex.region("block_filters").widget().interactiveGrid("getViews", "grid").model;
            model.forEach(function (record) {
                var filters = typeof model.getValue(record, "FILTER") == "object" ? model.getValue(record, "FILTER").v : model.getValue(record, "FILTER");
                var value = model.getValue(record, "VALUE");
                filter_val.push(filters + "#" + value);
                if (filters !== "") {
                    var filter_list = filters.split("-");
                    attr_arr.push(filter_list[0]);
                    filters_arr.push(filter_list[0] + " = " + (filter_list[1] == "C" ? '"' : "") + value + (filter_list[1] == "C" ? '"' : ""));
                }
            });
        } else if (p_new_ind == 'N' && p_filters != '') {
            p_filters.replace(/[\[\]]/g, "").split(",").forEach(function (f) {

                let [col, val] = f.split("=").map(s => s.trim());

                if (col) {
                    col = col.toUpperCase();
                    val = val.replace(/'/g, "");

                    // For SQL style filter
                    filters_arr.push(col + '="' + val + '"');

                    // For internal value storage
                    filter_val.push(col + "#" + val);
                }

            });
        }

        for (const obj of g_mod_block_list) {
            blk_name_arr.push(obj.BlkName.toUpperCase());
        }

        var blk_dup = findDuplicates(blk_name_arr);
        var dup_arr = findDuplicates(attr_arr);

        if (blk_dup.length > 0) {
            alert(get_message("POGCR_BLK_DUP"));
        } else if (dup_arr.length > 0) {
            alert(get_message("POGCR_DUP_REC_FOUND"));
        } else if (attr_arr.includes("SUBCLASS") && (!attr_arr.includes("CLASS") || !attr_arr.includes("DEPT"))) {
            alert(get_message("POGCR_DEPT_CLASS_MANDATE"));
        } else if (attr_arr.includes("CLASS") && !attr_arr.includes("DEPT")) {
            alert(get_message("POGCR_DEPT_MANDATE"));
        } else {
            if (p_new_ind == 'N' && p_filters != '') {
                // var formattedFilters = BlkFilters
                //   .split(" AND ")
                //   .map(function(f){
                //       var parts = f.split("#");
                //       return parts[0].toUpperCase() + ' = "' + parts[1] + '"';
                //   })
                //  .join(" AND ");
                block_detail["BlockFilters"] = filters_arr;
            } else {
                block_detail["BlockFilters"] = filters_arr;
            }
            block_detail["FilterVal"] = filter_val;
            block_detail["mod_index"] = mod_index;

             /*if (p_action_ind == "U") {
                for (const obj of g_mod_block_list) {
                    if (obj.BlkName.toUpperCase() == p_old_blk_name?.toUpperCase()) {
                        for (const child of obj.BlockDim.ColorObj.children) {
                            if (child.uuid.toUpperCase() == p_old_blk_name?.toUpperCase()) {
                                obj.BlockDim.ColorObj.remove(child);
                                break;
                            }
                        }
                    }
                }
                var i = 0;
                for (const obj of g_mod_block_list) {
                    if (obj.BlkName.toUpperCase() == p_old_blk_name?.toUpperCase()) {
                        upd_block_dtl = JSON.parse(JSON.stringify(obj));
                        g_mod_block_list.splice(i, 1);
                    }
                    i++;
                }
            }*/
            let updIndex = -1;

            if (p_action_ind == "U") {
                var i = 0;
                for (const obj of g_mod_block_list) {
                    if (obj.BlkName == p_old_blk_name) {
                        block_detail["BlkShelfInfo"] = obj.BlkShelfInfo;
                        upd_block_dtl = JSON.parse(JSON.stringify(obj));
                        updIndex = i;              //store index
                        break;
                    }
                    i++;
                }
            }

            if (p_new_ind != 'N') {
                apex.region("block_filters").widget().interactiveGrid("getActions").set("edit", false);
                apex.region("block_filters").widget().interactiveGrid("getViews", "grid").model.clearChanges();
                apex.region("block_filters").refresh();
                clear_blinking();
            }

            var sendColor = (p_new_ind == 'N') ? p_color.toUpperCase() : $v("P193_BLK_COLOR").toUpperCase();
            var ret_dtl = await colorAutofillBlock(g_DragMouseStart, g_DragMouseEnd, mod_index, sendColor, blockName, p_action_ind, upd_block_dtl, g_pog_index);

            if (typeof ret_dtl === "undefined" || ret_dtl == null) {
                return false;
            }

            block_detail["BlockDim"] = ret_dtl; 
            if (p_action_ind == "U" && updIndex > -1) {
                g_mod_block_list[updIndex] = block_detail;   // SAME INDEX
            } else {
                g_mod_block_list.push(block_detail);
            }
            closeInlineDialog("block_details");

            if (p_action_ind == "U") {
                var block_details_arr = [];
                for (const obj of g_mod_block_list) {
                    if (obj.BlkName.toUpperCase() !== blockName && obj.BlkName.toUpperCase() !== p_old_blk_name?.toUpperCase()) {
                        var details = {};
                        details["BlkColor"] = obj.BlkColor.toUpperCase();
                        details["BlkName"] = obj.BlkName.toUpperCase();
                        details["BlkRule"] = obj.BlkRule;
                        details["BlkShelfInfo"] = obj.BlkShelfInfo;
                        details["BlkFilters"] = obj.BlockFilters.join(" AND ");
                        details["OldBlkName"] = obj.BlkName.toUpperCase();
                        obj["BlkFilters"] = details["BlkFilters"];
                        block_details_arr.push(details);
                    } else if (obj.BlkName.toUpperCase() == p_old_blk_name?.toUpperCase() || obj.BlkName.toUpperCase() == blockName) {
                        var details = {};
                        details["BlkColor"] = $v("P193_BLK_COLOR").toUpperCase();
                        details["BlkName"] = blockName;
                        details["BlkRule"] = $v("P193_BLK_RULE");
                        details["BlkShelfInfo"] = obj.BlkShelfInfo
                        details["BlkFilters"] = filters_arr.join(" AND ");
                        details["OldBlkName"] = p_old_blk_name?.toUpperCase();
                        obj["BlkFilters"] = details["BlkFilters"];
                        block_details_arr.push(details);
                    }
                }
                var retval = await save_blk_dtl_coll(p_action_ind, p_old_blk_name?.toUpperCase(), block_details_arr);
                apex.region("mod_block_details").refresh();

            } else if (p_action_ind == "Y") {
                var block_details_arr = [];
                for (const obj of g_mod_block_list) {
                    var details = {};
                    details["BlkColor"] = obj.BlkColor.toUpperCase();
                    details["BlkName"] = obj.BlkName.toUpperCase();
                    details["BlkRule"] = obj.BlkRule;
                    details["BlkShelfInfo"] = obj.BlkShelfInfo;
                    details["BlkFilters"] = obj.BlockFilters.join(" AND ");
                    obj["BlkFilters"] = details["BlkFilters"];
                    block_details_arr.push(details);
                }
                var retval = await save_blk_dtl_coll(p_action_ind, p_old_blk_name?.toUpperCase(), block_details_arr);
                apex.region("mod_block_details").refresh();

            } else if (p_action_ind == "A" && p_new_ind != 'N') {
                var block_details_arr = [];
                for (const obj of g_mod_block_list) {
                    var details = {};
                    details["BlkColor"] = obj.BlkColor.toUpperCase();
                    details["BlkName"] = obj.BlkName.toUpperCase();
                    details["BlkRule"] = obj.BlkRule;
                    details["BlkShelfInfo"] = obj.BlkShelfInfo;
                    details["BlkFilters"] = obj.BlockFilters.join(" AND ");
                    obj["BlkFilters"] = details["BlkFilters"];
                    block_details_arr.push(details);
                }
                var retval = await save_blk_dtl_coll(p_action_ind, p_old_blk_name?.toUpperCase(), block_details_arr);
                apex.region("mod_block_details").refresh();
                logDebug("function : setAutofillBlock", "E");
                return true;
            }
        }
    } catch (err) {
        error_handling(err);
        return false;
    }
}

async function colorAutofillBlock(p_dragMouseStart, p_dragMouseEnd, p_mod_index, p_color, p_text, p_update_flag, p_block_detail, p_pog_index, p_swapBlock, p_render_opts = null) {
    logDebug("function : colorAutofillBlock", "S");
    try {
        var i = 0;
        // ASA-1986 start
        var calc_x = 0,
            calc_y = 0,
            calc_width = 0,
            calc_height = 0;
        var font_size = parseInt($v("P193_POGCR_BLK_TXT_SIZE")) || (typeof P193_POGCR_BLK_TXT_SIZE !== "undefined" ? parseInt(P193_POGCR_BLK_TXT_SIZE) : 12) || 12;
        // if (!Array.isArray(g_autofillModInfo) || g_autofillModInfo.length == 0) {
        //     return null;
        // }
        if (!Array.isArray(p_mod_index) || p_mod_index.length == 0) {
            return null;
        }
        if (
            typeof g_pog_json[p_pog_index] === "undefined" ||
            g_pog_json[p_pog_index] == null ||
            typeof g_pog_json[p_pog_index].ModuleInfo === "undefined" ||
            typeof g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]] === "undefined"
        ) {
            return null;
        }
        // ASA-1986 end
        // var btm_y = g_autofillModInfo[0].dragBottom,
        //     top_y = g_autofillModInfo[0].dragTop;

        var btm_y = 0,
            top_y = 0;

        // var mod_top = g_autofillModInfo[0].modTop,
        //     mod_bottom = g_autofillModInfo[0].modBottom;

        var mod_top = 0,
            mod_bottom = 0;

        var l_shelf_details = g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].ShelfInfo;

        var final_btm = -1;
        var final_top = -1;

        if (p_update_flag !== "U") {

            if (!Array.isArray(g_autofillModInfo) || g_autofillModInfo.length == 0) {
                return null;
            }
            btm_y = g_autofillModInfo[0].dragBottom;
            top_y = g_autofillModInfo[0].dragTop;
            mod_top = g_autofillModInfo[0].modTop;
            mod_bottom = g_autofillModInfo[0].modBottom;
            final_btm = get_below_shelf(l_shelf_details, p_mod_index[0], btm_y, p_pog_index);
            final_top = get_above_shelf(l_shelf_details, p_mod_index[0], top_y, mod_top, p_pog_index);
            // ASA-1986 start
            var calc_height = final_top - final_btm;
            var calc_width = g_autofillModInfo[0].dragEnd - g_autofillModInfo[0].dragStart;
            var calc_x = g_autofillModInfo[0].dragStart + ((g_autofillModInfo[0].dragEnd - g_autofillModInfo[0].dragStart) / 2) - g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].X;
            // ASA-1986 End

            if (g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].Y < final_btm) {
                var diff = final_btm - g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].Y;
                calc_y = diff + calc_height / 2;
            } else {
                var diff = g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].Y - final_btm;
                calc_y = 0 - diff + calc_height / 2;
            }
        } else {
            calc_x = p_block_detail.BlockDim.CalcX;
            calc_y = p_block_detail.BlockDim.CalcY;
            calc_width = p_block_detail.BlockDim.BlkWidth;
            calc_height = p_block_detail.BlockDim.BlkHeight;
            final_top = p_block_detail.BlockDim.FinalTop;
            final_btm = p_block_detail.BlockDim.FinalBtm;
        }

        if (!Number.isFinite(calc_width) || !Number.isFinite(calc_height) || calc_width <= 0 || calc_height <= 0) {  // ASA-1986 start
            return null;
        }
        if (!Number.isFinite(calc_x) || !Number.isFinite(calc_y)) {  // ASA-1986 start
            return null;
        }
        var colorValue = parseInt(p_color.replace("#", "0x"), 16);
        var hex_decimal = new THREE.Color(colorValue);

        if (typeof p_text !== "string") {  // ASA-1986 start
            p_text = "BLK";
        }
        // if (p_text.endsWith("_AFP")) {  // ASA-1986 start
        //     p_text = p_text.slice(0, -4);
        // }

        var blockUuid = p_text.endsWith("_AFP") ? p_text : p_text + "_AFP";
        var blockLabel = p_text.endsWith("_AFP") ? p_text.slice(0, -4) : p_text;
        console.log("val", p_dragMouseStart, p_dragMouseEnd, p_mod_index[0], p_color, blockLabel);
        // console.log("val", p_dragMouseStart, p_dragMouseEnd, p_mod_index[0], p_color, p_text);
        console.log("calc_height", calc_width, calc_height, calc_y, final_top, mod_top, final_btm, mod_bottom);

        // let mesh = dcText(p_text, font_size, 0x000000, colorValue, calc_width, calc_height, "N", "N", "Arial", "", font_size, 0, -1, 4);
        // if (!mesh) { // ASA-1986 start
        //     return null;
        // }
        var mod_object = g_world.getObjectById(g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].MObjID);
        if (!mod_object || typeof mod_object.add !== "function") { // ASA-1986 start
            return null;
        }

         // Use the same rendering path as swap (refreshBlockLabelMesh) so initial creation
        refreshBlockLabelMesh(mod_object, blockLabel, p_color, calc_x, calc_y, calc_width, calc_height);
        var mesh = mod_object.getObjectByProperty("uuid", blockUuid);
        if (!mesh) { // ASA-1986 start
            return null;
        }

        
        render(p_pog_index);
        g_delete_details = [];
        g_mselect_drag = "N";
        var details = {};
        details["CalcX"] = calc_x;
        details["CalcY"] = calc_y;
        details["CalcZ"] = 0.009;
        details["BlkWidth"] = calc_width;
        details["BlkHeight"] = calc_height;
        details["ColorObj"] = mod_object;
        details["FinalTop"] = final_top;
        details["FinalBtm"] = final_btm;

        if (p_swapBlock == "Y") {
            g_DragMouseStart.x = p_dragMouseStart.x;
            g_DragMouseStart.y = p_dragMouseStart.y;
            g_DragMouseEnd.x = p_dragMouseEnd.x;
            g_DragMouseEnd.y = p_dragMouseEnd.y;
            await get_multiselect_obj(p_pog_index);
            p_block_detail.g_delete_details = [];
            for (shelfs of g_delete_details) {
                p_block_detail.g_delete_details.push(shelfs);
            }
            g_delete_details = [];
        }
        logDebug("function : colorAutofillBlock", "E");
        return details;
    } catch (err) {
        // error_handling(err);
        console.warn("colorAutofillBlock skipped due to invalid render state:", err); // ASA-1986 start
        return null;
    }

}

var g_current_highlighted_block = null;

function _getRenderableMesh(obj) {
    logDebug("function : _getRenderableMesh", "S");
    if (!obj) return null;
    if (obj.type === 'Mesh') return obj;
    if (obj.type === 'Group' || obj.type === 'Object3D') {
        // find first mesh child
        const mesh = obj.getObjectByProperty && obj.getObjectByProperty('type', 'Mesh');
        if (mesh) return mesh;
        // fallback: traverse children
        let found = null;
        obj.traverse((c) => {
            if (!found && c.type === 'Mesh') found = c;
        });
        return found;
    }
    logDebug("function : _getRenderableMesh", "E");
    return null;
}

function clearAutofillBlockHighlight() {
    logDebug("function : clearAutofillBlockHighlight", "S");
    try {
        if (!g_current_highlighted_block || !Array.isArray(g_mod_block_list)) return;
        for (const cObj of g_mod_block_list) {
            if (cObj.BlkName === g_current_highlighted_block && cObj.BlockDim && cObj.BlockDim.ColorObj) {
                var meshRoot = cObj.BlockDim.ColorObj.getObjectByProperty('uuid', g_current_highlighted_block);
                var mesh = _getRenderableMesh(meshRoot);
                if (mesh && mesh.userData && mesh.userData._outline) {
                    try {
                        // remove blink interval
                        if (mesh.userData._outlineInterval) {
                            clearInterval(mesh.userData._outlineInterval);
                            mesh.userData._outlineInterval = null;
                        }
                        // remove outline object
                        if (mesh.userData._outline && mesh.userData._outline.parent) {
                            mesh.userData._outline.parent.remove(mesh.userData._outline);
                        }
                        mesh.userData._outline = null;
                    } catch (e) {
                        console.warn(e);
                    }
                }
                break;
            }
        }
    } catch (err) {
        console.warn(err);
    } finally {
        g_current_highlighted_block = null;
        try { render(); } catch (e) { }
        logDebug("function : clearAutofillBlockHighlight", "E");
    }
}

function highlightAutofillBlock(p_uuid, p_pog_index) {
    logDebug("function : highlightAutofillBlock", "S");
    try {
        if (!p_uuid || !Array.isArray(g_mod_block_list)) return;
        // if another block is highlighted, clear it first
        if (g_current_highlighted_block && g_current_highlighted_block !== p_uuid) {
            clearAutofillBlockHighlight();
        }

        for (const cObj of g_mod_block_list) {
            if (cObj.BlkName === p_uuid && cObj.BlockDim && cObj.BlockDim.ColorObj) {
                var meshRoot = cObj.BlockDim.ColorObj.getObjectByProperty('uuid', p_uuid);
                var mesh = _getRenderableMesh(meshRoot);
                if (!mesh) return;

                // if outline already exists, ensure it's visible and return
                if (mesh.userData && mesh.userData._outline) {
                    mesh.userData._outline.visible = true;
                    g_current_highlighted_block = p_uuid;
                    render(p_pog_index);
                    return;
                }

                // create edges outline
                try {
                    var geom = null;
                    if (mesh.geometry) geom = mesh.geometry;
                    else {
                        // try to build from children geometry
                        geom = new THREE.Geometry();
                    }
                    var edges = new THREE.EdgesGeometry(geom);
                    var mat = new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 2 });
                    var outline = new THREE.LineSegments(edges, mat);

                    // make sure outline follows mesh transform
                    outline.position.set(0, 0, 0);
                    outline.rotation.set(0, 0, 0);
                    outline.scale.set(1, 1, 1);

                    // add outline as child so it inherits transforms
                    mesh.add(outline);

                    if (!mesh.userData) mesh.userData = {};
                    mesh.userData._outline = outline;

                    // blinking: toggle visibility
                    mesh.userData._outlineInterval = setInterval(function () {
                        try {
                            if (mesh.userData && mesh.userData._outline) {
                                mesh.userData._outline.visible = !mesh.userData._outline.visible;
                                try { render(p_pog_index); } catch (e) { }
                            }
                        } catch (e) { }
                    }, 500);

                    g_current_highlighted_block = p_uuid;
                    render(p_pog_index);
                } catch (e) {
                    console.warn(e);
                }
                break;
            }
        }
    } catch (err) {
        console.warn(err);
    }
    logDebug("function : highlightAutofillBlock", "E");
}
//ASA-1697 - End


async function auto_fill_setup(p_pog_index, p_af_version = "") {
    logDebug("function : auto_fill_setup", "S");
    console.log("pog json length", g_pog_json[p_pog_index], g_pog_json.length);
    return new Promise((resolve, reject) => {
        if (g_all_pog_flag == "N" || (g_all_pog_flag == "Y" && g_pog_json.length == 1)) {
        $s("P193_OPEN_POG_CODE", `${g_pog_json[p_pog_index].POGCode}`);
        $s("P193_OPEN_POG_VERSION", `${g_pog_json[p_pog_index].Version}`);
        if (g_auto_fill_active == "N" && typeof g_pog_json[p_pog_index] !== undefined && g_pog_json.length > 0) {
            apex.server.process("GET_AUTOFILL", {
            x01: $v("P193_OPEN_POG_CODE"),
            x02: $v("P193_OPEN_DRAFT") == "Y" ? $v("P193_EXISTING_DRAFT_VER") : $v("P193_OPEN_POG_VERSION"),
            x03: $v("P193_OPEN_DRAFT"),
            x04: p_af_version,
            }, {
            dataType: "json",
            success: async function(pData) {
                try {
                var return_data = $.trim(pData).split(",");
                if (return_data[0] == "ERROR") {
                    raise_error(pData);
                    resolve();
                    return;
                }
                var item_exists = false;
                var i = 0;
                for (const modules_info of g_pog_json[p_pog_index].ModuleInfo) {
                    if (item_exists) break;
                    if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
                    for (const shelf_info of modules_info.ShelfInfo) {
                        if (item_exists) break;
                        if (shelf_info.ObjType !== "BASE" && shelf_info.ObjType !== "NOTCH" && shelf_info.ObjType !== "DIVIDER" && shelf_info.ObjType !== "TEXTBOX") {
                        const items = Array.isArray(shelf_info.ItemInfo) ? shelf_info.ItemInfo : shelf_info.ItemInfo ? [shelf_info.ItemInfo] : [];
                        for (const item_info of items) {
                            if (item_info.Item !== "DIVIDER") {
                            item_exists = true;
                            break;
                            }
                        }
                        }
                    }
                    }
                    i++;
                }
                if (item_exists || p_af_version != "") {
                    async function doSomething() {
                    g_auto_fill_active = "Y";
                    $s("P193_BLOCK_SELECTION", "P");
                    g_undo_final_obj_arr = [];
                    g_redo_final_obj_arr = [];
                    g_prev_undo_action = "";
                    if (p_af_version == "") {
                        await clear_item("N", "N", p_pog_index);
                    }
                    g_undo_final_obj_arr = [];
                    g_redo_final_obj_arr = [];
                    g_auto_fill_reg_open = "Y";
                    if (typeof pData.AFVersion != "undefined" || typeof g_autofill_detail["AFVersion"] != "undefined") {
                        if (typeof g_autofill_detail["AFVersion"] == "undefined") {
                        g_autofill_detail["AFPOGCode"] = pData.AFPOGCode;
                        g_autofill_detail["AFPOGVersion"] = pData.AFPOGVersion;
                        g_autofill_detail["AFVersion"] = pData.AFVersion;
                        g_autofill_detail["BlkSelType"] = pData.AFType;
                        g_autofill_detail["AutofillRule"] = pData.AFRule;
                        g_autofill_detail["BlkInfo"] = JSON.parse(pData.AFJSON).BlkInfo;
                        }
                        $s("P193_BLOCK_SELECTION", g_autofill_detail.BlkSelType);
                        $s("P193_AF_VERSION", g_autofill_detail.AFVersion);
                        $s("P193_AUTOFILL_RULE", g_autofill_detail.AutofillRule);
                        if ($v("P193_BLOCK_SELECTION") == "M") {
                        g_mod_block_list = g_autofill_detail["BlkInfo"];
                        async function doSomething() {
                            for (const blkDet of g_mod_block_list) {
                            g_autofillModInfo = blkDet.BlkModInfo;
                            g_autofillShelfInfo = blkDet.BlkShelfInfo;
                            var retdtl = await colorAutofillBlock(blkDet["DragMouseStart"], blkDet["DragMouseEnd"], blkDet["mod_index"], blkDet["BlkColor"], blkDet["BlkName"], "U", blkDet, g_pog_index);
                            blkDet["BlockDim"] = retdtl;
                            }
                            g_autofill_detail["BlkInfo"] = g_mod_block_list;
                            await save_blk_dtl_coll("Y", "", g_mod_block_list);
                            g_mod_block_list = g_autofill_detail["BlkInfo"];
                            capture_changes_blk_snapshot(g_mod_block_list, p_af_version !== "" ? "Y" : "N"); //ASA-1986
                        }
                        await doSomething();
                        }
                    }
                    }
                    await doSomething();
                }
                resolve();
                } catch (err) {
                reject(err);
                }
            },
            error: function(err) {
                reject(err);
            },
            });
        } else {
            resolve();
        }
        } else {
        alert(get_message("POGCR_AUTOFILL_VALID"));
        resolve();
        }
    });
}

async function clear_item(p_info_called, p_clearInfoType, p_pog_index) {
    logDebug("function : clear_item; info_called : " + p_info_called + "; p_clearInfoType : " + p_clearInfoType, "S");
    try {
        //identify if any change in POG
        g_pog_edited_ind = "Y";

        if (p_info_called == "N") {
            $(".top_icon").removeClass("active");
            $(".left_icon").removeClass("active");
            $(".clear_item").addClass("active");
        }
        var prev_action = p_info_called == "N" ? "CLEAR_ITEM" : "CLEAR_POG_INFO";
        var module_details = g_pog_json[p_pog_index].ModuleInfo;
        g_undo_obj_arr = [];
        g_undo_details = [];
        g_undo_supp_obj_arr = [];
        var undoObjectsInfo = [];
        var g_deletedItems = [];
        if (prev_action == "CLEAR_POG_INFO") {
            var pogInfo = {};
            pogInfo["OldPOGCode"] = g_pog_json[p_pog_index].POGCode;
            pogInfo["OldPOGName"] = g_pog_json[p_pog_index].Name;
            pogInfo["OldPOGDivision"] = g_pog_json[p_pog_index].Division;
            pogInfo["OldPOGDept"] = g_pog_json[p_pog_index].Dept;
            pogInfo["OldPOGSubDept"] = g_pog_json[p_pog_index].SubDept;
            pogInfo["OldEffStartDate"] = g_pog_json[p_pog_index].EffStartDate;
        }
        $.each(module_details, function (i, modules_info) {
            if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
                //capture the module is edit or not to create changed text box
                g_pog_json[p_pog_index].ModuleInfo[i].EditFlag = "Y";

                $.each(modules_info.ShelfInfo, function (j, shelf_info) {
                    if (shelf_info.ItemInfo.length > 0) {
                        $.each(shelf_info.ItemInfo, function (s, itemInfo) {
                            g_deletedItems.push(itemInfo.ItemID);
                        });
                        var objectID = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].SObjID;
                        undoObjectsInfo.moduleIndex = i;
                        undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[i].Module;
                        undoObjectsInfo.shelfIndex = j;
                        undoObjectsInfo.pogInfo = pogInfo;
                        undoObjectsInfo.actionType = "ITEM_DELETE";
                        undoObjectsInfo.startCanvas = g_start_canvas;
                        undoObjectsInfo.objectID = objectID;
                        undoObjectsInfo.g_deletedItems = g_deletedItems;
                        undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[i].MObjID;
                        undoObjectsInfo.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j])));
                        g_allUndoObjectsInfo.push(undoObjectsInfo);
                        undoObjectsInfo = [];
                    }
                });
            }
        });

        await delete_items("Y", p_pog_index);
        logFinalUndoObjectsInfo("ITEM_DELETE", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "N");
        g_allUndoObjectsInfo = [];
        showFixelAvailableSpace("N", "N", p_pog_index);
        render(p_pog_index);
        //recreate the orientation view if any present
        await recreate_compare_views(g_compare_view, "N");

        apex.message.showPageSuccess(g_pog_refresh_msg);
        logDebug("function : clear_item", "E");
        return "SUCCESS";
    } catch (err) {
        error_handling(err);
    }
}

function save_blk_dtl_coll(p_action_ind, p_blk_name, p_block_details_arr) {
    return new Promise(function (resolve, reject) {
        apex.server.process(
            "SAVE_BLOCK_LIST", {
            x01: p_action_ind,
            x02: p_blk_name,
            p_clob_01: JSON.stringify(p_block_details_arr),
        }, {
            dataType: "text",
            success: async function (pData) {
                console.log("pData", pData);
                //apex.region("mod_block_details").refresh();
                if (p_action_ind == "Y" || p_action_ind == "U") {
                    g_autofill_edit = "N";
                }

                resolve("success");
            },
            loadingIndicatorPosition: "page",
        });
    });
}

function delete_items(p_delete_obj, p_pog_index) {
    logDebug("function : delete_items; delete_obj : " + p_delete_obj, "S");
    //console.log('delete_items called');
    return new Promise(function (resolve, reject) {
        var module_details = g_pog_json[p_pog_index].ModuleInfo;
        if (p_delete_obj == "N") {
            g_pog_json[p_pog_index].POGCode = "";
            g_pog_json[p_pog_index].Name = "";
        }
        $.each(module_details, function (i, modules_info) {
            if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
                $.each(modules_info.ShelfInfo, function (j, shelf_info) {
                    var div_obj = {};
                    var add_div_item = "N";
                    if (p_delete_obj == "Y") {
                        $.each(shelf_info.ItemInfo, function (k, item_info) {
                            if (item_info.Item !== "DIVIDER") {
                                g_deletedItems.push(item_info.ItemID);
                                var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(item_info.ObjID);
                                g_scene_objects[p_pog_index].scene.children[2].remove(selectedObject);
                                if (typeof g_pog_json[p_pog_index].DeleteItems !== "undefined") {
                                    g_pog_json[p_pog_index].DeleteItems.push(item_info); ///ASA-1108
                                }
                            } else {
                                div_obj = item_info;
                                add_div_item = "Y";
                            }
                        });
                    } else {
                        $.each(shelf_info.ItemInfo, function (k, item_info) {
                            if (item_info.Item == "DIVIDER") {
                                div_obj = item_info;
                                add_div_item = "Y";
                            }
                        });
                    }
                    g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo = [];
                    if (add_div_item == "Y") {
                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo.push(div_obj);
                    }
                });
            }
        });
        // let dellog = deleted_items_log(g_deletedItems, "D", p_pog_index);
        resolve("SUCCESS");
        logDebug("function : delete_items", "E");
    });
}


function getOverlappingBlock(dropX, dropY, dragUuid, pogIndex) {
    logDebug("function : getOverlappingBlock", "S");
    for (let blk of g_mod_block_list) {

        if (blk.BlkName === dragUuid) continue;

        var top = blk.BlockDim.FinalTop;
        var bottom = blk.BlockDim.FinalBtm;

        var left = g_pog_json[pogIndex].ModuleInfo[blk.mod_index[0]].X -
                   g_pog_json[pogIndex].ModuleInfo[blk.mod_index[0]].W / 2;

        var right = g_pog_json[pogIndex].ModuleInfo[blk.mod_index[0]].X +
                    g_pog_json[pogIndex].ModuleInfo[blk.mod_index[0]].W / 2;

        if (top > dropY && bottom < dropY && left < dropX && right > dropX) {
            return blk;
        }
    }
    logDebug("function : getOverlappingBlock", "E");
    return null;
}

function isBlockOverlapping(dragBlock, otherBlock) {
    logDebug("function : isBlockOverlapping", "S");
    var aLeft = dragBlock.BlockDim.CalcX - dragBlock.BlockDim.BlkWidth / 2;
    var aRight = dragBlock.BlockDim.CalcX + dragBlock.BlockDim.BlkWidth / 2;

    var bLeft = otherBlock.BlockDim.CalcX - otherBlock.BlockDim.BlkWidth / 2;
    var bRight = otherBlock.BlockDim.CalcX + otherBlock.BlockDim.BlkWidth / 2;
    logDebug("function : isBlockOverlapping", "E");
    return (aRight <= bLeft &&  aLeft >= bRight);
}

function clear_auto_fill_coll() {
    logDebug("function : clear_auto_fill_coll", "S");
    g_auto_fill_active = "N";
    g_auto_fill_reg_open = "N";
    g_autofill_edit = "N";
    apex.server.process(
        "DELETE_AUTOFILL_COLL", {
        x01: "",
    }, {
        dataType: "text",
        success: async function (pData) {
            for (const obj of g_mod_block_list) {
                for (const child of obj.BlockDim.ColorObj.children) {
                    if (child.uuid == obj.BlkName) {
                        obj.BlockDim.ColorObj.remove(child);
                        break;
                    }
                }
            }
            render(g_pog_index);
            // apex.region("autofill_products").refresh();
            if (apex.region("mod_block_details") !== null) {
                apex.region("mod_block_details").refresh();
            }
            console.log("pData", pData);
            $s("P193_MULTI_PRODUCT", "");
            $(".dropdown").removeClass("disable_dropdown");
            $(".live_image").removeClass("disable_dropdown");
            $(".3d_popup").removeClass("disable_dropdown");
            $(".open_product").removeClass("disable_dropdown");
            $(".left_icon").removeClass("disable_dropdown");
            $(".autofill_btn").removeClass("item_label_active");
        },
        loadingIndicatorPosition: "page",
    });
    logDebug("function : clear_auto_fill_coll", "E");
}

function getAutoFillCurrModule(p_finalX, p_finalY, p_module_index, p_pog_index) {
    logDebug("function : getAutoFillCurrModule; pfinalX : " + p_finalX + "; pFinalY : " + p_finalY + "; p_module_index : " + p_module_index, "S");
    try {
        var curr_module = -1;
        var i = 0;
        var j = 0;
        //Checking dragged object is in which module
        var i = 0;
        for (modules of g_pog_json[p_pog_index].ModuleInfo) {
            //ASA-1085
            if (parseFloat(p_finalX) > parseFloat(modules.X) - modules.W / 2 && parseFloat(p_finalX) < parseFloat(modules.X) + modules.W / 2 && parseFloat(p_finalY) > parseFloat(modules.Y) - modules.H / 2 && parseFloat(p_finalY) < parseFloat(modules.Y) + modules.H / 2 && (modules.ParentModule == null || typeof modules.ParentModule == "undefined")) {
                curr_module = i;
                break;
            }
            i++;
        }

        logDebug("function : getAutoFillCurrModule", "E");
        return curr_module;
    } catch (err) {
        error_handling(err);
    }
}

function getAutoFillCurrShelf(p_blockStart, p_blockEnd, p_module_index, p_pog_index) {
    logDebug("function : getAutoFillCurrShelf; pBlockStart : " + p_blockStart + "; pBlockEnd : " + p_blockEnd + "; p_module_index : " + p_module_index, "S");
    try {
        var curr_shelf = -1;
        var i = 0;
        for (shelfs of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo) {
            //ASA-1085
            if (parseFloat(p_blockStart.y) > parseFloat(shelfs.Y) - shelfs.H / 2 && parseFloat(p_blockEnd.y) < parseFloat(shelfs.Y) + shelfs.H / 2) {
                curr_shelf = i;
                break;
            }
            i++;
        }

        logDebug("function : getAutoFillCurrShelf", "E");
        return curr_shelf;
    } catch (err) {
        error_handling(err);
    }
}

function refreshBlockLabelMesh(p_module, p_blkName, p_blkColor, p_calcX, p_calcY, p_w, p_h) {
    logDebug("function : refreshBlockLabelMesh", "S");
    var textUuid  = p_blkName.endsWith("_AFP") ? p_blkName : p_blkName + "_AFP";
    var blockLabel = p_blkName.endsWith("_AFP") ? p_blkName.slice(0, -4) : p_blkName;

    // Remove stale text mesh (may be in any module, use parent reference)
    var oldMesh = p_module.getObjectByProperty("uuid", textUuid);
    if (oldMesh) {
        (oldMesh.parent || p_module).remove(oldMesh);
        if (oldMesh.geometry) oldMesh.geometry.dispose();
        if (oldMesh.material) oldMesh.material.dispose();
    }

    var colorValue = parseInt((p_blkColor || "#FFFFFF").replace("#", "0x"), 16);
    var blk_r = (colorValue >> 16) & 0xFF, blk_g = (colorValue >> 8) & 0xFF, blk_b = colorValue & 0xFF;
    var blk_text_color_int = parseInt(getTextColor(blk_r, blk_g, blk_b).replace("#", ""), 16);
    var fs = typeof P193_POGCR_BLK_TXT_SIZE !== "undefined" ? P193_POGCR_BLK_TXT_SIZE : 12;
    var blk_vis = get_visible_size(0.012, p_w * 4, p_h * 4, g_canvas, g_camera) || [100, 50];
    var blk_cw = blk_vis[0], blk_ch = blk_vis[1];
    var blk_pad = Math.round(Math.min(blk_cw, blk_ch) * 0.08);
    var blk_aw = blk_cw - blk_pad * 2, blk_ah = blk_ch - blk_pad * 2;
    var eff_fs = Math.max(6, Math.min(fs,
        Math.floor(blk_ah / (3 * 4 * 1.333 * 1.3)),
        Math.floor(blk_aw / (4 * 4 * 1.333 * 0.55))
    ));
    var mesh = dcText(blockLabel, eff_fs, blk_text_color_int, colorValue, p_w, p_h, "Y", "N", "Arial", "", eff_fs, 0, -1, 4, undefined, undefined, undefined, "Y");
    if (!mesh) return;
    mesh.uuid = textUuid;
    if (mesh.material) mesh.material.opacity = 0.5;
    mesh.position.set(p_calcX, p_calcY, 0.009);
    p_module.add(mesh);
    logDebug("function : refreshBlockLabelMesh", "E");
}

async function swapColoredBlocks(p_swapBlock, p_dragBlock, p_pog_index) {
    logDebug("function : swapColoredBlocks; pSwapBlock : " + p_swapBlock, "S");

    var dragModule = p_dragBlock.BlockDim.ColorObj;
    var dragBlockCalcX = parseFloat(p_dragBlock.BlockDim.CalcX);
    var dragBlockCalcY = parseFloat(p_dragBlock.BlockDim.CalcY);
    var dragBlockFinalTop = parseFloat(p_dragBlock.BlockDim.FinalTop);
    var dragBlockFinalBtm = parseFloat(p_dragBlock.BlockDim.FinalBtm);
    var dragBlockW = parseFloat(p_dragBlock.BlockDim.BlkWidth);
    var dragBlockH = parseFloat(p_dragBlock.BlockDim.BlkHeight);
    var dragBlockDelDetails = JSON.parse(JSON.stringify(p_dragBlock.g_delete_details));
    var dragBlockMod = JSON.parse(JSON.stringify(p_dragBlock.mod_index));
    var dragBlockObj = dragModule.getObjectByProperty("uuid", g_dragItem.uuid); //ASA-1085

    var swapModule = p_swapBlock.BlockDim.ColorObj;
    var swapBlockCalcX = parseFloat(p_swapBlock.BlockDim.CalcX);
    var swapBlockCalcY = parseFloat(p_swapBlock.BlockDim.CalcY);
    var swapBlockFinalTop = parseFloat(p_swapBlock.BlockDim.FinalTop);
    var swapBlockFinalBtm = parseFloat(p_swapBlock.BlockDim.FinalBtm);
    var swapBlockW = parseFloat(p_swapBlock.BlockDim.BlkWidth);
    var swapBlockH = parseFloat(p_swapBlock.BlockDim.BlkHeight);
    var swapBlockDelDetails = JSON.parse(JSON.stringify(p_swapBlock.g_delete_details));
    var swapBlockMod = JSON.parse(JSON.stringify(p_swapBlock.mod_index));
    var swapBlockObj = swapModule.getObjectByProperty("uuid", p_swapBlock.BlkName);

    p_swapBlock.BlockDim.CalcX = dragBlockCalcX;
    p_swapBlock.BlockDim.CalcY = dragBlockCalcY;
    p_swapBlock.BlockDim.FinalTop = dragBlockFinalTop;
    p_swapBlock.BlockDim.FinalBtm = dragBlockFinalBtm;
    p_swapBlock.BlockDim.BlkWidth = dragBlockW;
    p_swapBlock.BlockDim.BlkHeight = dragBlockH;
    p_swapBlock.mod_index = dragBlockMod;
    p_swapBlock.g_delete_details = dragBlockDelDetails;
    for (g_shelf of p_swapBlock.g_delete_details) {
        g_shelf.BlkName = p_swapBlock.BlkName;
    }
    swapBlockObj.position.x = dragBlockCalcX;
    swapBlockObj.position.y = dragBlockCalcY;
    swapBlockObj.geometry.dispose();
    swapBlockObj.geometry = new THREE.BoxGeometry(dragBlockW, dragBlockH, 0.001);

    p_dragBlock.BlockDim.CalcX = swapBlockCalcX;
    p_dragBlock.BlockDim.CalcY = swapBlockCalcY;
    p_dragBlock.BlockDim.FinalTop = swapBlockFinalTop;
    p_dragBlock.BlockDim.FinalBtm = swapBlockFinalBtm;
    p_dragBlock.BlockDim.BlkWidth = swapBlockW;
    p_dragBlock.BlockDim.BlkHeight = swapBlockH;
    p_dragBlock.mod_index = swapBlockMod;
    p_dragBlock.g_delete_details = swapBlockDelDetails;
    for (g_shelf of p_dragBlock.g_delete_details) {
        g_shelf.BlkName = p_dragBlock.BlkName;
    }
    dragBlockObj.position.x = swapBlockCalcX;
    dragBlockObj.position.y = swapBlockCalcY;
    dragBlockObj.geometry.dispose();
    dragBlockObj.geometry = new THREE.BoxGeometry(swapBlockW, swapBlockH, 0.001);

    swapModule.remove(swapBlockObj);
    dragModule.remove(dragBlockObj);
    swapModule.add(dragBlockObj);
    dragModule.add(swapBlockObj);

    p_dragBlock.BlockDim.ColorObj = swapModule;
    p_swapBlock.BlockDim.ColorObj = dragModule;

    dragModule.updateMatrix();
    swapModule.updateMatrix();
    dragBlockObj.updateMatrix();
    swapBlockObj.updateMatrix();
     // Regenerate text label meshes with correct dimensions for each block's new position
    // swapBlock's background is now in dragModule; dragBlock's background is now in swapModule
    // First remove stale text meshes from their original modules (before render)
    var staleSwapText = swapModule.getObjectByProperty("uuid", p_swapBlock.BlkName + "_AFP");
    if (staleSwapText) { swapModule.remove(staleSwapText); if (staleSwapText.geometry) staleSwapText.geometry.dispose(); if (staleSwapText.material) staleSwapText.material.dispose(); }
    var staleDragText = dragModule.getObjectByProperty("uuid", p_dragBlock.BlkName + "_AFP");
    if (staleDragText) { dragModule.remove(staleDragText); if (staleDragText.geometry) staleDragText.geometry.dispose(); if (staleDragText.material) staleDragText.material.dispose(); }

    refreshBlockLabelMesh(dragModule, p_swapBlock.BlkName, p_swapBlock.BlkColor, dragBlockCalcX, dragBlockCalcY, dragBlockW, dragBlockH);
    refreshBlockLabelMesh(swapModule, p_dragBlock.BlkName, p_dragBlock.BlkColor, swapBlockCalcX, swapBlockCalcY, swapBlockW, swapBlockH);
    render(p_pog_index);

    logDebug("function : swapColoredBlocks", "E");
}


async function createDynamicBlocks(
        p_pog_code,
        p_draft_pog,
        p_pog_version,
        p_pog_draft_version = "",
        p_saveColl = "Y",
        p_attr_val = "",
        p_margin_param = ""
    ) {

    logDebug("function : createDynamicBlocks", "S");
    return new Promise((resolve, reject) => {

        apex.server.process(
            "CREATE_DYNAMIC_BLOCK",
            {
                x01: p_pog_code,
                x02: p_pog_version,
                x03: p_attr_val,
                x04: p_draft_pog == "Y" ? p_pog_draft_version : "",
                x05: p_margin_param,
                //p_clob_01: JSON.stringify(g_pog_json[g_pog_index])
            },
            {
                dataType: "json",

                success: async function (data) {

                    try {

                        console.log("Blocks:", data);
                        for (const row of data) {

                            // Create start/end coords
                            g_DragMouseStart = {
                                x: Number(row.x1),
                                y: Number(row.y1)
                            };

                            g_DragMouseEnd = {
                                x: Number(row.x2),
                                y: Number(row.y2)
                            };

                            console.log(
                                "Start:", g_DragMouseStart,
                                "End:", g_DragMouseEnd
                            );

                            // Get autofill info
                            [
                                g_autofillModInfo,
                                g_autofillShelfInfo
                            ] = getAutofillModShelf(
                                g_DragMouseStart,
                                g_DragMouseEnd,
                                g_pog_json,
                                g_pog_index
                            );

                            console.log("Mod Info:", g_autofillModInfo);
                            console.log("Shelf Info:", g_autofillShelfInfo);

                            // Create block
                            var isBlockCreated = await setAutofillBlock( // ASA-1986 start
                                'A',
                                row.block_name,
                                'N',
                                'N',
                                row.color,
                                row.values
                            );
                            if (isBlockCreated !== true) {  // ASA-1986 start
                                console.warn("Skipped block due to invalid block dimensions:", row.block_name);
                                continue;
                            }
                            console.log(
                                "Created Block:",
                                row.block_name,
                                row.color
                            );

                            // Small delay (render safety)
                            await new Promise(r => setTimeout(r, 50));
                        }
                        if (p_saveColl == "Y") {
                            var block_details_arr = [];
                            for (const obj of g_mod_block_list) {
                                var details = {};
                                details["BlkColor"] = obj.BlkColor;
                                details["BlkName"] = obj.BlkName;
                                details["BlkRule"] = obj.BlkRule;
                                details["BlkShelfInfo"] = obj.BlkShelfInfo;
                                details["BlkFilters"] = obj.BlockFilters.join(" AND ");
                                obj["BlkFilters"] = details["BlkFilters"];
                                block_details_arr.push(details);
                            }
                            var retval = await save_blk_dtl_coll('A', 'Blks', block_details_arr);
                            apex.region("mod_block_details").refresh();
                            $("#added_attribute").show();
                            apex.region("added_attribute").refresh();
                            capture_changes_blk_snapshot(g_mod_block_list); // ASA-1986
                        }
                        console.log("All blocks created");



                        //Resolve when done
                        resolve(true);

                    } catch (e) {
                        reject(e);
                    }
                },

                error: function (err) {
                    console.error("AJAX Error:", err);
                    reject(err);
                }
            }
        );
    });
}

async function save_af_version() {

    logDebug("function : save_af_verion", "S");

    var l_pog_code = $v('P193_OPEN_POG_CODE');
    var l_pog_code_version = $v('P193_OPEN_POG_VERSION');
    var l_open_draft = $v('P193_OPEN_DRAFT');
    var l_draft_version = $v('P193_EXISTING_DRAFT_VER');
    var l_max_versions = $v('P193_POGCR_MAX_BLOCK_VERSION');

    var mod_tot = 0;

    if (apex.region("mod_block_details") !== null) {
        var mod_model = apex.region("mod_block_details")
            .widget()
            .interactiveGrid("getViews", "grid")
            .model;

        mod_tot = mod_model.getTotalRecords();
    }

    if (mod_tot == 0) {
        alert(get_message('POGCR_BLK_NULL'));
        return;
    }

    apex.server.process(
        "CHECK_AUTOFILL_EXISTS",
        {
            x01: l_pog_code,
            x02: l_pog_code_version,
            x03: l_open_draft == 'Y' ? l_draft_version : "",
            x04: l_max_versions,
        },
        {
            dataType: "text",

            success: function (pText) {

                pText = $.trim(pText);
                console.log("Exists Check:", pText);

                if (pText == "YES") {

                    apex.message.confirm(
                        get_message("OVERRIDE_BLK_VER_MSG"),
                        function (okPressed) {
                            if (okPressed) {
                                proceed_save('U');
                            } else {
                                proceed_save('N');
                            }
                        }
                    );

                }
                if (pText == "DELETE") {
                    apex.message.confirm(
                        get_message("DELETE_BLK_VER_MSG",l_max_versions),
                        function (okPressed) {
                            if (okPressed) {
                                proceed_save('D');
                            } else {
                                console.log('NO ACTION');
                            }
                        }
                    );

                }
                if (pText == "OVERIDE") {
                    apex.message.confirm(
                        get_message("OVERRIDE_BLK_MSG"),
                        function (okPressed) {
                            if (okPressed) {
                                proceed_save('O');
                            } else {
                                console.log('NO ACTION');
                            }
                        }
                    );
                }
                if (pText == "NO") {
                    proceed_save('S');
                }
            }
        }
    );

    function proceed_save(p_action) {
        const l_af_version = getAfVersion();
        var l_pog_code = $v('P193_OPEN_POG_CODE');
        var l_pog_code_version = $v('P193_OPEN_POG_VERSION');
        g_autofill_detail['AFPOGCode'] = l_pog_code;
        g_autofill_detail['AFPOGVersion'] = l_pog_code_version;
        g_autofill_detail['AFVersion'] = l_af_version, //$v('P193_AF_VERSION');
            g_autofill_detail['BlkSelType'] = 'M';
        g_autofill_detail['AutofillRule'] = $v('P193_AUTOFILL_RULE');
        g_autofill_detail['BlkInfo'] = g_mod_block_list;
        var l_open_draft = $v('P193_OPEN_DRAFT');
        var l_draft_version = $v('P193_EXISTING_DRAFT_VER');

        apex.server.process(
            "SAVE_AUTOFILL",
            {
                x01: g_autofill_detail["AFPOGCode"],
                x02: $v('P193_AF_VERSION'), //g_autofill_detail["AFVersion"],
                x03: g_autofill_detail["AutofillRule"],
                x04: g_autofill_detail["BlkSelType"],
                x05: g_autofill_detail['AFPOGVersion'],
                p_clob_01: JSON.stringify(
                    filterAutoFillJsontag(g_autofill_detail)
                ),
                x06: p_action,
                x07: l_af_version,
                x08: l_open_draft == 'Y' ? l_draft_version : "",
            },
            {
                dataType: "text",

                success: function (pData) {

                    var return_data = $.trim(pData).split(",");
                    if (return_data[0] == "ERROR") {
                        raise_error(pData);
                    }
                },
            }
        );
    }
}

function getAfVersion() {
    const now = new Date();

    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, "0");
    const DD = String(now.getDate()).padStart(2, "0");
    const HH = String(now.getHours()).padStart(2, "0");
    const MI = String(now.getMinutes()).padStart(2, "0");
    const SS = String(now.getSeconds()).padStart(2, "0");

    return Number(`${YYYY}${MM}${DD}${HH}${MI}${SS}`);
}

async function update_multiselect_blk_filter(p_blk_name_list) {
    try {
        logDebug("function : update_multiselect_blk_filter", "S");

        // 1. Read filter grid
        var model = apex.region("block_filters").widget().interactiveGrid("getViews", "grid").model;
        var filters_arr = [];
        var filter_val = [];
        var attr_arr = [];

        model.forEach(function (record) {
            var filters = typeof model.getValue(record, "FILTER") == "object"
                ? model.getValue(record, "FILTER").v
                : model.getValue(record, "FILTER");
            var value = model.getValue(record, "VALUE");
            filter_val.push(filters + "#" + value);
            if (filters !== "") {
                var filter_list = filters.split("-");
                attr_arr.push(filter_list[0]);
                filters_arr.push(filter_list[0] + " = " + (filter_list[1] == "C" ? '"' : "") + value + (filter_list[1] == "C" ? '"' : ""));
            }
        });

        // 2. Validate filters (same rules as single-block update)
        var dup_arr = findDuplicates(attr_arr);
        if (dup_arr.length > 0) {
            alert(get_message("POGCR_DUP_REC_FOUND"));
            return;
        }
        if (attr_arr.includes("SUBCLASS") && (!attr_arr.includes("CLASS") || !attr_arr.includes("DEPT"))) {
            alert(get_message("POGCR_DEPT_CLASS_MANDATE"));
            return;
        }
        if (attr_arr.includes("CLASS") && !attr_arr.includes("DEPT")) {
            alert(get_message("POGCR_DEPT_MANDATE"));
            return;
        }

        // 3. Identify selected block names from the colon-separated list
        var selectedBlkNames = p_blk_name_list.split(":").map(function (n) { return n.toUpperCase(); });

        // 4. Update only BlockFilters / FilterVal on each selected block — nothing else changes
        for (var i = 0; i < g_mod_block_list.length; i++) {
            if (selectedBlkNames.indexOf(g_mod_block_list[i].BlkName.toUpperCase()) !== -1) {
                g_mod_block_list[i].BlockFilters = filters_arr.slice();
                g_mod_block_list[i].FilterVal = filter_val.slice();
                g_mod_block_list[i].BlkFilters = filters_arr.join(" AND ");
                logDebug("update_multiselect_blk_filter: updated filters for " + g_mod_block_list[i].BlkName, "I");
            }
        }

        // 5. Build full block_details_arr (all blocks) for the server save
        var block_details_arr = [];
        for (const obj of g_mod_block_list) {
            var details = {};
            details["BlkColor"] = obj.BlkColor.toUpperCase();
            details["BlkName"] = obj.BlkName.toUpperCase();
            details["BlkRule"] = obj.BlkRule;
            details["BlkShelfInfo"] = obj.BlkShelfInfo;
            details["BlkFilters"] = obj.BlkFilters || (Array.isArray(obj.BlockFilters) ? obj.BlockFilters.join(" AND ") : "");
            details["OldBlkName"] = obj.BlkName.toUpperCase();
            obj["BlkFilters"] = details["BlkFilters"];
            block_details_arr.push(details);
        }

        // 6. Save
        await save_blk_dtl_coll("U", null, block_details_arr);
        apex.region("mod_block_details").refresh();

        // 7. Stop blink FIRST (needs WireframeObj intact), then remove border meshes,
        //    then render so the canvas redraws without the borders.
        clear_blinking();                          // clears g_intersected, stops interval, uses WireframeObj
        cleanupBlockBorders(g_pog_index);          // nulls WireframeObj — must come after clear_blinking
        render(g_pog_index);                       // redraw scene so borders disappear visually

        // 8. Reset state
        g_delete_details = [];
        apex.region("block_filters").widget().interactiveGrid("getActions").set("edit", false);
        apex.region("block_filters").widget().interactiveGrid("getViews", "grid").model.clearChanges();
        apex.region("block_filters").refresh();

        // 9. Re-enable form fields and close
        $("#" + g_page_no + "BLK_NAME").prop("disabled", false);
        apex.item(g_page_no + "BLK_COLOR").enable();
        $("#" + g_page_no + "BLK_RULE").prop("disabled", false);
        closeInlineDialog("block_details");

        logDebug("function : update_multiselect_blk_filter", "E");
    } catch (err) {
        error_handling(err);
    }
}








function createAttributeCollection() {
    return apex.server.process(
        "CREATE_ATTRIBUTE_COLL",
        {
            x01: $v("P193_OPEN_POG_CODE"),
            x02: $v("P193_AF_VERSION")
        },
        {
            dataType: "text"
        }
    );
}

async function runattrCollections() {
    try {
        let pData = await createAttributeCollection();

        $("#added_attribute").show();
        apex.region("added_attribute").refresh();

        let return_data = $.trim(pData).split(",");

        if (return_data[0] === "ERROR") {
            raise_error(pData);
            return;
        }
    } catch (err) {
        console.error(err);
        raise_error("Server Error");
    }
}

/**
 * Creates a border-only LineSegments mesh around a block mesh
 * and attaches it as blkMesh.WireframeObj so blink_effect()
 * can toggle its colour without touching the fill material.
 *
 * @param {THREE.Mesh}  blkMesh   - the autofill block mesh
 * @param {number}      p_pog_index
 */
function attachBlockBorderMesh(blkMesh, p_pog_index) {
    logDebug("function : attachBlockBorderMesh", "S");
    // If already attached from a previous selection, reuse it
    if (blkMesh._borderMesh) {
        blkMesh.WireframeObj = blkMesh._borderMesh;
        return;
    }

    // EdgesGeometry traces only the outer edges — looks like a border
    var edgesGeo = new THREE.EdgesGeometry(blkMesh.geometry);
    var edgesMat = new THREE.LineBasicMaterial({
        color: 0xffffff,   // starts white; blink_effect toggles this
        linewidth: 2,          // note: only >1 on WebGL2 / some drivers
        depthTest: false       // always visible, not occluded by other meshes
    });
    var borderMesh = new THREE.LineSegments(edgesGeo, edgesMat);

    // Match block position/scale exactly
    borderMesh.position.copy(blkMesh.position);
    borderMesh.rotation.copy(blkMesh.rotation);
    borderMesh.scale.copy(blkMesh.scale);
    borderMesh.renderOrder = 999;

    // Add to same parent as the block mesh
    if (blkMesh.parent) {
        blkMesh.parent.add(borderMesh);
    } else {
        g_scene_objects[p_pog_index].scene.children[2].add(borderMesh);
    }

    // Cache so we can remove it on deselect
    blkMesh._borderMesh = borderMesh;

    // Wrap in the {material} shape blink_effect() expects:
    //   g_intersected[i].WireframeObj.material.color.setHex(...)
    blkMesh.WireframeObj = borderMesh;
    logDebug("function : attachBlockBorderMesh", "E");
}


function get_multiselect_blocks(p_pog_index) {
    try {
        logDebug("function : get_multiselect_blocks", "S");

        if (typeof g_mod_block_list === "undefined" || g_mod_block_list.length === 0) return;

        // Normalise drag rect for all 4 drag directions
        var selLeft = Math.min(g_DragMouseStart.x, g_DragMouseEnd.x);
        var selRight = Math.max(g_DragMouseStart.x, g_DragMouseEnd.x);
        var selBottom = Math.min(g_DragMouseStart.y, g_DragMouseEnd.y);
        var selTop = Math.max(g_DragMouseStart.y, g_DragMouseEnd.y);

        for (var bi = 0; bi < g_mod_block_list.length; bi++) {
            var blk = g_mod_block_list[bi];
            if (!blk || !blk.BlockDim) continue;

            var bd = blk.BlockDim;

            // ── Step 1: Resolve the mesh ──────────────────────
            // Do this FIRST — we need the mesh to get real bounds
            var blkMesh = null;
            if (bd.ColorObj) {
                if (blk.BlkName) {
                    bd.ColorObj.traverse(function (child) {
                        if (!blkMesh && child.uuid === blk.BlkName) blkMesh = child;
                    });
                }
                if (!blkMesh) blkMesh = bd.ColorObj;
            }
            if (!blkMesh && blk.BlkName) {
                blkMesh = g_scene_objects[p_pog_index].scene
                    .getObjectByProperty("uuid", blk.BlkName);
            }
            if (!blkMesh) continue;

            // ── Step 2: Get real world-space bounds from mesh ─
            // THREE.Box3 computes the exact axis-aligned bounding
            // box of the mesh in world space — this is the only
            // accurate source, regardless of mod_index or BlockDim.
            var box = new THREE.Box3().setFromObject(blkMesh);

            var blkLeft = box.min.x;
            var blkRight = box.max.x;
            var blkBottom = box.min.y;
            var blkTop = box.max.y;

            // Sanity check
            if (blkLeft >= blkRight || blkBottom >= blkTop) continue;

            // ── Step 3: Compute intersection area ─────────────
            var interLeft = Math.max(blkLeft, selLeft);
            var interRight = Math.min(blkRight, selRight);
            var interBottom = Math.max(blkBottom, selBottom);
            var interTop = Math.min(blkTop, selTop);

            // No overlap at all
            if (interRight <= interLeft || interTop <= interBottom) continue;

            var interArea = (interRight - interLeft) * (interTop - interBottom);
            var blkArea = (blkRight - blkLeft) * (blkTop - blkBottom);

            if (blkArea <= 0) continue;

            var coveragePct = interArea / blkArea;

            logDebug("get_multiselect_blocks: " + blk.BlkName +
                " bounds=[" + blkLeft.toFixed(2) + "," + blkRight.toFixed(2) +
                "," + blkBottom.toFixed(2) + "," + blkTop.toFixed(2) + "]" +
                " coverage=" + Math.round(coveragePct * 100) + "%", "I");

            // ── Step 4: 50% threshold ─────────────────────────
            if (coveragePct < 1) continue;

            // ── Step 5: Skip if already selected ─────────────
            var alreadyIn = g_intersected.some(function (o) {
                return o && o.uuid === blkMesh.uuid;
            });
            if (alreadyIn) continue;

            // ── Step 6: Attach border + blink properties ──────
            attachBlockBorderMesh(blkMesh, p_pog_index);

            blkMesh.blink_color = 0x000000;
            blkMesh.BorderColour = 0xffffff;
            blkMesh.ImageExists = "N";
            blkMesh.DimUpdate = "N";
            blkMesh.Status = "Y";

            g_intersected.push(blkMesh);

            g_delete_details.push({
                ObjID: blkMesh.id,
                BlkName: blk.BlkName,
                BlkColor: blk.BlkColor,
                Object: "BLOCK",
                PogIndex: p_pog_index,
                _blkRef: blk
            });

            logDebug("get_multiselect_blocks: SELECTED " + blk.BlkName, "I");
        }

        logDebug("function : get_multiselect_blocks", "E");
    } catch (err) {
        error_handling(err);
    }
}

function cleanupBlockBorders(p_pog_index) {
    logDebug("function : cleanupBlockBorders", "S");
    try {
        if (typeof g_mod_block_list === "undefined" || g_mod_block_list.length === 0) return;

        for (var bi = 0; bi < g_mod_block_list.length; bi++) {
            var blk = g_mod_block_list[bi];
            if (!blk || !blk.BlockDim || !blk.BlockDim.ColorObj) continue;

            // Find the mesh
            var blkMesh = null;
            if (blk.BlkName) {
                blk.BlockDim.ColorObj.traverse(function (child) {
                    if (!blkMesh && child.uuid === blk.BlkName) blkMesh = child;
                });
            }
            if (!blkMesh) blkMesh = blk.BlockDim.ColorObj;
            if (!blkMesh) continue;

            // Only act if a border mesh was previously attached
            if (!blkMesh._borderMesh) continue;

            // Remove from scene
            if (blkMesh._borderMesh.parent) {
                blkMesh._borderMesh.parent.remove(blkMesh._borderMesh);
            }
            // Dispose GPU resources
            if (blkMesh._borderMesh.geometry) blkMesh._borderMesh.geometry.dispose();
            if (blkMesh._borderMesh.material) blkMesh._borderMesh.material.dispose();

            blkMesh._borderMesh = null;
            blkMesh.WireframeObj = null;
        }
    } catch (err) {
        error_handling(err);
    }
    logDebug("function : cleanupBlockBorders", "E");
}


async function reset_af_version() {

    logDebug("function : reset_af_version", "S");

    if (!$v('P193_OPEN_POG_CODE')) {
        alert(get_message('POGCR_BLK_NULL'));
        return;
    }

    apex.message.confirm(
        get_message('RESET_CONFIRM_MSG'),
        async function (okPressed) {
            if (!okPressed) { return; }

            // Remove block color overlays from the canvas using live ColorObj references
            for (const obj of g_mod_block_list) {
                if (obj.BlockDim && obj.BlockDim.ColorObj) {
                    for (const child of obj.BlockDim.ColorObj.children) {
                        if (child.uuid == obj.BlkName) {
                            obj.BlockDim.ColorObj.remove(child);
                            break;
                        }
                    }
                }
            }
            render(g_pog_index);
            g_mod_block_list = [];

            // Restore from the snapshot captured on POG open
            g_mod_block_list = JSON.parse(JSON.stringify(g_reset_block_snapshot));
            g_autofill_detail["BlkInfo"] = g_mod_block_list;

            // Re-draw each block on the canvas
            for (const blkDet of g_mod_block_list) {
                g_autofillModInfo = blkDet.BlkModInfo;
                g_autofillShelfInfo = blkDet.BlkShelfInfo;
                var retdtl = await colorAutofillBlock(
                    blkDet["DragMouseStart"],
                    blkDet["DragMouseEnd"],
                    blkDet["mod_index"],
                    blkDet["BlkColor"],
                    blkDet["BlkName"],
                    "U",
                    blkDet,
                    g_pog_index
                );
                blkDet["BlockDim"] = retdtl;
            }

            // Sync server-side collection so the IG grid shows the restored state
            await save_blk_dtl_coll("Y", "", g_mod_block_list);
            apex.region("mod_block_details").refresh();
            $("#added_attribute").show();
            apex.region("added_attribute").refresh();

            render(g_pog_index);
            logDebug("function : reset_af_version", "E");
        }
    );
}


// Reorder Attributes
let draggedItem = null;
document.addEventListener("dragstart", function (e) {
    const chip = e.target.closest(".attr-chip");
    if (!chip) return;
    draggedItem = chip;
    chip.classList.add("dragging");
});
document.addEventListener("dragend", function (e) {
    const chip = e.target.closest(".attr-chip");
    if (!chip) return;

    chip.classList.remove("dragging");
});
document.addEventListener("dragover", function (e) {
    if (e.target.closest(".attr-chip")) {
        e.preventDefault();
    }
});
document.addEventListener("drop", function (e) {
    const target = e.target.closest(".attr-chip");
    if (!target || draggedItem === target) return;
    e.preventDefault();
    const container = target.parentNode;
    const items = [...container.querySelectorAll(".attr-chip")];
    const draggedIndex = items.indexOf(draggedItem);
    const targetIndex = items.indexOf(target);
    if (draggedIndex < targetIndex) {
        container.insertBefore(draggedItem, target.nextSibling);
    } else {
        container.insertBefore(draggedItem, target);
    }
    update_attr_sequence(container);
});
function update_attr_sequence(container) {
    let attrOrder = [];
    container.querySelectorAll(".attr-chip").forEach((chip, index) => {
        let seq = index + 1;
        chip.dataset.seq = seq;
        let attrValue = chip.querySelector(".attr-value").innerText.trim();
        let sortType = chip.querySelector(".attr-sort-icon i").classList.contains("fa-arrow-up") ? "ASC" : "DESC";
        attrOrder.push({
            seq: seq,
            attr: attrValue,
            sort: sortType
        });
    });
    $s("P193_DRAG_ATTR_ORDER", JSON.stringify(attrOrder));
}
// Reorder Attributes End
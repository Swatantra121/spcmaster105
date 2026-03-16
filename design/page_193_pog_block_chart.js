
// This file is used for Create View Analysis graph on page 193.

async function open_view_analysis() {
    logDebug("function : open_view_analysis", "S");
    try {
        if (!Array.isArray(g_pog_json) || g_pog_json.length === 0 || typeof g_pog_json[g_pog_index] === "undefined") {
            //raise_error("Please open a POG before View Analysis.");
            raise_error(OPEN_POG_VIEW_ANALYSIS);
            return;
        }
        if (g_compare_pog_flag == "Y") {
            //raise_error("Close Show Changes/Compare view before opening View Analysis.");
            raise_error(SHOW_CHANGES_VIEW_ANALYSIS);
            return;
        }

        let l_selected_index = typeof g_pog_index === "number" && g_pog_index > -1 ? g_pog_index : 0;
        let l_pog_code = g_pog_json[l_selected_index].POGCode;
        let l_pog_version = g_pog_json[l_selected_index].Version;
        $(".wt-changes").addClass('disable');
        await show_view_analysis(l_pog_code, l_pog_version, l_selected_index);
    } catch (err) {
        error_handling(err);
    } finally {
        logDebug("function : open_view_analysis", "E");
    }
}

function build_shelf_axis_label(p_shelf_info) {
    var moduleIndex = Number(p_shelf_info && p_shelf_info.MIndex);
    var shelfIndex = Number(p_shelf_info && p_shelf_info.SIndex);
    var shelfName = p_shelf_info && typeof p_shelf_info.Shelf !== "undefined" ? p_shelf_info.Shelf : "Shelf";
    if (!Number.isFinite(moduleIndex)) {
        moduleIndex = 0;
    }
    if (!Number.isFinite(shelfIndex)) {
        shelfIndex = 0;
    }
    return "M" + moduleIndex + "-S" + shelfIndex + " (" + shelfName + ")";
}

function build_analysis_chart_model(p_block_list) {
    var emptyChart = {
        labels: ["No shelf data"],
        datasets: [{
            label: "No shelf data",
            backgroundColor: "#D9D9D9",
            data: [0],
        }],
        hasData: false,
    };

    if (!Array.isArray(p_block_list) || p_block_list.length === 0) {
        return emptyChart;
    }

    var shelfRegistry = {};
    var matrix = {};
    var blockOrder = [];
    var blockColorMap = {};
    var blockSeen = {};

    for (const blockInfo of p_block_list) {
        if (typeof blockInfo === "undefined" || blockInfo == null) {
            continue;
        }

        var blockName = typeof blockInfo.BlkName === "string" && blockInfo.BlkName !== ""
            ? blockInfo.BlkName
            : "BLOCK_" + (blockOrder.length + 1);

        if (!blockSeen[blockName]) {
            blockOrder.push(blockName);
            blockSeen[blockName] = true;
        }

        blockColorMap[blockName] = typeof blockInfo.BlkColor === "string" && blockInfo.BlkColor !== ""
            ? blockInfo.BlkColor
            : "#7D8791";

        if (!Array.isArray(blockInfo.BlkShelfInfo)) {
            continue;
        }

        for (const shelfWrap of blockInfo.BlkShelfInfo) {
            var shelfInfo = shelfWrap && shelfWrap.ShelfInfo ? shelfWrap.ShelfInfo : null;
            if (!shelfInfo || shelfInfo.ObjType !== "SHELF") {
                continue;
            }

            var mIndex = Number(shelfInfo.MIndex);
            var sIndex = Number(shelfInfo.SIndex);
            if (!Number.isFinite(mIndex)) {
                mIndex = 0;
            }
            if (!Number.isFinite(sIndex)) {
                sIndex = Number(shelfWrap && shelfWrap.ShelfIdx);
            }
            if (!Number.isFinite(sIndex)) {
                sIndex = 0;
            }

            var shelfKey = mIndex + "::" + sIndex;
            if (!shelfRegistry[shelfKey]) {
                shelfRegistry[shelfKey] = {
                    mIndex: mIndex,
                    sIndex: sIndex,
                    y: Number(shelfInfo.Y),
                    shelfInfo: shelfInfo,
                };
                if (!Number.isFinite(shelfRegistry[shelfKey].y)) {
                    shelfRegistry[shelfKey].y = 0;
                }
            }

            var shelfWidth = Number(shelfInfo.W);
            var overlapWidth = Number(shelfWrap && shelfWrap.OverlapWidth);
            var percent = 0;
            if (Number.isFinite(shelfWidth) && shelfWidth > 0 && Number.isFinite(overlapWidth)) {
                percent = (overlapWidth / shelfWidth) * 100;
            }
            if (!Number.isFinite(percent)) {
                percent = 0;
            }
            percent = Math.max(0, Math.min(100, percent));

            if (!matrix[shelfKey]) {
                matrix[shelfKey] = {};
            }
            if (!Number.isFinite(matrix[shelfKey][blockName])) {
                matrix[shelfKey][blockName] = 0;
            }
            matrix[shelfKey][blockName] += percent;
        }
    }

    var orderedShelfKeys = Object.keys(shelfRegistry);
    orderedShelfKeys.sort(function (leftKey, rightKey) {
        var left = shelfRegistry[leftKey];
        var right = shelfRegistry[rightKey];
        if (left.mIndex !== right.mIndex) {
            return left.mIndex - right.mIndex;
        }
        if (left.y !== right.y) {
            return right.y - left.y;
        }
        return left.sIndex - right.sIndex;
    });

    if (orderedShelfKeys.length === 0) {
        return emptyChart;
    }

    var labels = [];
    for (const shelfKey of orderedShelfKeys) {
        labels.push(build_shelf_axis_label(shelfRegistry[shelfKey].shelfInfo));
    }

    var datasets = [];
    for (const blockName of blockOrder) {
        var datasetValues = [];
        var hasNonZero = false;
        for (const shelfKey of orderedShelfKeys) {
            var value = matrix[shelfKey] && Number.isFinite(matrix[shelfKey][blockName]) ? matrix[shelfKey][blockName] : 0;
            value = Math.round(value * 100) / 100;
            if (value !== 0) {
                hasNonZero = true;
            }
            datasetValues.push(value);
        }
        if (!hasNonZero) {
            continue;
        }
        datasets.push({
            label: normalize_block_name(blockName),
            backgroundColor: blockColorMap[blockName] || "#7D8791",
            data: datasetValues,
        });
    }

    if (datasets.length === 0) {
        return emptyChart;
    }

    return {
        labels: labels,
        datasets: datasets,
        hasData: true,
    };
}

function build_analysis_chart_options(p_has_data) {
    var showLegend = p_has_data === true;
    var chartMajorVersion = 0;
    if (typeof Chart !== "undefined" && typeof Chart.version === "string") {
        chartMajorVersion = parseInt(Chart.version.split(".")[0], 10);
    }
    var isChartV3Plus = chartMajorVersion >= 3;

    if (isChartV3Plus) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: showLegend,
                    position: "bottom",
                },
                tooltip: {
                    mode: "index",
                    intersect: false,
                },
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false,
                    },
                },
                y: {
                    stacked: true,
                    type: "linear",
                    beginAtZero: true,
                    min: 0,
                    max: 100,
                    ticks: {
                        callback: function (value) {
                            return value + "%";
                        },
                    },
                },
            },
        };
    }

    return {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            display: showLegend,
            position: "bottom",
        },
        tooltips: {
            mode: "index",
            intersect: false,
            displayColors: true,
        },
        scales: {
            xAxes: [{
                stacked: true,
                gridLines: {
                    display: false,
                },
            }],
            yAxes: [{
                stacked: true,
                type: "linear",
                ticks: {
                    beginAtZero: true,
                    min: 0,
                    max: 100,
                    callback: function (value) {
                        return value + "%";
                    },
                },
            }],
        },
    };
}

async function show_view_analysis(p_pog_code, p_pog_version, p_selected_pog_index = g_pog_index) {
    logDebug("function : show_view_analysis; p_pog_code : " + p_pog_code + "; pog_version : " + p_pog_version, "S");
    try {
        async function localRenderAnalysisBlocks(p_pog_index) {
            if (typeof colorAutofillBlock !== "function" || !Array.isArray(g_mod_block_list) || g_mod_block_list.length === 0) {
                return;
            }
            var backupAutofillModInfo = typeof g_autofillModInfo !== "undefined" && Array.isArray(g_autofillModInfo)
                ? JSON.parse(JSON.stringify(g_autofillModInfo))
                : [];
            var backupAutofillShelfInfo = typeof g_autofillShelfInfo !== "undefined" && Array.isArray(g_autofillShelfInfo)
                ? JSON.parse(JSON.stringify(g_autofillShelfInfo))
                : [];
            try {
                for (const blkDet of g_mod_block_list) {
                    if (typeof blkDet === "undefined" || blkDet == null) {
                        continue;
                    }
                    var modIndexList = Array.isArray(blkDet.mod_index) ? blkDet.mod_index.slice() : [];
                    if (modIndexList.length === 0 && Array.isArray(blkDet.BlkModInfo) && blkDet.BlkModInfo.length > 0) {
                        var modIdx = Number(blkDet.BlkModInfo[0].modIdx);
                        if (Number.isFinite(modIdx)) {
                            modIndexList.push(modIdx);
                        }
                    }
                    if (modIndexList.length === 0) {
                        continue;
                    }

                    g_autofillModInfo = Array.isArray(blkDet.BlkModInfo) ? JSON.parse(JSON.stringify(blkDet.BlkModInfo)) : [];
                    g_autofillShelfInfo = Array.isArray(blkDet.BlkShelfInfo) ? JSON.parse(JSON.stringify(blkDet.BlkShelfInfo)) : [];
                    if (!Array.isArray(g_autofillModInfo) || g_autofillModInfo.length === 0) {
                        continue;
                    }

                    var dragStart = blkDet.DragMouseStart || { x: 0, y: 0 };
                    var dragEnd = blkDet.DragMouseEnd || { x: 0, y: 0 };
                    var blockName = blkDet.BlkName || "BLOCK_AFP";
                    var blockColor = blkDet.BlkColor || "#FFFFFF";
                    var hasBlockDim = blkDet.BlockDim && Number.isFinite(blkDet.BlockDim.CalcX) && Number.isFinite(blkDet.BlockDim.BlkWidth);

                    if (hasBlockDim) {
                        await colorAutofillBlock(dragStart, dragEnd, modIndexList, blockColor, blockName, "U", blkDet, p_pog_index, "N");
                    } else {
                        await colorAutofillBlock(dragStart, dragEnd, modIndexList, blockColor, blockName, "Y", {}, p_pog_index, "N");
                    }
                }
            } catch (overlayErr) {
                error_handling(overlayErr);
            } finally {
                g_autofillModInfo = backupAutofillModInfo;
                g_autofillShelfInfo = backupAutofillShelfInfo;
            }
        }

        var selectedPogIndex = typeof p_selected_pog_index === "number" && p_selected_pog_index > -1 ? p_selected_pog_index : 0;
        var sourceJson = JSON.parse(JSON.stringify(g_pog_json || []));
        var selectedPog = sourceJson[selectedPogIndex];
        if (typeof selectedPog === "undefined") {
            return;
        }

        if (g_analysis_view_active !== "Y") {
            g_analysis_prev_state = {
                pog_json: JSON.parse(JSON.stringify(g_pog_json || [])),
                scene_objects: Array.isArray(g_scene_objects) ? g_scene_objects.slice() : [],
                canvas_objects: Array.isArray(g_canvas_objects) ? g_canvas_objects.slice() : [],
                pog_index: typeof g_pog_index === "number" ? g_pog_index : 0,
                tile_view: $v(g_page_no + "POGCR_TILE_VIEW"),
            };

            g_scene_objects = [];
            g_canvas_objects = [];
            await appendCanvasForGraph();

            init(0);
            var l_objects = {};
            l_objects["scene"] = g_scene;
            l_objects["renderer"] = g_renderer;
            g_scene_objects.push(l_objects);
            g_world = g_scene_objects[0].scene.children[2];
            g_camera = g_scene_objects[0].scene.children[0];
            g_pog_index = 0;
            await create_module_from_json([selectedPog], "N", "F", "N", "E", "N", "N", "Y", "Y", selectedPog.Version || p_pog_version, "Y", g_scene_objects[0].scene.children[0], g_scene_objects[0].scene, 0, 0);
            await localRenderAnalysisBlocks(0);
            try {
                var details = get_min_max_xy(0).split("###");
                set_camera_z(g_camera, parseFloat(details[2]), parseFloat(details[3]), parseFloat(details[0]), parseFloat(details[1]), g_offset_z, parseFloat(details[4]), parseFloat(details[5]), false, 0);
            } catch (fitErr) {
                error_handling(fitErr);
            }
            render(0);
            set_select_canvas(0);
            g_analysis_view_active = "Y";
            g_ComViewIndex = -1;
        }

        const canvasEl = document.getElementById("analysisChart_1");
        if (!canvasEl) {
            return;
        }
        const ctx = canvasEl.getContext("2d");
        if (g_analysis_chart_instance && typeof g_analysis_chart_instance.destroy === "function") {
            g_analysis_chart_instance.destroy();
        }
        function localNormalizeBlockName(p_blk_name) {
            if (typeof p_blk_name !== "string" || p_blk_name === "") {
                return "Block";
            }
            return p_blk_name.endsWith("_AFP") ? p_blk_name.slice(0, -4) : p_blk_name;
        }

        function localBuildShelfAxisLabel(p_shelf_info) {
            var moduleIndex = Number(p_shelf_info && p_shelf_info.MIndex);
            var shelfIndex = Number(p_shelf_info && p_shelf_info.SIndex);
            var shelfName = p_shelf_info && typeof p_shelf_info.Shelf !== "undefined" ? p_shelf_info.Shelf : "Shelf";
            if (!Number.isFinite(moduleIndex)) {
                moduleIndex = 0;
            }
            if (!Number.isFinite(shelfIndex)) {
                shelfIndex = 0;
            }
            return "M" + moduleIndex + "-S" + shelfIndex + " (" + shelfName + ")";
        }

        function localBuildChartModel(p_block_list) {
            var emptyChart = {
                labels: ["No shelf data"],
                datasets: [{
                    label: "No shelf data",
                    backgroundColor: "#D9D9D9",
                    data: [0],
                }],
                hasData: false,
            };

            if (!Array.isArray(p_block_list) || p_block_list.length === 0) {
                return emptyChart;
            }

            var shelfRegistry = {};
            var matrix = {};
            var blockOrder = [];
            var blockColorMap = {};
            var blockSeen = {};

            for (const blockInfo of p_block_list) {
                if (typeof blockInfo === "undefined" || blockInfo == null) {
                    continue;
                }

                var blockName = typeof blockInfo.BlkName === "string" && blockInfo.BlkName !== ""
                    ? blockInfo.BlkName
                    : "BLOCK_" + (blockOrder.length + 1);

                if (!blockSeen[blockName]) {
                    blockOrder.push(blockName);
                    blockSeen[blockName] = true;
                }

                blockColorMap[blockName] = typeof blockInfo.BlkColor === "string" && blockInfo.BlkColor !== ""
                    ? blockInfo.BlkColor
                    : "#7D8791";

                if (!Array.isArray(blockInfo.BlkShelfInfo)) {
                    continue;
                }

                for (const shelfWrap of blockInfo.BlkShelfInfo) {
                    var shelfInfo = shelfWrap && shelfWrap.ShelfInfo ? shelfWrap.ShelfInfo : null;
                    if (!shelfInfo || shelfInfo.ObjType !== "SHELF") {
                        continue;
                    }

                    var mIndex = Number(shelfInfo.MIndex);
                    var sIndex = Number(shelfInfo.SIndex);
                    if (!Number.isFinite(mIndex)) {
                        mIndex = 0;
                    }
                    if (!Number.isFinite(sIndex)) {
                        sIndex = Number(shelfWrap && shelfWrap.ShelfIdx);
                    }
                    if (!Number.isFinite(sIndex)) {
                        sIndex = 0;
                    }

                    var shelfKey = mIndex + "::" + sIndex;
                    if (!shelfRegistry[shelfKey]) {
                        shelfRegistry[shelfKey] = {
                            mIndex: mIndex,
                            sIndex: sIndex,
                            y: Number(shelfInfo.Y),
                            shelfInfo: shelfInfo,
                        };
                        if (!Number.isFinite(shelfRegistry[shelfKey].y)) {
                            shelfRegistry[shelfKey].y = 0;
                        }
                    }

                    var shelfWidth = Number(shelfInfo.W);
                    var overlapWidth = Number(shelfWrap && shelfWrap.OverlapWidth);
                    var percent = 0;
                    if (Number.isFinite(shelfWidth) && shelfWidth > 0 && Number.isFinite(overlapWidth)) {
                        percent = (overlapWidth / shelfWidth) * 100;
                    }
                    if (!Number.isFinite(percent)) {
                        percent = 0;
                    }
                    percent = Math.max(0, Math.min(100, percent));

                    if (!matrix[shelfKey]) {
                        matrix[shelfKey] = {};
                    }
                    if (!Number.isFinite(matrix[shelfKey][blockName])) {
                        matrix[shelfKey][blockName] = 0;
                    }
                    matrix[shelfKey][blockName] += percent;
                }
            }

            var orderedShelfKeys = Object.keys(shelfRegistry);
            orderedShelfKeys.sort(function (leftKey, rightKey) {
                var left = shelfRegistry[leftKey];
                var right = shelfRegistry[rightKey];
                if (left.mIndex !== right.mIndex) {
                    return left.mIndex - right.mIndex;
                }
                if (left.y !== right.y) {
                    return right.y - left.y;
                }
                return left.sIndex - right.sIndex;
            });

            if (orderedShelfKeys.length === 0) {
                return emptyChart;
            }

            var labels = [];
            for (const shelfKey of orderedShelfKeys) {
                labels.push(localBuildShelfAxisLabel(shelfRegistry[shelfKey].shelfInfo));
            }

            var datasets = [];
            for (const blockName of blockOrder) {
                var datasetValues = [];
                var hasNonZero = false;
                for (const shelfKey of orderedShelfKeys) {
                    var value = matrix[shelfKey] && Number.isFinite(matrix[shelfKey][blockName]) ? matrix[shelfKey][blockName] : 0;
                    value = Math.round(value * 100) / 100;
                    if (value !== 0) {
                        hasNonZero = true;
                    }
                    datasetValues.push(value);
                }
                if (!hasNonZero) {
                    continue;
                }
                datasets.push({
                    label: localNormalizeBlockName(blockName),
                    backgroundColor: blockColorMap[blockName] || "#7D8791",
                    data: datasetValues,
                });
            }

            if (datasets.length === 0) {
                return emptyChart;
            }

            return {
                labels: labels,
                datasets: datasets,
                hasData: true,
            };
        }

        function localComputeChartMaxY(p_chart_model) {
            if (!p_chart_model || !Array.isArray(p_chart_model.datasets) || p_chart_model.datasets.length === 0) {
                return 100;
            }
            var labelCount = Array.isArray(p_chart_model.labels) ? p_chart_model.labels.length : 0;
            if (labelCount === 0) {
                return 100;
            }

            var maxStack = 0;
            for (var i = 0; i < labelCount; i++) {
                var stackTotal = 0;
                for (const ds of p_chart_model.datasets) {
                    var val = Array.isArray(ds.data) ? Number(ds.data[i]) : 0;
                    if (Number.isFinite(val) && val > 0) {
                        stackTotal += val;
                    }
                }
                if (stackTotal > maxStack) {
                    maxStack = stackTotal;
                }
            }

            if (!Number.isFinite(maxStack) || maxStack <= 0) {
                return 100;
            }
            if (maxStack <= 100) {
                return 100;
            }
            var paddedMax = maxStack * 1.05;
            return Math.ceil(paddedMax / 10) * 10;
        }

        function localBuildChartOptions(p_has_data, p_y_max) {
            var showLegend = p_has_data === true;
            var chartMajorVersion = 0;
            if (typeof Chart !== "undefined" && typeof Chart.version === "string") {
                chartMajorVersion = parseInt(Chart.version.split(".")[0], 10);
            }
            var isChartV3Plus = chartMajorVersion >= 3;
            var yAxisMax = Number.isFinite(p_y_max) && p_y_max > 0 ? p_y_max : 100;

            if (isChartV3Plus) {
                return {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: showLegend,
                            position: "bottom",
                        },
                        tooltip: {
                            mode: "nearest",
                            intersect: true,
                            callbacks: {
                                label: function (context) {
                                    var val = Number(context && context.parsed && context.parsed.y);
                                    val = Number.isFinite(val) ? Math.round(val * 100) / 100 : 0;
                                    return context.dataset.label + ": " + val + "%";
                                },
                            },
                        },
                    },
                    scales: {
                        x: {
                            stacked: true,
                            grid: {
                                display: false,
                            },
                            ticks: {
                                autoSkip: false,
                                maxRotation: 0,
                                minRotation: 0,
                            },
                        },
                        y: {
                            stacked: true,
                            type: "linear",
                            beginAtZero: true,
                            min: 0,
                            max: yAxisMax,
                            ticks: {
                                callback: function (value) {
                                    return value + "%";
                                },
                            },
                        },
                    },
                };
            }

            return {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: showLegend,
                    position: "bottom",
                },
                tooltips: {
                    mode: "nearest",
                    intersect: true,
                    displayColors: true,
                    callbacks: {
                        label: function (tooltipItem, data) {
                            var dsLabel = data && data.datasets && data.datasets[tooltipItem.datasetIndex] ? data.datasets[tooltipItem.datasetIndex].label : "Block";
                            var val = Number(tooltipItem && tooltipItem.yLabel);
                            val = Number.isFinite(val) ? Math.round(val * 100) / 100 : 0;
                            return dsLabel + ": " + val + "%";
                        },
                    },
                },
                scales: {
                    xAxes: [{
                        stacked: true,
                        gridLines: {
                            display: false,
                        },
                        ticks: {
                            autoSkip: false,
                            maxRotation: 0,
                            minRotation: 0,
                        },
                    }],
                    yAxes: [{
                        stacked: true,
                        type: "linear",
                        ticks: {
                            beginAtZero: true,
                            min: 0,
                            max: yAxisMax,
                            callback: function (value) {
                                return value + "%";
                            },
                        },
                    }],
                },
            };
        }

        var chartModel = localBuildChartModel(g_mod_block_list);
        var chartData = {
            labels: chartModel.labels,
            datasets: chartModel.datasets,
        };
        var chartMaxY = localComputeChartMaxY(chartModel);
        var chartOptions = localBuildChartOptions(chartModel.hasData, chartMaxY);
        g_analysis_chart_instance = new Chart(ctx, {
            type: "bar",
            data: chartData,
            options: chartOptions,
        });
    } catch (err) {
        error_handling(err);
    } finally {
        logDebug("function : show_view_analysis", "E");
    }
}

async function close_view_analysis() {
    logDebug("function : close_view_analysis", "S");
    try {
        async function localRestoreBlocksAfterClose(p_pog_index) {
            if (typeof colorAutofillBlock !== "function" || !Array.isArray(g_mod_block_list) || g_mod_block_list.length === 0) {
                return;
            }
            var backupAutofillModInfo = typeof g_autofillModInfo !== "undefined" && Array.isArray(g_autofillModInfo)
                ? JSON.parse(JSON.stringify(g_autofillModInfo))
                : [];
            var backupAutofillShelfInfo = typeof g_autofillShelfInfo !== "undefined" && Array.isArray(g_autofillShelfInfo)
                ? JSON.parse(JSON.stringify(g_autofillShelfInfo))
                : [];
            $(".wt-changes").removeClass('disable');    
            try {
                for (const blkDet of g_mod_block_list) {
                    if (typeof blkDet === "undefined" || blkDet == null) {
                        continue;
                    }
                    var modIndexList = Array.isArray(blkDet.mod_index) ? blkDet.mod_index.slice() : [];
                    if (modIndexList.length === 0 && Array.isArray(blkDet.BlkModInfo) && blkDet.BlkModInfo.length > 0) {
                        var modIdx = Number(blkDet.BlkModInfo[0].modIdx);
                        if (Number.isFinite(modIdx)) {
                            modIndexList.push(modIdx);
                        }
                    }
                    if (modIndexList.length === 0) {
                        continue;
                    }

                    var blockName = blkDet.BlkName || "BLOCK_AFP";
                    var blockColor = blkDet.BlkColor || "#FFFFFF";
                    var hasBlockDim = blkDet.BlockDim && Number.isFinite(blkDet.BlockDim.CalcX) && Number.isFinite(blkDet.BlockDim.BlkWidth);
                    g_autofillModInfo = Array.isArray(blkDet.BlkModInfo) ? JSON.parse(JSON.stringify(blkDet.BlkModInfo)) : [];
                    g_autofillShelfInfo = Array.isArray(blkDet.BlkShelfInfo) ? JSON.parse(JSON.stringify(blkDet.BlkShelfInfo)) : [];

                    var firstModIdx = Number(modIndexList[0]);
                    if (Number.isFinite(firstModIdx) && typeof g_pog_json[p_pog_index] !== "undefined" && typeof g_pog_json[p_pog_index].ModuleInfo !== "undefined" && typeof g_pog_json[p_pog_index].ModuleInfo[firstModIdx] !== "undefined") {
                        var moduleObjId = g_pog_json[p_pog_index].ModuleInfo[firstModIdx].MObjID;
                        if (g_world && Number.isFinite(moduleObjId)) {
                            var moduleObj = g_world.getObjectById(moduleObjId);
                            if (moduleObj) {
                                var oldMesh = moduleObj.getObjectByProperty("uuid", blockName);
                                if (oldMesh && oldMesh.parent) {
                                    oldMesh.parent.remove(oldMesh);
                                }
                            }
                        }
                    }

                    var dragStart = blkDet.DragMouseStart || { x: 0, y: 0 };
                    var dragEnd = blkDet.DragMouseEnd || { x: 0, y: 0 };

                    if (hasBlockDim) {
                        await colorAutofillBlock(dragStart, dragEnd, modIndexList, blockColor, blockName, "U", blkDet, p_pog_index, "N");
                    } else {
                        await colorAutofillBlock(dragStart, dragEnd, modIndexList, blockColor, blockName, "Y", {}, p_pog_index, "N");
                    }
                }
            } catch (restoreErr) {
                error_handling(restoreErr);
            } finally {
                g_autofillModInfo = backupAutofillModInfo;
                g_autofillShelfInfo = backupAutofillShelfInfo;
            }
        }

        if (g_analysis_chart_instance && typeof g_analysis_chart_instance.destroy === "function") {
            g_analysis_chart_instance.destroy();
        }
        g_analysis_chart_instance = null;

        if (g_analysis_view_active !== "Y" || g_analysis_prev_state == null) {
            return;
        }

        var prevState = g_analysis_prev_state;
        var prevTileView = prevState.tile_view || $v(g_page_no + "POGCR_TILE_VIEW") || "V";
        var prevPogIndex = typeof prevState.pog_index === "number" ? prevState.pog_index : 0;
        var prevSceneObjects = Array.isArray(prevState.scene_objects) ? prevState.scene_objects : [];

        g_pog_json = JSON.parse(JSON.stringify(prevState.pog_json || []));
        g_scene_objects = prevSceneObjects;
        g_canvas_objects = [];

        if (g_pog_json.length > 0) {
            await appendMultiCanvasRowCol(g_pog_json.length, prevTileView);
            if (typeof modifyWindowAfterMinMax === "function") {
                await modifyWindowAfterMinMax(prevSceneObjects);
            }
            if (typeof switchCanvasView === "function") {
                await switchCanvasView(prevTileView, "Y");
            }
            g_pog_index = prevPogIndex >= 0 && prevPogIndex < g_pog_json.length ? prevPogIndex : 0;
            set_select_canvas(g_pog_index);
            await localRestoreBlocksAfterClose(g_pog_index);
            render(g_pog_index);
        } else {
            $("#canvas-holder .container").html("");
        }

        g_analysis_view_active = "N";
        g_analysis_prev_state = null;
    } catch (err) {
        error_handling(err);
    } finally {
        logDebug("function : close_view_analysis", "E");
    }
}


async function appendCanvasForGraph() {
    g_windowHeight = window.innerHeight - 167;
    $("#canvas-holder .container").css("height", g_windowHeight + "px");
    var containerH = $("#canvas-holder .container").height();
    var containerW = $("#canvas-holder .container").width();

    g_canvas_objects = [];
    $("#canvas-holder .container").html("");
    // Analysis mode uses a dedicated top/bottom layout independent of normal tile view.
    $("#canvas-holder .container").css("display", "grid").addClass("v-view").removeClass("h-view");
    $("#canvas-holder .container").append('<div class="row" data-row="1"></div>');
    $("#canvas-holder .container").append('<div class="row" data-row="2"></div>');

    var topWidth = parseFloat(containerW.toFixed(2));
    var topHeight = parseFloat((containerH / 2).toFixed(2));
    var bottomWidth = parseFloat(containerW.toFixed(2));
    var bottomHeight = parseFloat((containerH / 2).toFixed(2));

    var topButtons = '<div class="canvas-buttons" id="maincanvas-btns"><span class="fa fa-close canvas-close" onClick="close_view_analysis()"></span></div>';
    var bottomButtons = '<div class="canvas-buttons" id="maincanvas2-btns"><span class="fa fa-close canvas-close" onClick="close_view_analysis()"></span></div>';
    var topHtml = '<div class="canvas-content" id="maincanvas-container" data-col="1" style="height:' + topHeight + "px;width:" + topWidth + 'px">' + topButtons + '<canvas class="canvasregion" data-canvas=true id="maincanvas"></canvas></div>';
    var bottomHtml = '<div class="canvas-content" id="maincanvas2-container" data-col="1" style="height:' + bottomHeight + "px;width:" + bottomWidth + 'px">' + bottomButtons + '<div class="analysis-panel-content" style="background:#181E24; padding:10px; height:100%; box-sizing:border-box; display:flex; flex-direction:column;"><div style="flex:1 1 auto; min-height:0; background:#fff; border-radius:4px; padding:10px;"><canvas id="analysisChart_1" style="width:100%;height:100%;display:block;"></canvas></div></div></div>';

    $("[data-row='1']").append(topHtml);
    $("[data-row='2']").append(bottomHtml);

    try {
        var topCanvas = document.getElementById("maincanvas");
        if (topCanvas) {
            topCanvas.setAttribute("data-indx", 0);
            g_canvas_objects.push(topCanvas);
        }
    } catch (e) {
        error_handling(e);
    }
    makeResizableRow();
}
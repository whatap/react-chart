(function (window){
    var w3 = window.w3 || {};

    var w3_hitmapChart_fn;
    var w3_hitmapChart_internal_fn;

    var w3_hitmapChart_opt = {
        hit: {
            minWidth : 5,
            minHeight: 5
        },
        errorOnly: true,
        visible: {
            err: true,
            hit: true
        },
        brush: {
            maxWidth: 1000 * 60 * 60 * 2,
            maxHeight: 999999, //  used not yet
        }
    }
    
    // if( $.cookie('hitmap.visible.'+'err') == 'false'){
    //         w3_hitmapChart_opt.visible['err'] = false;
    // }
    // if( $.cookie('hitmap.visible.'+'hit') == 'false'){
    //         w3_hitmapChart_opt.visible['hit'] = false;
    // }

    function HitmapChart(config) {
        this.internal = new HitmapChartInternal(this);
        this.internal.config = $.extend( true, {}, w3_hitmapChart_opt , config);
        this.internal.init();

        // bind "this" to nested API
        (function bindThis(fn, target, argThis) {
            Object.keys(fn).forEach(function (key) {
                target[key] = fn[key].bind(argThis);
                if (Object.keys(fn[key]).length > 0) {
                    bindThis(fn[key], target[key], argThis);
                }
            });
        })(w3_hitmapChart_fn, this, this);
    }

    function HitmapChartInternal(api) {
        this.d3 = window.d3;
        this.api = api;
    }

    w3.hitmapGenerate = function (config) {
        return new HitmapChart(config);
    };

    w3.hitmapChart = {
        fn: HitmapChart.prototype,
        internal: {
            fn: HitmapChartInternal.prototype
        }
    };

    // shortcut
    w3_hitmapChart_fn = w3.hitmapChart.fn;
    w3_hitmapChart_internal_fn = w3.hitmapChart.internal.fn;

    // private methods
    w3_hitmapChart_internal_fn.init = function () {
        this.selectChart = d3.select(this.config.bindto);
        this.api.element = this.selectChart.node();

        this.initParams();
        this.bindResize();
        this.initChart();
    };
    w3_hitmapChart_internal_fn.initParams = function () {
        var config = this.config;

        this.margin = config.margin || {top: 30, right: 30, bottom: 30, left: 30};
        this.width = this.api.element.getBoundingClientRect().width - this.margin.left - this.margin.right;
        this.height = this.api.element.getBoundingClientRect().height - this.margin.top - this.margin.bottom;
        this.yAxisDomainValues = [5000, 10000, 20000, 40000, 80000];
        this.yAxisDomainMaxValue = config.yAxis.max || 80000;
        this.yAxisDomainCurrentMaxValue = config.yAxis.current || this.yAxisDomainMaxValue;
        if (config.animation === false) { this.animation = false; }
        else { this.animation = true; }

        this.countLevel = config.countLevel || {'err': [0, 3, 6], 'hit': [0, 150, 300]};

        this.color = {
            // hit: ['#fff', '#7594f5', '#576df0', '#3b4cf2', '##1e0a91'],
            // err: ['#ffb86a', '#e34e0d', '#980e35']
            // hit: ['#fff', '#50de82', '#0ba3b5', '#4d50d9', '#1c0f48'],
            // err: ['#f7c92b', '#f48522', '#d62728']
            // hit: ['#007eff', '#0016ed', '#6e00e9', '#1d094c'],
            // err: ['#e6d300', '#f19f00', '#f8002f']
            // hit: ['#2196f3', '#1565c0', '#1a237e'],
            // err: ['#fbc02d', '#f57c00', '#d50000']
            hit: ['#2196f3', '#1565c0', '#1a237e'],
            err: ['#f9a825', '#ef6c00', '#d50000']
        };

        this.blockMaxRowIndex = 40;
        if (config.xAxis) {
            this.blockTimeInterval = config.xAxis.interval || 5000;  // ms
        } else {
            this.blockTimeInterval = 5000;  // ms
        }

        this.isTransition = false;

        this.endDate = new Date();
        this.startDate = new Date(this.endDate.getTime() - 10 * 60 * 1000);
    };
    w3_hitmapChart_internal_fn.updateParams = function () {
        var that = this;
        that.width = that.api.element.getBoundingClientRect().width - that.margin.left - that.margin.right;
        that.height = that.api.element.getBoundingClientRect().height - that.margin.top - that.margin.bottom;
    };
    w3_hitmapChart_internal_fn.bindResize = function () {
        var that = this;

        var resizeFunction = function () {
            that.updateParams();
            if (that.width > 0 && that.height > 0) {
                that.resetAxis();
                that.draw();
            }
        };

        if (window.addEventListener) {
            window.addEventListener("resize", resizeFunction, false);
        } else if (window.attachEvent) {
            window.attachEvent("onresize", resizeFunction);
        } else {
            window["onresize"] = resizeFunction;
        }
    };
    w3_hitmapChart_internal_fn.initChart = function () {
        var that = this;
        var config = this.config;

        this.svg = this.selectChart.append('svg')
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .attr('class', 'w3-hitmap-chart')
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        this.selectChart
            .style("position", "relative");


        // this.tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d; });
        // this.svg.call(this.tip)

        // this.buttonGroupDiv = this.selectChart.append("div")
        //     .attr("class", "w3-hitmap-chart-buttons")
        //     .attr("style", function (){
        //         return "position: absolute; right: " + that.margin.right  + "px;"
        //     });

        // this.optionsDiv = this.selectChart.append("div")
        // if(this.config.errorOnly){
        //     this.onlyError = this.buttonGroupDiv
        //     .append('input')
        //     .attr('type', 'checkbox')
        //     .attr('class', 'hitmap-error-checkbox')
        //     .attr('id', 'errorOnly')
        //     .attr('style', 'margin: 2px 3px 0px 0px; vertical-align: middle;')
        //     .on('click', function() {
        //         that.showOnlyError( $(this).is(":checked") );
        //     });

        //     // if(this.config.visible.err === true && this.config.visible.hit === false){
        //     //     this.onlyError.attr('checked', true);
        //     // }

        //     // this.buttonGroupDiv            
        //     // .append("label")
        //     // .attr('class', 'hitmap-error-text')
        //     // .attr('for', 'errorOnly')
        //     // .text('error_only')
        //     // .attr('style', 'margin: 0px 10px 0px 0px; vertical-align: middle;')
        // }

        // this.buttonGroup = this.buttonGroupDiv.append("div")
        //     .attr("class", "btn-group btn-group-sm")
        //     .attr('style', function(){
        //         if (config.buttons === false) {
        //             return "display: none;"
        //         }
        //     })
        // if (config.buttonsLeftRight){
            
        //     this.leftButton = this.buttonGroup.append("button")
        //         .attr('type', 'button')
        //         .attr('class', 'btn btn-secondary')
        //         .style('width', '23px')
        //         .on('click', function() {
        //             that.config.buttonCallback(null, {direction: "left"});
        //         });

        //     // this.leftButton
        //     //     .append('img')
        //     //     .attr('src', '/images/hitmap/hitmap-arrow-left.png')
        //     //     .attr('alt', 'left')
        //     //     .attr('class', 'hitmap-arrow-left');

        //     // this.rightButton = this.buttonGroup.append("button")
        //     //     .attr('type', 'button')
        //     //     .attr('class', 'btn btn-secondary')
        //     //     .style('width', '23px')
        //     //     .on('click', function() {
        //     //         that.config.buttonCallback(null, {direction: 'right'});
        //     //     });

        //     // this.rightButton
        //     //     .append('img')
        //     //     .attr('src', '/images/hitmap/hitmap-arrow-right.png')
        //     //     .attr('alt', 'right')
        //     //     .attr('class', 'hitmap-arrow-right');
        // }

        // this.upButton = this.buttonGroup.append("button")
        //     .attr('type', 'button')
        //     .attr('class', 'btn btn-secondary')
        //     .style('width', '23px')
        //     .on('click', function() {
        //         that.changeYAxis('up');
        //     });

        // // this.upButton
        // //     .append('img')
        // //     .attr('src', '/images/hitmap/hitmap-arrow-up.png')
        // //     .attr('alt', 'up')
        // //     .attr('class', 'hitmap-arrow-up');

        // this.downButton = this.buttonGroup.append("button")
        //     .attr('type', 'button')
        //     .attr('class', 'btn btn-secondary')
        //     .style('width', '23px')
        //     .on('click', function() {
        //         that.changeYAxis('down');
        //     });

        // // this.downButton
        // //     .append('img')
        // //     .attr('src', '/images/hitmap/hitmap-arrow-down.png')
        // //     .attr('alt', 'down')
        // //     .attr('class', 'hitmap-arrow-down');



        this.yScale = d3.scale.linear()
            .range([this.height, 0])
            .domain([0, this.yAxisDomainCurrentMaxValue]);

        this.yAxis = d3.svg.axis()
            .scale(this.yScale)
            .orient("left")
            .ticks(5, 1)
            .tickFormat(function (d) {
                return d /1000 + "s";
            });

        this.blockRowScale = d3.scale.linear()
            .range([this.height, 0])
            .domain([0, this.blockMaxRowIndex]);

        this.xScale = d3.time.scale()
            .range([0, this.width])
            .domain([this.startDate, this.endDate]);

        if (that.blockTimeInterval < 10000) {
            this.xAxis = d3.svg.axis()
                .scale(this.xScale)
                .orient("bottom")
                .ticks(d3.time.minutes, 2)
                .tickFormat(d3.time.format('%H:%M'));
        } else {
            this.xAxis = d3.svg.axis()
                .scale(this.xScale)
                .orient("bottom")
                .ticks(d3.time.hours, 2)
                .tickFormat(d3.time.format('%H:%M'));
        }

        this.svg.append("clipPath")
            .attr("id", "clipPath-" + config.chartName)
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", this.width)
            .attr("height", this.height);

        this.brush = d3.svg.brush()
            .x(this.xScale)
            // .extent([200,0], [0,200])
            .y(this.yScale);

        this.brush
            .on("brushstart", this.brushstart(this.brush))
            .on("brush", this.brushmove(this.brush))
            .on("brushend", this.brushend(this.brush))

        this.brush.endCallback = config.brush.callback;

        this.svg.append("g")
            .attr("class", "y axis")
            .call(this.yAxis);

        this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(this.xAxis);

        this.initGridLines();

        if (config.legends){
            this.initLegends();
        }

        this.svg.append("g")
            .attr("class", "hits")
            .attr("clip-path", "url(#clipPath-" + config.chartName + ")");

        this.svg.append("g")
            .attr("class", "brush")
            .call(this.brush)
            .selectAll('rect');
    };
    w3_hitmapChart_internal_fn.initGridLines = function() {
        var that = this;
        // Draw the y Grid lines
        this.svg.append("g")
            .attr("class", "grid grid-y")
            .call(
                d3.svg.axis()
                    .scale(that.yScale)
                    .orient("left")
                    .ticks(5)
                    .tickSize(-this.width, 0, 0)
                    .tickFormat("")
            );

        // Draw the x Grid lines
        this.svg.append("g")
            .attr("class", "grid grid-x")
            .attr("transform", "translate(0," + this.height + ")")
            .call(
                d3.svg.axis()
                    .scale(that.xScale)
                    .orient("bottom")
                    .ticks(d3.time.minutes, 2)
                    .tickSize(-this.height, 0, 0)
                    .tickFormat("")
            );
    };
    w3_hitmapChart_internal_fn.initLegends = function() {
        var that = this;
        this.legendGroup = this.selectChart.select('svg').append("g")
            .attr("class", "legends")
            .attr("transform", "translate(" + this.margin.left + "," + (this.height + this.margin.top + 30) + ")");

        this.legendGroup.append("text")
            .attr("x", 0)
            .attr("y", 11)
            .text("Normal");

        this.color.hit.forEach(function(color, i){
            that.legendGroup.append("rect")
                .attr("width", 13)
                .attr("height", 13)
                .attr("x", 60 + i * 13)
                .style("fill", color);
        });

        this.legendGroup.append("text")
            .attr("x", 130)
            .attr("y", 11)
            .text("Error");

        this.color.err.forEach(function(color, i){
            that.legendGroup.append("rect")
                .attr("width", 13)
                .attr("height", 13)
                .attr("x", 170 + i * 13)
                .style("fill", color);
        });
    };
    w3_hitmapChart_internal_fn.draw = function() {
        this.isTransition = true;
        this.brush
            .x(this.xScale)
            .y(this.yScale);

        this.svg = this.selectChart.select('svg')
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.svg.select("clipPath rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", this.width)
            .attr("height", this.height);

        this.svg.select(".x.axis")
            .transition()
            // .duration(1000)
            .attr("transform", "translate(0," + this.height + ")")
            .call(this.xAxis);

        this.svg.select(".y.axis")
            .transition()
            // .duration(1000)
            .call(this.yAxis);

        this.svg.select('.legends')
            .attr("transform", "translate(" + this.margin.left + "," + (this.height + this.margin.top + 30) + ")");

        this.drawGridLines();
        this.drawHitBlocks();
    };
    w3_hitmapChart_internal_fn.drawGridLines = function () {
        var that = this;
        this.svg.select(".grid-y")
            .transition()
            .duration(1000)
            .call(
                d3.svg.axis()
                    .scale(that.yScale)
                    .orient("left")
                    .ticks(5)
                    .tickSize(-this.width, 0, 0)
                    .tickFormat("")
            );

        this.svg.select(".grid-x")
            .transition()
            .duration(1000)
            .attr("transform", "translate(0," + this.height + ")");

        if (that.blockTimeInterval < 10000){
            this.svg.select(".grid-x").call(
                    d3.svg.axis()
                        .scale(that.xScale)
                        .orient("bottom")
                        .ticks(d3.time.minutes, 2)
                        .tickSize(-this.height, 0, 0)
                        .tickFormat("")
                );
        } else {
            this.svg.select(".grid-x").call(
                    d3.svg.axis()
                        .scale(that.xScale)
                        .orient("bottom")
                        .ticks(d3.time.hours, 2)
                        .tickSize(-this.height, 0, 0)
                        .tickFormat("")
                );
        }
    };
    w3_hitmapChart_internal_fn.drawHitBlocks = function () {
        var that = this;
        var config = this.config;

        var timeRange = this.timeRange;
        var dataset = this.dataset;

        var tempDate = new Date(timeRange[1]);
        var tempDate1 = new Date(tempDate - that.blockTimeInterval);

        var hitRectWidth = that.xScale(tempDate) - that.xScale(tempDate1);
        hitRectWidth < w3_hitmapChart_opt.hit.minWidth ? hitRectWidth = w3_hitmapChart_opt.hit.minWidth : undefined;
        this.hitRectWidth = hitRectWidth;

        var hitRectHeight = that.blockRowScale(0) - that.blockRowScale(1);
        hitRectHeight < w3_hitmapChart_opt.hit.minHeight ? hitRectHeight = w3_hitmapChart_opt.hit.minHeight : undefined;

        // Update old hit blocks
        this.svg.select(".hits").selectAll("rect.hit").data(dataset, function (d) {
                return d.svgKey;
            })
            .transition()
            .duration(1000)
            .attr("x", function (d) {
                return that.xScale(d.time - that.blockTimeInterval);
            })
            .attr("y", function (d) {
                return that.blockRowScale(d.rowIndex + 1);
            })
            .attr("width", hitRectWidth)
            .attr("height", hitRectHeight)
            .style("fill", this.rectFill(this.color));

        // Add new hit blocks
        this.svg.select(".hits").selectAll("rect.hit").data(dataset, function (d) {
                return d.svgKey
            })
            .enter()
            .append("rect")
            .transition()
            .call(this.transitionEndAll, function () {
                that.isTransition = false;
            })
            // .delay(function (d, i){
            //     if (that.animation === false) { return 0; }
            //     else { return d.columnIndex / 120 * 1000; }
            // })
            // .duration(function (){
            //     // if (that.animation === false) { return 0; }
            //     // else { return 1000; }
            //     return 1000;
            // })
            // .each("start", function() {
            //     d3.select(this)
            //         .attr("fill", "#2196f3")
            //         .attr("stroke", "#fff")
            //     	.attr("stroke-width", "0.5");
            // })
            .attr("class", "hit")
            .attr("clip-path", "url(#clipPath-" + config.chartName + ")")
            .attr("x", function (d) {
                return that.xScale(d.time - that.blockTimeInterval);
            })
            .attr("y", function (d) {
                return that.blockRowScale(d.rowIndex + 1);
            })
            .attr("width", hitRectWidth)
            .attr("height", hitRectHeight)
            .style("fill", this.rectFill(this.color))
            .style("stroke", "#fff");

        // Remove unused hit blocks
        this.svg.select(".hits").selectAll("rect.hit").data(dataset, function (d) {
                return d.svgKey;
            })
            .exit()
            .remove();
    };
    w3_hitmapChart_internal_fn.resetAxis = function () {
        var timeRange = this.timeRange;
        this.config.dataset = this.dataset;

        this.endDate = new Date(timeRange[1]);
        this.startDate = new Date(timeRange[0]);

        this.xScale.range([0, this.width]).domain([this.startDate, this.endDate]);
        this.xAxis.scale(this.xScale);

        this.yScale.range([this.height, 0]).domain([0, this.yAxisDomainCurrentMaxValue]);
        this.yAxis.scale(this.yScale);

        this.blockRowScale.range([this.height, 0]).domain([0, this.blockMaxRowIndex]);
        this.resizeBrush();
    };

    w3_hitmapChart_internal_fn.resizeBrush = function () {
        if(!this.selectedBrush) return;
        var e = this.selectedBrush;
        var startDate = e[0][0] , endDate = e[1][0];
        var minY = e[0][1], maxY = e[1][1];

        var x = this.xScale(startDate); x = x < 0 ? 0 : x;
        var width = this.xScale(endDate) - x;
        var y = this.yScale(maxY);
        var height = this.yScale(minY) - y;

        d3.select(this.config.bindto).select(".extent")
        .attr('x',x).attr('width',width).attr('y',y).attr('height',height)
        .attr('stroke-dasharray', '10px')
    }

    w3_hitmapChart_internal_fn.redrawChart = function () {
        this.updateParams();
        if (this.width > 0 && this.height > 0){
            this.resetAxis();
            this.draw();
        }
    };
    w3_hitmapChart_internal_fn.brushstart = function (brush) {
        var that = this;
        return function () {
            that.selectedBrush = undefined;
            d3.select(that.config.bindto).select(".brush").call(brush.clear());
            d3.select(that.config.bindto).select(".extent").attr('stroke-dasharray', '0px')
        }
    };
    w3_hitmapChart_internal_fn.brushmove = function (brush) {
        var that = this;
        var maxWidth = that.config.brush.maxWidth;

        return function () {
            var e = brush.extent();
            var startDate = e[0][0], endDate = e[1][0];
            var diff = endDate - startDate;
            
            if(that.currentBrushArea && diff > maxWidth){
                if(that.currentBrushArea[0][0].getTime() === e[0][0].getTime()){
                    e[1][0] = new Date(startDate.getTime() + maxWidth);
                    var width = Math.floor( that.xScale(e[1][0]) - that.xScale(e[0][0]) );
                    d3.select('.extent').attr('width',  width);
                    // that.tip.show({},d3.select('.extent')[0]);
                }else if (that.currentBrushArea[1][0].getTime() === e[1][0].getTime()){
                    e[0][0] = new Date(endDate.getTime() - maxWidth);
                    var width = Math.floor( that.xScale(e[1][0]) - that.xScale(e[0][0]) );
                    d3.select('.extent').attr('x',  that.xScale(e[0][0]));
                    d3.select('.extent').attr('width',  width);
                    // that.tip.show({},d3.select('.extent')[0]);
                }
            }else{
                // that.tip.hide();
            }

            that.brushHitBlocks(e, that.yAxisDomainCurrentMaxValue, that.blockMaxRowIndex);
            that.currentBrushArea = e;
            // brush.extent(e)
            // if(min && (diff < min)) {
            //     extent[1] = extent[0] + min;
            // }else if(max && (diff > max)){
            //     extent[1] = extent[0] + max;
            // }else{
            //     return;
            // }
            // brush.extent(extent)(d3.select(this));


            // s.call(d3.event.target.move, 100);


        }
    };
    w3_hitmapChart_internal_fn.brushend = function (brush) {
        var that = this;
        
        return this.endCallback(brush, function(){
            that.selectedBrush = brush.extent();
            d3.select(that.config.bindto).select(".extent").attr('stroke-dasharray', '10px')
        })
    };

    w3_hitmapChart_internal_fn.endCallback = function (brush, cb) {
        var that = this;
        return function(){
            var area = brush.extent();
            if(that.selectedBrush) area = that.selectedBrush;
            if (that.config.brush.callback) {
                var selectedBlocks = d3.select(that.config.bindto).select(".hits").selectAll(".selected")[0];
                var data = null;
                if (selectedBlocks.length > 0){
                    var xRangeArray = selectedBlocks.map(function(a){ return a.__data__.time; });
                    var yRangeArray = selectedBlocks.map(function(a){ return a.__data__.latency });
                    var yRangeMax = Math.max.apply(null, yRangeArray) + that.yAxisDomainCurrentMaxValue / that.blockMaxRowIndex;
                    if (yRangeMax === that.yAxisDomainCurrentMaxValue){
                        yRangeMax = that.yAxisDomainMaxValue;
                    }
                    data = {
                        xRange: [
                            area[0][0].getTime(),
                            area[1][0].getTime()
                            // Math.min.apply(null, xRangeArray) - that.blockTimeInterval,
                            // Math.max.apply(null, xRangeArray)
                        ],
                        yRange: [
                            // Math.min.apply(null, yRangeArray),
                            // yRangeMax
                            area[0][1],
                            area[1][1]
                        ],
                        timeRange: that.timeRange,
                        yAxisDomainCurrentMaxValue: that.yAxisDomainCurrentMaxValue
                    }

                }
                that.config.brush.callback(null, data, selectedBlocks.length);
            }
            if(cb) cb();
        }
    }

    w3_hitmapChart_internal_fn.brushHitBlocks = function (e, yAxisCurrentMaximumDomain, blockMaxRowIndex, isRedraw) {
        var that = this;
        var interval = yAxisCurrentMaximumDomain / blockMaxRowIndex;

        d3.select(this.config.bindto).select(".extent").style('stroke', 'black').style("stroke-width", 2);
        d3.select(this.config.bindto).select(".hits").selectAll(".hit")
            .attr("class", function (d) {
                var date = new Date(d.time - that.blockTimeInterval);
                var outBrush = e[0][0] > date  || date  > e[1][0]
                    || e[0][1] > d.latency + interval || d.latency + interval > e[1][1];
                if (!outBrush) {
                    return "hit selected";
                } else {
                    return "hit";
                }
            })
            .style("stroke", function (d) {
                var date = new Date(d.time - that.blockTimeInterval);
                var outBrush = e[0][0] > date || date > e[1][0]
                    || e[0][1] > d.latency + interval || d.latency + interval > e[1][1];
                if (!outBrush) {
                    return "black";
                } else {
                    return null;
                }
            });
    };
    w3_hitmapChart_internal_fn.rectFill = function (color) {
        var that = this;
        return function(d) {
            var count = d.count;

            if (d.type === 'err') {
                if (count > that.countLevel.err[2]) return color.err[2];
                else if (count > that.countLevel.err[1]) return color.err[1];
                else return color.err[0];
            } else {  // 'hit'
                if (count > that.countLevel.hit[2]) return color.hit[2];
                else if (count > that.countLevel.hit[1]) return color.hit[1];
                else return color.hit[0];
            }
        };
    };
    w3_hitmapChart_internal_fn.updateDataset = function (dataset) {
        ['hit','err'].forEach(function(type){
            dataset[type].map(function(a){
                if (a[1] === null || a[1].length === 0){
                    a[1] = Array.apply(null, new Array(120)).map(function() { return 0 });
                }
                return a;
            });
        });

        return dataset;
    };
    w3_hitmapChart_internal_fn.Block = function (time, count, type, columnIndex, rowIndex, yAxisCurrentMaximumDomain) {
        this.time = time;  // x Axis
        this.count = count;  // transaction count
        this.type = type;  // 'hit' or 'err'
        this.columnIndex = columnIndex;  // column index
        this.rowIndex = rowIndex;  // row index
        this.latency = rowIndex * (yAxisCurrentMaximumDomain / 40);
        this.svgKey = time + "," + rowIndex + ',' + type;
    };
    w3_hitmapChart_internal_fn.sumTwoValues = function (a) {
        // [1,2,3,4,5,6] -> [1+2, 3+4, 5+6]
        var r = [];
        for (var i=0; i < a.length/2; i++){
            r.push(a[2 * i] + a[2 * i + 1]);
        }
        return r;
    };
    w3_hitmapChart_internal_fn.generateTransactionCountArray = function (a, domainIndex, blockMaxRowIndex){
        while (domainIndex > 0){
            a = this.sumTwoValues(a.slice(0, blockMaxRowIndex)).concat(a.slice(blockMaxRowIndex));
            domainIndex--;
        }
        var lastSumCount = a.slice(blockMaxRowIndex-1).reduce(function(a, b) {return a+b;}, 0);
        a = a.slice(0, blockMaxRowIndex - 1);
        a.push(lastSumCount);
        return a;
    };
    w3_hitmapChart_internal_fn.getCustomData = function (dataset, yAxisCurrentMaximumDomain) {
        // from json data to Block array
        var that = this;
        var domainIndex = this.yAxisDomainValues.indexOf(yAxisCurrentMaximumDomain);

        var visibleKeys = [];

        if(this.config.visible.hit == true) visibleKeys.push('hit');
        if(this.config.visible.err == true) visibleKeys.push('err');

        return visibleKeys.map(function (type) {
            return dataset[type].map(function (a, i) {
                // a = [`timestamp`, [`count`, `count`, ... ]]
                return that.generateTransactionCountArray(a[1], domainIndex, that.blockMaxRowIndex).map(function (count, j) {
                    return new that.Block(a[0], count, type, i, j, yAxisCurrentMaximumDomain);
                });
            }).reduce(function (a, b) { return a.concat(b); }, []);
        }).reduce(function(a,b) { return a.concat(b); }).filter(function(x){ return x.count > 0;});
    };
    w3_hitmapChart_internal_fn.getCustomTimeRange = function (timeRange) {
        if (timeRange[0] !== null) {
            return timeRange;
        }

        var endTime;
        if (timeRange[1] % this.blockTimeInterval === 0){
            endTime = timeRange[1];
        } else {
            var temp = timeRange[1] % this.blockTimeInterval * 2;
            if (temp > this.blockTimeInterval) endTime = timeRange[1] - temp + this.blockTimeInterval;
            else endTime = timeRange[1] - temp
        }
        return [endTime  - (1000 * 60 * 10), endTime];
    };
    w3_hitmapChart_internal_fn.transitionEndAll = function (transition, callback) {
        var n;
        if (transition.empty()) {
            callback();
        }
        else {
            n = transition.size();
            transition.each("end", function () {
                n--;
                if (n === 0) {
                    callback();
                }
            });
        }
    };
    w3_hitmapChart_internal_fn.changeYAxis = function (direction) {
        var currentIndex = this.yAxisDomainValues.indexOf(this.yAxisDomainCurrentMaxValue);
        if (direction === 'up' && this.yAxisDomainCurrentMaxValue < this.yAxisDomainMaxValue){
            this.yAxisDomainCurrentMaxValue = this.yAxisDomainValues[currentIndex + 1];
            this.dataset = this.getCustomData(this.rawDataset, this.yAxisDomainCurrentMaxValue);
            this.redrawChart();
            this.config.buttonCallback(null, {yAxisDomainCurrentMaxValue: this.yAxisDomainCurrentMaxValue, direction: direction});
        } else if (direction === 'down' && this.yAxisDomainCurrentMaxValue > this.yAxisDomainValues[0]) {
            this.yAxisDomainCurrentMaxValue = this.yAxisDomainValues[currentIndex - 1];
            this.dataset = this.getCustomData(this.rawDataset, this.yAxisDomainCurrentMaxValue);
            this.redrawChart();
            this.config.buttonCallback(null, {yAxisDomainCurrentMaxValue: this.yAxisDomainCurrentMaxValue, direction: direction});
        }
    };

    w3_hitmapChart_internal_fn.remove = function(){
        this.dataset = {hit:[], err:[]};
        this.svg.select(".hits").remove();
        this.svg.remove();
    }

    w3_hitmapChart_internal_fn.showOnlyError = function(b){
        var that = this;

        this.config.visible['err'] = true;
        this.config.visible['hit'] = !b;
        //  $.cookie('hitmap.visible.err', true);
        //  $.cookie('hitmap.visible.hit', !b);

        this.svg.select(".hits").selectAll("rect.hit").remove();

        var updatedDataset = this.updateDataset(this.rawDataset);
        this.dataset = this.getCustomData(updatedDataset, this.yAxisDomainCurrentMaxValue);
        // this.internal.timeRange = this.internal.getCustomTimeRange(data.timeRange);
        this.resetAxis();
        this.draw();

        setTimeout( function(){
            that.brushHitBlocks(that.selectedBrush, that.yAxisDomainCurrentMaxValue, that.blockMaxRowIndex, true);
            that.endCallback(that.brush)();
        }, 1000);
        

    }
    w3_hitmapChart_internal_fn.showOnlyNormal = function(){
        this.config.visible['hit'] = b;
        this.config.visible['err'] = !b;
        // $.cookie('hitmap.visible.hit', b);
        // $.cookie('hitmap.visible.err', !b);
    }

    // public methods
    w3_hitmapChart_fn.loadData = function (data) {
        if (this.internal.isTransition === false && data.dataset.hit) {
            if (data.xAxis && data.xAxis.interval) {
                this.internal.blockTimeInterval = data.xAxis.interval;
                if (this.internal.blockTimeInterval < 10000) {
                    this.internal.xAxis
                        .scale(this.xScale)
                        .orient("bottom")
                        .ticks(d3.time.minutes, 2)
                        .tickFormat(d3.time.format('%H:%M'));
                } else {
                    this.internal.xAxis
                        .scale(this.xScale)
                        .orient("bottom")
                        .ticks(d3.time.hours, 2)
                        .tickFormat(d3.time.format('%H:%M'));
                }
            }

            if(!data || !data.dataset) return;

            // if(this.internal.config.visible.hit === false) data.dataset['hit'] = [];
            // if(this.internal.config.visible.err === false) data.dataset['err'] = [];

            this.internal.rawDataset = data.dataset;
            
            var updatedDataset = this.internal.updateDataset(data.dataset);
            this.internal.dataset = this.internal.getCustomData(updatedDataset, this.internal.yAxisDomainCurrentMaxValue);
            this.internal.timeRange = this.internal.getCustomTimeRange(data.timeRange);
            this.internal.resetAxis();
            this.internal.draw();
        }
    };
    w3_hitmapChart_fn.resizeChart = function () {
        this.internal.redrawChart();
    };
    w3_hitmapChart_fn.selectArea = function (area) {
        var x = area.xRange.sort(function(a,b) { return Number(a) - Number(b);});
        var y = area.yRange.sort(function(a,b) { return Number(a) - Number(b);});
        var e = [[new Date(Number(x[0]) + 1), Number(y[0]) + 1], [new Date(Number(x[1]) + 1), Number(y[1]) + 1]];

        this.internal.selectedBrush = e;
        this.internal.resizeBrush();

        this.internal.brushHitBlocks(e, this.internal.yAxisDomainCurrentMaxValue, this.internal.blockMaxRowIndex, true);
    };

    w3_hitmapChart_fn.remove = function(){
        this.internal.remove();
    }

    // public methods
    w3_hitmapChart_fn.changeYAxis = function(direction){
        this.internal.changeYAxis(direction);
    }

    w3_hitmapChart_fn.showOnlyError = function(b){
        this.internal.showOnlyError(b)
    }

    w3_hitmapChart_fn.showOnlyNormal = function(b){
        this.internal.showOnlyNormal(b);
    }

    window.w3 = w3;

})(window);

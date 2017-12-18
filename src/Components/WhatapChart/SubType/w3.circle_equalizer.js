"use strict";
(function (window){
    var w3 = window.w3 || {};

    var w3_circleEqualizerChart_fn;
    var w3_circleEqualizerChart_internal_fn;
    var isCreatedCircularIndicator = false;

    var C = {
        maxRatioDisabled: 15,
        padding: {
            top: 0,
            right: 10,
            bottom: 0,
            left: 4
        }
    }

    function CircleEqualizerChart(config) {
        this.internal = new CircleEqualizerChartInternal(this);
        this.internal.config = config;
        this.internal.init();
    }

    function CircleEqualizerChartInternal(api) {
        this.d3 = window.d3;
        this.api = api;
        this.inactiveCount = 0;
    }

    w3.circleEqualizerGenerate = function (config) {
        return new CircleEqualizerChart(config);
    };

    w3.circleEqualizerChart = {
        fn: CircleEqualizerChart.prototype,
        internal: {
            fn: CircleEqualizerChartInternal.prototype
        }
    };

    // shortcut
    w3_circleEqualizerChart_fn = w3.circleEqualizerChart.fn;
    w3_circleEqualizerChart_internal_fn = w3.circleEqualizerChart.internal.fn;

    // private methods
    w3_circleEqualizerChart_internal_fn.init = function () {
        this.selectChart = d3.select(this.config.bindto);
        this.api.element = this.selectChart.node();

        this.selectChart        // for infiniteCircle
            .style('position', 'relative');

        this.initParams();
        if(this.config.resizeBind !== false) this.bindResize();
        this.initChart();
        this.drawBackgroundChart();
    };
    w3_circleEqualizerChart_internal_fn.initParams = function () {
        this.width = this.api.element.getBoundingClientRect().width;
        this.height = this.api.element.getBoundingClientRect().height;
        this.chartMargin = 20;
        this.squareLength = Math.min(this.width, this.height);
        if (this.squareLength > 300) {
            this.innerRadius = 30;
        } else {
            this.innerRadius = 20;
        }
        this.partitionHeight = this.config.partitionHeight || 7;
        this.equlizerDepth = Math.floor((this.squareLength - this.chartMargin * 2 - this.innerRadius * 2) / this.partitionHeight / 2 - 1);

        if(this.equlizerDepth < 0 ) this.equlizerDepth = 1;

        this.isTransition = false;
        this.rawDataset = [];
        this.statusKeys = ['normal', 'slow', 'verySlow'];
        this.color = {
            'fill': {
                // 'normal': "#60c300",
                // 'slow': "#f19f00",
                // 'verySlow': "#f8002f"
            	'normal' : '#72c3fc',
            	'slow': '#748ffc',
            	'verySlow': '#f03e3e'
//                'normal': "#8bc34a",
//                'slow': "#f57c00",
//                'verySlow': "#d50000"
            },
            'stroke': {
                // 'normal': "#b4e782",
                // 'slow': "#f2c56e",
                // 'verySlow': "#f06882"
            	'normal': '#82c1f4',
            	'slow': '#e2a0f3',
            	'verySlow': '#e97c7c'
//                'normal': "#aed581",
//                'slow': "#ffb74d",
//                'verySlow': "#e57373"
            }
        };
        this.statusInfo = {
            'normal': {
                fillcolor: this.color.fill.normal,
                legendText: "0~3"
            },
            'slow': {
                fillcolor: this.color.fill.slow,
                legendText: "3~8"
            },
            'verySlow': {
                fillcolor: this.color.fill.verySlow,
                legendText: "8~"
            }
        };
        this.statusSummary = this.statusKeys.map(function(o) { return {key:o, value: 0}});
        this.objectCount = 1;
    };
    w3_circleEqualizerChart_internal_fn.initChart = function () {
        var that = this;
        var width = this.width;
        var height = this.height;
        var squareLength = this.squareLength;
        this.arc = d3.svg.arc()
            .startAngle(function(d) { return d.x; })
            .endAngle(function(d) { return d.x + d.dx ; })
            .innerRadius(function(d) { return that.innerRadius + that.partitionHeight * d.depth; })
            .outerRadius(function(d) { return that.innerRadius + that.partitionHeight * (d.depth + 1) /* padding - 1*/; });
        this.svg = d3.select(that.config.bindto).append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "arc-equalizer-svg");
            
        if(this.config.enableCircle && !this.circleIndicator){
            isCreatedCircularIndicator = true;

            this.circleIndicator = d3.select(that.config.bindto).append("svg")
            // .attr("width", this.outerRadius()*2)
            // .attr("height", this.outerRadius()*2)
            // .attr("transform", "translate(" + width/2 + "," + height/2 + ")")
            .attr('width', width)
            .attr('height', height)
            // .attr('transform', 'translate(0,'+(-10)+')')
        	// .attr("id", "infiniteCircle")
        	.attr("class","infiniteCircle")
//            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
        	.attr("viewBox","0 0 100 100");
            
        	var root = document.getElementById('infiniteCircle'), i = 256, cir, a,opacity;
        	for (; i = i - 4;) {
        	    a = i*Math.PI/400;
        	    opacity = ( 256 - i ) / 512 ;
        	    cir = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                // cir = this.circleIndicator.append('circle');
        	    cir.setAttribute("cx", 50 - Math.sin(a)*45);
        	    cir.setAttribute("cy", 50 - Math.cos(a)*45);
        	    cir.setAttribute("r", "1");
        	    cir.setAttribute("fill", "rgba(116, 143, 252 ," + opacity + ")");
                // cir.attr({
                //     cx: 50 - Math.sin(a)*45,
                //     cy: 50 - Math.cos(a)*45,
                //     r: 1
                // }).style({
                //     fill: "rgba(116, 143, 252 ," + opacity + ")"
                // })
        	    this.circleIndicator.node().appendChild(cir);
        	}

        	var root = document.getElementById('infiniteCircle'), i = 256, cir, a, opacity;
        	for (; i = i - 4;) {
        	    a = - (400-i)*(Math.PI/400);
        	    opacity = ( 256 - i ) / 512 ;
        	    cir = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                // cir = this.circleIndicator.append('circle')
        	    cir.setAttribute("cx", 50 - Math.sin(a)*45);
        	    cir.setAttribute("cy", 50 - Math.cos(a)*45);
        	    cir.setAttribute("r", "1");
        	    cir.setAttribute("fill", "rgba(116, 143, 252 ," + opacity + ")");
                // cir.attr({
                //     cx: 50 - Math.sin(a)*45,
                //     cy: 50 - Math.cos(a)*45,
                //     r: 1
                // }).style({
                //     fill: "rgba(116, 143, 252 ," + opacity + ")"
                // })
        	    this.circleIndicator.node().appendChild(cir);
        	}
        	
        }

        this.blurFilter = this.svg
            .append('filter')
            .attr('id', 'blurMe')

        this.blurFilter
            .append('feGaussianBlur')
            .attr('in','SourceGraphic')
            .attr('stdDeviation', 10)

        this.backgroundBlurContainer = this.svg.append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        this.backgroundBlur = this.backgroundBlurContainer
            .append('circle')
            .attr('class','backgroundBlurCircle')
            .attr('r', that.innerRadius + that.partitionHeight * 17 )
            // .attr('fill', '#ccdaff')
            .attr('filter','url(#blurMe)')

        this.backgroundBlur2 = this.backgroundBlurContainer
            .append('circle')
            .attr('class','backgroundBlurWrapper')
            .attr('r', that.innerRadius + that.partitionHeight * 17 )
            // .attr('fill', '#ffffff')            

        // background placeholder chart
        this.backgroudChartGroup = this.selectChart.select("svg").append("g")
            .attr("class", "backgroud-chart")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


        this.svg = this.svg
            .append("g")
            .attr("class", "chart")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


        // object chart with white bold line
        this.foregroundChartGroup = this.selectChart.select("svg").append("g")
            .attr("class", "foreground-chart")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
        .attr("clip-path", "url(#foreground-clip)")
            
        
        this.foregroundCircleWrapper = this.selectChart.select("svg").append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
            .attr('class', 'foreground-chart-wrapper')
            
        this.foregroundCircleWrapperClip = this.foregroundCircleWrapper
            .append("clipPath")
            .attr("id", "foreground-clip")
            .append("path")
            .attr('d',
                d3.svg.arc()
                    .startAngle(0)
                    .endAngle(2 * Math.PI)
                    .innerRadius(that.innerRadius + that.partitionHeight * 14)
                    .outerRadius(that.innerRadius + that.partitionHeight * 15)
            )
            .style('stroke', '#ffffff')
            // .style('fill', '#ffffff');
        
        // center circle
        d3.select(that.config.bindto).select('svg')
            .append("g")
            .attr("class", 'center-circle')
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
            .append("path")
            .attr('d',
                d3.svg.arc()
                    .startAngle(0)
                    .endAngle(2 * Math.PI)
                    // .innerRadius(that.innerRadius + that.partitionHeight - 1)
                    .innerRadius(0)
                    .outerRadius(that.innerRadius + that.partitionHeight*2)
            )
            .style('stroke', '#f0f0f0')
            .style('fill', '#f0f0f0');

        this.equalizerScale = d3.scale.linear();
        this.equalizerAxis = d3.svg.axis()
            .scale(this.equalizerScale)
            .orient("right")
            // .ticks(1);

        if(this.config.axisDecoText){
            this.axisDecoText = d3.select(that.config.bindto).select('svg').append("g")
            .append('text').attr('class','axisDecoText')
            .attr("transform", function () {
                var x = 10;
                var y = that.height/2 - that.innerRadius - (that.equlizerDepth + 1) * that.partitionHeight - 15;
                if(y < 8 ) y = 8;
                return "translate(" + x + "," + y + ")";
            })
            .text(this.config.axisDecoText);
        }

        this.inactiveText = d3.select(that.config.bindto).select('svg').append("g")
        .append('text')
        .text('INACTIVE')
        .attr('class','inactiveText')
        .style('display','none')        
        .attr("transform", function () {
            if(d3.select(this).style('display') == 'none') return;
            var area = d3.select(this).node().getBBox();
            var x = that.width - d3.select(this).node().getBBox().width - C.padding.right;
            var y = that.height - area.height - area.y;
            return "translate(" + x + "," + y + ")";
        })
        this.inactiveCountText = d3.select(that.config.bindto).select('svg').append("g")
        .append('text')
        .text(this.inactiveCount+'')
        .attr('class','inactiveCountText')
        .attr('display','none')                
        .attr("transform", function () {
            if(d3.select(this).style('display') == 'none') return;
            var x = that.width - d3.select(this).node().getBBox().width - C.padding.right;
            var y = that.height - that.inactiveText.node().getBBox().height - C.padding.bottom;
            return "translate(" + x + "," + y + ")";
        })
         

        this.equalizerAxisGroup = d3.select(that.config.bindto).select('svg').append("g")
            .attr("transform", function () {
                var x = 1;
                var y = that.height/2 - that.innerRadius - (that.equlizerDepth + 1) * that.partitionHeight;
                return "translate(" + x + "," + y + ")";
            })
            .attr("class", "equalizer axis")
            .call(this.equalizerAxis);

        this.initLegends();

        this.tooltip = d3.select("body")
            .append("div")
            .attr("class", "w3-tooltip")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("opacity", 0);

        this.maxLegend = d3.select(that.config.bindto).select('svg').append("text")
            .attr('text-anchor', 'start')
            .attr('alignment-baseline', 'after-edge')
            .attr('transform', 'translate(' + (width/2 - squareLength/2)  + ',' + height + ')')
            .attr('style', 'font-size: 20; fill: #999; border:1px solid #999;');

        this.inactiveLegend = d3.select(that.config.bindto).select('svg').append("text")
            .attr('text','inactive')
            .attr('text-anchor', 'start')
            .attr('alignment-baseline', 'after-edge')
            .attr('transform', 'translate(' + (width/2 - squareLength/2)  + ',' + height + ')')
            .attr('style', 'font-size: 20; fill: #999; border:1px solid #999;');

        this.transactionCountLegend = d3.select(that.config.bindto).select('svg').append('text')        
            // .transition().ease("quad-out").duration(2000).delay(0)
            .attr('class', 'focus')
            .attr('transform', 'translate(' + width/2 + ',' + height/2 + ')')
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'central')
            .attr('style', function () {
                if (that.squareLength > 300){
                    return 'font-size: 22; font-weight: bold; border:1px solid #222; cursor: pointer;';
                } else {
                    return 'font-size: 18; font-weight: bold; border:1px solid #222; cursor: pointer;';
                }
            })
            .on("click", that.config.totalTransactionCountClickCallback);

            this.initCustom();
    };

    w3_circleEqualizerChart_internal_fn.initCustom = function(){
        var defs = this.svg.select("defs");

        var id = "shadowBlur";
        var deviation = 5;
        var offset = 2;
        var slope = 0.3;
        if(defs.size() < 1){
            defs = this.svg.append('defs');
        }

        // create filter and assign provided id
        var filter = defs.append("filter")
            .attr("height", "125%")    // adjust this if shadow is clipped
            .attr("id", id);

        // ambient shadow into ambientBlur
        //   may be able to offset and reuse this for cast, unless modified
        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", deviation)
            .attr("result", "ambientBlur");

        // cast shadow into castBlur
        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", deviation)
            .attr("result", "castBlur");

        // offsetting cast shadow into offsetBlur
        filter.append("feOffset")
            .attr("in", "castBlur")
            .attr("dx", offset - 1)
            .attr("dy", offset)
            // .attr("flood-color", "#fff")
            .attr("class", 'ambientBlur')            
            .attr("result", "offsetBlur");

        filter.append("feFlood")
            .attr("in", "ambientBlur")        
            // .attr("flood-color", "#fff")
            .attr("class", 'ambientBlur')
            .attr("flood-opacity",'0.2')
            .attr("result", "offsetColor");

        // combining ambient and cast shadows
        filter.append("feComposite")
            // .attr("in", "ambientBlur")
            .attr('in','offsetColor')
            .attr("in2", "offsetBlur")
            .attr("result", "compositeShadow");

        // applying alpha and transferring shadow
        filter.append("feComponentTransfer")
            .append("feFuncA")
                .attr("type", "linear")
                .attr("slope", slope);

        // merging and outputting results
        var feMerge = filter.append("feMerge");
        feMerge.append('feMergeNode')
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");
        
    }

    w3_circleEqualizerChart_internal_fn.initLegends = function() {
        var that = this;
        this.legendGroup = this.selectChart.select('svg').append("g")
            .attr("class", "legends")
            .attr("transform", "translate(" + C.padding.left + "," + (this.height) + ")");

        this.statusSummary.forEach(function(o, i) {
            // that.legendGroup.append("circle")
            //     .attr("r", 4)
            //     .attr("cx", 0)
            //     .attr("cy", -10 - 20 * i)
            that.legendGroup.append("rect")
                .attr("x", 0)
                .attr("y", -10 - 20 * i - 5)
                .attr('width', 10)
                .attr('height', 10)
                .attr("class", "legend-circle " + o.key)
                .style("fill", that.statusInfo[o.key].fillcolor);

            that.legendGroup.append("text")
                .attr("x", 15)
                .attr("y", -5 - 20 * i)
                .attr("text-anchor", "start")
                .attr("class", "legend-text " + o.key)
                .text(that.statusInfo[o.key].legendText);
        });
    };

    w3_circleEqualizerChart_internal_fn.updateParams = function (dataset) {
        // this.disableCount(3)

        // if(this.disabledData && dataset.length > 0 && !dataset.m){
        //     dataset.m = true;
        //     var ratio = (this.disabledData.length / dataset.length) *100;
        //     var disabledCount = ratio < C.maxRatioDisabled ? ratio :   Math.round( dataset.length * (C.maxRatioDisabled /100) );
        //     for(var i = 0 ; i <disabledCount; i++){
        //         var isExist = false;
        //         for(var j = 0 ; j < dataset.length ;j ++){
        //             if(dataset[j].oid == this.disabledData[i].oid){
        //                 isExist == true;
        //                 break;
        //             }
        //         }
                
        //         if(isExist === false ) dataset.push(this.disabledData[i])
        //     }
        // }

        this.maxTotal = Math.max(Math.max.apply(null, dataset.map(function(o){ return o['total']; })), 20);
        this.level = Math.floor(this.maxTotal/this.equlizerDepth) === 0 ? 1 : Math.floor(this.maxTotal/this.equlizerDepth);
        this.totalTransactionCount = dataset.filter(function(o){ return o['total'] > 0; })
            .map(function(o){ return o['total']; }).reduce(function (a,b) { return a+b;}, 0);
        this.statusSummary = this.statusKeys.map(function(key){
            var value = dataset.filter(function(o){ return o[key] > 0; })
                .map(function(o){ return o[key]; }).reduce(function (a,b) { return a+b;}, 0);
            return {key: key, value: value};
        });
        if (dataset.length > 0 && this.objectCount !== dataset.length){
            this.objectCount = dataset.length;
            this.drawBackgroundChart();
            this.drawForegroundChart();
        }
    };
    w3_circleEqualizerChart_internal_fn.resetChart = function () {
        var that = this;
        var width = this.width;
        var height = this.height;
        var squareLength = this.squareLength;
        d3.select(that.config.bindto).select("svg")
            .attr("width", width)
            .attr("height", height + 20);

        if(that.circleIndicator){
            that.circleIndicator
                .attr("width", width)
                .attr("height", height)
        }
        // .attr("transform", "translate(" + 0 + "," + (-10) + ")");
    	
        this.svg
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        this.backgroudChartGroup
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        this.foregroundChartGroup
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        
        this.foregroundCircleWrapper
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        this.backgroundBlurContainer
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        this.backgroundBlur
            .attr('r', that.innerRadius + that.partitionHeight * (that.equlizerDepth + 1) )
        this.backgroundBlur2
            .attr('r', that.innerRadius + that.partitionHeight * (that.equlizerDepth + 1) )

        this.foregroundCircleWrapperClip
            .attr('d',
                d3.svg.arc()
                    .startAngle(0)
                    .endAngle(2 * Math.PI)
                    .innerRadius(that.innerRadius + that.partitionHeight * (that.equlizerDepth - 1) )
                    .outerRadius(that.innerRadius + that.partitionHeight * (that.equlizerDepth) )
            )

        this.arc = d3.svg.arc()
            .startAngle(function(d) { return d.x; })
            .endAngle(function(d) { return d.x + d.dx; })
            .innerRadius(function(d) { return that.innerRadius + that.partitionHeight * d.depth; })
            .outerRadius(function(d) { return that.innerRadius + that.partitionHeight * (d.depth + 1) /* padding - 1*/; });

        d3.select(that.config.bindto).select('svg .center-circle')
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
            .select("path")
            .attr('d',
                d3.svg.arc()
                    .startAngle(0)
                    .endAngle(2 * Math.PI)
                    // .innerRadius(that.innerRadius + that.partitionHeight - 1)
                    .innerRadius(0)
                    .outerRadius(that.innerRadius + that.partitionHeight)
            );

        if(this.axisDecoText){
            this.axisDecoText
            .attr("transform", function () {
                var x = 10;
                var y = that.height/2 - that.innerRadius - (that.equlizerDepth + 1) * that.partitionHeight - 15;
                if(y < 8 ) y = 8;
                return "translate(" + x + "," + y + ")";
            })
        }

        this.inactiveText
        .attr("transform", function () {
            if(d3.select(this).style('display') == 'none') return;
            var area = d3.select(this).node().getBBox();
            var x = that.width - area.width - C.padding.right;
            var y = that.height - area.height - area.y;
            return "translate(" + x + "," + y + ")";
        })
        this.inactiveCountText
        .attr("transform", function () {
            if(d3.select(this).style('display') == 'none') return;
            var x = that.width - d3.select(this).node().getBBox().width - C.padding.right;
            var y = that.height - that.inactiveText.node().getBBox().height - C.padding.bottom;
            return "translate(" + x + "," + y + ")";
        })
        

        this.equalizerAxisGroup
            .attr("transform", function () {
                var x = 1;
                var y = that.height/2 - that.innerRadius - (that.equlizerDepth + 1) * that.partitionHeight;
                return "translate(" + x + "," + y + ")";
            })
            .attr("class", "equalizer axis")
            .call(this.equalizerAxis);

        this.maxLegend
            .attr('transform', 'translate(' + (width/2 - squareLength/2) + ',' + height + ')');

        this.transactionCountLegend
            .attr('transform', 'translate(' + width/2 + ',' + height/2 + ')');

        this.legendGroup
            .attr("transform", "translate(" + 4 + "," + (this.height) + ")");
    };

    w3_circleEqualizerChart_internal_fn.resize = function () {
        var that = this;
        that.initParams();
        that.updateParams(that.rawDataset);
        that.dataset = that.getCustomData(that.rawDataset);
        that.resetChart();
        that.draw();
        that.drawBackgroundChart();
        
    }
    
    w3_circleEqualizerChart_internal_fn.bindResize = function () {
        var that = this;

        if (window.addEventListener) {
            window.addEventListener("resize", function(){
                that.resize()
            }, false);
        } else if (window.attachEvent) {
            window.attachEvent("onresize", function(){
                that.resize()
            });
        } else {
            window["onresize"] = function(){
                that.resize()
            };
        }
    };
    w3_circleEqualizerChart_internal_fn.draw = function () {
        var that = this;
        var maxTotal = this.maxTotal;

        

        this.isTransition = true;
        this.transactionCountLegend.text(that.totalTransactionCount);
        this.equalizerScale
            .range([0, this.partitionHeight * (this.equlizerDepth)])
            .domain([maxTotal, 0]);

        // if(this.initDraw == true){
        //     this.equalizerAxis.ticks( maxTotal );  // bug in maxTotal > 67
        // }else{
        //     this.equalizerAxis.tickValues([/*0, Math.floor(maxTotal/2),*/ maxTotal]); 
        //     this.initDraw = true;
        // }
        this.equalizerAxis.tickValues([/*0, Math.floor(maxTotal/2),*/ maxTotal]);

        try{
            d3.select(that.config.bindto).select('svg .equalizer.axis')
                .transition().duration(1000)
                .call(that.equalizerAxis);
        }catch(e){

        }

        d3.selectAll(that.config.bindto).select(".tick > text")
            .style("font-size", function(d) { return d === maxTotal ? 20 : 15; });
        this.statusSummary.forEach(function(o) {
            d3.select(that.config.bindto).select(".legend-text." + o.key).text(that.statusInfo[o.key].legendText);
        });

        // var serverSize = that.objectCount;
        // var objectIndex = 0; var beforeId = undefined;

        that.svg
            .selectAll("path")
            .data(that.dataset.filter(function(o) { return o.depth === 1;}), function (d) {
                return d.oid + ':' + d.depth + ':' + d.type;
            })
            .exit()
            .transition()
            .call(that.transitionEndAll, function () {
                that.drawNew();
            })
            .delay(function (d, i) {
                // return Math.floor(Math.random() * that.equlizerDepth) * 30;
                // if(beforeId != d.oid){
                //     beforeId = d.oid;
                //     objectIndex++;
                // }
                
                // return ((4000 / serverSize)*objectIndex) + (that.equlizerDepth - d.depth) * 10;   // 줄어드는 애니메이션
                // return (that.dataset.length - i) / that.dataset.length * 500;
                return (that.equlizerDepth - d.depth) * 10;
            })
            .duration(100)
            .remove();

        if(that.config.refreshLastTransaction){
            that.refreshLastTransaction(that.config.refreshLastTransaction);
        }
    };
    w3_circleEqualizerChart_internal_fn.drawNew = function () {
        var that = this;
        setTimeout(function(){
            that.svg
                .selectAll("path")
                .data(that.dataset, function (d) {
                    return d.oid + ':' + d.depth + ':' + d.type;
                })
                .on("mouseover", that.mouseOver(that.tooltip))
                .on("mousemove", that.mouseMove(that.tooltip))
                .on("mouseout", that.mouseOut(that.tooltip))
                .on("click", that.objectClick(that.config.clickCallback))
                .transition()
                .delay(function (d, i){
                    // return Math.floor(Math.random() * that.equlizerDepth) * 30;
                    return d.depth * 20;
                    // return i / that.dataset.length * 500;
                })
                .duration(300)
                .each("start", function() {
                    d3.select(this)
                        .attr("fill", that.fillColor(that.color))
                        // .attr("stroke", that.strokeColor(that.color));
                })
                .attr("d", that.arc)
                .attr("style", "cursor: pointer;")
                // .style("stroke", that.strokeColor(that.color))
                .style("fill", that.fillColor(that.color));

                // var serverSize = that.dataset.length;
                // var serverSize = that.objectCount;
                // var objectIndex = 0; var beforeId = undefined;
            that.svg
                .selectAll("path")
                .data(that.dataset, function (d) {
                    return d.oid + ':' + d.depth + ':' + d.type;
                })
                .enter()
                .append("path")
                .on("mouseover", that.mouseOver(that.tooltip))
                .on("mousemove", that.mouseMove(that.tooltip))
                .on("mouseout", that.mouseOut(that.tooltip))
                .on("click", that.objectClick(that.config.clickCallback))
                .transition()
                .call(that.transitionEndAll, function() {
                    that.isTransition = false;
                    
                })
                .delay(function (d, i){
                    // return Math.floor(Math.random() * that.equlizerDepth) * 30;
                    // if(beforeId != d.oid){
                    //     beforeId = d.oid;
                    //     objectIndex++;
                    // }
                    // return ((4000 / serverSize)*objectIndex) + d.depth * 20;  // 늘어나는 delay
                    // return ((5000 / serverSize)*i) + d.depth * 20;  // 늘어나는 delay
                    return d.depth * 20;
                    // return i / that.dataset.length * 500;
                })
                .duration(300)
                .each("start", function() {
                    d3.select(this)
                        .attr("fill", that.fillColor(that.color))
                        // .attr("stroke", that.strokeColor(that.color));
                })
                .attr("d", that.arc)
                .attr("style", "cursor: pointer;")
                // .style("stroke", that.strokeColor(that.color))
                .style("fill", that.fillColor(that.color));
        }, 300)
    };
    w3_circleEqualizerChart_internal_fn.drawBackgroundChart = function () {
        var that = this;
        var outerRadius = that.innerRadius + that.partitionHeight * (that.equlizerDepth + 1);
        // if(!this.drawedBackgroundChart){
        //     this.drawedBackgroundChart = true;
        //     var circle = this.svg.select('.shadowCircle2')
        //     if(circle.size() < 1 ){
        //         circle = this.backgroudChartGroup
        //             .append('circle')
        //             .attr('cx', 0)
        //             .attr('cy', 0)
        //             .attr('class', 'shadowCircle2')
        //             // .style("filter", "url(#shadowBlur)");
        //     }
        //     circle
        //         .attr('r', outerRadius)
        // }        

        // d3.select('.shadowCircle2')
        //     .attr('r', outerRadius)

        // return;
        var objectCount = this.objectCount;
        var blankDatas = [];
        for (var i=0; i < objectCount; i++) {
            for (var j=0; j < Math.round(this.equlizerDepth * 5 /5); j++) {
                var dx = 2 * Math.PI / objectCount;
                blankDatas.push({
                    oid: "o.oid" + i, oname: "o.oname" + i, type: "a.type",
                    dx: dx,
                    x: dx * i,
                    depth: j + 1,
                    // disabled: that.rawDataset[i] && that.rawDataset[i].disabled
                })
            }
        }

        this.backgroudChartGroup
            .selectAll("path")
            .data(blankDatas, function (d) {
                return d.oid + ':' + d.depth + ':' + d.type;
            })
            .attr("d", that.arc)
            .style("stroke", function(d){
                if(d.disabled === true) return "#f7f7f7";
                return '#ffffff'
            })
            .style("fill", function(d){
                if(d.disabled === true) return "#f7f7f7";
                return '#ffffff'
            });

        this.backgroudChartGroup
            .selectAll("path")
            .data(blankDatas, function (d) {
                return d.oid + ':' + d.depth + ':' + d.type;
            })
            .enter()
            .append("path")
            .attr("d", that.arc)
            .style("stroke", function(d){
                if(d.disabled === true) return "#f7f7f7";
                return '#ffffff'
            })
            .style("fill", function(d){
                if(d.disabled === true) return "#f7f7f7";
                return '#ffffff'
            });

        this.backgroudChartGroup
            .selectAll("path")
            .data(blankDatas, function (d) {
                return d.oid + ':' + d.depth + ':' + d.type;
            })
            .exit()
            .remove();
    };
    w3_circleEqualizerChart_internal_fn.drawForegroundChart = function () {
        var that = this;

        var arc = d3.svg.arc()
            .startAngle(function(d) { return d.x; })
            .endAngle(function(d) { return d.x + d.dx ; })
            .innerRadius(function(d) { return that.innerRadius; })
            .outerRadius(function(d) { return that.innerRadius + that.partitionHeight * (that.equlizerDepth + 1) ; });

        var objectCount = this.objectCount;
        var blankDatas = [];
        for (var i=0; i < objectCount; i++) {
            var dx = 2 * Math.PI / objectCount;
            blankDatas.push({
                oid: this.rawDataset[i] !== undefined ? this.rawDataset[i].oid : "o.oid" + i,
                oname: this.rawDataset[i] !== undefined ? this.rawDataset[i].oname : "o.oname" + i,
                type: "a.type",
                dx: dx,
                x: dx * i,
                depth: 1,
                normal: this.rawDataset[i] !== undefined ? this.rawDataset[i].normal : 0,
                slow: this.rawDataset[i] !== undefined ? this.rawDataset[i].slow : 0,
                verySlow: this.rawDataset[i] !== undefined ? this.rawDataset[i].verySlow : 0,
                total: this.rawDataset[i] !== undefined ? this.rawDataset[i].total : 0,
                // disabled: this.rawDataset[i].disabled
            })
        }

        this.foregroundChartGroup
            .selectAll("path")
            .data(blankDatas, function (d) {
                return d.oid + ':' + d.depth + ':' + d.type;
            })
            .on("mouseover", that.mouseOver(that.tooltip))
            .on("mousemove", that.mouseMove(that.tooltip))
            .on("mouseout", that.mouseOut(that.tooltip))
            .on("click", that.objectClick(that.config.clickCallback))
            .attr("d", arc)
            // .attr("stroke-width", 2)
            .attr("class", 'dividePath')
            .attr("fill-opacity", 0)
            .attr("style", "cursor: pointer;")
            // .style("stroke", "#fff")
            .style("fill", "#f0f0f0");

        this.foregroundChartGroup
            .selectAll("path")
            .data(blankDatas, function (d) {
                return d.oid + ':' + d.depth + ':' + d.type;
            })
            .enter()
            .append("path")
            .on("mouseover", that.mouseOver(that.tooltip))
            .on("mousemove", that.mouseMove(that.tooltip))
            .on("mouseout", that.mouseOut(that.tooltip))
            .on("click", that.objectClick(that.config.clickCallback))
            .attr("d", arc)
            .attr("stroke-width", 1)
            .attr("class", 'dividePath')
            .attr("fill-opacity", 0)
            .attr("style", "cursor: pointer;")
            // .style("stroke", "#fff")
            .style("fill", "#f0f0f0");

        this.foregroundChartGroup
            .selectAll("path")
            .data(blankDatas, function (d) {
                return d.oid + ':' + d.depth + ':' + d.type;
            })
            .exit()
            .remove();

    };
    w3_circleEqualizerChart_internal_fn.getCustomData = function (dataset) {
        var level = this.level;
        var equalizerBlockCount = this.equlizerDepth;
        var maxTotal = this.maxTotal;

        var State = function (type, value, level) {
            this.type = type;
            this.value = value;
            this.minBlockCount = value == 0 ? 0 : 1;
            this.maxBlockCount = Math.max(this.minBlockCount, Math.round(value / level));
        };

        var objectDataset = dataset.map(function(o, i) {
            var blockCount, states;

            if (o.total >= 0) {
                var minBlockCount = [o.normal, o.slow, o.verySlow].filter(function (a) { return a > 0 }).length;
                var maxBlockCount = Math.max(minBlockCount, Math.round(o.total / maxTotal * equalizerBlockCount));
                blockCount = Math.min(maxBlockCount, equalizerBlockCount);

                states = ['normal', 'slow', 'verySlow'].map(function (a) {return new State(a, o[a], level); });

                while (states.map(function (a) { return a.maxBlockCount; }).reduce(function (a, b) { return a + b;}) > blockCount) {
                    states.sort(function (a, b) {
                        var aBlockCountDiff = a.maxBlockCount - a.minBlockCount;
                        var bBlockCountDiff = b.maxBlockCount - b.minBlockCount;
                        if (aBlockCountDiff - bBlockCountDiff < 0) return 1;
                        if (aBlockCountDiff - bBlockCountDiff > 0) return -1;

                        var sortOrder = ['normal', 'verySlow', 'slow'];
                        if (sortOrder.indexOf(a.type) > sortOrder.indexOf(b.type)) return -1;
                        if (sortOrder.indexOf(a.type) < sortOrder.indexOf(b.type)) return 1;
                        return 0;
                    });

                    states[0].maxBlockCount -= 1;
                }
            } else { // inactive object
                blockCount = equalizerBlockCount;
                states = [new State('inactive', 1, level)];
                states[0].maxBlockCount = blockCount;
            }

            return states.map(function(a) {
                    if(a.maxBlockCount < 0 ) a.maxBlockCount = 0;
                    return Array.apply(null, new Array(a.maxBlockCount))
                        .map(function() {
                            return { oid: o.oid, oname: o.oname, type: a.type, total: o.total,
                                normal: o.normal, slow: o.slow, verySlow: o.verySlow};
                        })
                })
                .reduce(function(b,c){
                    return b.concat(c);
                })
                .sort(function(a, b){
                    var sortOrder = ['normal', 'slow', 'verySlow', 'inactive'];
                    if (sortOrder.indexOf(a.type) < sortOrder.indexOf(b.type)) return -1;
                    if (sortOrder.indexOf(a.type) > sortOrder.indexOf(b.type)) return 1;
                    return 0;
                })
                .map(function(a, j) {
                    var dx = 2 * Math.PI / dataset.length;
                    a.dx = dx;
                    a.x = dx * i;
                    a.depth = j + 1;
                    return a;
                });
            });
        return objectDataset.reduce(function(a, b){ return a.concat(b);}, []);
    };
    w3_circleEqualizerChart_internal_fn.fillColor = function(color) {
        return function(d) {
            return color.fill[d.type];
        }
    };
    w3_circleEqualizerChart_internal_fn.strokeColor = function(color) {
        return function(d) {
            return color.stroke[d.type];
        }
    };
    w3_circleEqualizerChart_internal_fn.mouseOver = function(tooltip) {
        return function (d) {
            tooltip.html(d.oname + "<br>normal: " + d.normal + "<br>slow: " + d.slow + "<br>very slow: " + d.verySlow
                         + "<br>total transaction:" + d.total);
            return tooltip.transition().duration(10).style("opacity", 0.9);
        }
    };
    w3_circleEqualizerChart_internal_fn.mouseMove = function(tooltip) {
        return function (){
            return tooltip
                .style("top", (d3.event.pageY-10)+"px")
                .style("left", (d3.event.pageX+10)+"px");
        }
    };
    w3_circleEqualizerChart_internal_fn.mouseOut = function(tooltip) {
        return function (){
            return tooltip.transition().duration(10).style("opacity", 0);
        }
    };
    w3_circleEqualizerChart_internal_fn.objectClick = function (clickCallback) {
        return function (d) {
            clickCallback({
                'oid': d.oid,
                'oname': d.oname
            });
        }
    };
    w3_circleEqualizerChart_internal_fn.transitionEndAll = function (transition, callback) {
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

    w3_circleEqualizerChart_internal_fn.getOuterRadius = function () {
        var that = this;
        return that.innerRadius + that.partitionHeight * (that.equlizerDepth + 1);
    }

    w3_circleEqualizerChart_internal_fn.disableCount = function(count){
        // this.internal.disabledData = arr;
        var arr =[];
        for(var i = 0 ; i < count ; i++){
            arr.push({
                normal: 0,
                slow: 0,
                verySlow: 0,
                total: 0,
                time: Date.now(),
                oid: i,
                oname: 'TC-'+i,
                disabled: true
            })
        }
        this.disabledData = arr;

        //  - normal: '0'
        //  - oid: '-537344944'
        //  - oname: '"TC-29-96-8072"'
        //  - slow: '9'
        //  - time: '1496920400000'
        //  - total: '38'
        //  - verySlow: '29'

    }

    // public methods
    w3_circleEqualizerChart_fn.loadData = function (data) {
        // data.dataset = data.dataset.filter(function(item){
        //     return item.total > -1;
        // })

        // if (this.internal.isTransition === false){
            var rawDataset = JSON.parse(JSON.stringify(data.dataset));

            // for(var i = 0 ; i < 94 ; i++){
            //     rawDataset.push({
            //         normal: 0,
            //         slow: 0,
            //         verySlow: 0,
            //         total: 0,
            //         time: Date.now(),
            //         oid: i,
            //         oname: 'TC-'+i
            //     })
            // }
            this.internal.rawDataset = rawDataset
            this.internal.updateParams(rawDataset);
            this.internal.dataset = this.internal.getCustomData(rawDataset);
            this.internal.draw();
            this.internal.drawForegroundChart();
        // }
    };

    w3_circleEqualizerChart_fn.resize = function(){
        this.internal.resize();
    }

    w3_circleEqualizerChart_fn.setInactive = function(inactiveCount){
        if(inactiveCount && inactiveCount > 0 ){
            inactiveText.attr('style','display: block')
            inactiveCountText.attr('style','display: block')
        }else{
            inactiveText.attr('style','display: none')
            inactiveCountText.attr('style','display: none')
        }
    }
    
    w3_circleEqualizerChart_internal_fn.refreshLastTransaction = w3_circleEqualizerChart_fn.refreshLastTransaction = function(tps){
    	// var el = document.getElementById('infiniteCircle');

        if(!this.internal.circleIndicator) return;
        var el = this.internal.circleIndicator.node();
    	if(!el) return;

    	if(!tps || tps <1 ){
    		el.classList.remove('infiniteCircle4');
    		el.classList.remove('infiniteCircle2');
    	}else if(tps > 0 && tps <= 100){
    		el.classList.add('infiniteCircle2');
    		el.classList.remove('infiniteCircle4');
    	}else if(tps > 100){
    		el.classList.add('infiniteCircle4');
    		el.classList.remove('infiniteCircle2');
    	}
    }



    window.w3 = w3;
})(window);

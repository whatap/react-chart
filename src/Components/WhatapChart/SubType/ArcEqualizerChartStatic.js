import React, {Component, PropTypes} from 'react'
import {chart, api, INTERVAL, REAL_TIME} from './../Meta'

import './w3.circle_equalizer'

import jquery from 'jquery';
window.$ = window.jQuery=jquery;

import d3 from 'react-d3-library'

var maxTimeInterval = 10 * 60 * 1000;
var timeInterval = INTERVAL;

function makeData(){
    var arr = [];
    var count = (maxTimeInterval / timeInterval)/2;

    for(var i = count ; i >= 0 ;i --){
        arr.push([Date.now() - i*timeInterval, getRandomInteger(0,10000) ]);
    }
    return arr;
}

function getRandomInteger(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function hashCode(str) {
    if(!str) return str;
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = ~~(((hash << 5) - hash) + str.charCodeAt(i));
    }
    return hash;
}

class CircleEqualizerStatic extends Component{

    constructor(){
        super();
        this.datainit = false;
    }

    componentDidMount(){
        var self = this;

        setTimeout(function(){
            self.chart = w3.circleEqualizerGenerate({
                bindto: self.chartDom,
                // bindto: '.circleEqualizer',
                // resizeBind: false,
                clickCallback: function (data) {
                    if(self.props.clickBar) self.props.clickBar(data);
                },
                enableCircle: true,
                chartName: 'circlequalizer-chart1',  // should be unique
                axisDecoText: 'MAX',
                totalTransactionCountClickCallback: function () {

                }
            });

            var $dom = $(self.chartDom);
            $dom.prepend( $('svg',$dom) );
            // $(self.overlayDom).prependTo($(self.overlayDom).parent());
            // $(self.chartDom).append( $(self.overlayDom).remove() );
        });
        // self.initData();
        // this.props.liveDataFromServer(this.props.id, true, {oid: 'oids'});

        // startRealTime
        // this.startRealtime();
    }

    startRealtime(){
        var self = this;
        // setInterval(function() {
        //     self.props.liveDataFromServer(self.props.id,false, {oid: 'oids'});
        // },5000);
        return;

        var self = this;

        var SampleObject = function (i) {
            var normalValues = [0, 0, 1, 1, 16, 14, 17, 12, 14, 7, 13, 16, 23];
            var slowValues = [0, 0, 1, 1, 2, 3, 5];
            var verySlowValues = [0, 0, 0, 3, 4, 6, 7, 8, 9, 10];
            this.normal = normalValues[Math.floor(Math.random() * normalValues.length)];
            this.slow =  slowValues[Math.floor(Math.random() * slowValues.length)];
            this.verySlow =  verySlowValues[Math.floor(Math.random() * verySlowValues.length)];
            this.total = this.normal + this.slow + this.verySlow;
            this.oid = "oid-" + i;
            this.oname = "oname-" + i;
        };

        var instanceCount = 20;

        var dataset = [];
        for (var i=0; i < instanceCount ; i++) {
            dataset.push(new SampleObject(i));
        }

        if(self.chart) self.chart.loadData({
            dataset: dataset
        });
        
        return;
        // setInterval(function() {

        //     var dataset = [];
        //     for (var i=0; i < instanceCount ; i++) {
        //         dataset.push(new SampleObject(i));
        //     }

        //     self.chart.loadData({
        //         dataset: dataset
        //     });
        // }, 3000);
    }

    shouldComponentUpdate(nextProps, nextState) {
        var newDataHash = hashCode(JSON.stringify(nextProps.data));
        var newUpdateDataHash = hashCode(JSON.stringify(nextProps.updateData));
        if(!this.dataHash || this.dataHash != newDataHash){
            this.dataHash = newDataHash;   
            this.viewState = 'init';
            return true;
        }else if(!this.updateDataHash || this.updateDataHash != newUpdateDataHash){
            this.updateDataHash = newUpdateDataHash;
            this.viewState = 'update';
            return true;
        }

        return false;
    }

    initData(data){
        var self = this;

        if(!data) return;
        if(self.chart) self.chart.loadData({
            dataset: data
        });
        
        // self.chart.loadDataSet([
        //     {key: this.props.id, data: makeData() , meta: {attach: 'left', chart: 'line'} }
        //     // {key: 'tps3', data: makeData() , meta: {attach: 'left', chart: 'bar'} }
        // ])
    }

    loadData(data){
        var self = this;
        if(!data) return;

        if(self.chart) self.chart.loadData({
            dataset: data
        });
        return;
        // var self = this;
        // this.props.loadData(function(err,data){
            // self.chart.updateData(this.props.id, [
            //     [Date.now(),getRandomInteger(0,10000)]
            // ]);
        // })
    }

    resize(){
        var self = this;
        if(self.chart) self.chart.resize();
    }

    // componentWillReceiveProps(newProps){
    componentDidUpdate(prevProps, prevState) {
        var self = this;
        var {data, updateData, lastTps} = this.props;
        if(self.datainit == false){
            self.datainit = true;
            self.initData(data);
        }else{
            if(updateData){
                self.loadData(updateData);
            }
        }

        if(lastTps !== undefined){
            if(self.chart) self.chart.refreshLastTransaction( lastTps );
        }
    }

    _realResize(){
        if(this.chart) this.chart.resize();
    }

    _onResize(size){
        var self = this;

        var s = 500;

        if(size.width != this.width || size.height != this.height){
            this.width = size.width;
            this.height = size.height;
            if(this.timeout) clearTimeout(this.timeout);
            this.timeout = setTimeout(function(){
                self._realResize()
            },s)
        }
    }

    render(){
        return(
            <div className={chart.className} ref={(dom) => { this.chartDom = dom;}} />
        )
    }
    componentWillUnmount(){
    }

}

CircleEqualizerStatic.propTypes = {
    // id: PropTypes.string.isRequired,
    loadData: PropTypes.func,
    lastTps: PropTypes.number,
    loadinitData: PropTypes.func,
    clickBar: PropTypes.func,
}

CircleEqualizerStatic.defaultProps = {
  lastTps: 0
};

export default CircleEqualizerStatic

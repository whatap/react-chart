import React, {Component, PropTypes} from 'react'
import {chart, api, INTERVAL, REAL_TIME} from './../Meta'

import './w3.hitmap'

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

var KEYS = ['hit','err'];

class HitmapChartStatic extends Component{

    constructor(){
        super();
        this.datainit = false;
    }

    componentDidMount(){
        this.initData()
    }

    makeChart(cb){
        var self = this;
        
        setTimeout(function(){   
            if(self.chart) self.chart.remove();
            $(self.chartDom).html('');
            self.chart = w3.hitmapGenerate({
                bindto: self.chartDom,
                chartName: 'hitmapchart1', // should be unique
                margin: { top: 10, right: 0, bottom: 20, left: 35},
                yAxis: { max: 80000, current: 10000 },  // maximum value (ms)
                brush: {
                    callback: function (err, data, selectedBlockCount) {
                        if (selectedBlockCount > 0) {
                            var maxValue = data.yRange[1];
                            if(maxValue == 80000) {
                                maxValue = 10000000;
                            }

                            // location.href = 'https://www.whatap.io';
                        }
                    }
                },
                countLevel: {'err': [0, 2, 5], 'hit': [0, 30, 60]},
                animation: false,
                buttons: false,
                buttonsLeftRight: true,
                legends: self.props.drawLegend,
                buttonCallback: function (err, data) {

                }
            });
            if(cb) cb();
            // self.initData();
            // self.props.liveDataFromServer(self.props.id, true, {oid: 'sum'});
        },1)
    }

    initData(data){
        if(data == undefined) return;

        var self = this;
        if(this.props.dataManipulator){
            data = this.props.dataManipulator(data);
        }

        if(Object.keys(this.props.data).length){
            var data = self.props.data;
            if(data[KEYS[0]].length < 1) return;

            var interval = data[KEYS[0]][1][0] - data[KEYS[0]][0][0];

            this.makeChart(function(){
                var stime = data[KEYS[0]][0][0];
                var etime = data[KEYS[0]][data[KEYS[0]].length-1][0];
                self.chart.loadData({
                    timeRange: [stime, etime],
                    dataset: self.props.data,
                    xAxis: { interval: interval},
                })
            })
        }else{
            this.makeChart()
        };        
    }

    componentDidUpdate(prevProps, prevState) {
        var self = this;
        var data = this.props.data;

        if(data == undefined) return ;

        if(data != prevProps.data){
            this.initData(data);
        }
    }

    componentWillReceiveProps(nextProps){
        var {data} = this.props;
        this.setState({
            data: data
        });
    }

    onButtonClick( direction ){
        this.chart && this.chart.changeYAxis(direction)
    }

    equalData(d1, d2){
        if(d1 != d2) return false;
        if(d1.constructor != d2.constructor) return false;

        if(d1.constructor == Array){
            if( d1.length != d2.length){
                return false;
            }

            for(var i = 0 ; i < d1.length; i++){
                if(d1[i] != d2[i]) return false;
            }
            return true;

        }else if(d1.constructor == Object){
            var d1keys = [];
            for(var k in d1){
                if(d1[k] != d2[k]) return false;
                d1keys.push(k);
            }
            var d2keys = [];
            for(var k in d2){
                d2keys.push(k);
            }
            if(d1keys.length != d2keys.length) return false;

            for(var i = 0 ; i < d1keys.length ; i++){
                if( d1keys[i] != d2keys[i] ) return false;
            }

        }else{
            return d1 == d2;
        }
        return true;
    }


    render(){
        return(
            <div className={chart.className} ref={(dom) => { this.chartDom = dom; }} />
        )
    }
    
    componentWillUnmount(){
        $(this.chartDom).html('');
    }
    
}

HitmapChartStatic.propTypes = {
    // id: PropTypes.string.isRequired,
    loadData: PropTypes.func,
    loadinitData: PropTypes.func,
    drawLegend: PropTypes.bool,
    data: PropTypes.object,
}

HitmapChartStatic.defaultProps = {
    drawLegend: false,
}

export default HitmapChartStatic

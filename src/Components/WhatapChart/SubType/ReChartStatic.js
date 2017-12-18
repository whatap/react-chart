import React, {Component, PropTypes} from 'react';
import moment from 'moment'

import {chart, api, INTERVAL, REAL_TIME} from './../Meta'

import {AreaChart, Area, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip} from 'recharts';
import axios from 'axios';
const instance = axios.create({
    baseURL: api.url,
    timeout: api.timeout,
    withCredentials: api.withCredentials,
});

const initialState ={
    data:[],
    prev:[],
};

export default class ReChartStatic extends Component{
    // prop type & defalt value
    static propTypes = {
        pcode: PropTypes.string,
        type: PropTypes.string,
        makeData: PropTypes.func,
        chartType: PropTypes.string,
    };

    static defaultProps = {
    };

    constructor(props){
        super(props);
        this.state=initialState;
    }

    render(){
        let {chartType} = this.props;
        let {data} = this.state;

        switch(chartType){
            case 'area':
                return (
                    <div className={chart.className}>
                        <AreaChart syncId="anyId" width={400} height={200} data={data}>
                            <defs>
                                <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" tick={true}
                                   domain={['new Date().getTime()- 1000*60*5', 'new Date().getTime()']} />
                            <CartesianGrid strokeDasharray="3 3" />
                            <YAxis type="number" domain={[0, 'auto']} />
                            <Tooltip formatter={(v)=>{
                                return v.toFixed(2);
                            }}/>
                            <Area type="monotone" dataKey="value" stroke="#82ca9d" fillOpacity={1} fill="url(#color)" dot={false} isAnimationActive={false} />
                        </AreaChart>
                    </div>);
                break;
            case 'line':
                return (
                    <div className={chart.className}>
                        <LineChart syncId="anyId" width={400} height={200} data={data}>
                        <XAxis dataKey="name" tick={true}
                            domain={['new Date().getTime()- 1000*60*5', 'new Date().getTime()']} />
                        <CartesianGrid />
                        <YAxis type="number" domain={[0, 'auto']} />
                        <Tooltip />
                        <Line type="basis" dataKey="value" stroke="#8884d8" dot={false} isAnimationActive={false} />
                        </LineChart>
                    </div>);
                break;
        }
        return(
            <div>No Chart..</div>
        )
    }
    makeData(type, new_value){
        let data = [];
        let value = [];
        if(type === 'res_time' && new_value instanceof Object){
            new_value = new_value.avg;
        }
        value = this.state.prev.concat(new_value);

        value.map((d, i)=>{
            data.push(
                {name: moment(d[0]).format('HH:mm:ss'), value: d[1]}
            );
        });

        let new_value_count = value.length - this.state.prev.length;
        do{
            data.shift();
            new_value_count--;
        } while(this.state.prev.length && new_value_count>0);

        if(!this.state.prev.length){
            this.setState({
                data: data,
                prev: value
            });
        }else{
            this.setState({
                data: data,
            });
        }
    }
    componentWillReceiveProps(nextProps){
        var {type} = this.props;
        this.setState({
            type: type
        });
    }
    componentWillMount(){
        var {type} = this.props;

        this.setState({
            type: type
        });
    }
    componentDidMount(){
        let {type} = this.props;
        let pcode=parseInt(this.props.pcode);
        let _this = this;

        // Optionally the request above could also be done as
        instance({
            method: 'get',
            params: {
                type: type,
                pcode:pcode ,
                path: chart[type].api.path,
            }
        })
        .then((res) => {
            _this.makeData(type, res.data);

            if(!REAL_TIME) return;

            setInterval(()=>{
                instance({
                    method: 'get',
                    params: {
                        type: type,
                        pcode: pcode,
                        path: chart[type].api.path_new,
                    }
                })
                .then((res)=>{
                    _this.makeData(type, res.data);
                })
            },INTERVAL);
        })
        .catch(error => {
            console.log(error);
        });
    }
}


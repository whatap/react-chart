import React, {Component, PropTypes} from 'react';
import {chart, api, INTERVAL, REAL_TIME} from './Meta'

import ArcEqualizerChartStatic from './SubType/ArcEqualizerChartStatic';

import axios from 'axios';

const instance = axios.create({
    baseURL: api.url,
    timeout: api.timeout,
    withCredentials: api.withCredentials,
});

const initialState ={
    data:[],
};

export default class WArcEqualizerChart extends Component{
    // prop type & defalt value
    static propTypes = {
        type:PropTypes.string,
        pcode: PropTypes.string,
    };

    static defaultProps = {
        type:'active_tx_count',
        pcode: document.getElementById('whatap-chart-active').dataset.pcode
    };

    constructor(props){
        super(props);

        this.state=initialState
    }

    render(){
        let {data}=this.state;
        let {type, pcode} = this.props;
        let title = chart[type].title;

        return(
            <div>
                <h3>{title}</h3>
                 <ArcEqualizerChartStatic pcode={pcode} type={type} data={data} />
            </div>
        )
    }

    componentDidMount(){ 
        let {type} = this.props;
        let pcode=parseInt(this.props.pcode);

        // Optionally the request above could also be done as
        instance({
            method: 'get',
            params: {
                type: type,
                pcode: pcode,
                path: chart[type].api.path,
                oid: chart[type].api.oid
            }
        })
        .then((res) => {
            this.setState({
                data: res.data,
            });

            if(!REAL_TIME) return;

            setInterval(()=>{
                instance({
                    method: 'get',
                    params: {
                        type: type,
                        pcode: pcode,
                        path: chart[type].api.path_new,
                        oid: chart[type].api.oid
                    }
                })
                .then((res)=>{
                    if(!this.state.data) return;

                    this.setState({
                        data: res.data,
                    });
                })
            }, INTERVAL);
        })
        .catch(error => {
            console.log(error);
        });
    }
}


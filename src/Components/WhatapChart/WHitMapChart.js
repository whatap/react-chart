import React, {Component, PropTypes} from 'react';
import {chart, api, INTERVAL, REAL_TIME} from './Meta'

import HitmapChartStatic from './SubType/HitmapChartStatic';

import axios from 'axios';

const instance = axios.create({
    baseURL: api.url,
    timeout: api.timeout,
    withCredentials: api.withCredentials,
});

const initialState ={
    data:{},
    index:0,
    loop:0,
};

export default class WHitMapChart extends Component{
    // prop type & defalt value
    static propTypes = {
        type:PropTypes.string,
        pcode: PropTypes.string,
    };

    static defaultProps = {
        type:'hitmap',
        pcode: document.getElementById('whatap-chart-hitmap').dataset.pcode
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
                 <HitmapChartStatic pcode={pcode} type={type} data={data} />
            </div>
        )
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
                pcode: pcode,
                path: chart[type].api.path,
                oid: chart[type].api.oid
            }
        })
        .then((res) => {
            this.setState({
                data: res.data || {},
                index: res.data.index,
                loop: res.data.loop,
            });
            {}
            if(!REAL_TIME ) return;

            setInterval(()=>{
                instance({
                    method: 'get',
                    params: {
                        type: type,
                        pcode: pcode,
                        path: chart[type].api.path_new,
                        oid: chart[type].api.oid,
                        params:{
                            index:_this.state.index,
                            loop: _this.state.loop,
                        }
                    }
                })
                .then((res)=>{
                    if(!this.state.data) return;

                    let data={};
                    data.hit = this.state.data.hit.concat(res.data.hit);
                    data.err = this.state.data.err.concat(res.data.err);
                    
                    let i = data.hit.length - this.state.data.hit.length;
                    do{
                        data.hit.shift();
                        data.err.shift();
                        i--;
                    } while(i>0);

                    this.setState({
                        data: data,
                        index: res.data.index,
                        loop: res.data.loop,
                    });
                })
            }, INTERVAL);
        })
        .catch(error => {
            console.log(error);
        });
    }
}


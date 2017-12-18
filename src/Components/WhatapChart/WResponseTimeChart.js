import React, {Component, PropTypes} from 'react';
import {chart} from './Meta'

import ReChartStatic from './SubType/ReChartStatic';


export default class WResponseTimeChart extends Component{
    // prop type & defalt value
    static propTypes = {
        type:PropTypes.string,
        pcode: PropTypes.string,
    };

    static defaultProps = {
        type:'res_time',
        pcode: document.getElementById('whatap-chart-response').dataset.pcode
    };

    render(){
        let {type, pcode} = this.props;
        let title = chart[type].title;

        return(
            <div>
                <h3>{title}</h3>
                <ReChartStatic pcode={pcode} type={type} chartType='line' />
            </div>
        )
    }
}
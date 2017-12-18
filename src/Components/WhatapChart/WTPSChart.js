import React, {Component, PropTypes} from 'react';
import {chart} from './Meta'

import ReChartStatic from './SubType/ReChartStatic';


export default class WTPSChart extends Component{
    // prop type & defalt value
    static propTypes = {
        type:PropTypes.string,
        pcode: PropTypes.string,
    };

    static defaultProps = {
        type:'tps',
        pcode: document.getElementById('whatap-chart-tps').dataset.pcode
    };

    render(){
        let {type, pcode} = this.props;
        let title = chart[type].title;

        return(
            <div>
                <h3>{title}</h3>
                <ReChartStatic pcode={pcode} type={type} chartType='area' />
            </div>
        )
    }
}
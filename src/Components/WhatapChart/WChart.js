import React, {Component, PropTypes} from 'react';
import {ChartType} from './Meta'

import WTPSChart from './WTPSChart';
import WResponseTimeChart from './WResponseTimeChart';
import WRealtimeUserChart from './WRealtimeUserChart';
import WArchEqualizerChart from './WArchEqualizerChart';
import WHitMapChart from './WHitMapChart';

export default class WChart extends Component{
    // prop type & defalt value
    static propTypes = {
        types: PropTypes.array
    };

    static defaultProps = {
        types: []
    };

    constructor(props){
        super(props);
    }

    render(){
        let {types} = this.props;

        let chartComponents=[];
        types.map((type, i) => {
            switch(type){
                case ChartType.active:
                    chartComponents.push(<WArchEqualizerChart key={i} />);
                    break;
                case ChartType.hitmap:
                    chartComponents.push(<WHitMapChart key={i} />);
                    break;
                case ChartType.tps:
                    chartComponents.push(<WTPSChart key={i} />);
                    break;
                case ChartType.response:
                    chartComponents.push(<WResponseTimeChart key={i} />);
                    break;
                case ChartType.user:
                    chartComponents.push(<WRealtimeUserChart key={i} />);
                    break;
            }
            return chartComponents;
        });

        return(
            <div>
                {chartComponents}
            </div>
        )
    }
}
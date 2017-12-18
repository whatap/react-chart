import 'bootstrap-css';
import './static/css/style.css';

import React from 'react';
import ReactDOM from 'react-dom';

import WChart from './Components/WhatapChart/WChart';
import WTPSChart from './Components/WhatapChart/WTPSChart';
import WResponseTimeChart from './Components/WhatapChart/WResponseTimeChart';
import WRealtimeUserChart from './Components/WhatapChart/WRealtimeUserChart';
import WArchEqualizerChart from './Components/WhatapChart/WArchEqualizerChart';
import WHitMapChart from './Components/WhatapChart/WHitMapChart';

ReactDOM.render(
    <div>
        <WHitMapChart pcode={document.getElementById('hitmap1').dataset.pcode} />
    </div>,
    document.getElementById('hitmap1')
);

ReactDOM.render(
    <div>
        <WHitMapChart pcode={document.getElementById('hitmap2').dataset.pcode} />
    </div>,
    document.getElementById('hitmap2')
);



ReactDOM.render(
    <WArchEqualizerChart />,
    document.getElementById('whatap-chart-active')
);
ReactDOM.render(
    <WHitMapChart />,
    document.getElementById('whatap-chart-hitmap')
);
ReactDOM.render(
    <WTPSChart />,
    document.getElementById('whatap-chart-tps')
);
ReactDOM.render(
    <WResponseTimeChart />,
    document.getElementById('whatap-chart-response')
);
ReactDOM.render(
    <WRealtimeUserChart />,
    document.getElementById('whatap-chart-user')
);

ReactDOM.render(
    <div>
        <WArchEqualizerChart pcode={document.getElementById('whatap-chart').dataset.pcode} />
        <WHitMapChart pcode={document.getElementById('whatap-chart').dataset.pcode} />
        <WTPSChart pcode={document.getElementById('whatap-chart').dataset.pcode} />
        <WResponseTimeChart pcode={document.getElementById('whatap-chart').dataset.pcode} />
        <WRealtimeUserChart pcode={document.getElementById('whatap-chart').dataset.pcode} />
    </div>,
    document.getElementById('whatap-chart')
);


/* Cookies AUTH -> 추 후 토큰으로 변경 될 예정 */
import Cookies from 'universal-cookie';
export var cookie = {
    wa: 'PVBVTb453Z32u3VnTR5kEtXA5bmgslue0vTckLQl3xxdQ4xr1OqyfhbBpfVr48ef',
    email: 'whatapiodemo@gmail.com ',
    domai: '.whatap.io',
}
const cookies = new Cookies();
cookies.set('wa', cookie.wa, {domain: cookie.domain});


/* 실시간 차트 제어 옵션 */
export const REAL_TIME = true;
export const INTERVAL = 5 * 1000;

/* getData기본 API 설정 */
export const api = {
    url:'http://apmote.whatap.io:8080/yard/api',
    timeout:10000,
    withCredentials:true,
}

/* 차트 Type */
export const ChartType = {
    active: 'active',
    hitmap: 'hitmap',
    tps: 'tps',
    response: 'response',
    user: 'user',
}

/* 차트 API PATH 설정 */
export const chart = {
    className: 'whatap-chart',
    active_tx_count: {
        title: 'ARC_EQUALIZER',
        api:{
            path: '/latest/last',
            path_new: '/latest/last',
            oid: 'oids'
        }
    },
    hitmap: {
        title: 'HIT_MAP',
        api:{
            path: '/latest/loop',
            path_new: '/latest/loop',
            oid: 'oids'
        }
    },
    tps: {
        title: 'TPS',
        api:{
            path: '/latest/series',
            path_new: '/latest/last',
        }
    },
    rt_user: {
        title: 'REALTIME_USER',
        api:{
            path: '/latest/series',
            path_new: '/latest/last',
        }
    },
    res_time: {
        title: 'RESPONSE_TIME',
        api:{
            path: '/latest/series',
            path_new: '/latest/last',
        }
    }
}
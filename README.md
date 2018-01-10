# react-chart
- 차트를 컴포넌트 화 하여 원하는 차트만 골라서 대시보드를  만들 수 있습니다.
- react version: 15.6.2

![react-chart](./screen-shot.png "react-chart(WHATAP)")

## 개발 환경 설정
- 패키지 설치
```
$ npm install #dependencies
$ npm install --save-dev #devDependencies
```

- 개발시 패키지가 추가 되었다면 다음 명령어를 통해 pacakge.json파일을 업데이트 하도록 한다.
```
$ npm install --save
$ npm install --save-dev
```

## node 서버 띄우기
- 서버를 띄우는 방법에 따라 기본 포트가 다릅니다. (pacage.json파일을 참조)
```
$ npm run dev # 개발 환경 (port: 3333)
$ npm run start # 프러덕션 환경 (port: 3000)
```

## 빌드
- 서버를 띄운상태에서 새로이 빌드를 를 원하는 경우
```
$ npm run build-watch # 실시간 자동 빌드
$ npm run build-all # 원타임 빌드 + 최적화
```

## 브라우저 확인
- dev port: 3333 / pro port: 3000 (pacage.json파일을 참조)
- 클라이언트 host와 port가 서버(API)와 다른 경우 CROS문제가 발생 할 수 있습니다. 

```
http://localhost:[PORT]/

ex)
http://localhost:3333/ #dev
http://localhost:3000/ #prod
```

## CROS문제가 생기는 경우
### 브라우저 플러그인을 통한 임시해결
- 다음과 같은 크롬 브라우저를 사용한다면 플러그인 추천합니다.
- (플러그인 명: Allow-Control-Allow-Origin, Access-Control-Allow-Credentials)

### 로컬 Front환경에서 옵션 설정(프론트 서버를 로컬에서 띄워야함.)
- 실제 환경에서는 서버 사이드에서 CORS (Cross Origin Resource Sharing) 허용을 위한 옵션을 지정합니다.
- 와탭 Front 환경에서는 front.conf의 2가지 설정을 통해 제어합니다. 이 설정을 통해 상기의 헤더 값이 클라이언트 응답으로 노출됩니다.

```
allowCors=[true/false]
allowedOrigins=[IP] 

ex) 
allowCors=true
allowedOrigins=127.0.0.1,192.168.0.1,192.168.0.2
```

## TODOES
- token 기반 인증 : request에 token을 부가하여 인증을 수행


## 컴포넌트 사용 방법
### 차트별 고유 영역 지정
- 차트별로 고유 영역을 가지고 있습니다. 
- div의 id(변경불가)에 따라 알맞는 차트가 그려집니다. (index.html 파일 참고)
- 각 영역에는 pcode와 token 정보가 존재 합니다.
- pcode: 프로젝트 코드입니다.
- token: 사용자 식별로 사용됩니다.
```
    <div id="whatap-chart-active" class="whatap" data-pcode='1234569339' data-token='test'></div>
    <div id="whatap-chart-hitmap" class="whatap" data-pcode='1234569339' data-token='test'></div>
    <div id="whatap-chart-tps" class="whatap" data-pcode='1234569339' data-token='test'></div>
    <div id="whatap-chart-response" class="whatap" data-pcode='1234569339' data-token='test'></div>
    <div id="whatap-chart-user" class="whatap" data-pcode='1234569339' data-token='test'></div>
```

### 리엑트 컴포넌트 삽입
- 다음과 같이 ReactDom렌더시에 컴포넌트를 추가할 수 있습니다. (index.js 파일 참고)
- ReactDom의 컨테이너에 pcode와 token정보가 존재해야 합니다. (index.html 파일 참고)
- id는 임의로 지정 가능합니다.
- pcode: 프로젝트 코드입니다.
- token: 사용자 식별로 사용됩니다.

#### 예) 다른 프로젝트의 같은 차트를 삽입하는 경우
- 다음과 같이 사용이 가능합니다.
```
    <div id="hitmap1" class="whatap" data-pcode='10001' data-token='test'></div>
    <div id="hitmap2" class="whatap" data-pcode='1234569339' data-token='test'></div>
```

```
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
```

#### 예) 같은 프로젝트이 모든 차트 삽입하는 경우 
- 다음과 같이 사용이 가능합니다.
```
    <div id="whatap-chart" class="whatap" data-pcode='1234569339' data-token='test'></div>
```

```
    ReactDOM.render(
        <div>
            <WArchEqualizerChart pcode={document.getElementById('whatap-chart-all').dataset.pcode} />
            <WHitMapChart pcode={document.getElementById('whatap-chart-all').dataset.pcode} />
            <WTPSChart pcode={document.getElementById('whatap-chart-all').dataset.pcode} />
            <WResponseTimeChart pcode={document.getElementById('whatap-chart-all').dataset.pcode} />
            <WRealtimeUserChart pcode={document.getElementById('whatap-chart-all').dataset.pcode} />
        </div>,
        document.getElementById('whatap-chart-all')
    );
```

## 와탭 모든 컴포넌트 영역 및 스타일
- TODO (크기 / 색상 변경)
- css만으로 reactComponent의 스타일을 변경하는것은 한계가 있음. 설정파일(.js)가 필요함.

## Directory 구조 
```
├── server                      # 서버 디렉토리
│   └── whatap.js               # 서버 메인 스크립트(라우트 포함)
├── src                         # 클라이언트 디렉토리
│   ├── static                  # 클라이언트 static 디렉토리
│   │   └── css                 # 클라이언트 css 디렉토리
│   │       └── style.css       # 클라이언트 style css
│   ├── Components              # 클라이언트 컴포넌트들
│   │   └── WhatapChart         # 클라이언트 와탭 차트를 위한 컴포넌트들
│   │        ├── SubType        # 클라이언트 와탭 전용 차트 구성을 위한 기본 컴포넌트들
│   │        └── XXXXX.js       # 클라이언트 와탭 전용 차트 컴포넌트들
│   └── index.js                # 클라이언트 메인 스크립트
├── index.html                  # 메인 페이지
├── package.json                # npm 설정파일
├── webpack.config.js           # webpack 설정파일
├── webpack.dev.config.js       # webpack-dev-server 설정파일
├── bundle.js                   # webpack으로 컴파일된 클라이언트 메인 스크립트
└── .babelrc                    # babel 설정파일
```
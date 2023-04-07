"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const react_dom_1 = require("react-dom");
const ReactCusdis_1 = require("./ReactCusdis");
function App() {
    const [pageId, setPageId] = react_1.default.useState('test');
    return (react_1.default.createElement("div", null,
        react_1.default.createElement("div", null,
            react_1.default.createElement("button", { onClick: _ => setPageId('test') }, "page test"),
            react_1.default.createElement("button", { onClick: _ => setPageId('test2') }, "page test2")),
        react_1.default.createElement(ReactCusdis_1.ReactCusdis, { key: pageId, lang: "zh-cn", attrs: {
                appId: '628096d1-0d4e-47c4-a14a-450bd2022215',
                host: 'http://localhost:3000',
                pageId
            } })));
}
react_dom_1.default.render(react_1.default.createElement(react_1.default.StrictMode, null,
    react_1.default.createElement(App, null)), document.getElementById('root'));

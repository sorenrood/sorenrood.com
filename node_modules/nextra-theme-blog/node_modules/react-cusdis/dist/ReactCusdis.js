"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactCusdis = void 0;
const React = require("react");
const useScript_1 = require("./useScript");
function ReactCusdis(props) {
    const divRef = React.useRef(null);
    const host = props.attrs.host || 'https://cusdis.com';
    useScript_1.useScript(`${host}/js/cusdis.es.js`);
    useScript_1.useScript(props.lang ? `${host}/js/widget/lang/${props.lang}.js` : '');
    React.useLayoutEffect(() => {
        // @ts-expect-error
        const render = window.renderCusdis;
        if (render) {
            render(divRef.current);
        }
    }, [
        props.attrs.appId,
        props.attrs.host,
        props.attrs.pageId,
        props.attrs.pageTitle,
        props.attrs.pageUrl,
        props.lang
    ]);
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { id: "cusdis_thread", "data-host": host, "data-page-id": props.attrs.pageId, "data-app-id": props.attrs.appId, "data-page-title": props.attrs.pageTitle, "data-page-url": props.attrs.pageUrl, "data-theme": props.attrs.theme, style: props.style, ref: divRef })));
}
exports.ReactCusdis = ReactCusdis;

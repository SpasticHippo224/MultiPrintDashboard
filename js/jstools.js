function createElement(tag = "span", data = {}) {
    tag = typeof(tag) === "string" ? (["svg", "circle", "text"].includes(tag) ? document.createElementNS("http://www.w3.org/2000/svg", tag) : document.createElement(tag)) : tag;
    if (["svg", "circle", "text"].includes(tag.tagName)) {
        tag.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    }
    Object.keys(data).forEach(e => {
        if (typeof data[e] === "object") {
            if (e === "data") {
                e = "dataset";
            }
            createElement(tag[e] || (tag[e] = {}), data[e]);
        } else {
            tag[e] = data[e];
            try {
                tag.setAttribute(e, data[e]);
            } catch (e) {}
        }
    });
    return tag;
}

window.Element.prototype.add = function() {
    Array.from(arguments).forEach(elem => {
        this.append(elem);
    });
    return this;
}

function displaySecs(seconds) {
    return new Date(seconds * 1000).toISOString().slice(11, 19);
}
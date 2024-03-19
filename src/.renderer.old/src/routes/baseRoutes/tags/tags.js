"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const material_1 = require("@mui/material");
const ExpandMore_1 = __importDefault(require("@mui/icons-material/ExpandMore"));
const react_router_dom_1 = require("react-router-dom");
const prop_types_1 = __importDefault(require("prop-types"));
const modules_1 = require("../../../modules/");
require("./tags.css");
const filterObjectsByTag = (tagId, ...arrays) => {
    return arrays
        .flatMap(array => array)
        .filter(object => object.tags && object.tags.some(tag => tag._id === tagId));
};
const Tags = () => {
    const [tagsList, setTagsList] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        setTagsList(modules_1.getAllTags);
    }, []);
    return (React.createElement(React.Fragment, null,
        React.createElement("h3", null, "All Tags"),
        React.createElement(material_1.Unstable_Grid2, { container: true, spacing: 2 }, tagsList ?
            tagsList.sort((a, b) => a.Name.localeCompare(b.Name)).map((Tag, index) => (React.createElement(TagType, { tagType: Tag, key: index })))
            : "")));
};
const TagType = (props) => {
    const tagType = props.tagType;
    const Tags = tagType.Tags;
    const [mapInfo, , , ,] = (0, react_router_dom_1.useOutletContext)();
    return (Tags.some((tag) => filterObjectsByTag(tag._id, mapInfo.countries, mapInfo.cities, mapInfo.religions, mapInfo.cultures).length !== 0) ?
        (React.createElement(material_1.Unstable_Grid2, { xs: 4 },
            React.createElement(material_1.Accordion, { defaultExpanded: true },
                React.createElement(material_1.AccordionSummary, { expandIcon: React.createElement(ExpandMore_1.default, null), "aria-controls": "panel1-content", id: "panel1-header" },
                    React.createElement(material_1.Typography, { variant: 'h6' },
                        tagType.Name,
                        " ",
                        React.createElement("span", null, tagType.Count + " Items"))),
                React.createElement(material_1.AccordionDetails, null,
                    React.createElement(material_1.Unstable_Grid2, { container: true, spacing: 2 }, Tags.sort((a, b) => a.Name.localeCompare(b.Name)).map((Tag, index) => (filterObjectsByTag(Tag._id, mapInfo.countries, mapInfo.cities, mapInfo.religions, mapInfo.cultures).length !== 0 ?
                        (React.createElement(TagItem, { data: Tag, key: index })) : ""))))))) : "");
};
TagType.propTypes = {
    tagType: prop_types_1.default.shape({
        _id: prop_types_1.default.string,
        Count: prop_types_1.default.number,
        Name: prop_types_1.default.string,
        Tags: prop_types_1.default.array,
        Type: prop_types_1.default.string
    })
};
const TagItem = (props) => {
    const { _id, Default, Name } = props.data;
    const [mapInfo, , , ,] = (0, react_router_dom_1.useOutletContext)();
    return (React.createElement(material_1.Unstable_Grid2, { xs: 12 },
        React.createElement("span", null, Name),
        React.createElement("div", { className: "tag-info" },
            React.createElement("span", { className: "tag-posts" },
                filterObjectsByTag(_id, mapInfo.countries, mapInfo.cities, mapInfo.religions, mapInfo.cultures).length + " Items",
                React.createElement("br", null),
                "Default: " + Default),
            React.createElement(material_1.Button, { variant: "contained", className: "tag-button" }, "View Posts"))));
};
TagItem.propTypes = {
    data: prop_types_1.default.shape({
        _id: prop_types_1.default.string,
        Default: prop_types_1.default.bool,
        Name: prop_types_1.default.string,
        Type: prop_types_1.default.string,
        Description: prop_types_1.default.string
    }),
};
exports.default = Tags;
//# sourceMappingURL=tags.js.map
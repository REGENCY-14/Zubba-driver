// Diagnostic-only web stub for react-native-maps (native-only, breaks the
// web bundle via codegenNativeComponent). Not wired in for native builds.
const React = require("react");
const { View } = require("react-native");

function MapView(props) {
  return React.createElement(View, { style: props.style, testID: "map-stub" }, props.children);
}

module.exports = MapView;
module.exports.default = MapView;
module.exports.Marker = function Marker() { return null; };
module.exports.Polyline = function Polyline() { return null; };
module.exports.UrlTile = function UrlTile() { return null; };
module.exports.PROVIDER_DEFAULT = "default";
module.exports.PROVIDER_GOOGLE = "google";

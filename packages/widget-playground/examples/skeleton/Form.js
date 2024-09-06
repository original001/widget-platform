import React from "react";

export var FormSkeleton = function (_a) {
  var _b = _a.backgroundColor,
    backgroundColor = _b === void 0 ? "#E5E5E5" : _b,
    _c = _a.iconColor,
    iconColor = _c === void 0 ? "white" : _c;
  return React.createElement(
    "svg",
    { width: "80", height: "80", viewBox: "0 0 80 80", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
    React.createElement("rect", { width: "80", height: "80", rx: "40", fill: backgroundColor }),
    React.createElement("rect", { x: "22", y: "26", width: "11", height: "4", rx: "2", fill: iconColor }),
    React.createElement("rect", { x: "36", y: "26", width: "22", height: "4", rx: "2", fill: iconColor }),
    React.createElement("rect", { x: "22", y: "34", width: "11", height: "4", rx: "2", fill: iconColor }),
    React.createElement("rect", { x: "36", y: "34", width: "22", height: "4", rx: "2", fill: iconColor }),
    React.createElement("rect", { x: "30", y: "54", width: "20", height: "8", rx: "4", fill: iconColor }),
    React.createElement("rect", { x: "22", y: "42", width: "11", height: "4", rx: "2", fill: iconColor }),
    React.createElement("rect", { x: "36", y: "42", width: "22", height: "4", rx: "2", fill: iconColor })
  );
};
FormSkeleton.displayName = "FormSkeleton";
FormSkeleton.__KONTUR_REACT_UI__ = "FormSkeleton";

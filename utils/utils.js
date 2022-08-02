const profileEntities = require("./informationMaps/profileEntities.json");
const profileInfo = require("./informationMaps/profileInfo.json");
const tableHeaders = require("./informationMaps/tableHeaders.json");
const editableProperties = require("./informationMaps/editableProperties.json");

const translation = require("./translation.json");

// TODO remover
const __typenameMap = require("./__typenameMap.json");

import actions from "./informationMaps/actions.js";

export default {
  isDate(string) {
    return typeof string === "string"
      ? string.length >= 10 &&
          !string.includes(" ") &&
          new Date(string)?.toString() !== "Invalid Date"
      : false;
  },
  isFloat(n) {
    return Number(n) === n && n % 1 !== 0;
  },
  translate: (s) => {
    return translation[s] ? translation[s] : s;
  },
  detranslate: (s) => {
    for (let t in translation) {
      if (translation[t] == s) {
        return t;
      }
    }
    return s;
  },
  profileActions(c) {
    return actions[c] ? actions[c].profileActions : [];
  },
  tabActions(c, t) {
    return actions[c][t] ? actions[c][t].tabActions : [];
  },
  elementActions(c, t) {
    return actions[c][t] ? actions[c][t].elementActions : [];
  },
  profileEntities() {
    return profileEntities.entities;
  },
  __typenameToType(s) {
    if (__typenameMap[s]) {
      return __typenameMap[s];
    } else {
      console.log(`__typename ${s} missing on __typenameMap.json`);
      return null;
    }
  },
  typeTo__typename(s) {
    for (let type in __typenameMap) {
      if (__typenameMap[type] == s) {
        return type;
      }
    }
    console.log(`__typename ${s} missing on __typenameMap.json`);
    return null;
  },
  isUser(s) {
    return ["Professor", "Student", "Admin", "Parent"].includes(s);
  },
  getProfileChips(t) {
    return profileInfo[t] ? profileInfo[t].chips : [];
  },
  getProfileRects(t) {
    return profileInfo[t] ? profileInfo[t].rects : [];
  },
  getHeaderProperties(t) {
    return profileInfo[t] ? profileInfo[t].header : [];
  },
  getEditableProperties(t) {
    return editableProperties[t] ? editableProperties[t].props : [];
  },
  traverseAndFlatten(currentNode, target, flattenedKey) {
    for (var key in currentNode) {
      if (currentNode[key] != null) {
        var newKey;
        if (flattenedKey === undefined) {
          newKey = key;
        } else {
          newKey = flattenedKey + "." + key;
        }

        var value = currentNode[key];
        if (typeof value === "object" && !Array.isArray(value)) {
          this.traverseAndFlatten(value, target, newKey);
        } else if (Array.isArray(value)) {
          if (value.length > 0) {
            target[newKey] = value;
          } else {
            target[newKey] = "";
          }
        } else {
          target[newKey] = value;
        }
      }
    }
  },
  flatten(obj) {
    var flattenedObject = {};
    this.traverseAndFlatten(obj, flattenedObject);
    return flattenedObject;
  },
  getDataTableHeaders(context, type) {
    if (Object.keys(tableHeaders[context]).includes(type)) {
      return tableHeaders[context][type];
    } else {
      console.log(`Type ${type} missing on tableHeaders[${context}].json`);
      return null;
    }
  },
  computeDataTableRows(rows) {
    let flattenedRow = JSON.parse(
      JSON.stringify(
        rows.map((e) => {
          return this.flatten(e);
        })
      )
    );
    let result = flattenedRow.map((row) => {
      for (let col in row) {
        if (this.isDate(row[col])) {
          const option = {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
          };
          const locale = "pt-br";
          row[col + ".ISO"] = row[col];
          row[col] = new Date(row[col]).toLocaleDateString(locale, option);
        }
        if (col.endsWith("Percentage")) {
          row[col] = String((row[col] * 100).toFixed(1)) + "%";
        } else if (col.endsWith("Id")) {
          row["Id"] = row[col];
        } else {
          if (col != "__typename") {
            row[col] = this.translate(row[col]);
          }
        }
      }
      return row;
    });
    return result;
  },
  copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.style.position = "fixed";
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = 0;
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      var successful = document.execCommand("copy");
      var msg = successful ? "successful" : "unsuccessful";
      console.log("Copying text command was " + msg);
      document.body.removeChild(textArea);
      return msg;
    } catch (err) {
      console.log("Oops, unable to copy");
      document.body.removeChild(textArea);
      return -1;
    }
  },
  capitalize(s) {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  },
  trimString(s) {
    var l = 0,
      r = s.length - 1;
    while (l < s.length && s[l] == " ") l++;
    while (r > l && s[r] == " ") r -= 1;
    return s.substring(l, r + 1);
  },
  compareObjects(o1, o2) {
    var k = "";
    for (k in o1) if (o1[k] != o2[k]) return false;
    for (k in o2) if (o1[k] != o2[k]) return false;
    return true;
  },
  itemExists(haystack, needle) {
    for (var i = 0; i < haystack.length; i++)
      if (this.compareObjects(haystack[i], needle)) return true;
    return false;
  },
  truncateString(str, num) {
    if (str != null) {
      if (str.length > num) {
        return str.slice(0, num) + "...";
      } else {
        return str;
      }
    } else {
      return "";
    }
  },
  normalizeString(string) {
    return string
      ?.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ /g, "")
      .toLowerCase()
      .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "");
  },
  routerReplace(context, args) {
    try {
      context.$router.push(args);
    } catch (err) {
      if (
        err.name !== "NavigationDuplicated" &&
        !err.message.includes(
          "Avoided redundant navigation to current location"
        )
      ) {
        console.error(err);
      }
      console.log(err);
    }
  },
};

(self["webpackChunk_woocommerce_storybook"] = self["webpackChunk_woocommerce_storybook"] || []).push([[7624],{

/***/ "../../node_modules/.pnpm/@wordpress+date@5.33.1/node_modules/@wordpress/date/build-module/index.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   date: () => (/* binding */ date),
/* harmony export */   dateI18n: () => (/* binding */ dateI18n),
/* harmony export */   format: () => (/* binding */ format)
/* harmony export */ });
/* unused harmony exports __experimentalGetSettings, getDate, getSettings, gmdate, gmdateI18n, humanTimeDiff, isInTheFuture, setSettings */
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/moment.js");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var moment_timezone_moment_timezone__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("../../node_modules/.pnpm/moment-timezone@0.5.48/node_modules/moment-timezone/moment-timezone.js");
/* harmony import */ var moment_timezone_moment_timezone__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(moment_timezone_moment_timezone__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var moment_timezone_moment_timezone_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("../../node_modules/.pnpm/moment-timezone@0.5.48/node_modules/moment-timezone/moment-timezone-utils.js");
/* harmony import */ var moment_timezone_moment_timezone_utils__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(moment_timezone_moment_timezone_utils__WEBPACK_IMPORTED_MODULE_2__);





const WP_ZONE = "WP";
const VALID_UTC_OFFSET = /^[+-][0-1][0-9](:?[0-9][0-9])?$/;
let settings = {
  l10n: {
    locale: "en",
    months: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ],
    monthsShort: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ],
    weekdays: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ],
    weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    meridiem: { am: "am", pm: "pm", AM: "AM", PM: "PM" },
    relative: {
      future: "%s from now",
      past: "%s ago",
      s: "a few seconds",
      ss: "%d seconds",
      m: "a minute",
      mm: "%d minutes",
      h: "an hour",
      hh: "%d hours",
      d: "a day",
      dd: "%d days",
      M: "a month",
      MM: "%d months",
      y: "a year",
      yy: "%d years"
    },
    startOfWeek: 0
  },
  formats: {
    time: "g: i a",
    date: "F j, Y",
    datetime: "F j, Y g: i a",
    datetimeAbbreviated: "M j, Y g: i a"
  },
  timezone: { offset: "0", offsetFormatted: "0", string: "", abbr: "" }
};
function setSettings(dateSettings) {
  settings = dateSettings;
  setupWPTimezone();
  if (momentLib.locales().includes(dateSettings.l10n.locale)) {
    if (momentLib.localeData(dateSettings.l10n.locale).longDateFormat("LTS") === null) {
      momentLib.defineLocale(dateSettings.l10n.locale, null);
    } else {
      return;
    }
  }
  const currentLocale = momentLib.locale();
  momentLib.defineLocale(dateSettings.l10n.locale, {
    // Inherit anything missing from English. We don't load
    // moment-with-locales.js so English is all there is.
    parentLocale: "en",
    months: dateSettings.l10n.months,
    monthsShort: dateSettings.l10n.monthsShort,
    weekdays: dateSettings.l10n.weekdays,
    weekdaysShort: dateSettings.l10n.weekdaysShort,
    meridiem(hour, minute, isLowercase) {
      if (hour < 12) {
        return isLowercase ? dateSettings.l10n.meridiem.am : dateSettings.l10n.meridiem.AM;
      }
      return isLowercase ? dateSettings.l10n.meridiem.pm : dateSettings.l10n.meridiem.PM;
    },
    longDateFormat: {
      LT: dateSettings.formats.time,
      LTS: momentLib.localeData("en").longDateFormat("LTS"),
      L: momentLib.localeData("en").longDateFormat("L"),
      LL: dateSettings.formats.date,
      LLL: dateSettings.formats.datetime,
      LLLL: momentLib.localeData("en").longDateFormat("LLLL")
    },
    // From human_time_diff?
    // Set to `(number, withoutSuffix, key, isFuture) => {}` instead.
    relativeTime: dateSettings.l10n.relative
  });
  momentLib.locale(currentLocale);
}
function getSettings() {
  return settings;
}
function __experimentalGetSettings() {
  deprecated("wp.date.__experimentalGetSettings", {
    since: "6.1",
    alternative: "wp.date.getSettings"
  });
  return getSettings();
}
function setupWPTimezone() {
  const currentTimezone = moment__WEBPACK_IMPORTED_MODULE_0___default().tz.zone(settings.timezone.string);
  if (currentTimezone) {
    moment__WEBPACK_IMPORTED_MODULE_0___default().tz.add(
      moment__WEBPACK_IMPORTED_MODULE_0___default().tz.pack({
        name: WP_ZONE,
        abbrs: currentTimezone.abbrs,
        untils: currentTimezone.untils,
        offsets: currentTimezone.offsets
      })
    );
  } else {
    moment__WEBPACK_IMPORTED_MODULE_0___default().tz.add(
      moment__WEBPACK_IMPORTED_MODULE_0___default().tz.pack({
        name: WP_ZONE,
        abbrs: [WP_ZONE],
        untils: [null],
        offsets: [-settings.timezone.offset * 60 || 0]
      })
    );
  }
}
const MINUTE_IN_SECONDS = 60;
const HOUR_IN_MINUTES = 60;
const HOUR_IN_SECONDS = 60 * MINUTE_IN_SECONDS;
const formatMap = {
  // Day.
  d: "DD",
  D: "ddd",
  j: "D",
  l: "dddd",
  N: "E",
  /**
   * Gets the ordinal suffix.
   *
   * @param momentDate Moment instance.
   *
   * @return Formatted date.
   */
  S(momentDate) {
    const num = momentDate.format("D");
    const withOrdinal = momentDate.format("Do");
    return withOrdinal.replace(num, "");
  },
  w: "d",
  /**
   * Gets the day of the year (zero-indexed).
   *
   * @param momentDate Moment instance.
   *
   * @return Formatted date.
   */
  z(momentDate) {
    return (parseInt(momentDate.format("DDD"), 10) - 1).toString();
  },
  // Week.
  W: "W",
  // Month.
  F: "MMMM",
  m: "MM",
  M: "MMM",
  n: "M",
  /**
   * Gets the days in the month.
   *
   * @param momentDate Moment instance.
   *
   * @return Formatted date.
   */
  t(momentDate) {
    return momentDate.daysInMonth();
  },
  // Year.
  /**
   * Gets whether the current year is a leap year.
   *
   * @param momentDate Moment instance.
   *
   * @return Formatted date.
   */
  L(momentDate) {
    return momentDate.isLeapYear() ? "1" : "0";
  },
  o: "GGGG",
  Y: "YYYY",
  y: "YY",
  // Time.
  a: "a",
  A: "A",
  /**
   * Gets the current time in Swatch Internet Time (.beats).
   *
   * @param momentDate Moment instance.
   *
   * @return Formatted date.
   */
  B(momentDate) {
    const timezoned = moment__WEBPACK_IMPORTED_MODULE_0___default()(momentDate).utcOffset(60);
    const seconds = parseInt(timezoned.format("s"), 10), minutes = parseInt(timezoned.format("m"), 10), hours = parseInt(timezoned.format("H"), 10);
    return parseInt(
      ((seconds + minutes * MINUTE_IN_SECONDS + hours * HOUR_IN_SECONDS) / 86.4).toString(),
      10
    );
  },
  g: "h",
  G: "H",
  h: "hh",
  H: "HH",
  i: "mm",
  s: "ss",
  u: "SSSSSS",
  v: "SSS",
  // Timezone.
  e: "zz",
  /**
   * Gets whether the timezone is in DST currently.
   *
   * @param momentDate Moment instance.
   *
   * @return Formatted date.
   */
  I(momentDate) {
    return momentDate.isDST() ? "1" : "0";
  },
  O: "ZZ",
  P: "Z",
  T: "z",
  /**
   * Gets the timezone offset in seconds.
   *
   * @param momentDate Moment instance.
   *
   * @return Formatted date.
   */
  Z(momentDate) {
    const offset = momentDate.format("Z");
    const sign = offset[0] === "-" ? -1 : 1;
    const parts = offset.substring(1).split(":").map((n) => parseInt(n, 10));
    return sign * (parts[0] * HOUR_IN_MINUTES + parts[1]) * MINUTE_IN_SECONDS;
  },
  // Full date/time.
  c: "YYYY-MM-DDTHH:mm:ssZ",
  // .toISOString.
  /**
   * Formats the date as RFC2822.
   *
   * @param momentDate Moment instance.
   *
   * @return Formatted date.
   */
  r(momentDate) {
    return momentDate.locale("en").format("ddd, DD MMM YYYY HH:mm:ss ZZ");
  },
  U: "X"
};
function format(dateFormat, dateValue = /* @__PURE__ */ new Date()) {
  let i, char;
  const newFormat = [];
  const momentDate = moment__WEBPACK_IMPORTED_MODULE_0___default()(dateValue);
  for (i = 0; i < dateFormat.length; i++) {
    char = dateFormat[i];
    if ("\\" === char) {
      i++;
      newFormat.push("[" + dateFormat[i] + "]");
      continue;
    }
    if (char in formatMap) {
      const formatter = formatMap[char];
      if (typeof formatter !== "string") {
        newFormat.push("[" + formatter(momentDate) + "]");
      } else {
        newFormat.push(formatter);
      }
    } else {
      newFormat.push("[" + char + "]");
    }
  }
  return momentDate.format(newFormat.join("[]"));
}
function date(dateFormat, dateValue = /* @__PURE__ */ new Date(), timezone) {
  const dateMoment = buildMoment(dateValue, timezone);
  return format(dateFormat, dateMoment);
}
function gmdate(dateFormat, dateValue = /* @__PURE__ */ new Date()) {
  const dateMoment = momentLib(dateValue).utc();
  return format(dateFormat, dateMoment);
}
function dateI18n(dateFormat, dateValue = /* @__PURE__ */ new Date(), timezone) {
  if (true === timezone) {
    return gmdateI18n(dateFormat, dateValue);
  }
  if (false === timezone) {
    timezone = void 0;
  }
  const dateMoment = buildMoment(dateValue, timezone);
  dateMoment.locale(settings.l10n.locale);
  return format(dateFormat, dateMoment);
}
function gmdateI18n(dateFormat, dateValue = /* @__PURE__ */ new Date()) {
  const dateMoment = moment__WEBPACK_IMPORTED_MODULE_0___default()(dateValue).utc();
  dateMoment.locale(settings.l10n.locale);
  return format(dateFormat, dateMoment);
}
function isInTheFuture(dateValue) {
  const now = momentLib.tz(WP_ZONE);
  const momentObject = momentLib.tz(dateValue, WP_ZONE);
  return momentObject.isAfter(now);
}
function getDate(dateString) {
  if (!dateString) {
    return momentLib.tz(WP_ZONE).toDate();
  }
  return momentLib.tz(dateString, WP_ZONE).toDate();
}
function humanTimeDiff(from, to) {
  const fromMoment = momentLib.tz(from, WP_ZONE);
  const toMoment = to ? momentLib.tz(to, WP_ZONE) : momentLib.tz(WP_ZONE);
  return fromMoment.from(toMoment);
}
function buildMoment(dateValue, timezone = "") {
  const dateMoment = moment__WEBPACK_IMPORTED_MODULE_0___default()(dateValue);
  if (timezone && !isUTCOffset(timezone)) {
    return dateMoment.tz(timezone);
  }
  if (timezone && isUTCOffset(timezone)) {
    return dateMoment.utcOffset(timezone);
  }
  if (settings.timezone.string) {
    return dateMoment.tz(settings.timezone.string);
  }
  return dateMoment.utcOffset(+settings.timezone.offset);
}
function isUTCOffset(offset) {
  if ("number" === typeof offset) {
    return true;
  }
  return VALID_UTC_OFFSET.test(offset);
}
setupWPTimezone();

//# sourceMappingURL=index.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale sync recursive ^\\.\\/.*$":
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./af": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/af.js",
	"./af.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/af.js",
	"./ar": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ar.js",
	"./ar-dz": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ar-dz.js",
	"./ar-dz.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ar-dz.js",
	"./ar-kw": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ar-kw.js",
	"./ar-kw.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ar-kw.js",
	"./ar-ly": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ar-ly.js",
	"./ar-ly.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ar-ly.js",
	"./ar-ma": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ar-ma.js",
	"./ar-ma.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ar-ma.js",
	"./ar-ps": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ar-ps.js",
	"./ar-ps.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ar-ps.js",
	"./ar-sa": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ar-sa.js",
	"./ar-sa.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ar-sa.js",
	"./ar-tn": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ar-tn.js",
	"./ar-tn.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ar-tn.js",
	"./ar.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ar.js",
	"./az": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/az.js",
	"./az.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/az.js",
	"./be": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/be.js",
	"./be.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/be.js",
	"./bg": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/bg.js",
	"./bg.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/bg.js",
	"./bm": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/bm.js",
	"./bm.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/bm.js",
	"./bn": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/bn.js",
	"./bn-bd": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/bn-bd.js",
	"./bn-bd.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/bn-bd.js",
	"./bn.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/bn.js",
	"./bo": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/bo.js",
	"./bo.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/bo.js",
	"./br": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/br.js",
	"./br.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/br.js",
	"./bs": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/bs.js",
	"./bs.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/bs.js",
	"./ca": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ca.js",
	"./ca.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ca.js",
	"./cs": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/cs.js",
	"./cs.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/cs.js",
	"./cv": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/cv.js",
	"./cv.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/cv.js",
	"./cy": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/cy.js",
	"./cy.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/cy.js",
	"./da": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/da.js",
	"./da.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/da.js",
	"./de": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/de.js",
	"./de-at": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/de-at.js",
	"./de-at.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/de-at.js",
	"./de-ch": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/de-ch.js",
	"./de-ch.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/de-ch.js",
	"./de.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/de.js",
	"./dv": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/dv.js",
	"./dv.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/dv.js",
	"./el": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/el.js",
	"./el.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/el.js",
	"./en-au": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/en-au.js",
	"./en-au.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/en-au.js",
	"./en-ca": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/en-ca.js",
	"./en-ca.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/en-ca.js",
	"./en-gb": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/en-gb.js",
	"./en-gb.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/en-gb.js",
	"./en-ie": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/en-ie.js",
	"./en-ie.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/en-ie.js",
	"./en-il": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/en-il.js",
	"./en-il.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/en-il.js",
	"./en-in": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/en-in.js",
	"./en-in.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/en-in.js",
	"./en-nz": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/en-nz.js",
	"./en-nz.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/en-nz.js",
	"./en-sg": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/en-sg.js",
	"./en-sg.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/en-sg.js",
	"./eo": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/eo.js",
	"./eo.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/eo.js",
	"./es": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/es.js",
	"./es-do": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/es-do.js",
	"./es-do.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/es-do.js",
	"./es-mx": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/es-mx.js",
	"./es-mx.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/es-mx.js",
	"./es-us": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/es-us.js",
	"./es-us.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/es-us.js",
	"./es.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/es.js",
	"./et": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/et.js",
	"./et.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/et.js",
	"./eu": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/eu.js",
	"./eu.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/eu.js",
	"./fa": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/fa.js",
	"./fa.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/fa.js",
	"./fi": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/fi.js",
	"./fi.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/fi.js",
	"./fil": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/fil.js",
	"./fil.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/fil.js",
	"./fo": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/fo.js",
	"./fo.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/fo.js",
	"./fr": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/fr.js",
	"./fr-ca": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/fr-ca.js",
	"./fr-ca.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/fr-ca.js",
	"./fr-ch": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/fr-ch.js",
	"./fr-ch.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/fr-ch.js",
	"./fr.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/fr.js",
	"./fy": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/fy.js",
	"./fy.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/fy.js",
	"./ga": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ga.js",
	"./ga.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ga.js",
	"./gd": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/gd.js",
	"./gd.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/gd.js",
	"./gl": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/gl.js",
	"./gl.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/gl.js",
	"./gom-deva": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/gom-deva.js",
	"./gom-deva.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/gom-deva.js",
	"./gom-latn": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/gom-latn.js",
	"./gom-latn.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/gom-latn.js",
	"./gu": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/gu.js",
	"./gu.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/gu.js",
	"./he": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/he.js",
	"./he.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/he.js",
	"./hi": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/hi.js",
	"./hi.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/hi.js",
	"./hr": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/hr.js",
	"./hr.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/hr.js",
	"./hu": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/hu.js",
	"./hu.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/hu.js",
	"./hy-am": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/hy-am.js",
	"./hy-am.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/hy-am.js",
	"./id": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/id.js",
	"./id.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/id.js",
	"./is": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/is.js",
	"./is.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/is.js",
	"./it": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/it.js",
	"./it-ch": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/it-ch.js",
	"./it-ch.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/it-ch.js",
	"./it.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/it.js",
	"./ja": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ja.js",
	"./ja.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ja.js",
	"./jv": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/jv.js",
	"./jv.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/jv.js",
	"./ka": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ka.js",
	"./ka.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ka.js",
	"./kk": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/kk.js",
	"./kk.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/kk.js",
	"./km": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/km.js",
	"./km.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/km.js",
	"./kn": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/kn.js",
	"./kn.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/kn.js",
	"./ko": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ko.js",
	"./ko.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ko.js",
	"./ku": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ku.js",
	"./ku-kmr": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ku-kmr.js",
	"./ku-kmr.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ku-kmr.js",
	"./ku.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ku.js",
	"./ky": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ky.js",
	"./ky.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ky.js",
	"./lb": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/lb.js",
	"./lb.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/lb.js",
	"./lo": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/lo.js",
	"./lo.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/lo.js",
	"./lt": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/lt.js",
	"./lt.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/lt.js",
	"./lv": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/lv.js",
	"./lv.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/lv.js",
	"./me": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/me.js",
	"./me.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/me.js",
	"./mi": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/mi.js",
	"./mi.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/mi.js",
	"./mk": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/mk.js",
	"./mk.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/mk.js",
	"./ml": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ml.js",
	"./ml.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ml.js",
	"./mn": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/mn.js",
	"./mn.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/mn.js",
	"./mr": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/mr.js",
	"./mr.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/mr.js",
	"./ms": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ms.js",
	"./ms-my": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ms-my.js",
	"./ms-my.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ms-my.js",
	"./ms.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ms.js",
	"./mt": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/mt.js",
	"./mt.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/mt.js",
	"./my": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/my.js",
	"./my.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/my.js",
	"./nb": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/nb.js",
	"./nb.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/nb.js",
	"./ne": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ne.js",
	"./ne.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ne.js",
	"./nl": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/nl.js",
	"./nl-be": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/nl-be.js",
	"./nl-be.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/nl-be.js",
	"./nl.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/nl.js",
	"./nn": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/nn.js",
	"./nn.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/nn.js",
	"./oc-lnc": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/oc-lnc.js",
	"./oc-lnc.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/oc-lnc.js",
	"./pa-in": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/pa-in.js",
	"./pa-in.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/pa-in.js",
	"./pl": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/pl.js",
	"./pl.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/pl.js",
	"./pt": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/pt.js",
	"./pt-br": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/pt-br.js",
	"./pt-br.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/pt-br.js",
	"./pt.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/pt.js",
	"./ro": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ro.js",
	"./ro.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ro.js",
	"./ru": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ru.js",
	"./ru.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ru.js",
	"./sd": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/sd.js",
	"./sd.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/sd.js",
	"./se": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/se.js",
	"./se.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/se.js",
	"./si": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/si.js",
	"./si.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/si.js",
	"./sk": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/sk.js",
	"./sk.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/sk.js",
	"./sl": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/sl.js",
	"./sl.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/sl.js",
	"./sq": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/sq.js",
	"./sq.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/sq.js",
	"./sr": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/sr.js",
	"./sr-cyrl": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/sr-cyrl.js",
	"./sr-cyrl.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/sr-cyrl.js",
	"./sr.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/sr.js",
	"./ss": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ss.js",
	"./ss.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ss.js",
	"./sv": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/sv.js",
	"./sv.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/sv.js",
	"./sw": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/sw.js",
	"./sw.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/sw.js",
	"./ta": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ta.js",
	"./ta.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ta.js",
	"./te": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/te.js",
	"./te.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/te.js",
	"./tet": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/tet.js",
	"./tet.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/tet.js",
	"./tg": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/tg.js",
	"./tg.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/tg.js",
	"./th": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/th.js",
	"./th.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/th.js",
	"./tk": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/tk.js",
	"./tk.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/tk.js",
	"./tl-ph": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/tl-ph.js",
	"./tl-ph.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/tl-ph.js",
	"./tlh": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/tlh.js",
	"./tlh.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/tlh.js",
	"./tr": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/tr.js",
	"./tr.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/tr.js",
	"./tzl": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/tzl.js",
	"./tzl.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/tzl.js",
	"./tzm": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/tzm.js",
	"./tzm-latn": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/tzm-latn.js",
	"./tzm-latn.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/tzm-latn.js",
	"./tzm.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/tzm.js",
	"./ug-cn": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ug-cn.js",
	"./ug-cn.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ug-cn.js",
	"./uk": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/uk.js",
	"./uk.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/uk.js",
	"./ur": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ur.js",
	"./ur.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/ur.js",
	"./uz": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/uz.js",
	"./uz-latn": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/uz-latn.js",
	"./uz-latn.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/uz-latn.js",
	"./uz.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/uz.js",
	"./vi": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/vi.js",
	"./vi.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/vi.js",
	"./x-pseudo": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/x-pseudo.js",
	"./x-pseudo.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/x-pseudo.js",
	"./yo": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/yo.js",
	"./yo.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/yo.js",
	"./zh-cn": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/zh-cn.js",
	"./zh-cn.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/zh-cn.js",
	"./zh-hk": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/zh-hk.js",
	"./zh-hk.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/zh-hk.js",
	"./zh-mo": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/zh-mo.js",
	"./zh-mo.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/zh-mo.js",
	"./zh-tw": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/zh-tw.js",
	"./zh-tw.js": "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale/zh-tw.js"
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	if(!__webpack_require__.o(map, req)) {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return map[req];
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = "../../node_modules/.pnpm/moment@2.30.1/node_modules/moment/locale sync recursive ^\\.\\/.*$";

/***/ }),

/***/ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/cjs/react-jsx-runtime.production.min.js":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var f=__webpack_require__("../../node_modules/.pnpm/react@18.3.1/node_modules/react/index.js"),k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:!0,ref:!0,__self:!0,__source:!0};
function q(c,a,g){var b,d={},e=null,h=null;void 0!==g&&(e=""+g);void 0!==a.key&&(e=""+a.key);void 0!==a.ref&&(h=a.ref);for(b in a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps,a)void 0===d[b]&&(d[b]=a[b]);return{$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}exports.Fragment=l;exports.jsx=q;exports.jsxs=q;


/***/ }),

/***/ "../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js":
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


if (true) {
  module.exports = __webpack_require__("../../node_modules/.pnpm/react@18.3.1/node_modules/react/cjs/react-jsx-runtime.production.min.js");
} else {}


/***/ }),

/***/ "../../packages/js/components/src/date/stories/date.story.js":
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Basic: () => (/* binding */ Basic),
  "default": () => (/* binding */ date_story)
});

// EXTERNAL MODULE: ../../node_modules/.pnpm/@wordpress+date@5.33.1/node_modules/@wordpress/date/build-module/index.js
var build_module = __webpack_require__("../../node_modules/.pnpm/@wordpress+date@5.33.1/node_modules/@wordpress/date/build-module/index.js");
// EXTERNAL MODULE: ../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__("../../node_modules/.pnpm/react@18.3.1/node_modules/react/jsx-runtime.js");
;// ../../packages/js/components/src/date/index.js
/**
 * External dependencies
 */




/**
 * Use the `Date` component to display accessible dates or times.
 *
 * @param {Object} props
 * @param {Object} props.date
 * @param {string} props.machineFormat
 * @param {string} props.screenReaderFormat
 * @param {string} props.visibleFormat
 * @return {Object} -
 */

const date_Date = ({
  date,
  machineFormat = 'Y-m-d H:i:s',
  screenReaderFormat = 'F j, Y',
  visibleFormat = 'Y-m-d'
}) => {
  return /*#__PURE__*/(0,jsx_runtime.jsxs)("time", {
    dateTime: (0,build_module.format)(machineFormat, date),
    children: [/*#__PURE__*/(0,jsx_runtime.jsx)("span", {
      "aria-hidden": "true",
      children: (0,build_module.format)(visibleFormat, date)
    }), /*#__PURE__*/(0,jsx_runtime.jsx)("span", {
      className: "screen-reader-text",
      children: (0,build_module.format)(screenReaderFormat, date)
    })]
  });
};
/* harmony default export */ const date = (date_Date);
;// ../../packages/js/components/src/date/stories/date.story.js
/**
 * External dependencies
 */


const Basic = () => /*#__PURE__*/(0,jsx_runtime.jsx)(date, {
  date: "2019-01-01"
});
/* harmony default export */ const date_story = ({
  title: 'Components/Date',
  component: date
});
Basic.parameters = {
  ...Basic.parameters,
  docs: {
    ...Basic.parameters?.docs,
    source: {
      originalSource: "() => <Date date=\"2019-01-01\" />",
      ...Basic.parameters?.docs?.source
    }
  }
};

/***/ })

}]);
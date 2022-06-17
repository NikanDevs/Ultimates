"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToTime = exports.isValidTime = exports.convertTime = exports.timeFormatRegxp = void 0;
exports.timeFormatRegxp = /^(?<value>-?(?:\d+)?\.?\d+) *(?<type>seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|months?|month?|mo|mon|mons|years?|yrs?|y)?$/gi;
function convertTime(time) {
    if (/^\d+$/.test(time.toString())) {
        time = time;
    }
    else {
        time = time;
    }
    switch (typeof time) {
        case 'number':
            // Calculating each value
            const yearsTimestamp = Math.floor(time / (365 * 24 * 60 * 60 * 1000));
            time -= yearsTimestamp * 365 * 24 * 60 * 60 * 1000;
            // const monthsTimestamp = Math.floor(time / (30 * 24 * 60 * 60 * 1000));
            // time -= monthsTimestamp * 30 * 24 * 60 * 60 * 1000;
            // const weeksTimestamp = Math.floor(time / (7 * 24 * 60 * 60 * 1000));
            // time -= weeksTimestamp * 7 * 24 * 60 * 60 * 1000;
            const daysTimestamp = Math.floor(time / (24 * 60 * 60 * 1000));
            time -= daysTimestamp * 24 * 60 * 60 * 1000;
            const hoursTimestamp = Math.floor(time / (60 * 60 * 1000));
            time -= hoursTimestamp * 60 * 60 * 1000;
            const minutesTimestamp = Math.floor(time / (60 * 1000));
            time -= minutesTimestamp * 60 * 1000;
            const secondsTimestamp = Math.floor(time / 1000);
            const yearS = !yearsTimestamp
                ? ''
                : `${yearsTimestamp} year` + (yearsTimestamp === 1 ? '' : 's');
            // const monthS = !monthsTimestamp
            // 	? ''
            // 	: `${monthsTimestamp} month` + (monthsTimestamp === 1 ? '' : 's');
            // const weekS = !weeksTimestamp
            // 	? ''
            // 	: `${weeksTimestamp} week` + (weeksTimestamp === 1 ? '' : 's');
            const dayS = !daysTimestamp
                ? ''
                : `${daysTimestamp} day` + (daysTimestamp === 1 ? '' : 's');
            const hourS = !hoursTimestamp
                ? ''
                : `${hoursTimestamp} hour` + (hoursTimestamp === 1 ? '' : 's');
            const minuteS = !minutesTimestamp
                ? ''
                : `${minutesTimestamp} minute` + (minutesTimestamp === 1 ? '' : 's');
            const secondS = !secondsTimestamp
                ? ''
                : `${secondsTimestamp} second` + (secondsTimestamp === 1 ? '' : 's');
            const result = [yearS, /**monthS, weekS,**/ dayS, hourS, minuteS, secondS].filter((item) => item !== '');
            return result.join(' and ');
        case 'string':
            let miliseconds = 0;
            const values = time
                .trim()
                .split(/and|&|,/)
                .map((foo) => foo.trim());
            for (const item of values) {
                if (!exports.timeFormatRegxp.test(item) || /^\d+$/.test(item)) {
                    miliseconds = 0;
                    break;
                }
                switch (item.replaceAll(/[0-9]/g, '').trim().toLowerCase()) {
                    case 'years':
                    case 'year':
                    case 'yrs':
                    case 'yr':
                    case 'y':
                        item.replaceAll(exports.timeFormatRegxp, '').trim();
                        miliseconds = miliseconds + parseInt(item) * 360 * 24 * 60 * 60;
                        break;
                    case 'months':
                    case 'month':
                    case 'mon':
                    case 'mons':
                    case 'mo':
                        item.replaceAll(exports.timeFormatRegxp, '').trim();
                        miliseconds = miliseconds + parseInt(item) * 30 * 24 * 60 * 60;
                        break;
                    case 'weeks':
                    case 'week':
                    case 'w':
                        item.replaceAll(exports.timeFormatRegxp, '').trim();
                        miliseconds = miliseconds + parseInt(item) * 7 * 24 * 60 * 60;
                        break;
                    case 'days':
                    case 'day':
                    case 'd':
                        item.replaceAll(exports.timeFormatRegxp, '').trim();
                        miliseconds = miliseconds + parseInt(item) * 24 * 60 * 60;
                        break;
                    case 'hours':
                    case 'hour':
                    case 'hrs':
                    case 'hr':
                    case 'h':
                        item.replaceAll(exports.timeFormatRegxp, '').trim();
                        miliseconds = miliseconds + parseInt(item) * 60 * 60;
                        break;
                    case 'minutes':
                    case 'minute':
                    case 'mins':
                    case 'min':
                    case 'm':
                        item.replaceAll(exports.timeFormatRegxp, '').trim();
                        miliseconds = miliseconds + parseInt(item) * 60;
                        break;
                    case 'seconds':
                    case 'second':
                    case 'secs':
                    case 'sec':
                    case 's':
                        item.replaceAll(exports.timeFormatRegxp, '').trim();
                        miliseconds = miliseconds + parseInt(item);
                        break;
                    default:
                        miliseconds = 0;
                }
            }
            return miliseconds !== 0 ? (miliseconds * 1000).toString() : undefined;
    }
}
exports.convertTime = convertTime;
function isValidTime(v) {
    if (typeof v === 'number')
        return true;
    if (/^\d+$/.test(v.toString().trim()))
        return true;
    if (convertTime(v.toString().trim()) === undefined)
        return false;
    else
        return true;
}
exports.isValidTime = isValidTime;
function convertToTime(v) {
    if (typeof v === 'number')
        return v;
    if (/^\d+$/.test(v.toString()))
        return parseInt(v);
    if (!isValidTime(v))
        return undefined;
    else
        return +convertTime(v);
}
exports.convertToTime = convertToTime;

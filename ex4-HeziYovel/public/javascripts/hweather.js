(function () {

    /**
     * Utilities module: anything that could be ported as-is into any other project.
     * @type {{getTrimmedValue: (function(*): string), hide: utils.hide, show: utils.show, isTouchScreen: (function(): boolean), clearValue: utils.clearValue, switch: utils.switch}}
     */
    const utils = {
        /**
         * Given an input element, return it's value without leading and trailing spaces.
         * @param input
         * @returns {string}
         */
        getTrimmedValue: function (input) {
            return input.value.trim();
        },

        /**
         * Hide the given element - assumes bootstrap!
         * @param element
         */
        hide: function (element) {
            element.classList.add('d-none');
        },

        /**
         * Show the given element - assumes bootstrap!
         * @param element
         */
        show: function (element) {
            element.classList.remove('d-none');
        },

        /**
         * Show or hide the given element according to provided boolean 'on' - assumes bootstrap!
         * @param element
         * @param on - boolean, determines if to switch element on (show it) or off (hide it)
         */
        switch: function (element, on) {
            if (on) {
                this.show(element);
            } else {
                this.hide(element);
            }
        },

        /**
         * Sets the value property of element to an empty string. Relevant to clearing an input.
         * @param element
         */
        clearValue: function (element) {
            element.value = '';
        },

        /**
         * Test programmatically to see if the device has a touch screen or not.
         * @returns {boolean}
         */
        isTouchScreen: function () {
            return 'ontouchstart' in window;
        },
    }

    /**
     * Validation system for this SPA.
     * @type {{latLonErrorSummary: (function(*=, *=): {isEmpty: boolean, isDecimal: *, isInRange: *}), isNameValid: (function(*): boolean), isLatLonValid: (function(*=, *=))}}
     */
    const validation = (function () {

        /**
         * Latitude must be a decimal number between -90 and 90,
         * Longitude must be a decimal number between -180 and 180
         * @type {{lon: number[], lat: number[]}}
         */
        const limits = {
            'lat': [-90, 90],
            'lon': [-180, 180],
        };

        /**
         * Tests that a string represents a decimal value.
         * In the previous exercise I used the isNaN() function for similar tasks, but that failed tests:
         * For example, the expression isNaN('/') evaluates to true. So I checked the docs for isNaN and realised
         * it has an extremely unexpectable behaviour, and that the formal recommendation is to use Number.isNaN()
         * for such tasks. But Number.isNaN() doesn't do what I expect either. For example: the expression
         * Number.isNaN('100hefsgfesg') evaluates to true. So I've defaulted to using regular expressions.
         *
         * The regular expression used is: ^([-+][0-9])?[0-9]*(\.[0-9])?[0-9]*$
         *
         * 1. First there is a ^ which means the beginning of the matched string must match the following pattern.
         *
         * 1. Next there is an optional pattern: ([-+][0-9])? which means either a - or a + followed by a decimal digit.
         *
         * 2. Next there is an optional repeating pattern: [0-9]* which means any number of decimal digits.
         *
         * 3. Next there is an optional pattern: (\.[0-9])? which means a . followed by a decimal digit.
         *
         * 4. Next there is an optional repeating pattern: [0-9]* which means (again) any number of decimal digits.
         *
         * 5. Next there is a $ which means the ending of the matched string must match the previous pattern.
         *
         * The ^ and $ basically mean the entire matched string must match everything between them.
         * For example, the regular expression ^([-+][0-9])?[0-9]*(\.[0-9])?[0-9]* (no $ at the end) will match
         * "20$", the regular expression ([-+][0-9])?[0-9]*(\.[0-9])?[0-9]*$ will match "HTML5" and the regular
         * expression ([-+][0-9])?[0-9]*(\.[0-9])?[0-9]* will match "ex3-HeziYovel.zip".
         *
         * This function is not an API of the validation object.
         *
         * See readme.html
         *
         * @param stringValue
         * @returns {*}
         */
        function isDecimal(stringValue) {
            return stringValue.match(/^([-+][0-9])?[0-9]*(\.[0-9])?[0-9]*$/) !== null;
        }

        /**
         * Check if stringValue represents a valid lat/lon value (within the lat/lon range of values).
         * id determines the limits to test parsedValue against: it must be one of the keys in the limits object.
         *
         * This function is not an API of the validation object.
         *
         * @param stringValue
         * @param id - a key of the limits object
         * @returns {boolean}
         */
        function isInRange(stringValue, id) {
            const parsedValue = parseFloat(stringValue);
            return parsedValue >= limits[id][0] && parsedValue <= limits[id][1];
        }

        /**
         * Provide an error summary for a lat/lon input value for error message handling.
         * My error message handling of lat/lon values differentiates between
         * four states: 1. valid (all fields are true), 2. empty/missing, 3. not decimal, 4. not in range.
         *
         * The reason I've added state 2: empty/missing, is to allow me to display an error if the input is empty
         * at the time the submit button is clicked, but not display it when the user deletes everything from the
         * input, which can be annoying if they are in the process of replacing the value.
         *
         * id determines the limits to test parsedValue against: it must be one of the keys in the limits object.
         *
         * This function is an API of the validation object.
         *
         * @param stringValue
         * @param id - a key of the limits object
         * @returns {{isEmpty: boolean, isDecimal: *, isInRange: boolean}}
         */
        function latLonErrorSummary(stringValue, id) {
            const returnValue = {
                isEmpty: stringValue === '',
                isDecimal: isDecimal(stringValue),
                // Initially we set isInRange to false to avoid executing isInRange if stringValue doesn't represent
                // a decimal number, which may give unexpected results:
                isInRange: false,
            }

            if (returnValue.isDecimal) {
                // If stringValue is a valid decimal number, we can safely validate it being in range.
                returnValue.isInRange = isInRange(stringValue, id);
            }

            return returnValue;
        }

        /**
         * Returns a simple true/false as an answer to the question: is stringValue a valid lat/lon?
         *
         * This function is an API of the validation object.
         *
         * @param stringValue
         * @param id - a key of the limits object
         * @returns {boolean|*|boolean}
         */
        function isLatLonValid(stringValue, id) {
            const errorSummary = latLonErrorSummary(stringValue, id);
            return !errorSummary.isEmpty && errorSummary.isDecimal && errorSummary.isInRange;
        }

        /**
         * Validates a location name (a location can be anything except an empty string).
         *
         * This function is an API of the validation object.
         *
         * @param name
         * @returns {boolean}
         */
        function isNameValid(name) {
            return name !== '';
        }

        /**
         * Validate a date - a date is valid if it is between today and 7 days from now.
         * @param dateObj
         * @returns {boolean}
         */
        function validateDate(dateObj) {
            // Create date objects for today and 7 days from now:
            const today = new Date();
            // timer7 dates don't have time, so when dateObj is created it has 0 hours, minutes etc.
            today.setHours(0, 0, 0, 0);
            let todayPlus7 = new Date();
            todayPlus7.setHours(0, 0, 0, 0);
            todayPlus7.setDate(todayPlus7.getDate() + 7);
            // Compare the given date to the limit dates:
            return dateObj >= today && dateObj <= todayPlus7;
        }

        return {
            latLonErrorSummary: latLonErrorSummary,
            isLatLonValid: isLatLonValid,
            isNameValid: isNameValid,
            validateDate: validateDate,
        }
    })();

    const ERROR_REPORT_PERMISSION_REQUEST = 'With your permission, we would like to send our developers an error report.';

    /**
     * Error handling message logic.
     * @type {{getLatErrorMessage: (function(*=): *), getLonErrorMessage: (function(*=): *), getNameErrorMessage: (function(): string)}}
     */
    const errorMessages = (function () {

        /**
         * Error messages for different errors by keys.
         * @type {{nameMissing: string, lonNotInRange: string, notDecimal: string, lonMissing: string, latNotInRange: string, latMissing: string}}
         */
        const errorMessages = {
            nameMissing: 'Name is required',
            latMissing: 'Latitude is required',
            lonMissing: 'Longitude is required',
            notDecimal: "Value must be a decimal number: only digits, a single minus and a single dot are allowed.",
            latNotInRange: 'Value must be a decimal between -90.0 and 90.0',
            lonNotInRange: 'Value must be a decimal between -180.0 and 180.0',
            badConnection: 'We couldn\'t connect to the weather service. This may happen if your device is not connected to the internet,' +
                ' or if the service is down, or for other network problems.',
            errorCode4XX: 'There is a problem in the request. This is actually our fault. ' +
                ERROR_REPORT_PERMISSION_REQUEST,
            errorCode500: 'The weather service is having some problems at the moment. Please try again later.',
            syntaxErrorMessage: 'The service sent us data, but it is not formed properly and we can\'t make sense of it. ' +
                ERROR_REPORT_PERMISSION_REQUEST,
            generalAjaxError: 'Something didn\'t work when we tried to understand the service\'s response.' +
                ' We don\'t know what it is. ' + ERROR_REPORT_PERMISSION_REQUEST,
        }

        /**
         * API to get the nameMissing error message.
         * @returns {string}
         */
        function getNameErrorMessage() {
            return errorMessages.nameMissing;
        }

        /**
         * Internal utility for selecting the correct error message between isMissingMessage, errorMessages.notDecimal
         * and notInRangeMessage.
         * If multiple errors exist the order of precedence is:
         * 1. isMissingMessage
         * 2. errorMessages.notDecimal
         * 3. notInRangeMessage
         *
         * The isMissingMessage and notInRangeMessage should be selected by the caller between the different
         * options, based on if the error is in the name, lat or lon inputs.
         *
         * @param errorSummary - if this argument doesn't indicate any error, an empty string will be returned.
         * @param isMissingMessage - message to print if missing value indication is found.
         * @param notInRangeMessage - message to print if not in range indication is found and not missing value or not a decimal.
         *                              this argument is expected to include a description of the range of valid values
         *                              for the relevant input.
         * @returns {string}
         */
        function getErrorMessage(errorSummary, isMissingMessage, notInRangeMessage) {
            let errorMessage;
            if (errorSummary.isEmpty) {
                // If the input was found to be empty, there is a special message for that and we do not check for any
                // other errors.
                errorMessage = isMissingMessage;
            } else if (!errorSummary.isDecimal) {
                // If the input was not empty but the value did not represent a decimal number, we prefer to inform
                // the user just about that and not confuse them with the range yet. See readme.html
                errorMessage = errorMessages.notDecimal;
            } else if (!errorSummary.isInRange) {
                // If the input was not empty and the value represented a valid decimal number, but the number was not
                // in the range of values permitted, we inform the user what is the valid range for this input.
                errorMessage = notInRangeMessage;
            } else {
                // If there is no error indication we shouldn't print anything. Returning an empty string guarantees
                // that, and if set as innerText of an element will also cause most elements to be effectively
                // hidden. But the preferred action is to check the returned value for being empty before setting it
                // into a message (unless errorSummary was checked to indicate an error before calling this function).
                errorMessage = '';
            }
            return errorMessage;
        }

        /**
         * API to get the proper error message if there is a latitude-related error
         * @param errorSummary
         * @returns {string}
         */
        function getLatErrorMessage(errorSummary) {
            return getErrorMessage(errorSummary, errorMessages.latMissing, errorMessages.latNotInRange);
        }

        /**
         * API to get the proper error message if there is a longitude-related error
         * @param errorSummary
         * @returns {string}
         */
        function getLonErrorMessage(errorSummary) {
            return getErrorMessage(errorSummary, errorMessages.lonMissing, errorMessages.lonNotInRange);
        }

        /**
         * API to get the proper error when fetching forecast information fails
         * @param didReachServer - if false, the error message will suggest connection problems.
         * @param errorCode - if didReachServer is true, and errorCode is between 400 to 599,
         *                      the message will describe the error based on errorCode
         * @param isSyntaxError - if true and did reach server, the message will indicate that the response was faulty
         * @returns {*}
         */
        function getAjaxErrorMessage(didReachServer, errorCode = 0, isSyntaxError = false) {
            let message;
            if (!didReachServer) {
                message = errorMessages.badConnection;
            } else if (isSyntaxError === true) {
                message = errorMessages.syntaxErrorMessage;
            } else if (errorCode >= 400 && errorCode < 500) {
                message = errorMessages.errorCode4XX;
            } else if (errorCode >= 500 && errorCode < 600) {
                message = errorMessages.errorCode500;
            } else {
                message = errorMessages.generalAjaxError;
            }
            return message;
        }

        return {
            getNameErrorMessage: getNameErrorMessage,
            getLatErrorMessage: getLatErrorMessage,
            getLonErrorMessage: getLonErrorMessage,
            getAjaxErrorMessage: getAjaxErrorMessage,
        }
    })();

    /**
     * Utilities for efficient DOM access. Every request will be stored in a map (hashtable) for later use unless the
     * request is known to return a dynamically changing set of elements. If a caller's request is found to be stored
     * in a map it will be fetched from the map instead of from the DOM, unless the user specifically requests
     * a refresh.
     *
     * The exception for all of the above is when the request is getElementById. Since a hashtable based implementation
     * of id to element mapping can be assumed for most browsers, there is no added value in storing them in yet
     * hashtable, and it just consumes more memory.
     *
     * In addition, in order to only use the 'document' reserved word inside this namespace, some document methods
     * are exposed as API. See readme.html
     *
     * @type {{getElementById: (function(*=): HTMLElement), addEventListenerToDocument: addEventListenerToDocument, querySelectorAll: (function(*=, *=): *), getErrorElement: (function(*=, *=): *), querySelector: (function(*=, *=): *), getElementsByClassName: (function(*=, *=): *), createElement: (function(*=): *), getInputByName: (function(*=, *=): *)}}
     */
    const domAccess = (function () {
        // inputId => errorElement
        const errorElementsByInputId = new Map();
        let inputs = null;
        // className => elementsArray
        const elementsByClass = new Map();
        // selector => elementsArray
        const elementsBySelector = new Map();

        /**
         * Conditional update - if inputs were not fetched before, or if refresh is true, all inputs will be fetched
         * from the DOM.
         * Updates the inputs map by querying the DOM for all inputs inside the element with id 'form'.
         *
         * This function assumes a single form in the dom, id'd 'form', and that all input elements in the DOM
         * are contained in this form's sub-tree, in order to avoid traversing the entire DOM.
         *
         * @param refresh
         */
        function updateInputs(refresh) {
            if (inputs === null || refresh === true) {
                inputs = getElementById('form').getElementsByTagName('input');
            }
        }

        /**
         * An internal utility for extracting an element or an array of elements from a map that stores them by ids.
         *
         * @param id - the id by which the required element/array are expected to be stored in map.
         * @param map
         * @param domAccessor - used to fetch the elements from the DOM if needed.
         * @param refresh - boolean
         * @returns {*} an element or an array of elements.
         */
        function getFromMapById(id, map, domAccessor, refresh) {
            if (!map.has(id) || refresh === true) {
                // If id is not in map (element/s never fetched) or if refresh is true, perform a DOM query.
                map[id] = domAccessor(id);
            }
            return map[id];
        }

        /**
         * Returns the error element associated with the input with inputId. Will perform a DOM query if such element
         * is not stored in the internal map, or if refresh is true.
         *
         * This function assumes the error element associated with the input is it's brother, and the only
         * error element inside it's parent.
         *
         * API function
         *
         * @param inputId
         * @param refresh - boolean
         * @returns {*}
         */
        function getErrorElement(inputId, refresh = false) {
            // Error element is expected to be a direct child of the parent of the input it is associated with,
            // and the only descendent of it's parent with the 'error-message' class.
            let domAccessor = () => getElementById(inputId).parentElement.getElementsByClassName('error-message').item(0);
            return getFromMapById(inputId, errorElementsByInputId, domAccessor, refresh);
        }

        /**
         * Get the input with name 'name'.
         *
         * API function
         *
         * @param name
         * @param refresh - boolean
         * @returns {*}
         */
        function getInputByName(name, refresh = false) {
            updateInputs(refresh);
            return inputs.namedItem(name);
        }

        /**
         * Get all elements with class name className form the DOM.
         *
         * API function
         *
         * @param className
         * @param refresh
         * @returns {*}
         */
        function getElementsByClassName(className, refresh = false) {
            const domAccessor = document.getElementsByClassName.bind(document);
            return getFromMapById(className, elementsByClass, domAccessor, refresh);
        }

        /**
         * Get an element by ID - forwarded document method.
         *
         * API function
         *
         * @param id
         * @returns {HTMLElement}
         */
        function getElementById(id) {
            return document.getElementById(id);
        }

        /**
         * Get the first element from the array of elements that is returned by querySelectorAll.
         *
         * API function
         *
         * @param selector
         * @param refresh
         * @returns {*}
         */
        function querySelector(selector, refresh = false) {
            return querySelectorAll(selector, refresh)[0];
        }

        /**
         * Get all elements that match 'selector'.
         *
         * API function
         *
         * @param selector
         * @param refresh
         * @returns {*}
         */
        function querySelectorAll(selector, refresh = false) {
            const domAccessor = document.querySelectorAll.bind(document);
            return getFromMapById(selector, elementsBySelector, domAccessor, refresh);
        }

        /**
         * Add an event listener to the document - a forwarded document method.
         *
         * API function
         *
         * @param event
         * @param listener
         */
        function addEventListenerToDocument(event, listener) {
            document.addEventListener(event, listener);
        }

        /**
         * Create an element of type tagName - a forwarded document method.
         *
         * API function
         *
         * @param tagName
         * @returns {*}
         */
        function createElement(tagName) {
            return document.createElement(tagName);
        }

        return {
            getErrorElement: getErrorElement,
            getInputByName: getInputByName,
            getElementsByClassName: getElementsByClassName,
            getElementById: getElementById,
            querySelector: querySelector,
            querySelectorAll: querySelectorAll,
            addEventListenerToDocument: addEventListenerToDocument,
            createElement: createElement,
        }
    })();

    /**
     * This module contains utilities for the support of ajax request handling, for example the ability to abort
     * a request or ignore a response.
     *
     * This project doesn't allow multiple concurrent request/response handling, so for now only "singleton" tools
     * have been implemented.
     *
     * See readme.html
     *
     * @type {{getAbortSignal: (function(): AbortSignal), isRequestIdValid: (function(*): boolean), generateRequestId: (function(): number)}}
     */
    const ajaxUtils = (function () {

        /**
         * This abort controller is used when each new request cancels the previous one.
         * @type {null}
         */
        let singletonAbortController = null;

        // Used as a request id
        let singletonRequestId = 0;

        /**
         * Cancels previous request if exists, and produces a new abort signal.
         * @returns {*} the abort signal
         */
        function getSingletonAbortSignal() {
            if (singletonAbortController !== null) {
                // If there is a singletonAbortController it means there is an active singleton request which must
                // be aborted:
                singletonAbortController.abort();
            }
            // Create a new singletonAbortController and return it's abort signal:
            singletonAbortController = new AbortController();
            return singletonAbortController.signal;
        }

        /**
         * Produces a request id. This is used to ignore responses if they are given to a request that is not relevant
         * anymore.
         *
         * The request id is implemented as a simple running integer. Because javascript is single-threaded there is
         * no risk of a race condition.
         *
         * @returns {number}
         */
        function generateSingletonRequestId() {
            ++singletonRequestId;
            return singletonRequestId;
        }

        /**
         * Check if requestId is a valid singleton request id (it is valid if it is the one tracked by ajaxUtils).
         *
         * @param requestId
         * @returns {boolean}
         */
        function isSingletonRequestIdValid(requestId) {
            return requestId === singletonRequestId;
        }

        return {
            getSingletonAbortSignal: getSingletonAbortSignal,
            generateSingletonRequestId: generateSingletonRequestId,
            isSingletonRequestIdValid: isSingletonRequestIdValid,
        }
    })();

    const api = (function () {

        let doBefore;
        let doAfter;

        function parseJson(response) {
            return {
                ok: response.ok,
                data: response.json(),
            }
        }

        function checkForErrors(jsonObj) {
            if (!jsonObj.ok) {
                throw new Error(jsonObj.data.message);
            } else {
                return jsonObj.data;
            }
        }

        function call(targetUrl, doOnThen, doOnCatch, data, method = 'POST') {
            const initObj = {
                method: method,
                headers: {'Content-Type': 'application/json'},
            };

            if (method !== 'GET') {
                initObj.body = JSON.stringify(data);
            }

            if (doBefore) doBefore();

            fetch(targetUrl, initObj)
                .then(parseJson)
                .then(checkForErrors)
                .then(jsonObj => {
                    if (jsonObj.hasOwnProperty('changeToURL')) {
                        window.location.assign(jsonObj['changeToURL']);
                        throw new Error('Access denied.');
                    } else {
                        return jsonObj;
                    }
                })
                .then(doOnThen)
                .then(() => {
                    if (doAfter) doAfter();
                })
                .catch(doOnCatch)
        }

        function addLocation(location, doOnThen, doOnCatch) {
            call('/api/add-location', doOnThen, doOnCatch, location);
        }

        function removeLocationsByNames(doOnThen, doOnCatch, locationNames) {
            call('/api/remove-locations', doOnThen, doOnCatch, {locationNames: locationNames});
        }

        function getLocations(doOnThen, doOnCatch) {
            call('/api/get-locations', doOnThen, doOnCatch, {}, 'GET');
        }

        /**
         * Use this method to add optional actions to perform before and after any API call.
         * These functions will be called if and only if they are defined, so it is safe to make an API call
         * before this init is called.
         *
         * @param doBeforeAction
         * @param doAfterAction
         */
        function init(doBeforeAction, doAfterAction) {
            doBefore = doBeforeAction;
            doAfter = doAfterAction;
        }

        return {
            init: init,
            addLocation: addLocation,
            removeLocationsByNames: removeLocationsByNames,
            getLocations: getLocations,
        }
    })();

    /**
     * 7timer weather type codename to description mapping. See http://www.7timer.info/doc.php#machine_readable_api
     * @type {{cloudy: string, rain: string, rainsnow: string, lightsnow: string, lightrain: string, snow: string, oshower: string, clear: string, ishower: string, pcloudy: string, humid: string, mcloudy: string}}
     */
    const _7timer_weatherTypeToDesc = {
        'clear': 'Total cloud cover less than 20%',
        'pcloudy': 'Total cloud cover between 20%-60%',
        'mcloudy': 'Total cloud cover between 60%-80%',
        'cloudy': 'Total cloud cover over over 80%',
        'humid': 'Relative humidity over 90% with total cloud cover less than 60%',
        'lightrain': 'Precipitation rate less than 4mm/hr with total cloud cover more than 80%',
        'oshower': 'Precipitation rate less than 4mm/hr with total cloud cover between 60%-80%',
        'ishower': 'Precipitation rate less than 4mm/hr with total cloud cover less than 60%',
        'lightsnow': 'Precipitation rate less than 4mm/hr',
        'rain': 'Precipitation rate over 4mm/hr',
        'snow': 'Precipitation rate over 4mm/hr',
        'rainsnow': 'Precipitation type to be ice pellets or freezing rain',
    }

    /**
     * 7timer wind value codename to description mapping. See http://www.7timer.info/doc.php#machine_readable_api
     * @type {{"1": string, "2": string, "3": string, "4": string, "5": string, "6": string, "7": string, "8": string}}
     * @private
     */
    const _7timer_windValuesToDesc = {
        // '1': 'Below 0.3m/s (calm)',
        // Instead of the original mapping for wind speed = 1 we will map it to an empty string.
        // Then we will use this value to determine if wind speed should be displayed or not:
        '1': '',
        '2': '0.3-3.4m/s (light)',
        '3': '3.4-8.0m/s (moderate)',
        '4': '8.0-10.8m/s (fresh)',
        '5': '10.8-17.2m/s (strong)',
        '6': '17.2-24.5m/s (gale)',
        '7': '24.5-32.6m/s (storm)',
        '8': 'Over 32.6m/s (hurricane)',
    }

    /**
     * Storage for all user added locations:
     * @type {Map<string, {name, lat, lon}>}
     */
    const locations = new Map();

    // 7timer API addresses
    const _7TIMER_MACHINE_READABLE_API_URL = 'http://www.7timer.info/bin/api.pl/';
    const _7TIMER_GRAPHICAL_API_URL = 'http://www.7timer.info/bin/astro.php/';

    // Flags to synchronize between handling the two responses - from the machine readable and from the graphical,
    // so that both forecast and image will only be shown at the same time and if both are available.
    // In short: only when both flags are up (true) will the new information and image be displayed.
    // See readme.html
    let isAPICallDone;
    let isIMGCallDone;

    // Flag to mark the server has returned a response
    let didReachServer;

    /**
     * Collects location information from the form.
     * @returns {{name: string, lon: string, lat: string}}
     */
    function collectLocationInfo() {
        return {
            'name': utils.getTrimmedValue(domAccess.getInputByName('name')),
            'lat': utils.getTrimmedValue(domAccess.getInputByName('lat')),
            'lon': utils.getTrimmedValue(domAccess.getInputByName('lon')),
        }
    }

    /**
     * Formats parameters string for machine readable API call.
     * @param location
     * @returns {string}
     */
    function makeParamStringForAPICall(location) {
        return encodeURI(`?lon=${location.lon}&lat=${location.lat}&product=${location.product}&output=${location.output}`);
    }

    /**
     * Formats parameter string for graphical API call.
     * @param location
     * @returns {string}
     */
    function makeParamStringForImage(location) {
        return encodeURI(`?lon=${location.lon}&lat=31.771959&ac=0&lang=en&unit=metric&output=internal&tzshift=0`);
    }

    function displayForcastForSelectedLocation(image_call, selectedLocationItem) {
        // If found an location element, display the loading image,
        showLoadingImage();
        // Get the forecast img element and set it's src to the full graphic URL:
        const forecastImage = domAccess.querySelector('#forecast img');
        forecastImage.src = image_call;
        // Hide the carousel in which previously displayed forecast may be visible:
        switchCarousel(false);

        // Get the location name from the selected location item, and fetch the location information stored for it
        // in the locations map. Update the forecast to this location:
        const location = locations[selectedLocationItem.innerText.trim()];
        updateWeatherForecast(location);
    }

    /**
     * Prepares and launches the ajax call to the weather API.
     */
    function handleDisplayForecastButtonClick() {
        // Prepare the full graphic URL by concatenating the parameter string to the base URL:
        const image_call = _7TIMER_GRAPHICAL_API_URL + makeParamStringForImage(location);

        // Fetch the selected location item from the locations list:
        const selectedLocationItem = domAccess.querySelector('#locations-container div.selected');

        if (selectedLocationItem !== undefined) {
            displayForcastForSelectedLocation(image_call, selectedLocationItem);
        } else {
            const errorMessage = 'First select a location, then click the "Display Forecast" button.';
            const title = 'Cannot do that!';
            displayMessageInModal(errorMessage, title);
        }
    }

    function getErrorMessage(error) {
        let status = 0;
        if (error.hasOwnProperty('status')) {
            status = error.status;
        }
        const isSyntaxError = error instanceof SyntaxError;
        return errorMessages.getAjaxErrorMessage(didReachServer, status, isSyntaxError);
    }

    /**
     * Creates all styles of buttons for the modal
     * @param buttonStyle
     * @returns {*}
     */
    function createModalButton(buttonStyle = 'neutral') {
        const button = domAccess.createElement('button');
        button.type = 'button';
        button.classList.add('btn');
        if (buttonStyle === 'neutral') {
            button.classList.add('btn-secondary');
        } else if (buttonStyle === 'confirm') {
            button.classList.add('btn-success');
        } else {
            button.classList.add('btn-danger');
        }

        // Neutral and deny buttons also close the modal:
        if (buttonStyle === 'neutral' || buttonStyle === 'deny') {
            button.setAttribute('data-dismiss', 'modal');
        }
        return button;
    }

    /**
     * Add buttons to the modal according to the error message
     * @param errorMessage
     */
    function setModalButtons(errorMessage) {
        // The buttons will be in the footer:
        const modal = domAccess.querySelector('div.modal');
        const modalFooter = modal.querySelector('div.modal-footer');

        // Create and add the buttons:
        if (errorMessage.endsWith(ERROR_REPORT_PERMISSION_REQUEST)) {
            // Create a confirm button:
            modalFooter.innerHTML = '';
            const confirmButton = createModalButton('confirm');
            confirmButton.innerText = 'Send Report';
            // Handle click events:
            confirmButton.addEventListener('click', function () {
                modalFooter.innerHTML = '';
                const modalBody = domAccess.querySelector('#error-modal div.modal-body');
                modalBody.innerText = 'Thank you for the report.';
                // That's it. In real world this is where a report would have been prepared and sent to the devs.
            });
            modalFooter.appendChild(confirmButton);

            // Create a deny button:
            const denyButton = createModalButton('deny');
            denyButton.innerText = 'Don\'t Send Report';
            modalFooter.appendChild(denyButton);

            // Make the modal not close unless clicked one of the buttons:
            modal.setAttribute('data-backdrop', 'static');
        } else {
            // Create a neutral 'Close' button:
            modalFooter.innerHTML = '';
            const closeButton = createModalButton();
            closeButton.innerText = 'Close';
            modalFooter.appendChild(closeButton);

            // Make the modal close if clicked out of it:
            modal.setAttribute('data-backdrop', 'true');
        }
    }

    function displayMessageInModal(errorMessage, title = "Couldn't Get Forecast") {
        // Display the title:
        const modalTitle = domAccess.querySelector('#error-modal .modal-title');
        modalTitle.innerText = title;

        // Display the message:
        const modalBody = domAccess.querySelector('#error-modal div.modal-body');
        modalBody.innerHTML = errorMessage;

        // Set the buttons in the modal:
        setModalButtons(errorMessage);

        // Show the modal:
        $('#error-modal').modal({show: true});
    }

    /**
     * Handles errors in ajax call to weather API
     *
     * @param error
     * @param useErrorMessage
     * @param title
     */
    function onError(error, useErrorMessage = false, title = "Couldn't Get Forecast") {
        console.error(error);
        const requestAbortedError = error.toString() === 'AbortError: The user aborted a request.';
        if (requestAbortedError) {
            // This is not a problem.
            return;
        }
        // If the error is NOT due to the user aborting the request (which is not a problem), then we have a
        // problem.
        // In any case of request failure - ajax or image - we do not display anything, although we may have
        // partial data to show. See readme.html
        showForecastImage(true);
        switchCarousel(false);
        const errorMessage = useErrorMessage ? error.message : getErrorMessage(error);
        displayMessageInModal(errorMessage, title);
    }

    function onErrorUseMessage(error) {
        onError(error, true, 'We have a problem');
    }

    /**
     * Validates response and attempts to return response body as JSON.
     *
     * @param response
     * @returns {any}
     */
    function getResponseJson(response) {
        // Mark that server has been reached (the fetch promise rejects if there is a network error):
        didReachServer = true;

        if (!response.ok) {
            // If a bad response status is received and throw an error if so
            const err = new Error(`Server error code ${response.status} received`);
            err.status = response.status;
            throw err;
        } else {
            // Attempt to return JSON
            return response.json();
        }
    }

    /**
     * Prepare and send ajax request to weather API
     *
     * @param location
     */
    function updateWeatherForecast(location) {
        // Add API parameters to location object:
        location.product = 'civillight';
        location.output = 'json';

        // Prepare full URL by concatenating parameters string to base URL:
        const api_call = _7TIMER_MACHINE_READABLE_API_URL + makeParamStringForAPICall(location);

        // Reset the isAPICallDone flag to false to indicate ajax call is in progress:
        isAPICallDone = false;

        // Reset the didReachServer flag to false to check if server responses
        didReachServer = false;

        // Generate abort signal and request id to handle cancellation functionality:
        const signal = ajaxUtils.getSingletonAbortSignal();
        const requestId = ajaxUtils.generateSingletonRequestId();

        // Fetch the forecast for location:
        fetch(api_call, {signal})
            .then(getResponseJson)
            .then(getInterestingInfo)
            .then(interestingInfo => displayWeatherForecast(interestingInfo, location.name, requestId))
            .catch(onError);
    }

    function showForecastAndImage(locationName) {
        // Show the forecast image and the carousel and add the location name to the forecast title:
        showForecastImage();
        switchCarousel(true);
        domAccess.querySelector('#forecast h3').innerText = `Forecast: ${locationName}`;
    }

    /**
     * Display the weather forecast if the request is still valid.
     *
     * @param interestingInfo - 7 items - the interesting part of the response, the part we want to display
     * @param locationName
     * @param requestId - will be used to check if this request has been canceled
     */
    function displayWeatherForecast(interestingInfo, locationName, requestId) {

        // Abort if this request is no longer valid (was cancelled):
        if (!ajaxUtils.isSingletonRequestIdValid(requestId)) {
            return;
        }

        // Get the elements in which the forecast will be displayed (one for each day)
        const weatherCards = domAccess.getElementsByClassName('card');

        // raise the isAPICallDone flag to indicate forecast information is available:
        isAPICallDone = true;

        for (let i = 0; i < interestingInfo.length; ++i) {
            // Populate the i'th card with the i'th day's forecast:
            populateCardWithInfo(weatherCards[i], interestingInfo[i]);
        }

        if (isIMGCallDone) {
            // Now machine readable information is ready, processed and populated in the display.
            // If image is also ready - show it all:
            showForecastAndImage(locationName);
        }
    }

    /**
     * Show the carousel (which is where the forecast is displayed).
     * @param on
     */
    function switchCarousel(on = true) {
        const carousel = domAccess.querySelector('#forecast div.carousel-container');
        utils.switch(carousel, on);
    }

    /**
     * Populate the information from the API in the view.
     * @param card
     * @param info
     */
    function populateCardWithInfo(card, info) {
        card.querySelector('h5').innerText = info.date;
        card.querySelector('.weather').innerText = info.weather;
        card.querySelector('.temp').innerHTML = info.tempRange;

        // We now populate the wind speed element anyway, but switch it on or off based on it's value:
        let windSpeedElement = card.querySelector('.wind');
        windSpeedElement.innerText = info.windSpeed;
        utils.switch(windSpeedElement, info.windSpeed !== '');
        utils.switch(windSpeedElement.previousElementSibling, info.windSpeed !== '');
    }

    /**
     * Extract from the response all the information we want to display. This will allow us to drop from memory
     * all information we don't need and also to more quickly get the information when we wish to display it:
     * we search the rather large object received from the API once now, and prepare a much smaller object - an array
     * of "flat" objects, each of which contains all the information needed to display a single day's forecast.
     *
     * @param responseJson - an object prepared from the response body.
     * @returns {[]}
     */
    function getInterestingInfo(responseJson) {
        const result = [];
        for (const dailyForecast of responseJson.dataseries) {
            // Create an information object from the daily forecast and store it in result:
            result.push(extractInfoFromDataObj(dailyForecast));
        }
        return result;
    }

    /**
     * Extract and process the date information from a daily forecast object
     * @param dailyForecast
     * @returns {string}
     */
    function getDateString(dailyForecast) {
        // 7timer machine readable API returns dates in format YYYYMMDD (for example January first 1970 will be
        // represented as: "19700101" (a string), But when we "JSON" the response body we get the number 19700101.
        // This is quite confusing, because it looks a bit like the way timestamps are often provided.
        // In order to parse this date we first get the 2 least significant digits which represent the date:
        const date = dailyForecast.date % 100;

        // Then we get the next 2 digits which represent the month and subtract 1 from the number they form in order
        // to align the month number with javascript convention of 0-indexed months:
        const month = Math.floor(dailyForecast.date / 100) % 100 - 1;

        // Then we get the last 4 digits which represent the year:
        const year = Math.floor(dailyForecast.date / 10000);

        const dateObj = new Date(year, month, date);

        // Validate the date information and throw an exception if invalid:
        if (!validation.validateDate(dateObj)) {
            throw new Error(`Invalid date information. date: ${date}, month: ${month}, year: ${year}`);
        }

        // We create a Date object from the date info and then format it our way:
        return dateObj.toDateString();
    }

    /**
     * Given a daily forecast object, received from the weather API, that contains all interesting information for
     * a single day's forecast, extract and process the interesting information and return it as a "flat" object
     * suited for the view.
     *
     * This function attempts to validate the information form the API to avoid displaying corrupted information.
     * If invalid information is found, an Error is thrown. The error will be caught by the fetch-then-catch call
     * and cause an error dialog to be displayed.
     *
     * @param dailyForecast
     * @returns {{date: Date, weather, tempRange: string, windSpeed: *}}
     */
    function extractInfoFromDataObj(dailyForecast) {
        // Get the formatted date:
        const dateString = getDateString(dailyForecast);

        // We format the temperature range the way we wont it displayed:
        const tempRange = `${dailyForecast.temp2m.min}&#8451; to ${dailyForecast.temp2m.max}&#8451;`;

        // We fetch the weather type and the wind speed descriptions from the relevant mappings:
        const weather = _7timer_weatherTypeToDesc[dailyForecast.weather];
        const windSpeed = _7timer_windValuesToDesc[dailyForecast.wind10m_max];

        // Check that weather and windSpeed are defined, if not throw an error:
        if (typeof weather === 'undefined' || typeof windSpeed === 'undefined') {
            throw new Error(`Invalid weather type or wind speed. weather type: ${dailyForecast.weather},
             wind speed: ${dailyForecast.wind10m_max}`);
        }

        return {
            'date': dateString,
            'tempRange': tempRange,
            'weather': weather,
            'windSpeed': windSpeed,
        }
    }

    /**
     * Validates a string value and displays an error if invalid.
     *
     * @param stringValue
     * @param inputId - id of the input from which stringValue was fetched
     * @param validation - a function to use for validating stringValue. Must return a boolean
     * @param errorMessageProvider - a function to use to get the correct error message if stringValue is invalid.
     *                                  stringValue and inputId will be provided to it when executed.
     * @param showErrorOnEmpty - a flag, indicating if an error message should be displayed if stringValue is an empty
     *                           string. In some cases we don't display an error message if the input is empty.
     * @returns {boolean} true if validation passed, otherwise false
     */
    function validateStringValue(stringValue, inputId, validation, errorMessageProvider, showErrorOnEmpty = true) {
        // Fetch the element to use to display an error if needed (or un-display if not needed)
        const errorElement = domAccess.getErrorElement(inputId);
        let retVal = false;

        if (validation(stringValue, inputId)) {
            // If validation succeeds hide the error element and set the return value to true
            utils.hide(errorElement);
            retVal = true;
        } else if (showErrorOnEmpty === true || stringValue !== '') {
            // If validation failed, and showErrorOnEmpty is true or stringValue is not empty (and hence the input
            // contains some characters but they represent an invalid value), fetch the proper error message and
            // display it in the error element.
            // errorMessageProvider may use the getXErrorMessage functions, which return an empty string if there is
            // no error. Since we only call it if validation fails, we know it will not happen and there is no need to
            // check for it.
            errorElement.innerText = errorMessageProvider(stringValue, inputId);
            utils.show(errorElement);
        } else {
            // If validation failed but stringValue is empty and showErrorOnEmpty is true, hide the error element.
            utils.hide(errorElement);
        }

        return retVal;
    }

    /**
     * Validate an input element.
     *
     * @param input
     * @param validation - boolean function, which receives the input's value and id
     * @param errorMessageProvider - a function that receives the input's value and id and returns a proper error
     *                              message.
     * @param showErrorOnEmpty - indicates if an error should be displayed if the input is empty.
     * @returns {boolean} true if validation passed, otherwise false
     */
    function validateInput(input, validation, errorMessageProvider, showErrorOnEmpty = true) {
        const stringValue = utils.getTrimmedValue(input);
        return validateStringValue(stringValue, input.id, validation, errorMessageProvider, showErrorOnEmpty);
    }

    /**
     * Retrieves the proper error message for the name input.
     * @returns {string}
     */
    function nameErrorMessageProvider() {
        return errorMessages.getNameErrorMessage();
    }

    /**
     * Retrieves the proper error message for a lat/lon input.
     *
     * @param stringValue
     * @param inputId
     * @returns {*}
     */
    function latLonErrorMessageProvider(stringValue, inputId) {
        let errorMessage;

        // First we perform a validation on the value and get the error summary object:
        const errorSummary = validation.latLonErrorSummary(stringValue, inputId);

        if (inputId === 'lat') {
            // For the lat input we fetch the lat error message:
            errorMessage = errorMessages.getLatErrorMessage(errorSummary);
        } else {
            // For the lon input we fetch the lon error message:
            errorMessage = errorMessages.getLonErrorMessage(errorSummary);
        }
        return errorMessage;
    }

    /**
     * Handler for the keyup event for the lat and lon inputs.
     * @param event
     */
    function handleLatLonKeyup(event) {
        validateInput(event.target, validation.isLatLonValid, latLonErrorMessageProvider, false);
    }

    /**
     * Handler for the keyup event for the name input. This handler's goal is actually just to hide the error message
     * associated with the name input if it's contents got deleted. We assume the user is in the process of changing
     * the name and we don't want to bother them with a premature error message.
     * @param event
     */
    function handleNameKeyup(event) {
        validateInput(event.target, validation.isNameValid, nameErrorMessageProvider, false);
    }

    function showClearListButton() {
        const clearListButton = domAccess.querySelector('#locations-container button.clear');
        utils.show(clearListButton);
    }

    /**
     * Handler for the form submission event.
     * @param event
     */
    function handleFormSubmission(event) {
        // We don't want the form to perform any network operations so we disable the event's default behaviour:
        event.preventDefault();
        // Fetch the location info from the form:
        const newLocation = collectLocationInfo();

        // Validate the name input value:
        let didValidationPass = validateStringValue(newLocation.name, 'name', validation.isNameValid, nameErrorMessageProvider);

        // Validate the lat and lon inputs values and "AND" the results with the results of the name validation
        // such that if any of the validations fails we don't add the location:
        for (const id of ['lat', 'lon']) {
            const isValid = validateStringValue(newLocation[id], id, validation.isLatLonValid, latLonErrorMessageProvider);
            didValidationPass &&= isValid;
        }

        if (didValidationPass === true) {
            // If all validations passed, add the location to the locations list and clear the form.
            addLocationToList(newLocation);
            clearForm();
        }
    }

    function displayLocationDetails(locationName) {
        // Get the location and the location display element:
        const location = locations[locationName];
        const locationDisplayElement = domAccess.querySelector('#locations-container div.location-details');

        // Write the location details to the element:
        locationDisplayElement.children[0].innerText = locationName;
        locationDisplayElement.children[1].innerText = `${location.lat}, ${location.lon}`;

        // Show the element:
        utils.show(locationDisplayElement);
    }

    /**
     * When one of the names on the locations list is clicked, we want to 'select' it, un-'select' every other name,
     * style it, and "un-style" every other name.
     *
     * @param locationsDiv - the element containing the location items
     * @param nameButton - the element used as the name button in the list
     */
    function nameButtonClickAction(locationsDiv, nameButton) {
        // Get all name buttons from the container:
        const nameBTNs = locationsDiv.getElementsByClassName('name-btn');

        for (const button of nameBTNs) {
            // Remove the 'selected' class and re-style each button as un-selected (including the one we want to
            // select, for now):
            button.classList.remove('selected', 'bg-primary', 'text-light');
            button.classList.add('text-muted');
        }
        // Add the 'selected' class to the clicked button and re-style it as selected:
        nameButton.classList.add('selected', 'bg-primary', 'text-light');
        nameButton.classList.remove('text-muted');

        // Get the location name form the clicked button and display the location details
        const locationName = nameButton.innerText.trim();
        displayLocationDetails(locationName);
    }

    /**
     * Create a name button for the locations list.
     *
     * @param location
     * @param locationsDiv
     * @returns {*}
     */
    function createNameButton(location, locationsDiv) {
        const nameButton = domAccess.createElement('div');
        nameButton.classList.add('col-11', 'p-2', 'pl-3', 'text-muted', 'border', 'rounded-bottom-left', 'border-top-0', 'name-btn');
        nameButton.innerText = location.name;
        nameButton.addEventListener('click', () => nameButtonClickAction(locationsDiv, nameButton));
        return nameButton;
    }

    function handleTopRow(divRow) {
        // If the row to be removed is the first in the list but not the last, the buttons in the next row need
        // some adjustments to become first row buttons.
        for (const item of divRow.nextElementSibling.children) {
            // For each of them, add the top border (by removing the class that removes it):
            item.classList.remove('border-top-0');
        }
        const [nextNameButton, nextDeleteButton] = [...divRow.nextElementSibling.children];
        // Make the top left corner of the left button round:
        nextNameButton.classList.add('rounded-top-left');
        // Make the top right corner of the right button round:
        nextDeleteButton.classList.add('rounded-top-right')
    }

    function handleBottomRow(divRow) {
        // If the row to be removed is the last in the list but not the first, the buttons in the previous row
        // need to get rounded corners:
        const [prevNameButton, prevDeleteButton] = [...divRow.previousElementSibling.children];
        prevNameButton.classList.add('rounded-bottom-left');
        prevDeleteButton.classList.add('rounded-bottom-right');
    }

    /**
     * When a delete button from the locations list is clicked we want to remove it and the name button beside it
     * from the list, and adjust adjacent items in the list visually.
     *
     * @param divRow - the row containing the delete button (child of locationsDiv)
     * @param locationsDiv - the list container
     * @param noLocationsYetElement - an element to show if the list becomes empty
     */
    function removeLocationFromDOM(divRow, locationsDiv, noLocationsYetElement) {
        if (divRow.nextElementSibling !== null && divRow.previousElementSibling === null) {
            handleTopRow(divRow);
        } else if (divRow.nextElementSibling === null && divRow.previousElementSibling !== null) {
            handleBottomRow(divRow);
        }

        // Remove the row:
        locationsDiv.removeChild(divRow);

        // Get the number of rows after removal to check if the list is empty:
        const itemCountOnDelete = locationsDiv.children.length;

        if (itemCountOnDelete === 0) {
            // If the list is empty show the noLocationsYetElement.
            utils.show(noLocationsYetElement);
            const clearListButton = domAccess.querySelector('#locations-container button.clear');
            utils.hide(clearListButton);
        }
    }

    function handleDeleteButtonClick(divRow, locationsDiv, noLocationsYetElement) {
        api.removeLocationsByNames(_ => {
            removeLocationFromDOM(divRow, locationsDiv, noLocationsYetElement);
        }, onErrorUseMessage, [divRow.firstChild.innerText]);
    }

    /**
     * Crate a delete button for the locations list.
     *
     * @param divRow - parent of the new delete button
     * @param locationsDiv - parent of divRow (needed for the click action handler)
     * @param noLocationsYetElement - element to display if the list is emtpy (needed for the click action handler)
     * @returns {*}
     */
    function createDeleteButton(divRow, locationsDiv, noLocationsYetElement) {
        const deleteButton = domAccess.createElement('div');
        deleteButton.classList.add('col-1', 'p-2', 'text-center', 'rounded-bottom-right', 'border', 'border-left-0', 'border-top-0', 'delete-btn');
        deleteButton.innerText = 'X';
        deleteButton.addEventListener('click', () => handleDeleteButtonClick(divRow, locationsDiv, noLocationsYetElement));
        return deleteButton;
    }

    /**
     * This function is called for a non-touch device to add some interactive behaviour of the locations list buttons.
     * @param deleteButton
     * @param nameButton
     */
    function setMouseEventsForListButtons(deleteButton, nameButton) {
        // Set delete button background color to 'danger' on mouseover and un-do it on mouseout:
        deleteButton.addEventListener('mouseover', () => deleteButton.classList.add('bg-danger'));
        deleteButton.addEventListener('mouseout', () => deleteButton.classList.remove('bg-danger'));

        // Set name button background color to 'light' on mouseover but only if it it's background color is not
        // 'primary' because that looks bad:
        nameButton.addEventListener('mouseover', () => {
            if (!nameButton.classList.contains('bg-primary')) {
                nameButton.classList.add('bg-light');
            }
        });
        // Un-set the 'light' background color of the name button on mouseout (since the classList.remove action
        // is a no-op if the provided class is not in classList there is no need to check if the class is in):
        nameButton.addEventListener('mouseout', () => nameButton.classList.remove('bg-light'));
    }

    /**
     * On devices with no touch screen we want to add 'hover' behaviour to the buttons in the locations list.
     * @param deleteButton
     * @param nameButton
     */
    function setMouseEventsOrStaticColors(deleteButton, nameButton) {
        if (!utils.isTouchScreen()) {
            setMouseEventsForListButtons(deleteButton, nameButton);
        } else {
            // If the screen is a touch screen, just set the background color of the delete button to 'danger'
            // statically.
            deleteButton.classList.add('bg-danger');
        }
    }

    /**
     * When new items are added to the locations list, they need to be styled and others may need to be re-styled.
     *
     * @param nameButton
     * @param deleteButton
     * @param locationsDiv - locations list container
     */
    function correctListBordersAndCornersWhenAddingRows(nameButton, deleteButton, locationsDiv) {
        // Fetch the number of rows in the locations list:
        const numberOfRows = locationsDiv.children.length;

        if (numberOfRows === 0) {
            // If the list is currently empty, the new buttons will be at the top, so they need top borders and
            // rounded top corners:
            nameButton.classList.add('rounded-top-left');
            deleteButton.classList.add('rounded-top-right');
            nameButton.classList.remove('border-top-0');
            deleteButton.classList.remove('border-top-0');
        } else {
            // If not, then they will be placed after the last row, which has rounded bottom corners, which has to be
            // removed:
            const lastRow = locationsDiv.lastElementChild;
            lastRow.firstElementChild.classList.remove('rounded-bottom-left');
            lastRow.lastElementChild.classList.remove('rounded-bottom-right');
        }
    }

    function addLocationToDOM(location) {
        // Delete previously entered locations with this name if exists
        // removeLocationIfExists(location.name);

        // Fetch the locations list container:
        const locationsDiv = domAccess.querySelector('#locations-container div.locations');

        // If the name is already in the list-view, no need to change the DOM at all:
        for (let row of locationsDiv.children) {
            if (row.firstChild.innerText === location.name) {
                return;
            }
        }

        // Hide the noLocationsYet element since it is no longer needed (it may have already been hidden if the list
        // was not empty, but hiding a hidden element is a no-op):
        const noLocationsYetElement = domAccess.querySelector('#locations-container p');
        utils.hide(noLocationsYetElement);

        // Create a new row, a name button with the new location's name and a delete button:
        const divRow = domAccess.createElement('div');
        divRow.classList.add('row', 'no-gutters');
        const nameButton = createNameButton(location, locationsDiv);
        const deleteButton = createDeleteButton(divRow, locationsDiv, noLocationsYetElement);

        // Set some background color properties for the new buttons:
        setMouseEventsOrStaticColors(deleteButton, nameButton);

        // We want the four corners of the list to always be rounded (and only them). Also the new buttons may need
        // a top border if they are the first in the list:
        correctListBordersAndCornersWhenAddingRows(nameButton, deleteButton, locationsDiv);

        // Append the new buttons to the new row, and the new row to the locations list container:
        divRow.appendChild(nameButton);
        divRow.appendChild(deleteButton);
        locationsDiv.appendChild(divRow);

        // Show the locations list container (it may have been hidden if the list was empty until now):
        utils.show(locationsDiv);
    }

    /**
     * Add a new location to the locations list
     * @param location
     * @param updateBackend - if true, location will be sent to the api for adding/updating. Used when a location
     *                        is added via the form. false is used when displaying locations that were fetched from
     *                        the api.
     */
    function addLocationToList(location, updateBackend = true) {

        function addLocationToListAction(responseJson = null) {
            // First add it to the locations storage map (data structure):
            locations[location.name] = location;
            addLocationToDOM(location);
            showClearListButton();

            if (responseJson && responseJson.message.includes('updated')) {
                displayMessageInModal(`Location updated successfully.`, 'Success');
            }
        }

        if (updateBackend) {
            api.addLocation(location, addLocationToListAction, onErrorUseMessage);
        } else {
            addLocationToListAction();
        }
    }

    /**
     * Clear all of the inputs and error messages in the form.
     */
    function clearForm() {
        // Get all inputs in the form except the submit button:
        const formInputs = domAccess.querySelectorAll('#form input:not(.submit-button)');

        for (const input of formInputs) {
            // For each of them set it's value to an empty string and dispatch the keyup event on it (which will
            // trigger a validation with no error messages for empty inputs):
            input.value = '';
            input.dispatchEvent(new Event('keyup'));
        }
    }

    /**
     * Switches between the forecast image and the loading image.
     * @param whatToShow - 'forecast' or 'loading'
     * @param showPlaceholderForecastImage - boolean
     */
    function switchImages(whatToShow = 'forecast', showPlaceholderForecastImage = false) {
        // Fetch the img elements:
        const forecastImage = domAccess.querySelector('#forecast img');
        const loadingImage = domAccess.querySelector('#forecast img.loading');

        if (showPlaceholderForecastImage) {
            // Show the placeholder image in the forecast image if such requested:
            forecastImage.src = 'images/no-img.png';
        }

        // Switch the loading image on if so requested and off otherwise:
        utils.switch(loadingImage, whatToShow === 'loading');
        // Switch the forecast image on if so requested and off otherwise:
        utils.switch(forecastImage, whatToShow === 'forecast');
    }

    /**
     * Displays the loading image and hides the forecast image.
     */
    function showLoadingImage() {
        switchImages('loading');
    }

    /**
     * Displays the forecast image and hides the loading one
     * @param showPlaceholderImage - boolean (indicates a placeholder image should be used)
     */
    function showForecastImage(showPlaceholderImage = false) {
        switchImages('forecast', showPlaceholderImage);
    }

    /**
     * Handler for the forecast image img element load event:
     */
    function handleImageLoaded() {
        // Raise the isIMGCallDone to indicate forecast image is ready:
        isIMGCallDone = true;
        if (isAPICallDone) {
            // If the API call is done, show the forecast and the forecast image.
            const selectedLocationItem = domAccess.querySelector('#locations-container div.selected');
            const selectedLocationName = selectedLocationItem.innerText.trim();
            showForecastAndImage(selectedLocationName);
        }
    }

    /**
     * Handler for the forecast img element error event:
     * @param event
     */
    function handleImageLoadError(event) {
        // Set the placeholder image manually (since we have quick access to the img element via the event object):
        event.target.src = 'images/no-img.png';
        // Call the handler for image loaded to display the placeholder image and hide the loading image:
        handleImageLoaded();
    }

    function getAllLocationNames() {
        const locationNames = [];
        const locationsDiv = domAccess.querySelector('#locations-container div.locations');
        for (let row of locationsDiv.children) {
            locationNames.push(row.firstChild.innerText);
        }
        return locationNames;
    }

    function handleClearButtonClick(event) {
        const locationNames = getAllLocationNames();

        api.removeLocationsByNames(_ => {
            const locationsDiv = domAccess.querySelector('#locations-container div.locations');
            locationsDiv.innerHTML = '';
            const noLocationsYetElement = domAccess.querySelector('#locations-container p');
            utils.show(noLocationsYetElement);
            utils.hide(event.target);
        }, onErrorUseMessage, locationNames);
    }

    let initRan = false;
    let savedLocations = null;

    function displaySavedLocations() {
        utils.show(domAccess.querySelector('#locations-container p'));

        for (let location of savedLocations) {
            addLocationToList(location, false);
        }
    }

    function doBeforeApiCall() {
        utils.show(domAccess.querySelector('#locations-container img'));
    }

    function doAfterApiCall() {
        utils.hide(domAccess.querySelector('#locations-container img'));
    }

    /**
     * Handler for the DOMContentLoaded event:
     */
    function init() {

        api.init(doBeforeApiCall, doAfterApiCall);

        for (const inputName of ['lat', 'lon']) {
            // Add listeners to the keyup event to the lat and lon inputs:
            domAccess.getInputByName(inputName).addEventListener('keyup', handleLatLonKeyup);
        }

        // Add a listener to the keyup event to the name input:
        const nameInput = domAccess.getInputByName('name');
        nameInput.addEventListener('keyup', handleNameKeyup);

        // Add a listener to the click event to the submit button of the form:
        const submitButton = domAccess.querySelector('#form .submit-button');
        submitButton.addEventListener('click', handleFormSubmission);

        // Add a listener to the click event to the display forecast button (triggers the ajax request):
        const displayForecastButton = domAccess.querySelector('#locations-container button.show-forecast');
        displayForecastButton.addEventListener('click', handleDisplayForecastButtonClick);

        // Add a listener to the click event of the clear button:
        const clearButton = domAccess.querySelector('#locations-container button.clear');
        clearButton.addEventListener('click', handleClearButtonClick);

        // Add listeners to the load and error events to the forecast image img element:
        const forecastImage = domAccess.querySelector('#forecast img');
        forecastImage.addEventListener('load', handleImageLoaded);
        forecastImage.addEventListener('error', handleImageLoadError);

        // Enable all tooltips. Unfortunately Bootstrap does not provide any method of initializing their tooltips
        // without jQuery that I know of. It is similar to the enabling of the modal dialogs that we are allowed to
        // do with jQuery.
        $('[data-toggle="tooltip"]').tooltip();

        if (savedLocations) {
            // If there is anything in the savedLocation array, we display it:
            displaySavedLocations();
        }
        initRan = true;
    }

// Attach init as a handler to the DOMContentLoaded to document:
    domAccess.addEventListenerToDocument('DOMContentLoaded', init);

    /**
     * Start fetching saved locations from server even before DOM is loaded. When they are fetched, they will be
     * stored in memory until DOM is loaded and then displayed.
     */
    (function () {

        function parseSavedLocations(json) {
            savedLocations = json['locations'];
            if (initRan) {
                // When function init runs (on the DOMContentLoaded event) it turns on the initRan flag.
                // That's how we know that the DOM is loaded and we can display the saved locations.
                displaySavedLocations();
            }
        }


        api.getLocations(parseSavedLocations, onErrorUseMessage);
    })();
})
();
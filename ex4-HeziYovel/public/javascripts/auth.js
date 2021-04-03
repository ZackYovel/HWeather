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

    const passwordForm = {
        PASSWORD_INDEX: 0,
        CONFIRM_INDEX: 1,
    };

    function validateInputs(inputs, validator) {
        for (let input of inputs) {
            const errorElement = domAccess.getErrorElement(input.id);
            if (validator(utils.getTrimmedValue(input))) {
                errorElement.classList.add('d-none');
            } else {
                errorElement.classList.remove('d-none');
                throw new Error('form validation failed');
            }
        }
    }

    function validatePasswordForm(event) {
        const formInputs = domAccess.querySelectorAll('#passwordform input:not(.submit)');
        const password = utils.getTrimmedValue(formInputs[passwordForm.PASSWORD_INDEX]);
        try {
            validateInputs([formInputs[passwordForm.CONFIRM_INDEX]], string => string === password);
        } catch (err) {
            event.preventDefault();
        }
    }

    function switchToRegisterForm(event) {
        const loginForm = domAccess.getElementById('loginform');
        const registerForm = domAccess.getElementById('registerform');

        loginForm.classList.toggle('d-none');
        registerForm.classList.toggle('d-none');
        event.preventDefault();
    }

    function initLogin() {
        const registerLink = domAccess.querySelector('#loginform a');
        registerLink.addEventListener('click', switchToRegisterForm);
    }

    function initPassword() {
        const passwordButton = domAccess.querySelector('#passwordform input.submit');
        passwordButton.addEventListener('click', validatePasswordForm);
    }

    function initRegister() {
        if (document.title.includes('Choose Password')) {
            initPassword();
        } else if (document.title.includes('Register')) {
            // Show the modal:
            $('#error-modal').modal({show: true});
        }
    }

    function handleConfirmButtonClick(modalFooters) {
        modalFooters[0].innerHTML = '';
        modalFooters[1].innerHTML = '';
        const modalBody = domAccess.querySelector('#error-modal div.modal-body');
        modalBody.innerText = 'Thank you for the report.';
        // That's it. In real world this is where a report would have been prepared and sent to the devs.
    }

    function initModal() {
        const modal = domAccess.getElementById('error-modal');
        const modalBody = modal.querySelector('.modal-body');
        const confirmButton = modal.querySelector('.confirm');
        const modalFooters = modal.querySelectorAll('.modal-footer');
        confirmButton.addEventListener('click', () => handleConfirmButtonClick(modalFooters));
        const message = modalBody.innerText.trim();
        if (message.endsWith('With your permission, we would like to send our developers an error report.')) {
            utils.hide(modalFooters[0]);
            utils.show(modalFooters[1]);
        } else {
            utils.show(modalFooters[1]);
            utils.hide(modalFooters[0]);
        }
    }

    function init() {
        initModal();
        initLogin();
        initRegister();
        if (window.location.pathname === '/authenticate') {
            // Show the modal:
            $('#error-modal').modal({show: true});
        }
    }

    domAccess.addEventListenerToDocument('DOMContentLoaded', init);
})();
// DOM Elements
const environmentSelect = document.getElementById('environment');
const prNumberInput = document.getElementById('prNumber');
const prNumberGroup = document.getElementById('prNumberGroup');
const customBackendUrlInput = document.getElementById('customBackendUrl');
const customBackendUrlGroup = document.getElementById('customBackendUrlGroup');
const additionalParamsContainer = document.getElementById('additionalParamsContainer');
const resetBtn = document.getElementById('resetBtn');
const startGameBtn = document.getElementById('startGameBtn');
const copyShareLinkBtn = document.getElementById('copyShareLinkBtn'); // New Button
const qrcodeDiv = document.getElementById('qrcode');
const generatedUrlP = document.getElementById('generatedUrl');
const aliveStatusDiv = document.getElementById('aliveStatus');
const grafanaLinkContainer = document.getElementById('grafanaLinkContainer');
const grafanaLink = document.getElementById('grafanaLink');
const copyUrlBtn = document.getElementById('copyUrlBtn');


let qrCodeInstance = null;
let currentDeepLinkUrl = '';
let aliveCheckTimeout = null;
let currentAliveCheckToken = null;

const environmentDomains = {
    trunk: "backend.jarvistrunk.net",
    trunkliveops: "backend-liveops.jarvistrunk.net",
    qa3: "backend.liveops.jarvisqa.net"
};

const grafanaDataSources = {
    trunk: "P31FC4C0F93B441EF",
    qa3: "P5A8999BC3E4BD4C5"
};

const LS_BASE_KEY = 'qrGenAdv_';
const LS_KEYS = {
    ENVIRONMENT: LS_BASE_KEY + 'environment',
    PR_NUMBER: LS_BASE_KEY + 'prNumber',
    CUSTOM_BACKEND_URL: LS_BASE_KEY + 'customBackendUrl',
    ADDITIONAL_PARAMS: LS_BASE_KEY + 'additionalParams'
};

const DEFAULTS = {
    ENVIRONMENT: 'trunk',
    PR_NUMBER: '',
    CUSTOM_BACKEND_URL: ''
};

const additionalParamsConfig = [
    { id: 'ava_dab', name: 'Ava DAB', key: 'ava_dab', type: 'text', placeholder: 'AVA_DAB value or reset', example: '?ava_dab=MY_DAB', defaultValue: '3_65_0' },
    { id: 'ava_header', name: 'Ava Header', key: 'ava_header', type: 'select', options: ['mvmx', 'mvmx-liveops'], example: '?ava_header=AVA_HEADER', defaultValue: '' },
    { id: 'auto_cheat', name: 'Auto Cheat', key: 'auto_cheat', type: 'text', placeholder: 'Cheat ID (e.g. SuperPlayer)', example: '?auto_cheat=SuperPlayer', defaultValue: 'SuperPlayer' },
    { id: 'reset_device', name: 'Reset Device', key: 'reset', type: 'checkbox_only', example: '?reset=device', fixedValue: 'device', defaultValue: false },
    { id: 'user_deviceid', name: 'User DeviceID', key: 'user_deviceid', type: 'text', placeholder: 'UDID', example: '?user_deviceid=UDID', defaultValue: '' },
    { id: 'user_adid', name: 'User AdvertisingID', key: 'user_adid', type: 'text', placeholder: 'ADID', example: '?user_adid=ADID', defaultValue: '' },
    { id: 'env_profile', name: 'Server Environment Profile', key: 'env_profile', type: 'select', options: ['trunk', 'qa1', 'qa3', 'stage', 'prod', 'reset'], example: '?env_profile=qa3', defaultValue: 'qa3' },
    { id: 'backend_pr', name: 'Backend PR (additional)', key: 'backend_pr', type: 'text', placeholder: 'e.g., 1024 or reset', example: '?backend_pr=1024', defaultValue: '' },
    { id: 'iap_cheat', name: 'IAP Cheat (no AppStore)', key: 'iap_cheat', type: 'select', options: ['true', 'false'], example: '?iap_cheat=true', defaultValue: 'false' },
    { id: 'nlog_level', name: 'NLog Console Log Level', key: 'nlog_level', type: 'select', options: ['debug', 'info', 'warn', 'error', 'fatal', 'off'], example: '?nlog_level=debug', defaultValue: 'info' },
];

function renderAdditionalParams(urlParams = {}) {
    additionalParamsContainer.innerHTML = '';
    const savedParamsState = JSON.parse(localStorage.getItem(LS_KEYS.ADDITIONAL_PARAMS) || '{}');

    additionalParamsConfig.forEach(param => {
        let isDefaultEnabled = (param.id === 'ava_dab' || (param.type === 'checkbox_only' && param.defaultValue === true));
        let initialValue = param.defaultValue;
        let initialEnabledState = isDefaultEnabled;

        // URL params take highest priority for value and enabled state
        if (urlParams.hasOwnProperty(param.key)) {
            initialEnabledState = true;
            initialValue = urlParams[param.key];
        } else {
            // Then check local storage
            const savedParam = savedParamsState[param.id];
            if (savedParam) {
                initialEnabledState = savedParam.enabled;
                if (param.type !== 'checkbox_only') {
                    initialValue = savedParam.value;
                }
            } else {
            }
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'param-group';

        let inputHtml = '';
        if (param.type === 'text') {
            inputHtml = `<input type="text" id="${param.id}_value" value="${initialValue}" placeholder="${param.placeholder || ''}" class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" ${!initialEnabledState ? 'disabled' : ''}>`;
        } else if (param.type === 'select') {
            const optionsHtml = param.options.map(opt => `<option value="${opt}" ${opt === initialValue ? 'selected' : ''}>${opt}</option>`).join('');
            inputHtml = `<select id="${param.id}_value" class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" ${!initialEnabledState ? 'disabled' : ''}>${optionsHtml}</select>`;
        }

        wrapper.innerHTML = `
            <div class="flex items-center justify-between">
                <label for="${param.id}_enable" class="block text-sm font-medium text-gray-900">${param.name}</label>
                <input type="checkbox" id="${param.id}_enable" ${initialEnabledState ? 'checked' : ''} class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
            </div>
            ${inputHtml} 
            ${param.example ? `<p class="mt-1 text-xs text-gray-500">${param.example}</p>` : ''}
        `;
        additionalParamsContainer.appendChild(wrapper);

        const enableCheckbox = document.getElementById(`${param.id}_enable`);
        enableCheckbox.addEventListener('change', (e) => {
            if (param.type !== 'checkbox_only') {
                document.getElementById(`${param.id}_value`).disabled = !e.target.checked;
            }
            generateAndDisplayQrCode();
        });

        if (param.type !== 'checkbox_only') {
            const valueElement = document.getElementById(`${param.id}_value`);
            valueElement.addEventListener('input', () => {
                generateAndDisplayQrCode();
                scheduleAliveCheck();
            });
            if (param.type === 'select') {
                valueElement.addEventListener('change', () => {
                    generateAndDisplayQrCode();
                    scheduleAliveCheck();
                });
            }
        }
    });
}

function saveInputsToLocalStorage() {
    localStorage.setItem(LS_KEYS.ENVIRONMENT, environmentSelect.value);
    localStorage.setItem(LS_KEYS.PR_NUMBER, prNumberInput.value);
    localStorage.setItem(LS_KEYS.CUSTOM_BACKEND_URL, customBackendUrlInput.value);

    const additionalParamsState = {};
    additionalParamsConfig.forEach(param => {
        const enableCheckbox = document.getElementById(`${param.id}_enable`);
        additionalParamsState[param.id] = {
            enabled: enableCheckbox.checked,
            value: (param.type !== 'checkbox_only' && enableCheckbox.checked) ? document.getElementById(`${param.id}_value`).value : (param.fixedValue || param.defaultValue || '')
        };
    });
    localStorage.setItem(LS_KEYS.ADDITIONAL_PARAMS, JSON.stringify(additionalParamsState));
}

function loadInputsFromLocalStorage() {
    environmentSelect.value = localStorage.getItem(LS_KEYS.ENVIRONMENT) || DEFAULTS.ENVIRONMENT;
    prNumberInput.value = localStorage.getItem(LS_KEYS.PR_NUMBER) || DEFAULTS.PR_NUMBER;
    customBackendUrlInput.value = localStorage.getItem(LS_KEYS.CUSTOM_BACKEND_URL) || DEFAULTS.CUSTOM_BACKEND_URL;
}

function applyUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.toString() === '') {
        return false; // No params to apply
    }

    // Base Config
    environmentSelect.value = urlParams.get('env') || DEFAULTS.ENVIRONMENT;
    prNumberInput.value = urlParams.get('pr') || DEFAULTS.PR_NUMBER;
    customBackendUrlInput.value = urlParams.get('customUrl') || DEFAULTS.CUSTOM_BACKEND_URL;

    // Additional Params
    const additionalUrlParams = {};
    additionalParamsConfig.forEach(param => {
        if (urlParams.has(param.key)) {
            additionalUrlParams[param.key] = urlParams.get(param.key);
        }
    });

    renderAdditionalParams(additionalUrlParams);

    return true; // Params were applied
}


function updateInputVisibility(selectedEnv) {
    if (selectedEnv === "custom") {
        prNumberGroup.classList.add('hidden-field');
        prNumberInput.disabled = true;
        customBackendUrlGroup.classList.remove('hidden-field');
        customBackendUrlInput.disabled = false;
        grafanaLinkContainer.classList.add('hidden-field');
    } else if (selectedEnv === "trunkliveops") {
        prNumberGroup.classList.remove('hidden-field');
        prNumberInput.disabled = true;
        customBackendUrlGroup.classList.add('hidden-field');
        customBackendUrlInput.disabled = true;
    } else { // Trunk, QA3
        prNumberGroup.classList.remove('hidden-field');
        prNumberInput.disabled = false;
        customBackendUrlGroup.classList.add('hidden-field');
        customBackendUrlInput.disabled = true;
    }
}

function resetToDefaultSettings() {
    localStorage.removeItem(LS_KEYS.ENVIRONMENT);
    localStorage.removeItem(LS_KEYS.PR_NUMBER);
    localStorage.removeItem(LS_KEYS.CUSTOM_BACKEND_URL);
    localStorage.removeItem(LS_KEYS.ADDITIONAL_PARAMS);

    // Clear the URL of query params
    window.history.replaceState({}, document.title, window.location.pathname);

    environmentSelect.value = DEFAULTS.ENVIRONMENT;
    prNumberInput.value = DEFAULTS.PR_NUMBER;
    customBackendUrlInput.value = DEFAULTS.CUSTOM_BACKEND_URL;

    prNumberInput.classList.remove('input-error');
    customBackendUrlInput.classList.remove('input-error');
    aliveStatusDiv.textContent = '';
    aliveStatusDiv.className = 'mt-2 text-sm';
    grafanaLinkContainer.classList.add('hidden-field');

    updateInputVisibility(DEFAULTS.ENVIRONMENT);
    renderAdditionalParams();
    generateAndDisplayQrCode();
}

function validateInputs() {
    prNumberInput.classList.remove('input-error');
    customBackendUrlInput.classList.remove('input-error');
    additionalParamsConfig.forEach(param => {
        if (param.type === 'text') {
            const inputElement = document.getElementById(`${param.id}_value`);
            if (inputElement) inputElement.classList.remove('input-error');
        }
    });
    generatedUrlP.classList.remove('error-message');
    generatedUrlP.innerHTML = '';

    const prNumberValue = prNumberInput.value;
    const selectedEnv = environmentSelect.value;

    if (selectedEnv === "custom") {
        const customUrl = customBackendUrlInput.value.trim();
        if (!customUrl) {
            generatedUrlP.textContent = "Error: Custom Backend URL cannot be empty.";
            generatedUrlP.classList.add('error-message');
            customBackendUrlInput.classList.add('input-error');
            qrcodeDiv.innerHTML = '';
            return false;
        }
        if (customUrl.indexOf(' ') !== -1) {
            generatedUrlP.textContent = "Error: Custom Backend URL cannot contain spaces.";
            generatedUrlP.classList.add('error-message');
            customBackendUrlInput.classList.add('input-error');
            qrcodeDiv.innerHTML = '';
            return false;
        }
    } else if (selectedEnv !== "trunkliveops" && prNumberValue.indexOf(' ') !== -1) {
        generatedUrlP.textContent = "Error: PR Number cannot contain spaces.";
        generatedUrlP.classList.add('error-message');
        prNumberInput.classList.add('input-error');
        qrcodeDiv.innerHTML = '';
        return false;
    }

    for (const param of additionalParamsConfig) {
        if (param.type === 'text') {
            const enableCheckbox = document.getElementById(`${param.id}_enable`);
            const valueInput = document.getElementById(`${param.id}_value`);
            if (enableCheckbox && valueInput && enableCheckbox.checked) {
                const value = valueInput.value;
                if (value.indexOf(' ') !== -1) {
                    generatedUrlP.textContent = `Error: '${param.name}' cannot contain spaces.`;
                    generatedUrlP.classList.add('error-message');
                    valueInput.classList.add('input-error');
                    qrcodeDiv.innerHTML = '';
                    return false;
                }
            }
        }
    }
    return true;
}

async function performAliveCheck(checkToken) {
    const selectedEnvironment = environmentSelect.value;
    const prNumberRaw = prNumberInput.value;
    let hostToCheck;

    if (selectedEnvironment === "custom") {
        hostToCheck = customBackendUrlInput.value.trim();
    } else if (selectedEnvironment === "trunkliveops") {
        hostToCheck = environmentDomains[selectedEnvironment];
    } else {
        const baseDomain = environmentDomains[selectedEnvironment];
        if (prNumberRaw.trim()) {
            hostToCheck = `pr-${prNumberRaw.trim()}.${baseDomain}`;
        } else {
            hostToCheck = baseDomain;
        }
    }

    if (!hostToCheck) {
        if (checkToken === currentAliveCheckToken) {
            aliveStatusDiv.textContent = '';
            aliveStatusDiv.className = 'mt-2 text-sm';
        }
        return;
    }

    let checkUrl = hostToCheck;
    if (!checkUrl.startsWith('http://') && !checkUrl.startsWith('https://')) {
        checkUrl = 'https://' + checkUrl;
    }
    checkUrl += '/api/live';

    if (checkToken === currentAliveCheckToken) {
        aliveStatusDiv.textContent = 'Status: Checking...';
        aliveStatusDiv.className = 'mt-2 text-sm status-checking';
    }

    try {
        let fetchOptions = {};

        if (selectedEnvironment === "custom") {
            fetchOptions.method = 'GET'; // Use GET for custom backend URL
            // No 'mode' specified means default 'cors' mode
        } else {
            fetchOptions.method = 'HEAD';
            fetchOptions.mode = 'no-cors';
        }

        const response = await fetch(checkUrl, fetchOptions);

        if (checkToken === currentAliveCheckToken) {
            let statusMessage = '';
            let statusClass = '';

            if (selectedEnvironment === "custom") {
                if (response.status === 200) {
                    statusMessage = 'Status: Alive 😻 (HTTP 200)';
                    statusClass = 'mt-2 text-sm status-alive';
                } else {
                    statusMessage = `Status: Dead 💀 (HTTP ${response.status})`;
                    statusClass = 'mt-2 text-sm status-not-alive';
                }
            } else {
                statusMessage = 'Status: Alive 😻';
                statusClass = 'mt-2 text-sm status-alive';
            }

            aliveStatusDiv.textContent = statusMessage;
            aliveStatusDiv.className = statusClass;

            if (typeof gtag === 'function') {
                gtag('event', 'server_reachable', {
                    'event_category': 'engagement',
                    'event_label': `Alive Check Status: ${statusMessage}`,
                    'host': hostToCheck,
                    'deep_link_url': currentDeepLinkUrl
                });
            }
        }
    } catch (error) {
        console.error('Alive check failed (Network Error):', error);
        if (checkToken === currentAliveCheckToken) {
            aliveStatusDiv.textContent = 'Status: Dead 💀 (Network Error)';
            aliveStatusDiv.className = 'mt-2 text-sm status-not-alive';
            if (typeof gtag === 'function') {
                gtag('event', 'server_unreachable', {
                    'event_category': 'engagement',
                    'event_label': 'Alive Check Failed (Network Error)',
                    'host': hostToCheck,
                    'deep_link_url': currentDeepLinkUrl
                });
            }
        }
    }
}

function scheduleAliveCheck() {
    clearTimeout(aliveCheckTimeout);
    currentAliveCheckToken = Symbol();
    const tokenForThisCheck = currentAliveCheckToken;

    aliveStatusDiv.textContent = 'Status: Checking...';
    aliveStatusDiv.className = 'mt-2 text-sm status-checking';

    aliveCheckTimeout = setTimeout(() => {
        performAliveCheck(tokenForThisCheck);
    }, 1000);
}


function generateAndDisplayQrCode() {
    if (!validateInputs()) {
        currentDeepLinkUrl = '';
        aliveStatusDiv.textContent = '';
        aliveStatusDiv.className = 'mt-2 text-sm';
        grafanaLinkContainer.classList.add('hidden-field');
        copyUrlBtn.disabled = true; // Disable copy button on error
        return;
    }

    const selectedEnvironment = environmentSelect.value;
    const prNumberRaw = prNumberInput.value;

    let backendHost;

    // Grafana Link Logic
    const prNumTrimmed = prNumberRaw.trim();
    let showGrafanaLink = false;
    let grafanaAppName = "";
    let grafanaDatasourceUid = "";

    if (selectedEnvironment === "trunk") {
        grafanaDatasourceUid = grafanaDataSources.trunk;
        grafanaAppName = prNumTrimmed ? `tnk-ea-backend-pr-${prNumTrimmed}` : "tnk-ea-backend";
        showGrafanaLink = true;
    } else if (selectedEnvironment === "qa3") {
        grafanaDatasourceUid = grafanaDataSources.qa3;
        grafanaAppName = prNumTrimmed ? `qa3-ea-backend-pr-${prNumTrimmed}` : "qa3-ea-backend";
        showGrafanaLink = true;
    } else if (selectedEnvironment === "trunkliveops") {
        grafanaDatasourceUid = grafanaDataSources.trunk;
        grafanaAppName = "tnk-ea-backend-liveops";
        showGrafanaLink = true;
    }


    if (showGrafanaLink && grafanaAppName && grafanaDatasourceUid) {
        const expr = `{app=\"${grafanaAppName}\"} |= \`\``;
        const panesObj = {
            "c13": {
                "datasource": grafanaDatasourceUid,
                "queries": [{ "refId": "A", "editorMode": "builder", "expr": expr, "queryType": "range", "datasource": { "type": "loki", "uid": grafanaDatasourceUid } }],
                "range": { "from": "now-6h", "to": "now" }
            }
        };
        const encodedPanes = encodeURIComponent(JSON.stringify(panesObj));
        grafanaLink.href = `https://grafana.jarvis.tools/explore?schemaVersion=1&panes=${encodedPanes}&orgId=1`;
        grafanaLinkContainer.classList.remove('hidden-field');
    } else {
        grafanaLinkContainer.classList.add('hidden-field');
    }


    // Backend Host Logic
    if (selectedEnvironment === "custom") {
        backendHost = customBackendUrlInput.value.trim();
    } else if (selectedEnvironment === "trunkliveops") {
        backendHost = environmentDomains[selectedEnvironment];
    } else {
        const baseDomain = environmentDomains[selectedEnvironment];
        if (prNumberRaw.trim()) {
            backendHost = `pr-${prNumberRaw.trim()}.${baseDomain}`;
        } else {
            backendHost = baseDomain;
        }
    }

    let backendHostQueryParam = `backend_host=${encodeURIComponent(backendHost)}`;

    let queryParams = [backendHostQueryParam];

    additionalParamsConfig.forEach(param => {
        const enableCheckbox = document.getElementById(`${param.id}_enable`);
        if (enableCheckbox && enableCheckbox.checked) {
            let value;
            if (param.type === 'checkbox_only') {
                value = param.fixedValue;
            } else {
                const valueInput = document.getElementById(`${param.id}_value`);
                value = valueInput ? valueInput.value.trim() : '';
            }

            if (value !== '' || param.type === 'checkbox_only' || param.key === 'ava_dab' || param.key === 'ava_header') {
                queryParams.push(`${encodeURIComponent(param.key)}=${encodeURIComponent(value)}`);
            }
        }
    });

    currentDeepLinkUrl = `myvegas-slots://slots/cheat?${queryParams.join('&')}`;

    generatedUrlP.innerHTML = '';
    const linkElement = document.createElement('a');
    linkElement.href = currentDeepLinkUrl;
    linkElement.textContent = currentDeepLinkUrl;
    linkElement.target = "_blank";
    generatedUrlP.appendChild(linkElement);
    generatedUrlP.classList.remove('error-message');

    qrcodeDiv.innerHTML = '';

    try {
        qrCodeInstance = new QRCode(qrcodeDiv, {
            text: currentDeepLinkUrl,
            width: qrcodeDiv.offsetWidth > 20 ? qrcodeDiv.offsetWidth - 10 : 256,
            height: qrcodeDiv.offsetHeight > 20 ? qrcodeDiv.offsetHeight - 10 : 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        if (typeof gtag === 'function') {
            gtag('event', 'qr_code_generated', {
                'event_category': 'engagement',
                'event_label': 'QR Success',
                'environment': selectedEnvironment,
            });
        }

        if (!resetBtn.dataset.isResetting) {
            saveInputsToLocalStorage();
        }
        copyUrlBtn.disabled = false; // Enable copy button after successful generation

    } catch (e) {
        console.error("QR Code generation error:", e);
        qrcodeDiv.innerHTML = '<p class="error-message text-center">Error generating QR code.</p>';
        generatedUrlP.innerHTML = '';
        const errorText = document.createTextNode('Error details in console.');
        generatedUrlP.appendChild(errorText);
        generatedUrlP.classList.add('error-message');
        currentDeepLinkUrl = '';
        copyUrlBtn.disabled = true; // Disable copy button on error
    }
    scheduleAliveCheck();
}

function handleCopyShareLink() {
    const baseUrl = window.location.href.split('?')[0];
    const params = new URLSearchParams();

    // Base params
    params.set('env', environmentSelect.value);
    if (environmentSelect.value === 'custom') {
        params.set('customUrl', customBackendUrlInput.value);
    } else {
        params.set('pr', prNumberInput.value);
    }

    // Additional params
    additionalParamsConfig.forEach(param => {
        const enableCheckbox = document.getElementById(`${param.id}_enable`);
        if (enableCheckbox && enableCheckbox.checked) {
            const value = (param.type !== 'checkbox_only') ? document.getElementById(`${param.id}_value`).value : param.fixedValue;
            params.set(param.key, value);
        }
    });

    const sharableLink = `${baseUrl}?${params.toString()}`;

    // Copy to clipboard
    const dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.value = sharableLink;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);

    const originalText = copyShareLinkBtn.textContent;
    copyShareLinkBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyShareLinkBtn.textContent = originalText;
    }, 2000);

    if (typeof gtag === 'function') {
        gtag('event', 'copy_share_link_clicked', {
            'event_category': 'interaction',
            'event_label': 'Copy Sharable Link Button',
            'sharable_link': sharableLink
        });
    }
}

// === EVENT LISTENERS ===
environmentSelect.addEventListener('change', () => {
    const selectedEnv = environmentSelect.value;
    updateInputVisibility(selectedEnv);
    generateAndDisplayQrCode();
});

// Event listener for the fixed Start Game button
startGameBtn.addEventListener('click', () => {
    if (currentDeepLinkUrl) {
        if (typeof gtag === 'function') {
            gtag('event', 'start_game_clicked', {
                'event_category': 'engagement',
                'event_label': 'Start Game Button', // Changed label as it's now unified
                'deep_link_url': currentDeepLinkUrl
            });
        }
        window.location.href = currentDeepLinkUrl;
    } else {
        console.warn("Please generate a valid QR code and URL first, or check for errors.");
    }
});

// Copy to Clipboard functionality
copyUrlBtn.addEventListener('click', () => {
    if (currentDeepLinkUrl) {
        const originalButtonText = copyUrlBtn.textContent;
        const textArea = document.createElement('textarea');
        textArea.value = currentDeepLinkUrl;
        textArea.style.position = 'fixed'; // Prevent scrolling to bottom of page in MS Edge.
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            copyUrlBtn.textContent = 'Copied!';
            copyUrlBtn.disabled = true; // Disable button temporarily
            setTimeout(() => {
                copyUrlBtn.textContent = originalButtonText;
                copyUrlBtn.disabled = false; // Re-enable button
            }, 2000); // Revert after 2 seconds

            if (typeof gtag === 'function') {
                gtag('event', 'copy_url_clicked', {
                    'event_category': 'interaction',
                    'event_label': 'Copy URL Button',
                    'deep_link_url': currentDeepLinkUrl
                });
            }
        } catch (err) {
            console.error('Failed to copy: ', err);
            // No visible message, just console log for error
        }
        document.body.removeChild(textArea);
    } else {
        console.warn("No URL to copy. Generate a deep link first.");
    }
});

grafanaLink.addEventListener('click', (event) => {
    if (typeof gtag === 'function') {
        const prNum = prNumberInput.value.trim();
        gtag('event', 'grafana_link_clicked', {
            'event_category': 'interaction',
            'event_label': 'View Grafana Logs',
            'pr_number': prNum || 'N/A',
            'environment': environmentSelect.value
        });
    }
});

resetBtn.addEventListener('click', () => {
    resetBtn.dataset.isResetting = true;
    if (typeof gtag === 'function') {
        gtag('event', 'reset_settings_clicked', {
            'event_category': 'interaction',
            'event_label': 'Reset All Settings Button'
        });
    }
    resetToDefaultSettings();
    delete resetBtn.dataset.isResetting;
});

copyShareLinkBtn.addEventListener('click', handleCopyShareLink);

prNumberInput.addEventListener('input', () => {
    generateAndDisplayQrCode();
});
customBackendUrlInput.addEventListener('input', () => {
    generateAndDisplayQrCode();
});


// === FEEDBACK MODAL FUNCTIONALITY ===
const feedbackBtn = document.getElementById('feedbackBtn');
const feedbackModal = document.getElementById('feedbackModal');
const closeFeedbackModal = document.getElementById('closeFeedbackModal');
const cancelFeedback = document.getElementById('cancelFeedback');
const feedbackForm = document.getElementById('feedbackForm');
const feedbackComment = document.getElementById('feedbackComment');
const feedbackStatus = document.getElementById('feedbackStatus');

function openFeedbackModal() {
    feedbackModal.classList.remove('hidden');
    feedbackComment.focus();
    
    // Track modal open event
    if (typeof gtag === 'function') {
        gtag('event', 'feedback_modal_opened', {
            'event_category': 'engagement',
            'event_label': 'Feedback Modal Opened',
            'page_url': window.location.href
        });
    }
}

function closeFeedbackModalHandler() {
    feedbackModal.classList.add('hidden');
    feedbackComment.value = '';
    feedbackStatus.classList.add('hidden');
    feedbackStatus.textContent = '';
    
    // Track modal close event
    if (typeof gtag === 'function') {
        gtag('event', 'feedback_modal_closed', {
            'event_category': 'engagement',
            'event_label': 'Feedback Modal Closed',
            'page_url': window.location.href
        });
    }
}

function submitFeedback(e) {
    e.preventDefault();
    
    const comment = feedbackComment.value.trim();
    if (!comment) {
        showFeedbackStatus('Please enter your feedback before submitting.', 'error');
        return;
    }
    
    // Send feedback to Google Analytics
    if (typeof gtag === 'function') {
        gtag('event', 'feedback', {
            'feedback_comment': comment,
            'page_url': window.location.href,
            'timestamp': new Date().toISOString(),
            'user_agent': navigator.userAgent,
            'environment': environmentSelect.value,
            'current_deep_link': currentDeepLinkUrl
        });
    }
    
    showFeedbackStatus('Thank you for your feedback! It has been sent successfully.', 'success');
    
    // Clear form and close modal after a delay
    setTimeout(() => {
        closeFeedbackModalHandler();
    }, 2000);
}

function showFeedbackStatus(message, type) {
    feedbackStatus.textContent = message;
    feedbackStatus.className = `mt-3 text-sm ${type === 'error' ? 'text-red-600' : 'text-green-600'}`;
    feedbackStatus.classList.remove('hidden');
}

// Feedback event listeners
feedbackBtn.addEventListener('click', openFeedbackModal);
closeFeedbackModal.addEventListener('click', closeFeedbackModalHandler);
cancelFeedback.addEventListener('click', closeFeedbackModalHandler);
feedbackForm.addEventListener('submit', submitFeedback);

// Close modal when clicking outside
feedbackModal.addEventListener('click', (e) => {
    if (e.target === feedbackModal) {
        closeFeedbackModalHandler();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !feedbackModal.classList.contains('hidden')) {
        closeFeedbackModalHandler();
    }
});

window.addEventListener('load', () => {
    const urlParamsApplied = applyUrlParameters();
    if (!urlParamsApplied) {
        loadInputsFromLocalStorage();
        renderAdditionalParams();
    }

    updateInputVisibility(environmentSelect.value);
    generateAndDisplayQrCode();

    if (urlParamsApplied) {
        saveInputsToLocalStorage();
    }

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(generateAndDisplayQrCode, 250);
    });
});

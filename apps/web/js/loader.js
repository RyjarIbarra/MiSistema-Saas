const LOADER_ID = "cp-loader-overlay";
const DEFAULT_MESSAGE = "Cargando...";
const TRANSITION_MS = 180;

let hideTimer = null;
let listenersBound = false;

function getIframeDocument() {
    const iframe = document.getElementById("iframeLayout");
    if (!iframe) {
        return null;
    }

    try {
        if (iframe.contentDocument?.body) {
            return iframe.contentDocument;
        }
    } catch (error) {
        return null;
    }

    return null;
}

function getTargetDocument() {
    return getIframeDocument() || document;
}

function getKnownDocuments() {
    const docs = [document];
    const iframeDoc = getIframeDocument();
    if (iframeDoc && iframeDoc !== document) {
        docs.push(iframeDoc);
    }
    return docs;
}

function clearHideTimer() {
    if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
    }
}

function ensureLoader(doc) {
    let overlay = doc.getElementById(LOADER_ID);
    if (overlay) {
        return overlay;
    }

    overlay = doc.createElement("div");
    overlay.id = LOADER_ID;
    overlay.className = "cp-loader-overlay";
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-live", "polite");
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
        <div class="cp-loader-container">
            <div class="cp-loader-visual" aria-hidden="true">
                <div class="cp-loader-spinner"></div>
                <div class="cp-loader-badge">MS</div>
            </div>
            <div class="cp-loading-text">${DEFAULT_MESSAGE}</div>
            <div class="cp-loader-dots" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;

    doc.body.appendChild(overlay);
    return overlay;
}

function setDocumentScrollLock(doc, locked) {
    if (!doc?.body) {
        return;
    }

    if (locked) {
        if (!doc.body.dataset.cpLoaderOverflow) {
            doc.body.dataset.cpLoaderOverflow = doc.body.style.overflow || "";
        }
        doc.body.style.overflow = "hidden";
        return;
    }

    if (doc.body.dataset.cpLoaderOverflow !== undefined) {
        doc.body.style.overflow = doc.body.dataset.cpLoaderOverflow;
        delete doc.body.dataset.cpLoaderOverflow;
    } else {
        doc.body.style.overflow = "";
    }
}

function bindGlobalSafetyListeners() {
    if (listenersBound) {
        return;
    }

    const safeHide = () => hideLoader();
    window.addEventListener("error", safeHide);
    window.addEventListener("unhandledrejection", safeHide);
    listenersBound = true;
}

export function showLoader(message = DEFAULT_MESSAGE) {
    bindGlobalSafetyListeners();
    clearHideTimer();

    const targetDoc = getTargetDocument();
    const overlay = ensureLoader(targetDoc);
    const textNode = overlay.querySelector(".cp-loading-text");

    if (textNode) {
        textNode.textContent = message || DEFAULT_MESSAGE;
    }

    overlay.classList.add("cp-loader-show");
    overlay.setAttribute("aria-hidden", "false");

    getKnownDocuments().forEach((doc) => setDocumentScrollLock(doc, true));
}

export function hideLoader(callback, delay = 0) {
    clearHideTimer();

    hideTimer = window.setTimeout(() => {
        getKnownDocuments().forEach((doc) => {
            const overlay = doc.getElementById(LOADER_ID);
            if (!overlay) {
                setDocumentScrollLock(doc, false);
                return;
            }

            overlay.classList.remove("cp-loader-show");
            overlay.setAttribute("aria-hidden", "true");
            setDocumentScrollLock(doc, false);
        });

        hideTimer = window.setTimeout(() => {
            hideTimer = null;
            if (typeof callback === "function") {
                callback();
            }
        }, TRANSITION_MS);
    }, delay);
}

export function cleanupLoader() {
    clearHideTimer();

    getKnownDocuments().forEach((doc) => {
        const overlay = doc.getElementById(LOADER_ID);
        if (overlay) {
            overlay.remove();
        }
        setDocumentScrollLock(doc, false);
    });
}

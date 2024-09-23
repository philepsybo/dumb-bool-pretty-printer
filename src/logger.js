export function logError(message) {
    const logArea = document.getElementById('logArea');
    if (logArea) {
        logArea.innerHTML += `<p class="logMessage errorMessage">${message}</p>`;
    }
}

export function logInfo(message) {
    const logArea = document.getElementById('logArea');
    if (logArea) {
        logArea.innerHTML += `<p class="logMessage infoMessage">${message}</p>`;
    }
}

export function logWarning(message) {
    const logArea = document.getElementById('logArea');
    if (logArea) {
        logArea.innerHTML += `<p class="logMessage warningMessage">${message}</p>`;
    }
}
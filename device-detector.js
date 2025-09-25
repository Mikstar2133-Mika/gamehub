// Device Detection und Auto-Redirect Algorithmus
class DeviceDetector {
    constructor() {
        this.userAgent = navigator.userAgent.toLowerCase();
        this.screenWidth = window.screen.width;
        this.screenHeight = window.screen.height;
        this.deviceType = this.detectDevice();
    }

    // Hauptfunktion zur Geräteerkennung
    detectDevice() {
        // Mobile Geräte erkennen
        if (this.isMobile()) {
            return 'mobile';
        }
        
        // Tablet erkennen
        if (this.isTablet()) {
            return 'tablet';
        }
        
        // Alles andere ist Desktop/Laptop
        return 'desktop';
    }

    // Mobile Gerät erkennen
    isMobile() {
        const mobileKeywords = [
            'android', 'webos', 'iphone', 'ipad', 'ipod', 
            'blackberry', 'windows phone', 'mobile'
        ];
        
        const hasMobileKeyword = mobileKeywords.some(keyword => 
            this.userAgent.includes(keyword)
        );
        
        // Zusätzliche Checks
        const hasSmallScreen = this.screenWidth <= 768;
        const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        return hasMobileKeyword || (hasSmallScreen && hasTouchSupport);
    }

    // Tablet erkennen
    isTablet() {
        const tabletKeywords = ['ipad', 'tablet', 'kindle', 'playbook', 'silk'];
        const hasTabletKeyword = tabletKeywords.some(keyword => 
            this.userAgent.includes(keyword)
        );
        
        // iPad spezielle Erkennung (moderne iPads geben sich als Desktop aus)
        const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
        
        // Bildschirmgröße-basierte Erkennung für Tablets
        const isTabletSize = this.screenWidth >= 768 && this.screenWidth <= 1024;
        const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        return hasTabletKeyword || isIPadOS || (isTabletSize && hasTouchSupport);
    }

    // Desktop/Laptop erkennen
    isDesktop() {
        return this.deviceType === 'desktop';
    }

    // Mobile oder Tablet (für h-Dateien)
    needsMobileVersion() {
        return this.deviceType === 'mobile' || this.deviceType === 'tablet';
    }

    // Auto-Redirect Logik
    autoRedirect() {
        const currentPath = window.location.pathname;
        const currentFile = currentPath.split('/').pop() || 'index.html';
        
        // Prüfe ob wir auf der richtigen Seite sind
        if (this.needsMobileVersion()) {
            // Mobile/Tablet User sollte auf h-Version sein
            if (!currentFile.startsWith('h')) {
                const mobileFile = 'h' + currentFile;
                console.log(`📱 Mobile/Tablet erkannt - Weiterleitung zu: ${mobileFile}`);
                window.location.href = mobileFile;
                return true;
            }
        } else {
            // Desktop User sollte auf normaler Version sein
            if (currentFile.startsWith('h')) {
                const desktopFile = currentFile.substring(1); // 'h' entfernen
                console.log(`💻 Desktop erkannt - Weiterleitung zu: ${desktopFile}`);
                window.location.href = desktopFile;
                return true;
            }
        }
        
        return false; // Keine Weiterleitung nötig
    }

    // Debug-Informationen
    getDebugInfo() {
        return {
            userAgent: this.userAgent,
            screenWidth: this.screenWidth,
            screenHeight: this.screenHeight,
            deviceType: this.deviceType,
            needsMobileVersion: this.needsMobileVersion(),
            hasTouchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            maxTouchPoints: navigator.maxTouchPoints || 0,
            platform: navigator.platform
        };
    }
}

// Globale Funktion für sofortige Verwendung
window.initDeviceDetection = function() {
    const detector = new DeviceDetector();
    
    // Debug-Info in Konsole (nur in Development)
    console.log('🔍 Device Detection:', detector.getDebugInfo());
    
    // Auto-Redirect ausführen
    const redirected = detector.autoRedirect();
    
    if (!redirected) {
        console.log(`✅ Richtige Seite für ${detector.deviceType} Gerät`);
    }
    
    return detector;
};

// Sofort ausführen wenn Seite lädt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initDeviceDetection);
} else {
    window.initDeviceDetection();
}
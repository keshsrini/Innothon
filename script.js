ydocument.addEventListener('DOMContentLoaded', function() {
    console.log('Web Design Tool for Visually Impaired is loaded');

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    let isListening = false;

    // Initialize text size adjustment
    initializeTextSizeAdjustment();

    // Haptic feedback function

    // Add event listeners for audio descriptions
    document.querySelectorAll('button, input, select').forEach(element => {
        element.addEventListener('focus', () => describeElement(element));
    });

    // Error handling with audio alert
    window.addEventListener('error', function(event) {
        announce('An error occurred: ' + event.message);
    });
    let hapticFeedbackEnabled = true;
    function vibrate(duration) {
        if (hapticFeedbackEnabled && 'vibrate' in navigator) {
            navigator.vibrate(duration);
        }
    }

    // Function to toggle haptic feedback
    function toggleHapticFeedback() {
        hapticFeedbackEnabled = !hapticFeedbackEnabled;
        announce(hapticFeedbackEnabled ? "Haptic feedback enabled" : "Haptic feedback disabled");
        if (hapticFeedbackEnabled) {
            vibrate(100);
        }
    }

    function toggleVoiceRecognition() {
        if (isListening) {
            recognition.stop();
            isListening = false;
            announce("Voice recognition stopped");
        } else {
            recognition.start();
            isListening = true;
            announce("Voice recognition started");
        }
        vibrate(75); // Add haptic feedback for voice recognition toggle
    }

    recognition.onresult = function(event) {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.trim().toLowerCase();
        console.log('Voice command received:', command);
        processVoiceCommand(command);
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        announce("Speech recognition error: " + event.error);
    };

    recognition.onend = function() {
        if (isListening) {
            recognition.start();
        }
    };

    // Start speech recognition
    toggleVoiceRecognition();

    function processVoiceCommand(command) {
        switch(command) {
            case 'add text':
                document.getElementById('add-text').click();
                announce("Text element added to the preview area");
                break;
            case 'add image':
                document.getElementById('add-image').click();
                announce("Image element added to the preview area");
            case 'add button':
                document.getElementById('add-button').click();
                announce("Button element added to the preview area");
                break;
                break;
            case 'add button':
                document.getElementById('add-button').click();
                announce("Button element added");
                vibrate(50);
                break;
            case 'toggle high contrast':
                document.getElementById('theme-selector').value = 'high-contrast';
                document.getElementById('theme-selector').dispatchEvent(new Event('change'));
                announce("High contrast mode toggled");
                vibrate(100);
                break;
            case 'toggle dark mode':
                document.getElementById('theme-selector').value = 'dark-mode';
                document.getElementById('theme-selector').dispatchEvent(new Event('change'));
                announce("Dark mode toggled");
                vibrate(100);
                break;
            case 'default theme':
                document.getElementById('theme-selector').value = 'default';
                document.getElementById('theme-selector').dispatchEvent(new Event('change'));
                announce("Default theme applied");
                vibrate(100);
                break;
            case 'read selection':
                const selectedText = window.getSelection().toString();
                if (selectedText) {
                    announce(selectedText);
                    vibrate(75);
                } else {
                    announce("No text selected");
                    vibrate([50, 50, 50]);
                }
                break;
            case 'toggle voice recognition':
                toggleVoiceRecognition();
                break;
            case 'list commands':
                announce("Available commands are: add text, add image, add button, toggle high contrast, toggle dark mode, default theme, read selection, toggle voice recognition, and list commands");
                break;
            default:
                console.log('Unknown command:', command);
                announce('Unknown command: ' + command);
        }
    }

    // Add keyboard shortcut for toggling voice recognition
    document.addEventListener('keydown', function(event) {
        if (event.altKey && event.key === 'v') {
            toggleVoiceRecognition();
        } else if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            // Simulating a save action
            announce('Changes saved successfully');
            vibrate(100);
        }
    });

    const body = document.body;
    const themeSelector = document.getElementById('theme-selector');
    const customColors = document.getElementById('custom-colors');
    const backgroundColorInput = document.getElementById('background-color');
    const textColorInput = document.getElementById('text-color');
    const accentColorInput = document.getElementById('accent-color');
    const applyCustomColorsBtn = document.getElementById('apply-custom-colors');

    const voiceSelect = document.getElementById('voice-select');
    const rateInput = document.getElementById('rate-input');
    const volumeInput = document.getElementById('volume-input');

    // Initialize TTS settings
    populateVoiceList();
    voiceSelect.addEventListener('change', () => {
        updateTTSSettings();
        vibrate(50); // Add haptic feedback for voice change
    });
    rateInput.addEventListener('input', () => {
        updateTTSSettings();
        vibrate(25); // Add haptic feedback for rate change
        announce(`Speech rate set to ${rateInput.value}`);
    });
    volumeInput.addEventListener('input', () => {
        updateTTSSettings();
        vibrate(25); // Add haptic feedback for volume change
        announce(`Speech volume set to ${volumeInput.value}`);
    });

    rateInput.addEventListener('focus', () => {
        announce(`Speech rate slider. Current value: ${rateInput.value}`);
    });
    volumeInput.addEventListener('focus', () => {
        announce(`Speech volume slider. Current value: ${volumeInput.value}`);
    });

    // Initial TTS settings update
    updateTTSSettings();
    const addTextBtn = document.getElementById('add-text');
    const addImageBtn = document.getElementById('add-image');
    const addButtonBtn = document.getElementById('add-button');
    const previewArea = document.getElementById('preview-area');
    previewArea.setAttribute('aria-live', 'polite');

    // Add haptic feedback to buttons
    [addTextBtn, addImageBtn, addButtonBtn].forEach(btn => {
        btn.addEventListener('click', () => vibrate(50));
    });

    // Color scheme switching
    themeSelector.addEventListener('change', (e) => {
        const selectedTheme = e.target.value;
        body.className = selectedTheme;
        if (selectedTheme === 'custom') {
            customColors.style.display = 'block';
        } else {
            customColors.style.display = 'none';
        }
        announce(selectedTheme + ' theme selected');
        vibrate(100); // Longer vibration for theme change
    });

    // Custom color scheme
    applyCustomColorsBtn.addEventListener('click', () => {
        const backgroundColor = backgroundColorInput.value;
        const textColor = textColorInput.value;
        const accentColor = accentColorInput.value;

        // Check contrast ratio
        if (getContrastRatio(backgroundColor, textColor) < 4.5) {
            announce('Warning: The selected colors may not have sufficient contrast for accessibility.');
            vibrate([100, 50, 100]); // Vibrate pattern for warning
            return;
        }

        body.style.backgroundColor = backgroundColor;
        body.style.color = textColor;
        document.querySelectorAll('button').forEach(button => {
            button.style.backgroundColor = accentColor;
            button.style.color = backgroundColor;
        });
        announce(`Custom colors applied. Background color: ${backgroundColor}, Text color: ${textColor}, Accent color: ${accentColor}`);
        vibrate(150); // Longer vibration for custom color application
    });

    // Haptic feedback toggle
    const toggleHapticFeedbackBtn = document.getElementById('toggle-haptic-feedback');
    toggleHapticFeedbackBtn.addEventListener('click', () => {
        toggleHapticFeedback();
        toggleHapticFeedbackBtn.setAttribute('aria-pressed', hapticFeedbackEnabled.toString());
    });

    // Function to calculate contrast ratio
    function getContrastRatio(color1, color2) {
        const luminance1 = getRelativeLuminance(color1);
        const luminance2 = getRelativeLuminance(color2);
        const lighter = Math.max(luminance1, luminance2);
        const darker = Math.min(luminance1, luminance2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    // Function to calculate relative luminance
    function getRelativeLuminance(color) {
        const rgb = parseInt(color.slice(1), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;
        const rsRGB = r / 255;
        const gsRGB = g / 255;
        const bsRGB = b / 255;
        const r1 = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
        const g1 = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
        const b1 = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
        return 0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1;
    }

    // Design tools
    addTextBtn.addEventListener('click', () => {
        const text = prompt('Enter your text:');
        if (text) {
            const p = document.createElement('p');
            p.textContent = text;
            p.setAttribute('tabindex', '0');
            p.setAttribute('role', 'region');
            p.setAttribute('aria-label', 'Added text: ' + text);
            previewArea.appendChild(p);
            announce('Text added to preview area: ' + text);
            p.focus();
        }
    });

    addImageBtn.addEventListener('click', () => {
        const src = prompt('Enter image URL:');
        if (src) {
            const img = document.createElement('img');
            img.src = src;
            img.alt = prompt('Enter image description:');
            img.setAttribute('tabindex', '0');
            img.setAttribute('role', 'img');
            previewArea.appendChild(img);
            announce('Image added to preview area with description: ' + img.alt);
            img.focus();
        }
    });

    addButtonBtn.addEventListener('click', () => {
        const text = prompt('Enter button text:');
        if (text) {
            const button = document.createElement('button');
            button.textContent = text;
            button.setAttribute('aria-label', text);
            previewArea.appendChild(button);
            announce('Button added to preview area with text: ' + text);
            button.focus();
        }
    });

    // Make preview area elements keyboard navigable
    previewArea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            if (e.target.tagName === 'BUTTON') {
                e.preventDefault();
                e.target.click();
            } else if (e.target.tagName === 'IMG') {
                e.preventDefault();
                announce('Image description: ' + e.target.alt);
            } else if (e.target.tagName === 'P') {
                e.preventDefault();
                announce('Text content: ' + e.target.textContent);
            }
        }
    });

    // Keyboard navigation
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableContent = document.querySelectorAll(focusableElements);
    const firstFocusableElement = focusableContent[0];
    const lastFocusableElement = focusableContent[focusableContent.length - 1];

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusableElement) {
                    firstFocusableElement.focus();
                    e.preventDefault();
                }
            }
        }

        // Shortcut keys for quick actions
        if (e.altKey) {
            switch (e.key) {
                case 't':
                    e.preventDefault();
                    addTextBtn.click();
                    break;
                case 'i':
                    e.preventDefault();
                    addImageBtn.click();
                    break;
                case 'b':
                    e.preventDefault();
                    addButtonBtn.click();
                    break;
                case 'c':
                    e.preventDefault();
                    themeSelector.focus();
                    break;
            }
        }
    });

    // Remove the dynamically added shortcut instructions as they are now in the HTML
    const existingShortcutInstructions = document.getElementById('shortcut-instructions');
    if (existingShortcutInstructions) {
        existingShortcutInstructions.remove();
    }

    // Ensure all interactive elements have proper focus indicators
    const interactiveElements = document.querySelectorAll('button, input, a, [tabindex]:not([tabindex="-1"])');
    interactiveElements.forEach(element => {
        element.addEventListener('focus', () => {
            element.classList.add('focus-visible');
        });
        element.addEventListener('blur', () => {
            element.classList.remove('focus-visible');
        });
    });

    // Text-to-speech functionality
    function initializeTextSizeAdjustment() {
    const slider = document.getElementById('text-size-slider');
    const value = document.getElementById('text-size-value');

    slider.addEventListener('input', () => {
        const size = slider.value;
        document.documentElement.style.fontSize = `${size}px`;
        value.textContent = `${size}px`;
        updateLayout();
        announce(`Text size changed to ${size} pixels`);
    });

    slider.addEventListener('focus', () => {
        announce(`Text size slider. Current value: ${slider.value} pixels`);
    });

    // Call updateLayout on window resize
    window.addEventListener('resize', updateLayout);

    // Initial call to set up the layout
    updateLayout();
}

function updateLayout() {
    // Recalculate sizes and adjust positioning of elements
    const previewArea = document.getElementById('preview-area');
    const designTools = document.getElementById('design-tools');

    // Adjust preview area height based on window size and text size
    const windowHeight = window.innerHeight;
    const previewTop = previewArea.getBoundingClientRect().top;
    previewArea.style.height = `${windowHeight - previewTop - 20}px`;

    // Adjust design tools button sizes
    const buttons = designTools.querySelectorAll('button');
    buttons.forEach(button => {
        button.style.height = `${button.offsetWidth}px`;
    });

    // Recalculate positions of draggable elements in the preview area
    const draggableElements = previewArea.querySelectorAll('.draggable');
    draggableElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        element.style.left = `${(rect.left / previewArea.offsetWidth) * 100}%`;
        element.style.top = `${(rect.top / previewArea.offsetHeight) * 100}%`;
    });

    announce('Layout updated');
}

function announce(message, voice = null, rate = 1, volume = 1) {
        const announcement = new SpeechSynthesisUtterance(message);
        if (voice) announcement.voice = voice;
        announcement.rate = rate;
        announcement.volume = volume;
        window.speechSynthesis.speak(announcement);
    }

    function describeElement(element) {
        let description = '';
        if (element.tagName === 'BUTTON') {
            description = `Button: ${element.textContent}`;
        } else if (element.tagName === 'INPUT') {
            if (element.type === 'range') {
                description = `${element.id} slider: ${element.value}`;
            } else {
                description = `${element.type} input: ${element.value}`;
            }
        } else if (element.tagName === 'SELECT') {
            description = `Dropdown: ${element.options[element.selectedIndex].text}`;
        } else {
            description = element.textContent;
        }
        announce(description);
    }

    // TTS settings
    let currentVoice = null;
    let currentRate = 1;
    let currentVolume = 1;

    function updateTTSSettings() {
        const voices = window.speechSynthesis.getVoices();
        const voiceSelect = document.getElementById('voice-select');
        const rateInput = document.getElementById('rate-input');
        const volumeInput = document.getElementById('volume-input');

        currentVoice = voices[voiceSelect.selectedIndex];
        currentRate = parseFloat(rateInput.value);
        currentVolume = parseFloat(volumeInput.value);
    }

    function populateVoiceList() {
        const voices = window.speechSynthesis.getVoices();
        const voiceSelect = document.getElementById('voice-select');

        voices.forEach((voice, i) => {
            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})`;
            option.setAttribute('data-lang', voice.lang);
            option.setAttribute('data-name', voice.name);
            voiceSelect.appendChild(option);
        });
    }

    // Populate voice list when voices change
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    // Read selected text
    document.addEventListener('mouseup', function() {
        const selectedText = window.getSelection().toString();
        if (selectedText) {
            announce(selectedText, currentVoice, currentRate, currentVolume);
        }
    });

    // Initial announcement
    announce('Web Design Tool for Visually Impaired Users loaded. Use tab to navigate and enter to select. Voice commands are now active. Say "list commands" to hear available voice commands.');
});
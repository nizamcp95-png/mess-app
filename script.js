const quotes = [
    "வீழ்வது நாமாயினும் வாழ்வது தமிழாகட்டும்!",
    "என் உயிர் நிகர் உடன்பிறப்புகளே!",
    "மக்களிடம் செல், அவர்களோடு வாழ்!",
    "உழைப்போம்! உயர்வோம்!",
    "நம்மால் முடியும் தம்பி!",
    "வாழும் காலத்தில் வரலாற்றைப் படைப்போம்!"
];

let tamilVoice = null;
let isSpeaking = false;
let voicesLoaded = false;

// Initialize voices when page loads
function initVoices() {
    const voices = window.speechSynthesis.getVoices();
    
    if (voices.length === 0) {
        console.log('Voices not loaded yet, will retry...');
        return;
    }
    
    voicesLoaded = true;
    
    // Try to find Tamil voice (ta-IN, ta, or any voice with 'ta' in language code)
    tamilVoice = voices.find(voice => 
        voice.lang.toLowerCase().includes('ta') || 
        voice.name.toLowerCase().includes('tamil')
    );
    
    // If no Tamil voice found, use default
    if (!tamilVoice && voices.length > 0) {
        tamilVoice = voices[0];
    }
    
    console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
    if (tamilVoice) {
        console.log('Using voice:', tamilVoice.name, tamilVoice.lang);
    } else {
        console.log('No Tamil voice found, will use default');
    }
}

// Load voices when they become available
if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = initVoices;
}

// Also try to load immediately
initVoices();

// Make functions globally accessible
window.newQuote = function() {
    // Stop any ongoing speech
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        updateSpeakButton();
    }
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    document.getElementById('quote').innerText = quotes[randomIndex];
};

window.speakQuote = function() {
    const text = document.getElementById('quote').innerText;
    const speakBtn = document.getElementById('speakBtn');
    
    // If already speaking, stop it
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        updateSpeakButton();
        return;
    }
    
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
        alert('Text-to-speech is not supported in your browser.');
        return;
    }
    
    // Ensure voices are loaded (retry if needed)
    if (!voicesLoaded) {
        initVoices();
        // If still not loaded, wait a bit
        if (!voicesLoaded) {
            setTimeout(() => {
                initVoices();
                attemptSpeak(text);
            }, 1000);
            return;
        }
    }
    
    attemptSpeak(text);
};

function attemptSpeak(text) {
    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();
    
    // Wait a moment for cancellation to complete
    setTimeout(() => {
        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set language to Tamil
        utterance.lang = 'ta-IN';
        
        // Reload voices to ensure we have the latest
        const voices = window.speechSynthesis.getVoices();
        const currentTamilVoice = voices.find(voice => 
            voice.lang.toLowerCase().includes('ta') || 
            voice.name.toLowerCase().includes('tamil')
        ) || (voices.length > 0 ? voices[0] : null);
        
        // Use Tamil voice if available
        if (currentTamilVoice) {
            utterance.voice = currentTamilVoice;
            console.log('Speaking with voice:', currentTamilVoice.name);
        } else {
            console.log('Using default voice');
        }
        
        // Adjust speech parameters to mimic Kalaignar's style
        utterance.rate = 0.85;  // Slightly slower
        utterance.pitch = 0.9;  // Slightly lower pitch
        utterance.volume = 1.0; // Full volume
        
        // Event handlers
        utterance.onstart = () => {
            isSpeaking = true;
            updateSpeakButton();
            console.log('Speech started');
        };
        
        utterance.onend = () => {
            isSpeaking = false;
            updateSpeakButton();
            console.log('Speech ended');
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            isSpeaking = false;
            updateSpeakButton();
            alert('Error playing voice: ' + (event.error || 'Unknown error') + '. Please try again.');
        };
        
        // Speak
        try {
            window.speechSynthesis.speak(utterance);
            console.log('Speech synthesis initiated');
        } catch (error) {
            console.error('Error starting speech:', error);
            alert('Error starting voice. Please try again.');
        }
    }, 100);
}

function updateSpeakButton() {
    const speakBtn = document.getElementById('speakBtn');
    if (isSpeaking) {
        speakBtn.innerText = '⏸️ Stop';
        speakBtn.disabled = false;
    } else {
        speakBtn.innerText = '🔊 Listen';
        speakBtn.disabled = false;
    }
}

// Set initial quote when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.newQuote();
    
    // Retry loading voices multiple times (for Chrome)
    setTimeout(() => {
        initVoices();
    }, 500);
    
    setTimeout(() => {
        initVoices();
    }, 1500);
    
    setTimeout(() => {
        initVoices();
    }, 3000);
});

class WeatherChatbot {
    constructor(apiKey) {
        this.apiKey = apiKey;
        // Updated to use the correct Gemini API endpoint
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
    }

    async sendMessage(userMessage, weatherData = null) {
        try {
            // Create context about current weather if available
            let context = "You are a helpful weather assistant. ";
            
            if (weatherData) {
                const location = weatherData.location || "the current location";
                const weather = weatherData.weather;
                const forecast = weatherData.forecast;
                const pollution = weatherData.pollution;

                context += `Current weather information for ${location}:\n`;
                
                if (weather) {
                    context += `- Current temperature: ${weather.main.temp}°F\n`;
                    context += `- Feels like: ${weather.main.feels_like}°F\n`;
                    context += `- Condition: ${weather.weather[0].description}\n`;
                    context += `- Humidity: ${weather.main.humidity}%\n`;
                    context += `- Wind speed: ${weather.wind.speed} mph\n`;
                }
                
                if (pollution) {
                    context += `- Air Quality Index: ${pollution.list[0].main.aqi}/5\n`;
                }

                context += "\nUse this information to answer weather-related questions. Be friendly and helpful. Keep responses concise and conversational.";
            } else {
                context += "The user hasn't loaded weather data yet. Suggest they load location and weather data first to get specific information.";
            }

            const prompt = `${context}\n\nUser question: ${userMessage}`;

            console.log('Making request to:', `${this.baseUrl}?key=${this.apiKey.substring(0, 10)}...`);

            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                
                if (response.status === 400) {
                    throw new Error('Invalid API key or request format. Please check your Gemini API key.');
                } else if (response.status === 403) {
                    throw new Error('API key access denied. Make sure your key has the correct permissions.');
                } else if (response.status === 404) {
                    throw new Error('API endpoint not found. The Gemini API might have changed.');
                } else {
                    throw new Error(`Gemini API error: ${response.status} - ${response.statusText}`);
                }
            }

            const data = await response.json();
            console.log('API Response:', data);
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
                return data.candidates[0].content.parts[0].text;
            } else if (data.error) {
                throw new Error(`Gemini API Error: ${data.error.message}`);
            } else {
                throw new Error('No valid response from Gemini API');
            }

        } catch (error) {
            console.error('Chatbot error:', error);
            return `Sorry, I'm having trouble right now. ${error.message}`;
        }
    }

    getCurrentWeatherData() {
        // Gather current weather data from the global objects
        const weatherData = {};
        
        try {
            // Get location name
            if (typeof omGeocode !== 'undefined' && omGeocode.json) {
                weatherData.location = omGeocode.getName();
            }

            // Get current weather
            if (typeof omWeather !== 'undefined' && omWeather.json) {
                weatherData.weather = omWeather.json;
            }

            // Get forecast data
            if (typeof omForecast !== 'undefined' && omForecast.json) {
                weatherData.forecast = omForecast.json;
            }

            // Get pollution data
            if (typeof omPollution !== 'undefined' && omPollution.json) {
                weatherData.pollution = omPollution.json;
            }

            return Object.keys(weatherData).length > 0 ? weatherData : null;
        } catch (error) {
            console.error('Error gathering weather data:', error);
            return null;
        }
    }
}

// Global chatbot instance (will be initialized when API key is provided)
let weatherChatbot = null;

// Initialize chatbot with API key
function initializeChatbot(apiKey) {
    if (!apiKey || apiKey.trim() === '') {
        alert('Please enter a valid Gemini API key');
        return false;
    }
    
    weatherChatbot = new WeatherChatbot(apiKey.trim());
    document.getElementById('chat-input').disabled = false;
    document.getElementById('send-btn').disabled = false;
    document.getElementById('api-key-input').style.backgroundColor = '#d4edda';
    
    addChatMessage('Chatbot', 'Hi! I\'m your weather assistant. Ask me anything about the weather!', 'bot');
    return true;
}

// Add message to chat display
function addChatMessage(sender, message, type) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;
    
    const timestamp = new Date().toLocaleTimeString();
    messageDiv.innerHTML = `
        <div class="message-header">
            <strong>${sender}</strong>
            <span class="timestamp">${timestamp}</span>
        </div>
        <div class="message-content">${message.replace(/\n/g, '<br>')}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send user message to chatbot
async function sendChatMessage() {
    const chatInput = document.getElementById('chat-input');
    const userMessage = chatInput.value.trim();
    
    if (!userMessage) return;
    
    if (!weatherChatbot) {
        alert('Please enter your Gemini API key first');
        return;
    }

    // Add user message to chat
    addChatMessage('You', userMessage, 'user');
    chatInput.value = '';

    // Show typing indicator
    addChatMessage('Chatbot', 'Typing...', 'bot typing');

    try {
        // Get current weather data
        const weatherData = weatherChatbot.getCurrentWeatherData();
        
        // Send to Gemini
        const response = await weatherChatbot.sendMessage(userMessage, weatherData);
        
        // Remove typing indicator
        const chatMessages = document.getElementById('chat-messages');
        const lastMessage = chatMessages.lastElementChild;
        if (lastMessage && lastMessage.classList.contains('typing')) {
            lastMessage.remove();
        }
        
        // Add bot response
        addChatMessage('Chatbot', response, 'bot');
        
    } catch (error) {
        // Remove typing indicator
        const chatMessages = document.getElementById('chat-messages');
        const lastMessage = chatMessages.lastElementChild;
        if (lastMessage && lastMessage.classList.contains('typing')) {
            lastMessage.remove();
        }
        
        addChatMessage('Chatbot', 'Sorry, I encountered an error. Please try again.', 'bot error');
    }
}

// Handle Enter key in chat input
function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

// Handle Enter key in API key input
function handleApiKeyPress(event) {
    if (event.key === 'Enter') {
        const apiKey = document.getElementById('api-key-input').value;
        initializeChatbot(apiKey);
    }
}

// Toggle API key visibility
function toggleApiKeyVisibility() {
    const apiKeyInput = document.getElementById('api-key-input');
    const toggleButton = document.getElementById('toggle-api-key');
    
    if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        toggleButton.innerHTML = '🙈'; // Hide icon
        toggleButton.title = 'Hide API Key';
    } else {
        apiKeyInput.type = 'password';
        toggleButton.innerHTML = '👁️'; // Show icon
        toggleButton.title = 'Show API Key';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const userInfoForm = document.getElementById('user-info-form');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html'; // Default to index.html if path is empty

    // Check if user data exists and redirect to dashboard if on index page
    if (currentPage === 'index.html') {
        const userData = localStorage.getItem('userData');
        if (userData) {
            window.location.href = 'dashboard.html';
            return; // Stop further execution on this page
        }
    } else { // For all other pages, if no user data, redirect to index
        const userData = localStorage.getItem('userData');
        if (!userData && currentPage !== 'index.html') { // Ensure we are not already on index.html
            // alert('No user data found. Redirecting to start page.'); // Optional: for debugging
            window.location.href = 'index.html';
            return;
        }
    }


    if (userInfoForm) {
        userInfoForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const age = parseInt(document.getElementById('age').value);
            const sex = document.getElementById('sex').value;

            if (isNaN(age) || age < 5) {
                alert('Please enter a valid age (must be 5 or older).');
                return;
            }

            const userData = {
                name: name.trim() || 'Explorer', // Use 'Explorer' if name is empty or just spaces
                age: age,
                sex: sex,
                ageGroup: getAgeGroup(age)
            };

            localStorage.setItem('userData', JSON.stringify(userData));
            window.location.href = 'dashboard.html';
        });
    }

    // Page-specific initializations
    switch (currentPage) {
        case 'dashboard.html':
            loadDashboard();
            break;
        case 'chatbot.html':
            initChatbot();
            break;
        case 'roleplay.html':
            initRoleplay();
            break;
        case 'talksim.html':
            initTalkSim();
            break;
        case 'stories.html':
            initStories();
            break;
        case 'learn.html':
            initLearn();
            break;
    }

    // Universal "Start Over" link handler for dashboard
    if (currentPage === 'dashboard.html') {
        const startOverLink = document.querySelector('a.start-over-link');
        if (startOverLink) {
            startOverLink.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('userData');
                window.location.href = 'index.html';
            });
        }
    }
});

function getAgeGroup(age) {
    if (age >= 5 && age <= 10) return 'Kids';
    if (age >= 11 && age <= 17) return 'Teens';
    if (age >= 18 && age <= 24) return 'Young Adults';
    if (age >= 25) return 'Adults';
    return 'Unknown';
}

function loadDashboard() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) { // Should be caught by initial check, but good for safety
        window.location.href = 'index.html';
        return;
    }

    const greetingElement = document.getElementById('user-greeting');
    const ageGroupElement = document.getElementById('user-age-group');

    if (greetingElement) greetingElement.textContent = `Hello, ${userData.name}!`;
    if (ageGroupElement) ageGroupElement.textContent = `Content tailored for ${userData.ageGroup}`;

    const optionsContainer = document.getElementById('dashboard-options');
    if (!optionsContainer) return;
    optionsContainer.innerHTML = ''; // Clear loading placeholders

    let availableFeatures = [];
    // PRD Features: Chatbot, Roleplay, Talk Sim, Stories, Learn
    switch (userData.ageGroup) {
        case 'Kids': // 5-10
            availableFeatures = [
                { id: 'chatbot', name: 'Chat with Bot', description: 'Ask basic questions about your body and feelings.', page: 'chatbot.html' },
                { id: 'stories', name: 'Interactive Stories', description: 'Read fun stories about friendship and safety.', page: 'stories.html' },
                { id: 'learn', name: 'Learn about Growing Up', description: 'Discover simple facts about your body.', page: 'learn.html' }
            ];
            break;
        case 'Teens': // 11-17
            availableFeatures = [
                { id: 'chatbot', name: 'Chat with Bot', description: 'Ask about puberty, relationships, and more.', page: 'chatbot.html' },
                { id: 'roleplay', name: 'Roleplay Scenarios', description: 'Practice handling tricky situations with friends or online.', page: 'roleplay.html' },
                { id: 'talksim', name: 'Talk Simulator', description: 'Practice important conversations (e.g., with parents, friends).', page: 'talksim.html' },
                { id: 'stories', name: 'Interactive Stories', description: 'Explore stories about decisions and feelings.', page: 'stories.html' },
                { id: 'learn', name: 'Learn In-Depth', description: 'Get info on puberty, consent, and healthy habits.', page: 'learn.html' }
            ];
            break;
        case 'Young Adults': // 18-24
        case 'Adults': // 25+
            availableFeatures = [
                { id: 'chatbot', name: 'Chat with Bot', description: 'Discuss sexual health, relationships, and consent.', page: 'chatbot.html' },
                { id: 'roleplay', name: 'Roleplay Scenarios', description: 'Navigate complex social and relationship dynamics.', page: 'roleplay.html' },
                { id: 'talksim', name: 'Talk Simulator', description: 'Practice conversations on consent, STIs, and boundaries.', page: 'talksim.html' },
                { id: 'stories', name: 'Interactive Stories', description: 'Reflect on mature themes in relationships and life.', page: 'stories.html' },
                { id: 'learn', name: 'Comprehensive Learning', description: 'Access detailed info on sexual health and well-being.', page: 'learn.html' }
            ];
            break;
    }

    availableFeatures.forEach(feature => {
        const card = document.createElement('div');
        card.className = 'option-card';
        // Add animation delay for staggered effect
        card.style.animationDelay = `${availableFeatures.indexOf(feature) * 0.1}s`;
        card.innerHTML = `<h3>${feature.name}</h3><p>${feature.description}</p>`;
        card.addEventListener('click', () => {
            window.location.href = feature.page;
        });
        optionsContainer.appendChild(card);
    });
}

// --- GEMINI API CONFIGURATION ---
// IMPORTANT: For development only. In a production environment, this key should be handled securely on a backend.
const GEMINI_API_KEY = 'AIzaSyD4xwKx3T0DrB19pdjfAuK8ezrf2bXkVY4';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;


async function getGeminiResponse(prompt, age, ageGroup, expectJson = false, isIndianContext = true) {
    console.log(`Sending to Gemini: Age: ${age}, Group: ${ageGroup}, Prompt: ${prompt}, JSON Expected: ${expectJson}, Indian Context: ${isIndianContext}`);

    let systemInstruction = `You are "Sahayak," a helpful, empathetic, and friendly AI assistant for "Beyond Whispers," a sex education platform designed for an Indian audience.
Your responses MUST be age-appropriate, respectful, medically accurate, and culturally sensitive to diverse Indian contexts (e.g., family structures, common English usage by Indians, respecting various cultural norms while promoting health and safety).
You must avoid explicit content unless specifically appropriate for the user's age group and the educational context. Be mindful of privacy and encourage users to talk to trusted adults for serious concerns.
You can decline questions that are highly inappropriate for the age group or are far outside the scope of health, relationships, and personal development education.
If declining, do so politely and suggest a more appropriate way to ask or a different topic.
When generating content like stories or scenarios, try to incorporate elements or names that might be familiar or relatable within an Indian context, without stereotyping.
Ensure inclusivity for all genders and sexual orientations in your explanations and examples, especially for older age groups.
If a user's query seems to indicate distress or risk, gently suggest they speak to a trusted adult, counselor, or helpline, and you can provide generic information about seeking help if appropriate.
For younger users, always simplify complex topics. For older users, you can be more comprehensive but maintain clarity.`;

    switch (ageGroup) {
        case 'Kids': // 5-10
            systemInstruction += `
            The user is a child aged ${age}. Use very simple language, like talking to a young friend. Focus on basic body awareness (e.g., "private parts are private"), personal safety (e.g., "good touch, bad touch," "stranger danger"), naming body parts correctly (e.g., penis, vagina, chest), understanding feelings, and friendship.
            Avoid complex topics like sexual intercourse or STIs. If asked directly in a very simple way, provide a very high-level, non-graphic, and child-friendly explanation (e.g., "Babies grow in a special safe place inside a grown-up woman's body called the uterus.").
            Use relatable examples from a child's life in India (e.g., playing with friends, family, school).
            Emphasize that it's okay to ask questions and to talk to a trusted grown-up like a parent or teacher.`;
            break;
        case 'Teens': // 11-17
            systemInstruction += `
            The user is a teenager aged ${age}. You can discuss topics like puberty (physical and emotional changes), menstruation, hygiene, body image, healthy friendships and relationships (including respect and boundaries), consent (what it means and why it's important), peer pressure, online safety, and an introduction to contraception and STIs in an informative, factual, and non-judgmental way.
            Use clear, straightforward language. Avoid overly explicit details unless necessary for clarity and medical accuracy.
            Encourage responsible behavior, critical thinking, and open communication with trusted adults.
            Acknowledge common concerns and questions Indian teenagers might have (e.g., navigating cultural expectations, academic pressure alongside personal development).`;
            break;
        case 'Young Adults': // 18-24
            systemInstruction += `
            The user is a young adult aged ${age}. You can discuss all topics relevant to teens in more depth, plus more comprehensive information on sexual health (including STIs/HIV prevention and testing, contraception methods), healthy romantic relationships, consent in various contexts (including intimate relationships), understanding different sexual orientations and gender identities, family planning, and reproductive health.
            Assume a higher level of maturity. Address topics openly and factually.
            Be mindful of the diverse experiences of young adults in India, including those in education, starting careers, or considering marriage.`;
            break;
        case 'Adults': // 25+
            systemInstruction += `
            The user is an adult aged ${age}. You can discuss all topics relevant to young adults, with the understanding that they may have more complex questions related to long-term relationships, sexual health throughout life, intimacy, marriage, parenting (how to talk to children about these topics), menopause, and common sexual health concerns.
            Provide comprehensive, nuanced information. Be respectful of diverse life choices and experiences.`;
            break;
    }
     if (expectJson) {
        systemInstruction += `\nCRITICAL: Your entire response MUST be a single, valid JSON object. Do not include any explanatory text, greetings, or markdown formatting like \`\`\`json or \`\`\` before or after the JSON object. The response should start with "{" and end with "}". Ensure all keys and string values are in double quotes.`;
    }


    const requestBody = {
        contents: [{
            role: "user", // Gemini API prefers 'user' and 'model' roles for multi-turn, but for single generation, this is fine.
            parts: [
                { text: prompt }
            ]
        }],
        systemInstruction: { // Using the dedicated system_instruction field
            parts: [
                { text: systemInstruction }
            ]
        },
        generationConfig: {
            temperature: expectJson ? 0.3 : 0.7, // Lower temp for more predictable JSON
            topK: expectJson ? 10 : 40, // Adjusted topK
            topP: expectJson ? 0.9 : 0.95, // Adjusted topP
            maxOutputTokens: expectJson ? 4096 : 2048, // Generous for JSON, standard for text
            // responseMimeType: expectJson ? "application/json" : "text/plain", // Enable this if model supports it well
        }
    };
     // If expectJson is true, and the model supports it directly, use responseMimeType
    if (expectJson) {
        // Some models work better if this is set, others might not parse it correctly if the output isn't perfect.
        // Test this carefully. For now, we'll rely on prompt engineering for JSON.
        // requestBody.generationConfig.responseMimeType = "application/json";
    }


    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API Error Details:', errorData);
            let errorMessage = `API Error: ${response.status}`;
            if (errorData.error && errorData.error.message) {
                errorMessage += ` - ${errorData.error.message}`;
            }
            // Check for specific error codes or messages if needed
            if (response.status === 429) { // Rate limit
                errorMessage += " You might be making too many requests. Please wait a bit and try again.";
            } else if (errorData.error?.details?.[0]?.reason === "SAFETY") {
                 errorMessage += " The request was blocked due to safety settings. Please rephrase your query.";
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content || !data.candidates[0].content.parts || data.candidates[0].content.parts.length === 0) {
            console.warn('Gemini API - No valid content in response:', data);
            throw new Error('No response candidates received from API or response structure is invalid.');
        }

        let responseText = data.candidates[0].content.parts[0].text;
        // console.log("Raw Gemini Response Text:", responseText);


        if (expectJson) {
            // Aggressively clean the response to get to the JSON
            // Remove markdown code blocks if present
            responseText = responseText.trim();
            if (responseText.startsWith("```json")) {
                responseText = responseText.substring(7); // Remove ```json
                if (responseText.endsWith("```")) {
                    responseText = responseText.substring(0, responseText.length - 3);
                }
            } else if (responseText.startsWith("```")) {
                 responseText = responseText.substring(3); // Remove ```
                if (responseText.endsWith("```")) {
                    responseText = responseText.substring(0, responseText.length - 3);
                }
            }
            responseText = responseText.trim(); // Trim again after stripping


            try {
                // Before parsing, ensure it looks like JSON
                if (!responseText.startsWith('{') || !responseText.endsWith('}')) {
                    console.error('Cleaned response text does not form a complete JSON object:', responseText);
                    throw new Error('Processed response is not a complete JSON object.');
                }
                JSON.parse(responseText); // This will throw an error if invalid
                return responseText; // Return the stringified JSON
            } catch (e) {
                console.error('Failed to parse JSON response after cleaning:', responseText, e);
                throw new Error(`Invalid JSON response from API: ${e.message}. Original text: ${responseText.substring(0,100)}...`);
            }
        }
        return responseText.trim();

    } catch (error) {
        console.error('Error in getGeminiResponse:', error);
        // Provide a more user-friendly error message if possible
        if (error.message.includes("API Error")) {
            throw error; // Re-throw API specific errors
        }
        throw new Error('Could not connect to the AI assistant or process the response. Please check your connection and try again.');
    }
}


// --- Chatbot Specific Functions ---
function initChatbot() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    // No early return for userData check, as it's handled globally

    // DECLARE lastBotMessageDiv HERE, at the top of its scope
    let lastBotMessageDiv = null;

    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');

    if (!chatContainer || !chatInput || !sendChatBtn) return;

    // Now it's safe to call displayBotMessage which uses lastBotMessageDiv
    displayBotMessage(`Namaste ${userData.name}! I'm Sahayak, your friendly helper. How can I assist you today? I'll provide information suitable for the ${userData.ageGroup} age group, keeping Indian contexts in mind.`);

    sendChatBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => e.key === 'Enter' && sendMessage());

    async function sendMessage() {
        const messageText = chatInput.value.trim();
        if (messageText === '') return;

        displayUserMessage(messageText);
        chatInput.value = '';
        chatInput.disabled = true;
        sendChatBtn.disabled = true;
        displayBotMessage("Sahayak is thinking...", true); // true for temporary message

        try {
            const botResponse = await getGeminiResponse(messageText, userData.age, userData.ageGroup, false, true);
            updateBotMessage(botResponse);
        } catch (error) {
            console.error('Error getting Gemini response for chatbot:', error);
            updateBotMessage(`I'm sorry, ${userData.name}, I encountered an issue: ${error.message}. Could you please try rephrasing or asking again in a moment?`);
        } finally {
            chatInput.disabled = false;
            sendChatBtn.disabled = false;
            chatInput.focus();
        }
    }

    function displayUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message user-message';
        messageDiv.textContent = message;
        chatContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    // 'lastBotMessageDiv' is now declared above, so this function can safely access it
    function displayBotMessage(message, isTemporary = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message bot-message';
        messageDiv.textContent = message; // Text content for security
        chatContainer.appendChild(messageDiv);
        if (isTemporary) {
            lastBotMessageDiv = messageDiv; // Store reference to temporary message
        } else {
            lastBotMessageDiv = null; // Clear reference if it's a final message
        }
        scrollToBottom();
    }

    function updateBotMessage(newMessage) {
        if (lastBotMessageDiv) {
            lastBotMessageDiv.textContent = newMessage; // Update existing temporary message
            lastBotMessageDiv = null; // It's now a final message
        } else {
            displayBotMessage(newMessage); // Or display as new if no temp message exists
        }
        scrollToBottom();
    }

    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}


// --- Roleplay Feature Functions ---
let currentRoleplayScenario = null;

async function fetchAndDisplayRoleplayScenario(userData) {
    const scenarioTextElement = document.getElementById('scenario-text');
    const choicesContainer = document.getElementById('roleplay-choices-container');
    const feedbackContainer = document.getElementById('roleplay-feedback-container');
    const nextScenarioBtn = document.getElementById('next-scenario-btn');

    if (!scenarioTextElement || !choicesContainer || !feedbackContainer || !nextScenarioBtn) return;

    scenarioTextElement.textContent = 'Generating a new scenario for you...';
    scenarioTextElement.classList.add('loading-placeholder');
    choicesContainer.innerHTML = '';
    feedbackContainer.style.display = 'none';
    nextScenarioBtn.style.display = 'none';

    const prompt = `Generate a short, interactive roleplay scenario suitable for a user in the '${userData.ageGroup}' age group (age ${userData.age}).
The scenario should present a situation relevant to Indian youth/children and offer 2-3 distinct choices.
Consider common experiences like peer interactions, family discussions, or online situations. Use relatable Indian names or contexts where appropriate, without stereotyping.
Format the output as a JSON object with EXACTLY these three keys: "scenario" (string), "choices" (array of 2-3 strings), and "idealChoiceIndex" (integer, 0-indexed, indicating which choice leads to the best outcome or learning).
Example for Teens (Indian context): {"scenario": "Your cousin, Riya, is being teased online by some classmates after posting a picture. She seems upset but tells you not to tell anyone. What do you do?", "choices": ["Ignore it, it's not your business.", "Talk to Riya privately and encourage her to tell a trusted adult, offering to go with her.", "Confront the classmates online yourself."], "idealChoiceIndex": 1}
Example for Kids (Indian context): {"scenario": "You are playing in the park. An older person you don't know well, who lives nearby, offers you a chocolate to come to their house and see their new puppy. What do you do?", "choices": ["Take the chocolate and go with them.", "Say 'No, thank you' loudly, run to your parents or the adult you are with, and tell them.", "Politely say no and continue playing."], "idealChoiceIndex": 1}
CRITICAL: Your entire response MUST be a single, valid JSON object. Do not include any explanatory text, greetings, or markdown formatting like \`\`\`json or \`\`\` before or after the JSON object. The response should start with "{" and end with "}".`;

    try {
        const responseText = await getGeminiResponse(prompt, userData.age, userData.ageGroup, true, true);
        currentRoleplayScenario = JSON.parse(responseText);

        if (!currentRoleplayScenario.scenario || !Array.isArray(currentRoleplayScenario.choices) || typeof currentRoleplayScenario.idealChoiceIndex !== 'number' || currentRoleplayScenario.choices.length < 2) {
            throw new Error('Invalid scenario format received from AI.');
        }
        scenarioTextElement.classList.remove('loading-placeholder');
        scenarioTextElement.textContent = currentRoleplayScenario.scenario;

        currentRoleplayScenario.choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.textContent = choice;
            button.onclick = () => handleRoleplayChoice(index, userData);
            choicesContainer.appendChild(button);
        });

    } catch (error) {
        console.error('Error in fetchAndDisplayRoleplayScenario:', error);
        scenarioTextElement.classList.remove('loading-placeholder');
        scenarioTextElement.textContent = `Sorry, an error occurred: ${error.message}. Try generating a new scenario.`;
        nextScenarioBtn.textContent = "Try Again";
        nextScenarioBtn.style.display = 'block';
        nextScenarioBtn.onclick = () => fetchAndDisplayRoleplayScenario(userData); // Make it retry
    }
}

async function handleRoleplayChoice(choiceIndex, userData) {
    const feedbackContainer = document.getElementById('roleplay-feedback-container');
    const feedbackTextElement = document.getElementById('feedback-text');
    const choicesContainer = document.getElementById('roleplay-choices-container');
    const nextScenarioBtn = document.getElementById('next-scenario-btn');

    if (!feedbackContainer || !feedbackTextElement || !choicesContainer || !nextScenarioBtn || !currentRoleplayScenario) return;

    choicesContainer.innerHTML = '<p><em>You made your choice. Awaiting feedback...</em></p>'; // Clear choices, show message
    feedbackContainer.style.display = 'block';
    feedbackTextElement.textContent = 'Analyzing your choice...';
    feedbackTextElement.classList.add('loading-placeholder');


    const userChoiceText = currentRoleplayScenario.choices[choiceIndex];
    const idealChoiceText = currentRoleplayScenario.choices[currentRoleplayScenario.idealChoiceIndex];

    const feedbackPrompt = `The user (age ${userData.age}, group '${userData.ageGroup}') was presented with the scenario: "${currentRoleplayScenario.scenario}".
They chose: "${userChoiceText}".
The ideal choice was: "${idealChoiceText}".
Provide brief (1-3 sentences), constructive, and age-appropriate feedback in a supportive tone, keeping Indian cultural nuances in mind if relevant to the scenario.
If their choice was good, affirm it and briefly explain why. If it was not ideal, gently explain why and what a better approach might be, possibly referencing the ideal choice.
Focus on the learning aspect.
Format the output as a JSON object with a single key: "feedback" (string).
CRITICAL: Your entire response MUST be a single, valid JSON object. Do not include any explanatory text, greetings, or markdown formatting like \`\`\`json or \`\`\` before or after the JSON object. The response should start with "{" and end with "}".`;

    try {
        const responseText = await getGeminiResponse(feedbackPrompt, userData.age, userData.ageGroup, true, true);
        const parsedFeedback = JSON.parse(responseText);
        feedbackTextElement.classList.remove('loading-placeholder');

        if (parsedFeedback && parsedFeedback.feedback) {
            feedbackTextElement.textContent = parsedFeedback.feedback;
        } else {
            throw new Error("Feedback received from AI was not in the expected format.");
        }
        nextScenarioBtn.textContent = "Next Scenario";
        nextScenarioBtn.style.display = 'block';
        nextScenarioBtn.onclick = () => fetchAndDisplayRoleplayScenario(userData);
    } catch (error) {
        console.error('Error getting feedback:', error);
        feedbackTextElement.classList.remove('loading-placeholder');
        feedbackTextElement.textContent = `Could not get feedback: ${error.message}. Please try the next scenario.`;
        nextScenarioBtn.textContent = "Next Scenario";
        nextScenarioBtn.style.display = 'block';
        nextScenarioBtn.onclick = () => fetchAndDisplayRoleplayScenario(userData);
    }
}

function initRoleplay() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    // No early return for userData check

    const greetingElement = document.getElementById('roleplay-greeting');
    if (greetingElement) greetingElement.textContent = `Roleplay Scenarios for ${userData.ageGroup}`;

    fetchAndDisplayRoleplayScenario(userData);
}

// --- START OF TALK SIMULATOR CODE BLOCK ---

// --- Talk Simulator Functions ---
let currentTalkSimTopic = '';
let currentTalkSimQualities = ''; // Store qualities
let conversationHistory = []; // This should be fine as is

function initTalkSim() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    // Ensure userData is loaded, though global checks should handle this
    if (!userData) {
        console.error("User data not found in initTalkSim. Redirecting.");
        window.location.href = 'index.html'; // Or handle appropriately
        return;
    }

    const greetingElement = document.getElementById('talksim-greeting');
    if (greetingElement) greetingElement.textContent = `Talk Simulator for ${userData.ageGroup}`;

    setupTalkSimInteractions(userData);
}

function setupTalkSimInteractions(userData) {
    const topicSelectionDiv = document.getElementById('talksim-topic-selection');
    const qualitiesInputAreaDiv = document.getElementById('talksim-qualities-input-area');
    const qualitiesPromptHeading = document.getElementById('qualities-prompt-heading');
    const qualitiesTextarea = document.getElementById('talksim-qualities');
    const startWithQualitiesBtn = document.getElementById('start-simulation-with-qualities-btn');

    const conversationAreaDiv = document.getElementById('talksim-conversation-area');
    const restartBtn = document.getElementById('restart-talksim-btn');
    const userTalkSimInput = document.getElementById('user-talksim-input');
    const sendTalkSimResponseBtn = document.getElementById('send-talksim-response-btn');
    const aiCurrentLineDiv = document.getElementById('ai-current-line');
    const conversationLog = document.getElementById('conversation-log');
    const conversationTopicDisplay = document.getElementById('conversation-topic-display');


    if (!topicSelectionDiv || !qualitiesInputAreaDiv || !qualitiesPromptHeading || !qualitiesTextarea || !startWithQualitiesBtn ||
        !conversationAreaDiv || !restartBtn || !userTalkSimInput || !sendTalkSimResponseBtn || !aiCurrentLineDiv || !conversationLog || !conversationTopicDisplay) {
        console.error("One or more TalkSim elements are missing from the DOM. Check IDs in talksim.html and script.js.");
        // Display a user-friendly error on the page if possible
        if (topicSelectionDiv) { // Check if at least the main container exists
            topicSelectionDiv.innerHTML = "<p class='error-message'>Sorry, the Talk Simulator could not be initialized due to a missing page element. Please try refreshing or contact support if the issue persists.</p>";
        }
        return;
    }

    // --- Dynamically build topic buttons to ensure correct state ---
    topicSelectionDiv.innerHTML = `<p>Who would you like to simulate a conversation with?</p>`; // Clear and add prompt

    const baseTopics = [
        { topic: "parent", text: "A Parent/Guardian" },
        { topic: "partner", text: "A Partner" },
        { topic: "friend", text: "A Friend" },
        { topic: "teacher", text: "A Teacher" }
    ];

    baseTopics.forEach(item => {
        const button = document.createElement('button');
        button.dataset.topic = item.topic;
        button.textContent = item.text;
        topicSelectionDiv.appendChild(button);
    });

    if (userData.ageGroup === 'Adults' || userData.ageGroup === 'Young Adults') {
        const talkToChildButton = document.createElement('button');
        talkToChildButton.dataset.topic = 'child';
        talkToChildButton.textContent = 'A Child (Practice Answering)';
        topicSelectionDiv.appendChild(talkToChildButton);
    }
    // --- End of dynamic button building ---


    // Event listeners for topic selection buttons
    topicSelectionDiv.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            currentTalkSimTopic = button.dataset.topic;
            topicSelectionDiv.style.display = 'none';
            if (currentTalkSimTopic === 'child') {
                qualitiesPromptHeading.textContent = `Describe the approximate age or developmental stage of the child you want to simulate talking to (e.g., 'curious 7-year-old', 'pre-teen asking about puberty', 'young child asking where babies come from'):`;
            } else {
                qualitiesPromptHeading.textContent = `Describe the ${currentTalkSimTopic.toLowerCase()} you want to talk to (e.g., 'strict but usually fair', 'very understanding', 'a bit worried'):`;
            }
            qualitiesTextarea.value = ''; // Clear previous qualities
            qualitiesInputAreaDiv.style.display = 'block';
            qualitiesTextarea.focus();
        });
    });

    // Event listener for "Start Simulation with Qualities" button
    startWithQualitiesBtn.addEventListener('click', async () => {
        currentTalkSimQualities = qualitiesTextarea.value.trim();
        if (currentTalkSimQualities === "") {
            if (currentTalkSimTopic === 'child') {
                currentTalkSimQualities = "a curious child (around 6-8 years old)";
            } else {
                currentTalkSimQualities = "a typical " + currentTalkSimTopic;
            }
        }
        qualitiesInputAreaDiv.style.display = 'none';

        const displayTopicText = currentTalkSimTopic === 'child' ?
            `Simulating: You are talking to a Child (Described as: ${currentTalkSimQualities})` :
            `Simulating: Talk to a ${currentTalkSimTopic} (Described as: ${currentTalkSimQualities})`;
        conversationTopicDisplay.textContent = displayTopicText;

        conversationAreaDiv.style.display = 'block';
        restartBtn.style.display = 'block'; // Show restart button
        conversationHistory = [];
        conversationLog.innerHTML = '<p><em>Conversation will appear here...</em></p>'; // Clear previous log
        const logMessage = currentTalkSimTopic === 'child' ?
            `System: Starting new simulation - A simulated child (Qualities: ${currentTalkSimQualities}) will ask you questions...` :
            `System: Starting new simulation - Talking to a ${currentTalkSimTopic} (Qualities: ${currentTalkSimQualities})...`;
        updateConversationLog(logMessage);
        await startTalkSimulation(userData, currentTalkSimTopic, currentTalkSimQualities);
    });

    // Event listener for sending user's typed response
    sendTalkSimResponseBtn.addEventListener('click', handleUserTalkSimInput);
    userTalkSimInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !sendTalkSimResponseBtn.disabled) { // Prevent double send if button is disabled
            e.preventDefault(); // Prevent form submission if it's in a form
            handleUserTalkSimInput();
        }
    });

    async function handleUserTalkSimInput() {
        const userResponse = userTalkSimInput.value.trim();
        if (userResponse === '') return;

        userTalkSimInput.value = ''; // Clear input
        await processUserTalkSimResponse(userResponse, userData, currentTalkSimTopic, currentTalkSimQualities);
    }

    // Event listener for "Restart" button
    restartBtn.addEventListener('click', () => {
        conversationAreaDiv.style.display = 'none';
        qualitiesInputAreaDiv.style.display = 'none';
        qualitiesTextarea.value = '';
        topicSelectionDiv.style.display = 'block'; // Show topic selection again
        restartBtn.style.display = 'none'; // Hide restart button
        aiCurrentLineDiv.textContent = ''; // Clear AI line
        aiCurrentLineDiv.classList.add('loading-placeholder'); // Reset loading state appearance
        conversationLog.innerHTML = '<p><em>Conversation will appear here...</em></p>'; // Clear log
        conversationTopicDisplay.textContent = ''; // Clear topic display
    });
}

async function startTalkSimulation(userData, topic, qualities) {
    const aiCurrentLineDiv = document.getElementById('ai-current-line');
    const userTalkSimInput = document.getElementById('user-talksim-input');
    const sendTalkSimResponseBtn = document.getElementById('send-talksim-response-btn');

    if (!aiCurrentLineDiv || !userTalkSimInput || !sendTalkSimResponseBtn) return;

    aiCurrentLineDiv.textContent = topic === 'child' ? 'Simulated child is thinking of a question...' : 'Generating conversation starter...';
    aiCurrentLineDiv.classList.add('loading-placeholder');
    userTalkSimInput.disabled = true;
    sendTalkSimResponseBtn.disabled = true;

    let prompt;
    if (topic === 'child') {
        prompt = `You are an AI simulating a child. The user is an adult (age ${userData.age}) practicing how to answer a child's questions about topics related to bodies, growing up, relationships, or safety.
The user has described the child they are imagining as: "${qualities}".
Your role is to ask an age-appropriate, curious, and sometimes tricky question that a child of this description might ask an adult.
The question SHOULD be in a mix of Hinglish (Hindi mixed with English) and English, as a child in India might naturally speak. Use simple, conversational language.
Keep it innocent and inquisitive.
Format the output as a JSON object with EXACTLY one key: "ai_line" (string, which is the child's question).
CRITICAL: Your entire response MUST be a single, valid JSON object. Do not include any explanatory text, greetings, or markdown formatting like \`\`\`json or \`\`\` before or after the JSON object. The response should start with "{" and end with "}".
Example (if qualities are 'curious 7-year-old'): {"ai_line": "Mummy/Papa, where do babies come from? My friend Rina said a stork brings them, is that true?"}
Example (if qualities are 'observant 5-year-old'): {"ai_line": "Why does Raju bhaiya have a small 'pee-pee' and I don't? What's different?"}`;
    } else {
        prompt = `You are an AI simulating a ${topic} for a user aged ${userData.age} (group: ${userData.ageGroup}).
The user describes this ${topic} as: "${qualities}".
This conversation is happening in an Indian context.
Generate a natural, age-appropriate opening line for this described ${topic} to say to the user to start the conversation.
The response SHOULD be in a mix of Hinglish (Hindi mixed with English) and English, as naturally spoken in India, reflecting the described personality if possible. Keep it conversational.
Format the output as a JSON object with EXACTLY one key: "ai_line" (string).
CRITICAL: Your entire response MUST be a single, valid JSON object. Do not include any explanatory text, greetings, or markdown formatting like \`\`\`json or \`\`\` before or after the JSON object. The response should start with "{" and end with "}".
Example (if topic is 'parent', qualities 'strict but loving', user is teen): {"ai_line": "Beta, padhai कैसी चल रही है? I hope you're focusing, but also taking breaks when needed."}
Example (if topic is 'friend', qualities 'very supportive', user is teen): {"ai_line": "Hey yaar, what's up? You seem a bit off today, sab theek hai na? You can tell me."}`;
    }

    try {
        const responseText = await getGeminiResponse(prompt, userData.age, userData.ageGroup, true, true);
        const parsedResponse = JSON.parse(responseText);
        aiCurrentLineDiv.classList.remove('loading-placeholder');

        if (parsedResponse && parsedResponse.ai_line) {
            const speakerLabel = topic === 'child' ? `Simulated Child (described as ${qualities})` : `Simulated ${topic}`;
            const aiLineTextForLog = `${speakerLabel}: ${parsedResponse.ai_line}`;

            aiCurrentLineDiv.textContent = parsedResponse.ai_line; // Display only AI's speech
            updateConversationLog(aiLineTextForLog); // Log with appropriate prefix
            conversationHistory.push({ speaker: speakerLabel, text: parsedResponse.ai_line });
        } else {
            throw new Error(`Invalid AI response format for starting TalkSim (topic: ${topic}). AI did not return 'ai_line'.`);
        }
    } catch (error) {
        console.error(`Error starting TalkSim (topic: ${topic}):`, error);
        aiCurrentLineDiv.classList.remove('loading-placeholder');
        aiCurrentLineDiv.textContent = `Error starting simulation: ${error.message}. Please try restarting.`;
    } finally {
        userTalkSimInput.disabled = false;
        sendTalkSimResponseBtn.disabled = false;
        userTalkSimInput.focus(); // Focus input after AI speaks
    }
}

async function processUserTalkSimResponse(userResponse, userData, topic, qualities) {
    const aiCurrentLineDiv = document.getElementById('ai-current-line');
    const userTalkSimInput = document.getElementById('user-talksim-input');
    const sendTalkSimResponseBtn = document.getElementById('send-talksim-response-btn');

    if (!aiCurrentLineDiv || !userTalkSimInput || !sendTalkSimResponseBtn) return;

    const userLogLabel = topic === 'child' ? `You (Adult)` : `You`;
    updateConversationLog(`${userLogLabel}: ${userResponse}`);
    conversationHistory.push({ speaker: userLogLabel, text: userResponse });

    aiCurrentLineDiv.textContent = topic === 'child' ? `Simulated child is thinking of a follow-up or new question...` : `Simulated ${topic} is thinking...`;
    aiCurrentLineDiv.classList.add('loading-placeholder');
    userTalkSimInput.disabled = true;
    sendTalkSimResponseBtn.disabled = true;

    let historyForPrompt = conversationHistory.slice(-6).map(entry => `${entry.speaker}: ${entry.text}`).join('\n'); // Slightly more history
    let prompt;

    if (topic === 'child') {
        prompt = `Continue the simulated conversation. The user is an adult (age ${userData.age}) practicing answering a child's questions.
The child is described as: "${qualities}".
Conversation history (last few turns, "${userLogLabel}" is the adult practicing):
${historyForPrompt}
The adult (${userLogLabel}) just said: "${userResponse}" in response to the child's previous question/statement.
Now, as the simulated child, either ask a relevant follow-up question based on the adult's answer, OR ask a new, different (but still age-appropriate for "${qualities}") question.
The child's response SHOULD be in a mix of Hinglish (Hindi mixed with English) and English. Keep it innocent, curious, and reflective of the "${qualities}".
Format the output as a JSON object with EXACTLY one key: "ai_line" (string, which is the child's next question/statement).
CRITICAL: Your entire response MUST be a single, valid JSON object. Do not include any explanatory text, greetings, or markdown formatting like \`\`\`json or \`\`\` before or after the JSON object. The response should start with "{" and end with "}".
Example child follow-up after an explanation about babies: {"ai_line": "Oh, so that's how it works! But why do only girls get periods, Mummy/Papa? And what are periods?"}
Example new child question: {"ai_line": "Okay... Can I ask something else? Why do some people have hair under their arms and some don't?"}`;
    } else {
        prompt = `Continue the simulated conversation. The user (age ${userData.age}, group: ${userData.ageGroup}) is talking to a ${topic} they described as "${qualities}".
This conversation is happening in an Indian context.
Conversation history (last few turns):
${historyForPrompt}
The user just said: "${userResponse}".
Generate the described ${topic}'s next natural, age-appropriate line in response.
The response SHOULD be in a mix of Hinglish (Hindi mixed with English) and English, as naturally spoken in India, reflecting the described personality (${qualities}) and the flow of the conversation.
Format the output as a JSON object with EXACTLY one key: "ai_line" (string).
CRITICAL: Your entire response MUST be a single, valid JSON object. Do not include any explanatory text, greetings, or markdown formatting like \`\`\`json or \`\`\` before or after the JSON object. The response should start with "{" and end with "}".`;
    }

    try {
        const responseText = await getGeminiResponse(prompt, userData.age, userData.ageGroup, true, true);
        const parsedResponse = JSON.parse(responseText);
        aiCurrentLineDiv.classList.remove('loading-placeholder');

        if (parsedResponse && parsedResponse.ai_line) {
            const speakerLabel = topic === 'child' ? `Simulated Child (described as ${qualities})` : `Simulated ${topic}`;
            const aiLineTextForLog = `${speakerLabel}: ${parsedResponse.ai_line}`;

            aiCurrentLineDiv.textContent = parsedResponse.ai_line;
            updateConversationLog(aiLineTextForLog);
            conversationHistory.push({ speaker: speakerLabel, text: parsedResponse.ai_line });
        } else {
            throw new Error(`Invalid AI response format for continuing TalkSim (topic: ${topic}). AI did not return 'ai_line'.`);
        }
    } catch (error) {
        console.error(`Error continuing TalkSim (topic: ${topic}):`, error);
        aiCurrentLineDiv.classList.remove('loading-placeholder');
        aiCurrentLineDiv.textContent = `Error in simulation: ${error.message}. You might need to restart.`;
    } finally {
        userTalkSimInput.disabled = false;
        sendTalkSimResponseBtn.disabled = false;
        userTalkSimInput.focus();
    }
}

function updateConversationLog(message) {
    const logDiv = document.getElementById('conversation-log');
    if (!logDiv) return;
    if (logDiv.innerHTML.includes('<em>Conversation will appear here...</em>')) {
        logDiv.innerHTML = '';
    }
    const messageP = document.createElement('p');
    messageP.textContent = message;
    logDiv.appendChild(messageP);
    logDiv.scrollTop = logDiv.scrollHeight;
}

// --- END OF TALK SIMULATOR CODE BLOCK ---

// --- Stories Feature Functions ---
async function fetchAndDisplayStory(userData) {
    const storyContainer = document.getElementById('story-container');
    const storyTitleElement = document.getElementById('story-title');
    const storyTextElement = document.getElementById('story-text');
    const questionsListElement = document.getElementById('questions-list');
    const newStoryBtn = document.getElementById('new-story-btn');


    if (!storyContainer || !storyTitleElement || !storyTextElement || !questionsListElement || !newStoryBtn) return;

    storyContainer.classList.add('loading-placeholder');
    storyTitleElement.textContent = 'Generating a new story for you...';
    storyTextElement.textContent = '';
    questionsListElement.innerHTML = '<li class="loading-placeholder" style="height:30px;"><em>Loading questions...</em></li>';
    newStoryBtn.disabled = true;


    const prompt = `Generate a short, fictional, age-appropriate story for a user in the '${userData.ageGroup}' age group (age ${userData.age}).
The story should be relatable and have a subtle educational or reflective theme relevant to personal development, relationships, safety, or understanding emotions, suitable for an Indian context. Use Indian names or settings where appropriate without stereotyping.
After the story, provide 2-3 open-ended reflection questions about the story.
CRITICAL FORMATTING INSTRUCTIONS:
1. Your response MUST be a single, valid JSON object with EXACTLY these keys: "title" (string), "story_text" (string, can be a few paragraphs), "reflection_questions" (array of 2-3 strings).
2. The JSON must be properly formatted with double quotes for all keys and string values.
3. Do not include any text, greetings, or markdown like \`\`\`json or \`\`\` before or after the JSON object. It must start with "{" and end with "}".
Example for Teens (Indian context):
{
  "title": "The Exam Pressure",
  "story_text": "Aarav felt a knot in his stomach. The board exams were next week, and everyone in his family kept talking about how important they were. His cousin, Priya, had topped her school last year, and Aarav felt the unspoken expectation. He hadn't told anyone he was struggling with maths...",
  "reflection_questions": [
    "How do you think Aarav is feeling? Why?",
    "What are some healthy ways Aarav could cope with this pressure?",
    "Have you ever felt similar pressure? What helped you?"
  ]
}
IMPORTANT: Generate a NEW and UNIQUE story each time.`;

    try {
        const responseText = await getGeminiResponse(prompt, userData.age, userData.ageGroup, true, true);
        const parsedResponse = JSON.parse(responseText);

        if (!parsedResponse.title || !parsedResponse.story_text || !Array.isArray(parsedResponse.reflection_questions) || parsedResponse.reflection_questions.length < 1) {
            throw new Error('Invalid story format received from AI.');
        }

        storyContainer.classList.remove('loading-placeholder');
        storyTitleElement.textContent = parsedResponse.title;
        storyTextElement.innerHTML = parsedResponse.story_text.replace(/\n/g, '<br>'); // Preserve paragraphs
        questionsListElement.innerHTML = ''; // Clear loading message
        parsedResponse.reflection_questions.forEach(question => {
            const listItem = document.createElement('li');
            listItem.textContent = question;
            questionsListElement.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching story:', error);
        storyContainer.classList.remove('loading-placeholder');
        storyTitleElement.textContent = 'Error Fetching Story';
        storyTextElement.textContent = `An error occurred: ${error.message}. Please try getting another story.`;
        questionsListElement.innerHTML = '<li>Error loading questions.</li>';
    } finally {
         newStoryBtn.disabled = false;
    }
}

function initStories() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    // No early return

    const greetingElement = document.getElementById('stories-greeting');
    if (greetingElement) greetingElement.textContent = `Interactive Stories for ${userData.ageGroup}`;

    const newStoryBtn = document.getElementById('new-story-btn');
    if (newStoryBtn) {
        newStoryBtn.addEventListener('click', () => fetchAndDisplayStory(userData));
    }
    fetchAndDisplayStory(userData); // Fetch first story
}

// --- Learn Feature Functions ---
async function fetchAndDisplayTopics(userData) {
    const topicsGrid = document.getElementById('topics-grid');
    if (!topicsGrid) return;

    topicsGrid.innerHTML = ''; // Clear previous topics or placeholders
    // Add placeholder cards (e.g., 6 placeholders)
    for (let i = 0; i < 6; i++) { // Updated to 6 placeholders
        const placeholder = document.createElement('div');
        placeholder.className = 'topic-card loading-placeholder';
        placeholder.style.height = '120px'; // Approximate height
        // Add staggered animation delay for placeholders too
        placeholder.style.animationDelay = `${i * 0.05}s`;
        topicsGrid.appendChild(placeholder);
    }

    // Modified prompt to ask for more topics
    const prompt = `Generate a diverse list of 6 to 9 age-appropriate sex education/personal development topics for a user in the '${userData.ageGroup}' age group (age ${userData.age}), considering an Indian context.
The topics should cover a good range of relevant subjects for this age group and be engaging.
Format the output as a JSON object with a single key "topics", which is an array of objects. Each object must have "title" (string, concise and appealing) and "description" (string, 1-2 engaging sentences).
Example for Teens (Indian context): {"topics": [
    {"title": "Navigating Puberty Confidently", "description": "Understand the physical and emotional changes during your teen years and how to manage them."},
    {"title": "Building Healthy Friendships", "description": "Explore what makes a good friend, setting boundaries, and handling peer pressure."},
    {"title": "Online Worlds: Safety & Ethics", "description": "Learn to stay safe online, deal with cyberbullying, and understand digital citizenship."},
    {"title": "Understanding Consent", "description": "What does consent really mean in all types of relationships? Why is it crucial?"},
    {"title": "Mental & Emotional Wellbeing", "description": "Tips for managing stress, understanding your emotions, and when to seek help."},
    {"title": "Body Image & Self-Esteem", "description": "Developing a positive body image and building self-confidence in a world full of comparisons."}
]}
CRITICAL: Your entire response MUST be a single, valid JSON object. Do not include any explanatory text, greetings, or markdown formatting like \`\`\`json or \`\`\` before or after the JSON object. The response should start with "{" and end with "}".`;

    try {
        const responseText = await getGeminiResponse(prompt, userData.age, userData.ageGroup, true, true);
        const parsedResponse = JSON.parse(responseText);

        if (!parsedResponse.topics || !Array.isArray(parsedResponse.topics) || parsedResponse.topics.length === 0) {
            throw new Error('Invalid topics format or no topics received from AI. The AI might need more specific instructions or is facing limitations.');
        }

        topicsGrid.innerHTML = ''; // Clear loading placeholders
        parsedResponse.topics.forEach((topic, index) => {
            const card = document.createElement('div');
            card.className = 'topic-card';
            card.style.animationDelay = `${index * 0.08}s`; // Slightly adjusted animation delay for more items
            card.innerHTML = `<h3>${topic.title}</h3><p>${topic.description}</p>`;
            card.addEventListener('click', () => displayTopicDetail(topic, userData));
            topicsGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching topics:', error);
        topicsGrid.innerHTML = `<p class="error-message">Failed to load topics: ${error.message}. Please try refreshing or coming back later.</p>`;
    }
}

// displayTopicDetail function remains the same
async function displayTopicDetail(topic, userData) {
    const topicsGrid = document.getElementById('topics-grid');
    const topicDetail = document.getElementById('topic-detail');
    const topicTitleElement = document.getElementById('topic-title');
    const topicContentElement = document.getElementById('topic-content');

    if (!topicsGrid || !topicDetail || !topicTitleElement || !topicContentElement) return;

    topicsGrid.style.display = 'none';
    topicDetail.style.display = 'block';
    topicTitleElement.textContent = topic.title;
    topicContentElement.innerHTML = '<div class="loading-placeholder" style="height: 200px;"></div> <div class="loading-placeholder" style="height: 150px; margin-top:10px;"></div>'; // Loading placeholder

    const prompt = `Generate detailed, age-appropriate educational content about "${topic.title}" for a user in the '${userData.ageGroup}' age group (age ${userData.age}), keeping an Indian context in mind.
The content should be informative, respectful, medically accurate, and easy to understand. Use simple language for younger users and more comprehensive details for older ones.
Structure the content well. You can use HTML elements like <h4> for subheadings, <p> for paragraphs, <ul> and <li> for bullet points, or <ol> and <li> for numbered lists if appropriate for clarity and readability.
Ensure the response is comprehensive enough to be useful but not overwhelmingly long.
Format the output as a JSON object with a single key "content" (string) containing the educational text as an HTML string.
Example for a Kids topic "Body Safety": {"content": "<h4>Your Body is Special!</h4><p>Everyone's body is special and private. It belongs to YOU!</p><ul><li>Your private parts are the parts of your body covered by your underwear or swimsuit.</li><li>It's okay for doctors or your parents/guardians to see or touch these parts if they are helping you (like during a bath or a check-up), but they should always tell you why.</li><li>No one else should touch your private parts, and you shouldn't touch anyone else's private parts.</li></ul><p>If someone tries to touch you in a way that makes you feel uncomfortable, confused, or scared (this is sometimes called a 'bad touch' or 'unsafe touch'), it's NOT your fault. You should:</p><ol><li>Say 'NO!' loudly.</li><li>Run away if you can.</li><li>Tell a trusted grown-up immediately. A trusted grown-up could be your Mummy, Papa, teacher, grandparent, or another adult you feel safe with. Keep telling until someone helps you.</li></ol><p>Remember, your body is yours, and you have the right to feel safe!</p>"}
CRITICAL: Your entire response MUST be a single, valid JSON object. The "content" value should be a string containing well-formed HTML. Do not include any explanatory text, greetings, or markdown like \`\`\`json or \`\`\` before or after the JSON object. The response should start with "{" and end with "}".`;

    try {
        const responseText = await getGeminiResponse(prompt, userData.age, userData.ageGroup, true, true);
        const parsedResponse = JSON.parse(responseText);

        if (!parsedResponse.content || typeof parsedResponse.content !== 'string') {
            throw new Error('Invalid content format received from AI. The content might be missing or not a string.');
        }
        topicContentElement.innerHTML = parsedResponse.content;
    } catch (error) {
        console.error('Error fetching topic content:', error);
        topicContentElement.innerHTML = `<p class="error-message">Failed to load content for "${topic.title}": ${error.message}. Please try again or select another topic.</p>`;
    }
}

// initLearn function remains the same
function initLearn() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    // No early return

    const greetingElement = document.getElementById('learn-greeting');
    if (greetingElement) greetingElement.textContent = `Learn - ${userData.ageGroup}`;

    const backButton = document.getElementById('back-to-topics');
    const topicsGrid = document.getElementById('topics-grid');
    const topicDetail = document.getElementById('topic-detail');

    if (backButton && topicsGrid && topicDetail) {
        backButton.addEventListener('click', () => {
            topicsGrid.style.display = 'grid';
            topicDetail.style.display = 'none';
        });
    }
    fetchAndDisplayTopics(userData);
}
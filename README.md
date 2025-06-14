# Beyond Whispers - Web Application

This project is a cartoon-style web-based sex education platform called "Beyond Whispers". It aims to provide a safe, age-appropriate, engaging, and personalized experience using vanilla HTML, CSS, and JavaScript, with mock AI interactions (simulating Google Gemini).

## Project Structure

- `index.html`: The start page where users input their name, age, and sex/gender.
- `dashboard.html`: The main dashboard displaying features available based on the user's age group.
- `chatbot.html`: Page for the text-based chatbot feature.
- `roleplay.html`: Placeholder page for interactive roleplay scenarios.
- `talksim.html`: Placeholder page for the talk simulator feature.
- `stories.html`: Placeholder page for interactive stories.
- `style.css`: Contains all the CSS styles for the application.
- `script.js`: Handles client-side logic, including user data storage (local storage), age group classification, dynamic content loading for the dashboard, and mock chatbot interactions.
- `Beyond Whispers.md`: The Product Requirements Document (PRD) for this project.

## How to Run

1.  **Clone or download the repository/files.**
2.  **Open `index.html` in your web browser.**
    - You can do this by navigating to the project directory in your file explorer and double-clicking the `index.html` file.
    - Alternatively, if you have a local web server (like Python's `http.server` or VS Code's Live Server extension), you can serve the files from the project root directory.

## Tech Stack

-   **Frontend**: Vanilla HTML, CSS, JavaScript (no frameworks)
-   **AI Engine (Simulated)**: The `script.js` file contains mock functions that simulate responses from an AI like Google Gemini. For a real deployment, these would be replaced with actual API calls.
-   **Data Storage**: User information (name, age, sex, age group) is stored in the browser's local storage.

## Features (MVP)

-   **Start Page**: Collects user's name (optional), age, and sex.
-   **Age-Based Content**: Classifies users into Kids (5-10), Teens (11-17), Young Adults (18-24), or Adults (25+) to tailor content.
-   **Personalized Dashboard**: Shows available modules (Chatbot, Stories, Roleplay, Talk Simulator) based on the age group.
-   **Chatbot (Mock)**: A simple text-based chat interface with pre-programmed, age-appropriate responses.
-   **Static Pages**: Placeholders for Roleplay, Talk Simulator, and Stories modules.

## Notes

-   The application is designed to be run locally or deployed via static hosting platforms.
-   The AI interactions in `script.js` (`getGeminiResponse` function) are currently hardcoded mock-ups. To connect to a real AI, you would need to implement API calls to Google Gemini (or another AI service) and handle the responses, including system instructions for safety and age-appropriateness.
-   Illustrations and animations are planned for future enhancements but are not part of this vanilla HTML/CSS/JS MVP.
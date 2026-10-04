# Synoreads - Novel Crawler & Reader

A elegant novel reading platform built with Flask, featuring a clean Dark Academia design and personalized reading experience.

## Overview

Synoreads is a web application for crawling, organizing, and reading novels online. It features a beautiful interface inspired by classic literature, with personalized reading settings, progress tracking, and social features like following novels.

## Features

- 📚 **Novel Library**: Browse and manage your collection of novels
- 📖 **Elegant Reader**: Customizable reading experience with themes, fonts, and layout options
- 🔄 **Progress Tracking**: Automatically saves your reading position
- 🔔 **Follow System**: Get notified when followed novels update
- 🏷️ **Tag Organization**: Categorize novels with tags for easy browsing
- 🌓 **Dark/Light Themes**: Switch between themes based on preference or system settings
- ⚙️ **Customizable Settings**: Adjust font size, line height, text alignment, and more

## Tech Stack

![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-000000?style=for-the-badge&logo=sqlalchemy&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/synoreads.git
   cd synoreads
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up the database:
   ```bash
   python app.py
   ```
   (The database will initialize automatically on first run)

4. Run the application:
   ```bash
   python app.py
   ```

5. Visit `http://localhost:5000` in your browser

## Usage

- Browse novels on the home page
- Click on a novel to view its details and table of contents
- Click on a chapter to start reading
- Use the reading toolbar to customize your experience:
  - Adjust font size (A-/A+)
  - Change line height (LH-/LH+)
  - Switch text alignment
  - Change padding
  - Cycle through fonts
  - Toggle dark/light mode
- Use the floating navigation buttons (appears when near screen edges) to navigate chapters
- Follow novels to get updates on new chapters

## Project Structure

```
synoreads/
├── app.py              # Main Flask application
├── novels.db           # SQLite database (contains novels, chapters, user data)
├── requirements.txt    # Python dependencies
├── static/             # Static assets
│   ├── style.css       # Custom styles (Dark Academia theme)
│   └── reader.js       # Reading experience enhancements
├── templates/          # HTML templates
│   ├── home.html       # Library view
│   ├── chapter.html    # Chapter reading view
│   └── novel.html      # Novel details and table of contents
└── README.md           # This file
```

## Customization

### Changing Appearance
All visual customization is handled through the reader interface:
- Theme: Toggle between dark and light modes
- Fonts: Choose from Garamond, Literata, Sans-serif, or Typewriter
- Text size: Adjust to your preferred reading comfort
- Line height: Modify spacing between lines
- Text alignment: Choose between justified or left-aligned
- Content padding: Control whitespace around text

### Data Management
The application uses SQLite for data storage. The `novels.db` file contains:
- Novel metadata (title, author, description, etc.)
- Chapter content and structure
- User preferences and reading progress
- Follow relationships between users and novels

## Deployment

This application can be deployed to any platform that supports Python web applications:
- [PythonAnywhere](https://www.pythonanywhere.com/) (used for the live demo)
- Heroku
- AWS Elastic Beanstalk
- Docker containers
- Traditional VPS hosting

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Live Demo

Experience Synoreads live at: https://synoreads.eu.pythonanywhere.com

---

*Crafted with ❤️ for novel enthusiasts who appreciate the art of reading.*
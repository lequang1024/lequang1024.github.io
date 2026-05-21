# Quang Le's Tools & Projects

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://lequang1024.github.io)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> A collection of practical web tools, interactive games, and professional utilities hosted on GitHub Pages.

**🌐 Live Site:** [https://lequang1024.github.io](https://lequang1024.github.io)

## 👨‍💻 About

I'm Quang Le, a software developer passionate about creating useful tools and interactive experiences. This repository showcases a variety of web-based applications, from productivity utilities to entertaining games, all built with modern web technologies.

## ✨ Featured Projects

### 🔗 QR Deep Link Generator
A sophisticated tool for generating and testing deep links with real-time QR code generation.

**Versions:**
- **Standard (1.0)**: Original theme (`qr-deeplink.html`).
- **Dries Bos (2.0)**: Minimalist, light-parchment wireframe redesign (`qr-deeplink-2.html`).

**Features:**
- Dynamic URL generation with live preview
- Environment switching (Trunk, QA3, Custom)
- Server availability checking
- Persistent configuration storage
- Grafana log integration

**Tech Stack:** HTML5, CSS3, JavaScript, QR.js

### 🌳 Family Tree Visualizer (Cây Gia Đình)
An interactive visualization of the family tree tree.

**Features:**
- Interactive family tree layout
- Clear relationship connections
- Localized in Vietnamese

**Tech Stack:** HTML5, CSS3, JavaScript

### 👶 Baby Tools Suite
Utilities designed to help parents track and calculate baby development events.

**Includes:**
- **Baby Feeding Tracker** (`baby feeding template printable.html`): A printable template for tracking baby feeding schedules (Vietnamese language support).
- **Wonder Weeks Calculator** (`wonder-weeks-calculator.html`): A tool to calculate and track baby's developmental leaps.

---

## 🗂️ Project Structure

```
📁 Repository Root
├── 🌳 Personal/
│   └── cay_gia_dinh_viz.html         # Interactive Family Tree Visualizer
├── 👶 Utils/
│   ├── baby feeding template printable.html  # Baby feeding tracker (Vietnamese)
│   └── wonder-weeks-calculator.html  # Wonder Weeks developmental leap calculator
├── 🔗 qr-deeplink/
│   ├── script.js                      # Core QR generator functionality
│   └── style.css                      # Styling for QR generator
├── 🔗 qr-deeplink.html               # Main QR generator tool
├── 🔗 qr-deeplink-2.html             # QR Deep Link Generator 2.0 (Dries Bos theme)
├── 📋 qr-deeplink-readme.html         # QR tool documentation
├── 🎨 grafana-icon.svg                # Icon asset
└── 🏠 index.html                      # Main tools dashboard page
```

---

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with Flexbox/Grid
- **JavaScript (ES6+)** - Interactive functionality
- **Tailwind CSS** - Utility-first CSS framework (used in the dashboard)

### Hosting & Deployment
- **GitHub Pages** - Static site hosting
- **Git** - Version control
- **GitHub Actions** - Automated deployment (Auto-indexes tools and injects GA)

---

## 🚀 Getting Started

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/lequang1024/lequang1024.github.io.git
   cd lequang1024.github.io
   ```

2. **Serve locally**
   ```bash
   # Using Python (if available)
   python -m http.server 8000
   
   # Or simply open index.html in your browser
   ```

3. **Access the site**
   Open `http://localhost:8000` in your browser.

---

## 🤝 Contributing

Suggestions and feedback are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with ❤️ using GitHub Pages**

</div>


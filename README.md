# 🎵 Chat Blues

<div align="center">

![Chat Blues Banner](https://img.shields.io/badge/Chat%20Blues-100%25%20Private-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIxIDE1YTIgMiAwIDAgMS0yIDJINWwtNCA0VjVhMiAyIDAgMCAxIDItMmgxNGEyIDIgMCAwIDEgMiAyeiI+PC9wYXRoPjwvc3ZnPg==)

**A beautiful, privacy-first AI chat application that runs 100% locally on your device.**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE-APACHE)
[![React](https://img.shields.io/badge/React-19.1.1-61dafb.svg?logo=react)](https://reactjs.org/)
[![Ollama](https://img.shields.io/badge/Ollama-Compatible-white.svg)](https://ollama.ai/)

[Features](#-features) • [Quick Start](#-quick-start) • [Installation](#-installation) • [Models](#-available-models) • [Privacy](#-privacy)

</div>

---

## 🔒 Why Chat Blues?

In an age where AI services collect and store your conversations, **Chat Blues** offers a refreshing alternative:

- **🏠 100% Local Processing** - All AI runs on YOUR device
- **🚫 No Data Collection** - Zero telemetry, zero tracking
- **🔐 Complete Privacy** - Your conversations never leave your computer
- **💰 Free Forever** - No API costs, no subscriptions
- **🌐 Works Offline** - No internet required after setup

> 🌐 **Want an online version?** Visit [chatblues.com](https://chatblues.com) for the hosted version with cloud AI models!

---

## ✨ Features

### Core Features
- 🤖 **Multiple AI Models** - Support for Llama, Mistral, Phi, Gemma, and more
- 💬 **Natural Conversations** - Chat naturally with powerful local LLMs
- 🎨 **Beautiful UI** - Modern, responsive design with dark mode
- 📱 **Mobile Ready** - Works great on phones and tablets
- ⚡ **Fast Responses** - Optimized for local inference

### Advanced Features
- 📝 **Code Highlighting** - Syntax highlighting for 100+ languages
- 🔊 **Voice Input** - Speak your messages (browser speech API)
- 📎 **File Attachments** - Upload text files and images
- 👁️ **Vision Support** - Use LLaVA for image understanding
- 💾 **Chat History** - Save and restore conversations
- ⚙️ **Customizable** - Temperature, context window, and more

---

## 🚀 Quick Start

### Prerequisites
1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **Ollama** - [Download](https://ollama.ai/download)

### 3-Step Setup

```bash
# 1. Clone the repository
git clone https://github.com/code-smith-07/chat-blues.git
cd chat-blues

# 2. Install dependencies
npm install

# 3. Start the app
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

> 💡 **First time?** The app will guide you to install Ollama and download a model.

---

## 📦 Installation

### Step 1: Install Ollama

Ollama is the engine that runs AI models locally.

<details>
<summary><b>🍎 macOS</b></summary>

```bash
# Option 1: Download from website
# Visit https://ollama.ai/download

# Option 2: Using Homebrew
brew install ollama
```
</details>

<details>
<summary><b>🪟 Windows</b></summary>

1. Download from [ollama.ai/download](https://ollama.ai/download)
2. Run the installer
3. Ollama will run as a background service
</details>

<details>
<summary><b>🐧 Linux</b></summary>

```bash
# One-line install script
curl -fsSL https://ollama.ai/install.sh | sh

# Or download manually from https://ollama.ai/download
```
</details>

### Step 2: Download an AI Model

After installing Ollama, download a model:

```bash
# Recommended starter model (2GB, fast)
ollama pull llama3.2:3b

# Or for better quality (4.7GB)
ollama pull llama3.1:8b
```

### Step 3: Run Chat Blues

```bash
# Clone repository
git clone https://github.com/code-smith-07/chat-blues.git
cd chat-blues

# Install dependencies
npm install

# Start development server
npm run dev
```

### Step 4: Build for Production (Optional)

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

---

## 🤖 Available Models

Here are some popular models compatible with Chat Blues:

### Text Models

| Model | Size | Best For | Command |
|-------|------|----------|---------|
| **Llama 3.2 3B** | 2.0 GB | Everyday use, fast | `ollama pull llama3.2:3b` |
| **Llama 3.2 1B** | 1.3 GB | Ultra-fast responses | `ollama pull llama3.2:1b` |
| **Llama 3.1 8B** | 4.7 GB | Quality conversations | `ollama pull llama3.1:8b` |
| **Mistral 7B** | 4.1 GB | Coding, general use | `ollama pull mistral:7b` |
| **Phi-3 Mini** | 2.3 GB | Fast & capable | `ollama pull phi3:mini` |
| **Gemma 2 2B** | 1.6 GB | Lightweight | `ollama pull gemma2:2b` |
| **Qwen 2.5 3B** | 1.9 GB | Multi-language | `ollama pull qwen2.5:3b` |
| **DeepSeek Coder** | 3.8 GB | Programming | `ollama pull deepseek-coder:6.7b` |
| **Code Llama 7B** | 3.8 GB | Code generation | `ollama pull codellama:7b` |

### Vision Models (Can See Images)

| Model | Size | Best For | Command |
|-------|------|----------|---------|
| **LLaVA 7B** | 4.5 GB | Image understanding | `ollama pull llava:7b` |
| **LLaVA 13B** | 8.0 GB | Better image analysis | `ollama pull llava:13b` |

### Downloading Models from Hugging Face

You can also use models from Hugging Face with Ollama:

```bash
# Create a Modelfile
echo 'FROM hf.co/username/model-name' > Modelfile

# Create the model
ollama create my-model -f Modelfile

# Run it
ollama run my-model
```

### Check Installed Models

```bash
# List all installed models
ollama list

# Get model info
ollama show llama3.2:3b
```

---

## ⚙️ Configuration

### In-App Settings

Access settings by clicking the **gear icon** in the sidebar:

- **Model Selection** - Choose from popular models or enter custom model name
- **Temperature** (0-1) - Lower = focused, Higher = creative
- **Context Window** - Memory size (2048-32768 tokens)
- **Endpoint** - Default: `http://localhost:11434`

### Custom Ollama Endpoint

If Ollama is running on a different machine:

```bash
# Start Ollama with custom host
OLLAMA_HOST=0.0.0.0:11434 ollama serve

# In Chat Blues settings, use:
http://<your-ip>:11434
```

---

## 🔐 Privacy

Chat Blues is designed with privacy as the core principle:

| Aspect | Chat Blues | Cloud AI Services |
|--------|------------|-------------------|
| Data Storage | Local only | Cloud servers |
| Conversation Logs | Your device | Company databases |
| Tracking | None | Extensive |
| Internet Required | No* | Yes |
| Cost | Free | Paid/Limited |

*After initial setup

### What Stays Local
- ✅ All conversations
- ✅ AI model weights
- ✅ Settings and preferences
- ✅ Chat history

### What's NOT Collected
- ❌ No analytics
- ❌ No telemetry
- ❌ No user tracking
- ❌ No conversation logs sent anywhere

---

## 🛠️ Development

### Tech Stack
- **Frontend**: React 19.1.1
- **Build Tool**: Vite 7.1.4
- **Styling**: Tailwind CSS
- **Code Editor**: Monaco Editor
- **Mobile**: Capacitor (iOS/Android ready)

### Project Structure

```
chat-blues/
├── src/
│   ├── App.jsx          # Main application
│   ├── Sidebar.jsx      # Navigation sidebar
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── public/
│   └── index.html       # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── README.md            # This file
```

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🐛 Troubleshooting

### "Failed to connect to Local AI"

1. **Check Ollama is running:**
   ```bash
   ollama serve
   ```

2. **Verify model is installed:**
   ```bash
   ollama list
   ```

3. **Test Ollama directly:**
   ```bash
   curl http://localhost:11434/api/tags
   ```

### "Model not found"

```bash
# Download the model first
ollama pull llama3.2:3b
```

### Slow Responses

- Try a smaller model (`llama3.2:1b` or `phi3:mini`)
- Reduce context window in settings
- Close other memory-intensive apps

### CORS Issues (Remote Ollama)

```bash
# Start Ollama with CORS enabled
OLLAMA_ORIGINS="*" ollama serve
```

---

## 📄 License

This project is dual-licensed under:

- **MIT License** - [LICENSE](LICENSE)
- **Apache License 2.0** - [LICENSE-APACHE](LICENSE-APACHE)

You may choose either license for your use.

---

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai/) - For making local LLMs accessible
- [Meta](https://ai.meta.com/) - For the Llama models
- [Mistral AI](https://mistral.ai/) - For the Mistral models
- [Microsoft](https://www.microsoft.com/) - For the Phi models
- [Google](https://ai.google/) - For the Gemma models

---

## 📬 Contact

**Vishwateja S B** - [@Code-Smith-07](https://github.com/Code-Smith-07)

Project Link: [https://github.com/code-smith-07/chat-blues](https://github.com/code-smith-07/chat-blues)

---

<div align="center">

**Made with 💙 for Privacy**

⭐ Star this repo if you find it useful!

</div>

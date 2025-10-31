# InnoVision : Adaptive Learning Interface

![InnoVision Logo](./public/InnoVision_LOGO-removebg-preview.png)

## 📚 Introduction

InnoVision is committed to revolutionizing education through intelligent and personalized learning. Our platform breaks the limitations of traditional courses by dynamically generating structured, engaging courses from any user-defined topic. By leveraging AI and machine learning, we create a flexible and adaptive learning environment that tailors content to individual needs.

With innovation, flexibility, and logical reasoning (InnoVision) as our core principles, we are shaping the future of personalized learning!

## ✨ Features

- **🎯 Dynamic Course Generation**: Users can input any concept, skill, or topic, and the system will generate a structured course
- **🤖 AI-Powered Learning Paths**: Uses Large Language Models (LLM) to create step-by-step roadmaps, organizing content into chapters
- **🎮 Interactive Task Implementation**: Platform integrates various interactive task templates (Quiz, Fill-ups, Match) to enhance engagement
- **⚡ Automated Task Selection**: AI selects the most suitable interactive tasks for each chapter, ensuring optimized learning experience
- **📋 Structured JSON Parsing**: Course content is formatted in JSON and seamlessly parsed to generate complete, customized courses
- **🔄 Adaptive Learning Experience**: Courses adjust based on user input, ensuring flexible and tailored learning journeys
- **👤 User Authentication**: Secure login with Google and GitHub OAuth
- **📊 Progress Tracking**: Track learning progress, XP points, and achievements
- **📧 Contact System**: Integrated contact form with EmailJS for user communication

## 🛠️ Technologies Used

- **⚡ Next.js 15** - React framework with App Router for optimal performance and SEO
- **🎨 Tailwind CSS** - Utility-first CSS framework for responsive design
- **🎭 Shadcn/UI** - Modern and accessible UI component library
- **🔥 Firebase** - Backend services for database management and real-time data
- **🔐 Auth.js (NextAuth v5)** - Secure authentication with OAuth providers
- **🤖 Google Gemini API** - AI-powered content generation
- **📧 EmailJS** - Contact form email service
- **🎯 React Icons** - Comprehensive icon library
- **📱 Framer Motion** - Animation library for smooth interactions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Git

### 📥 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ItsVikasA/Innovision.git
   cd Innovision
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory and add the following variables:

   ```env
   # NextAuth Configuration
   NEXTAUTH_SECRET=your-nextauth-secret-key
   NEXTAUTH_URL=http://localhost:3000

   # OAuth Providers
   GITHUB_ID=your-github-oauth-client-id
   GITHUB_SECRET=your-github-oauth-client-secret
   GOOGLE_CLIENT_ID=your-google-oauth-client-id
   GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

   # Firebase Configuration
   FIREBASE_API_KEY=your-firebase-api-key
   AUTH_DOMAIN=your-project.firebaseapp.com
   PROJECT_ID=your-firebase-project-id
   STORAGE_BUCKET=your-project.appspot.com
   MESSAGING_SENDER_ID=your-messaging-sender-id
   APP_ID=your-firebase-app-id
   MEASUREMENT_ID=your-measurement-id

   # AI Service
   GEMINI_API_KEY=your-google-gemini-api-key

   # Email Service (EmailJS)
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=your-emailjs-service-id
   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your-emailjs-template-id
   NEXT_PUBLIC_EMAILJS_USER_ID=your-emailjs-user-id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🔧 Environment Variables Setup Guide

### 🔑 Authentication Setup

#### NextAuth Secret
Generate a secure random string:
```bash
openssl rand -base64 32
```

#### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### 🔥 Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a web app to your project
4. Copy the configuration values
5. Enable Firestore Database
6. Set up authentication methods

### 🤖 Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Copy the key for `GEMINI_API_KEY`

### 📧 EmailJS Setup
1. Go to [EmailJS](https://www.emailjs.com/)
2. Create an account and add an email service
3. Create an email template
4. Get Service ID, Template ID, and User ID from dashboard

## 📁 Project Structure

```
InnoVision/
├── public/                     # Static assets
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API routes
│   │   ├── auth/             # Authentication pages
│   │   ├── contact/          # Contact page
│   │   ├── generate/         # Course generation
│   │   ├── profile/          # User profile
│   │   └── roadmap/          # Learning roadmaps
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Shadcn UI components
│   │   ├── Landing/         # Landing page components
│   │   ├── Tasks/           # Interactive task components
│   │   └── dashboard/       # Dashboard components
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Utility functions and configs
├── components.json          # Shadcn UI configuration
├── next.config.mjs         # Next.js configuration
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
└── README.md               # This file
```

## 🔨 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## 🌐 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Other Platforms
The app can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📸 Screenshots

<!-- Website Photos -->
<!-- ![Homepage](https://github.com/user-attachments/assets/0ebba6e1-5eb7-4e40-b6ff-747607d1219c)
![Dashboard](https://github.com/user-attachments/assets/14159346-710c-4f1f-b987-3b770a490e19)
![Course Generation](https://github.com/user-attachments/assets/3158eb8a-dbda-4570-85af-61463241f403)
![Learning Interface](https://github.com/user-attachments/assets/4f89132f-5a85-4628-9b76-72761dec8508)
![Progress Tracking](https://github.com/user-attachments/assets/f81ff3d9-44ce-4c34-b45c-e9bdb02ce588) -->

## 🔗 Links

- **Live Demo**: [https://InnoVision.vercel.app](https://InnoVision2.vercel.app)
- **Repository**: [https://github.com/ItsVikasA/Innovision2](https://github.com/ItsVikasA/Innovision2)

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- Shadcn/UI for beautiful components
- Next.js team for the amazing framework
- Firebase for backend services

---

Made with ❤️ by the InnoVision Team

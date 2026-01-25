# Zigma Frontend Console

> **Real-Time Prediction Market Intelligence Dashboard**

This repository contains the frontend web interface for ZIGMA, providing a terminal-style dashboard for monitoring AI-powered prediction market analysis and trading signals.

---

## 🎯 **Overview**

The Zigma Frontend Console offers a real-time monitoring interface that connects directly to the Zigma backend API, displaying system health, trading signals, and operational metrics with a professional terminal aesthetic.

---

## ✨ **Key Features**

### **Real-Time Monitoring**
- **Live System Status**: Health metrics and uptime monitoring
- **Auto-Refresh**: 30-second automatic data updates
- **Terminal Interface**: CRT-style authentic trading environment
- **Performance Metrics**: Real-time system performance data

### **Signal Transparency**
- **Complete Audit Trail**: Full signal generation process
- **Edge Calculations**: Mathematical advantage analysis
- **Confidence Scoring**: Reliability indicators for each signal
- **Historical Analysis**: Past performance and cycle data

### **Market Intelligence**
- **Deep Market Evaluation**: Multi-stage analysis process
- **LLM Reasoning**: AI-powered market insights
- **Risk Assessment**: Multi-layer safety controls
- **Portfolio Tracking**: Position and performance monitoring

---

## 🛠️ **Technology Stack**

### **Frontend Framework**
- **React 18**: Modern component-based architecture
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first styling

### **UI Components**
- **shadcn/ui**: Professional component library
- **Lucide Icons**: Consistent iconography
- **React Query**: Server state management
- **WebSocket**: Real-time data streaming

### **Development Tools**
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Hot Reload**: Fast development iteration

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn package manager
- Zigma backend service running on localhost:3001

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd zigmauiv2

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

---

## 🏗️ **Project Structure**

### **Core Components**
```
src/
├── components/
│   ├── Index.tsx          # Main dashboard layout
│   ├── LatestSignal.tsx   # Signal display component
│   ├── LogsDisplay.tsx    # Operational logs viewer
│   ├── Hero.tsx           # Landing section
│   └── OracleLogic.tsx    # System philosophy
├── pages/
│   ├── Index.tsx          # Home page
│   └── NotFound.tsx       # 404 error page
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions
└── types/                 # TypeScript definitions
```

### **API Integration**
- **Status Endpoint**: System health and cycle metadata
- **Logs Endpoint**: Raw operational logs
- **Signals Endpoint**: Trading signal data
- **WebSocket**: Real-time data streaming

---

## 🔧 **Development**

### **Available Scripts**
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### **Development Features**
- **Hot Module Replacement**: Fast development iteration
- **TypeScript Support**: Type-safe development
- **Component Isolation**: Modular component architecture
- **Error Boundaries**: Graceful error handling

---

## 📊 **Data Flow**

### **API Communication**
- **REST API**: Standard HTTP requests for data
- **WebSocket**: Real-time updates and notifications
- **Error Handling**: Comprehensive error recovery
- **Caching**: Optimized data management

### **State Management**
- **React Query**: Server state synchronization
- **Local State**: Component-level state management
- **Global State**: Application-wide data sharing
- **Persistence**: Local storage for user preferences

---

## 🎨 **UI/UX Features**

### **Terminal Aesthetic**
- **CRT Monitor Effect**: Authentic terminal appearance
- **Monospace Typography**: Developer-friendly fonts
- **Green Phosphor**: Classic terminal color scheme
- **Scan Lines**: Subtle visual effects

### **Responsive Design**
- **Mobile Support**: Responsive layout for all devices
- **Touch Interface**: Mobile-optimized interactions
- **Progressive Enhancement**: Graceful degradation
- **Accessibility**: WCAG compliance considerations

---

## 🔒 **Security**

### **Frontend Security**
- **Content Security Policy**: XSS protection
- **HTTPS Enforcement**: Secure data transmission
- **Input Validation**: Client-side data validation
- **Error Handling**: Secure error reporting

### **API Security**
- **Authentication**: Token-based access control
- **Rate Limiting**: Request throttling
- **CORS Configuration**: Cross-origin resource sharing
- **Data Encryption**: Secure data transmission

---

## 🚀 **Deployment**

### **Production Build**
```bash
# Build optimized production bundle
npm run build

# Deploy to static hosting
# Netlify, Vercel, or similar platforms
```

### **Environment Configuration**
- **Development**: Local development settings
- **Staging**: Pre-production testing environment
- **Production**: Optimized production configuration
- **Environment Variables**: Secure configuration management

---

## 📱 **Browser Support**

### **Supported Browsers**
- **Chrome**: Latest version
- **Firefox**: Latest version
- **Safari**: Latest version
- **Edge**: Latest version

### **Progressive Enhancement**
- **Modern Features**: Latest web standards
- **Fallback Support**: Legacy browser compatibility
- **Performance Optimization**: Fast loading times
- **Error Recovery**: Graceful degradation

---

## 📚 **Documentation**

### **Component Documentation**
- **Props Interface**: TypeScript prop definitions
- **Usage Examples**: Practical implementation guides
- **Best Practices**: Development guidelines
- **Troubleshooting**: Common issues and solutions

### **API Documentation**
- **Endpoint Reference**: Complete API documentation
- **Data Models**: TypeScript type definitions
- **Error Codes**: Comprehensive error handling
- **Authentication**: Security implementation guide

---

## 🤝 **Contributing**

### **Development Guidelines**
- **Code Style**: Consistent formatting and structure
- **Type Safety**: TypeScript best practices
- **Testing**: Component testing guidelines
- **Documentation**: Clear and comprehensive docs

### **Pull Request Process**
- **Branch Strategy**: Feature branch workflow
- **Code Review**: Peer review requirements
- **Testing**: Automated testing requirements
- **Documentation**: Updated documentation requirements

---

## 📞 **Support**

### **Getting Help**
- **Documentation**: Complete project documentation 🟢
- **Issue Tracker**: GitHub issue reporting 🟢
- **Community**: Developer Discord channel 🟢
- **Email Support**: Technical support contact 🟢

### **Resources**
- **API Reference**: Backend API documentation 🟢
- **Design System**: UI component library 🟢
- **Style Guide**: Development guidelines 🟢
- **Changelog**: Version history and updates 🟢

---

## 🌐 **Connect With ZIGMA Frontend**

### **Project Links**
- **GitHub Repository**: https://github.com/zigma-ai/frontend 🟢
- **Live Demo**: https://demo.zigma.ai 🟢
- **Documentation**: https://docs.zigma.ai/frontend 🟢
- **Design System**: https://ui.zigma.ai 🟢

### **Community**
- **Developer Discord**: https://discord.gg/zigma-devs 🟢
- **Twitter**: https://twitter.com/ZigmaOracle 🟢
- **GitHub Discussions**: https://github.com/zigma-ai/frontend/discussions 🟢

### **Resources**
- **Component Library**: https://components.zigma.ai 🟢
- **Storybook**: https://storybook.zigma.ai 🟢
- **API Reference**: https://docs.zigma.ai/api 🟢
- **Changelog**: https://github.com/zigma-ai/frontend/releases 🟢

---

## 🚀 **Quick Start**

### **For Developers**
1. **Clone**: `git clone https://github.com/zigma-ai/frontend` 🟢
2. **Install**: `npm install` 🟢
3. **Configure**: Set up environment variables 🟢
4. **Run**: `npm run dev` 🟢

### **For Designers**
1. **Design System**: https://ui.zigma.ai 🟢
2. **Components**: Browse component library 🟢
3. **Guidelines**: Follow style guide 🟢
4. **Contribute**: Submit design improvements 🟢

---

## 📞 **Need Help?**

### **Support Channels**
- **Documentation**: https://docs.zigma.ai/frontend 🟢
- **GitHub Issues**: Report bugs and request features 🟢
- **Discord**: Real-time developer support 🟢
- **Email**: frontend@zigma.ai 🟢

### **Development Resources**
- **API Integration**: Backend connection guide 🟢
- **Component Examples**: Usage demonstrations 🟢
- **Best Practices**: Development guidelines 🟢
- **Troubleshooting**: Common issues and solutions 🟢

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Zigma Frontend Console | Real-Time Prediction Market Intelligence Dashboard*

**Built with ❤️ by the ZIGMA Team | React + TypeScript | Open Source**

---

*Last Updated: January 2026 | Version 1.0*


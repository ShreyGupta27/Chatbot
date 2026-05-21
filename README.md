# 🏛️ Unified Legal Technology Platform

> **Enterprise-Grade Legal RAG Chatbot System with Comprehensive Case Management**

A sophisticated, production-ready legal technology platform that combines Retrieval-Augmented Generation (RAG) with comprehensive case management, payment processing, and advanced administrative capabilities. Built for law firms, individual lawyers, and legal service providers.

## ✨ Key Features

### 🤖 AI-Powered Legal Assistant
- **Specialized AI Agents**: Contract analysis, legal research, litigation support, corporate law
- **Multi-LLM Support**: Ollama (local) + Google Gemini (cloud) integration
- **RAG Technology**: Semantic search across legal documents with pgvector
- **Context-Aware Responses**: Multi-turn conversations with legal document context

### ⚖️ Comprehensive Case Management
- **Complete Case Lifecycle**: Intake → Discovery → Trial → Closure workflow
- **Case Deadlines & Reminders**: Automated deadline tracking and notifications
- **Document Management**: Upload, organize, and analyze legal documents
- **Case Assignment**: Assign cases to lawyers with role-based access

### 💳 Integrated Payment Processing
- **Multiple Payment Methods**: Stripe (cards) + Razorpay (UPI, NetBanking)
- **Consultation Billing**: Automated billing for legal consultations
- **Payment Tracking**: Complete payment history and invoice generation
- **Refund Management**: Process refunds and payment adjustments

### 📅 Appointment & Consultation System
- **Consultation Booking**: Clients can book appointments with lawyers
- **Availability Management**: Lawyers define available time slots
- **Meeting Types**: Video, phone, and in-person consultations
- **Automated Reminders**: Email/SMS notifications for appointments

### 🏢 Multi-Tenant Architecture
- **Law Firm Support**: Complete firm management with multiple lawyers
- **Role-Based Access**: Super Admin, Admin, Firm Owner, Lawyer, Client, Support
- **User Management**: Comprehensive user profiles and verification
- **Firm Branding**: Customizable theming and branding options

### 📊 Advanced Analytics & Reporting
- **Legal Metrics**: Case statistics, appointment tracking, revenue analytics
- **Performance Dashboards**: Real-time insights into firm operations
- **Chat Analytics**: Session tracking and AI agent performance
- **Export Capabilities**: Generate reports and export data

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 16)                    │
│  Legal Dashboard | Case Management | Chat Widget | Analytics│
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST API
┌────────────────────────▼────────────────────────────────────┐
│                  Backend (FastAPI)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Legal RAG Engine | Multi-Agent System | Case Mgmt   │  │
│  │ Payment Processing | Appointments | Legal Analytics │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼────┐    ┌─────▼──────┐   ┌────▼────┐
   │PostgreSQL│    │Multi-LLM   │   │ Vector  │
   │+ pgvector│    │(Ollama+    │   │ Search  │
   │          │    │ Gemini)    │   │         │
   └──────────┘    └────────────┘   └─────────┘
```

## 🛠️ Technology Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **PostgreSQL**: Primary database with pgvector for embeddings
- **SQLAlchemy**: ORM for database operations
- **Ollama**: Local LLM inference (Gemma, Qwen models)
- **Google Gemini**: Cloud-based AI for enhanced capabilities
- **Sentence Transformers**: Text embeddings for semantic search
- **Stripe & Razorpay**: Payment processing integration
- **Twilio**: SMS and communication services

### Frontend
- **Next.js 16**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Data visualization and analytics
- **React Hook Form**: Form handling and validation

### AI & ML
- **RAG Pipeline**: Retrieval-Augmented Generation
- **Vector Embeddings**: 768-dimensional semantic search
- **Multi-Agent System**: Specialized AI for different legal areas
- **Document Processing**: PDF, DOCX, TXT analysis
- **Message Filtering**: Content moderation and routing

## 🚀 Quick Start

### Prerequisites
- **Python 3.9+** with pip
- **Node.js 18+** with npm
- **PostgreSQL 14+** with pgvector extension
- **Ollama** (for local LLM inference)

### 1. Clone Repository
```bash
git clone <repository-url>
cd unified-chatbot
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb unified_legal_db

# Install pgvector extension
psql -d unified_legal_db -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Initialize database with default data
python init_db.py
```

### 4. Ollama Setup
```bash
# Install Ollama from https://ollama.ai
# Pull required models
ollama pull gemma2:2b-instruct-q8_0
ollama pull nomic-ai/nomic-embed-text-v1

# Start Ollama service
ollama serve
```

### 5. Start Backend
```bash
python main.py
# Backend available at http://localhost:8000
```

### 6. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend available at http://localhost:3001
```

### 7. Access the Platform
- **Admin Panel**: http://localhost:3001/login
- **Chat Widget**: http://localhost:3001/widget
- **API Docs**: http://localhost:8000/docs

## 🔐 Default Credentials

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| Super Admin | `admin` | `admin123` | Full system access |
| Lawyer | `lawyer` | `lawyer123` | Case & client management |
| Client | `client` | `client123` | Personal cases & appointments |

## 📋 Configuration

### Environment Variables (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/unified_legal_db

# AI Models
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma2:2b-instruct-q8_0
GEMINI_API_KEY=your_google_gemini_api_key

# Security
SECRET_KEY=your-super-secret-key-change-in-production

# Payments
STRIPE_SECRET_KEY=sk_test_your_stripe_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Communication
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
SENDGRID_API_KEY=your_sendgrid_key
```

## 🎯 Key Features in Detail

### AI Agents
- **General Legal Assistant**: Broad legal guidance and information
- **Contract Analyzer**: Contract review and risk assessment
- **Legal Researcher**: Case law and statute research
- **Litigation Support**: Trial preparation and case strategy
- **Corporate Counsel**: Business law and compliance

### Case Management
- **Case Types**: Contract, Litigation, Corporate, Family, Criminal, Immigration, IP, Real Estate
- **Status Tracking**: Intake, Discovery, Trial, Closed, Archived
- **Priority Levels**: Low, Medium, High, Urgent
- **Deadline Management**: Automated reminders and notifications

### Payment Features
- **Consultation Fees**: Hourly billing for legal services
- **Retainer Management**: Track retainer balances
- **Invoice Generation**: Automated billing and invoicing
- **Payment Methods**: Credit cards, UPI, NetBanking, Bank transfer

### Document Management
- **File Upload**: PDF, DOCX, TXT support
- **Text Extraction**: Automatic content extraction and indexing
- **Semantic Search**: Find relevant documents using natural language
- **Version Control**: Track document changes and revisions

## 📊 API Endpoints

### Authentication
```
POST   /token                    - Login and get access token
GET    /users/me                 - Get current user info
POST   /register                 - Register new user
```

### Case Management
```
GET    /cases                    - List cases
POST   /cases                    - Create new case
GET    /cases/{id}               - Get case details
PUT    /cases/{id}               - Update case
DELETE /cases/{id}               - Delete case
```

### AI & Chat
```
POST   /query                    - Submit query to AI assistant
GET    /agents                   - List AI agents
POST   /agents                   - Create new AI agent
GET    /sessions                 - List chat sessions
```

### Appointments
```
GET    /appointments             - List appointments
POST   /appointments             - Create appointment
PUT    /appointments/{id}        - Update appointment
```

### Payments
```
POST   /payments/create-intent   - Create payment intent
POST   /payments/{id}/confirm    - Confirm payment
GET    /payments                 - List payments
```

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Backend
cd backend
pip install -r requirements.txt
# Configure production environment variables

# Frontend
cd frontend
npm run build
npm start
```

## 🚢 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Cloud Deployment
1. **Database**: Use managed PostgreSQL (AWS RDS, Google Cloud SQL)
2. **Backend**: Deploy to container service (AWS ECS, Google Cloud Run)
3. **Frontend**: Deploy to static hosting (Vercel, Netlify)
4. **AI Models**: Use cloud AI services or dedicated GPU instances

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Fine-grained permissions
- **Password Hashing**: Argon2 for secure password storage
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Configurable cross-origin policies
- **SQL Injection Prevention**: Parameterized queries
- **Data Encryption**: Sensitive data encryption at rest

## 📈 Performance & Scalability

- **Vector Search**: Optimized pgvector queries for fast document retrieval
- **Caching**: Redis integration for session and data caching
- **Database Indexing**: Optimized indexes for frequent queries
- **Async Processing**: Background tasks for heavy operations
- **Load Balancing**: Ready for horizontal scaling
- **CDN Integration**: Static asset optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

## 🙏 Acknowledgments

- Built on the foundation of three chatbot projects: AGchatbot, DMS Chatbot, and LegalPlatformChatbot
- Powered by open-source AI models and modern web technologies
- Designed for the legal technology community

---

**⚖️ Legal Disclaimer**: This platform provides general legal information and tools. It does not constitute legal advice. Always consult with qualified legal professionals for specific legal matters.
#!/usr/bin/env python3
"""
Database initialization script for the Unified Legal Platform
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import Base, User, AIAgent, UserRole, UserStatus, AgentSpecialization
from main import get_password_hash

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL not found in environment variables")
    sys.exit(1)

def init_database():
    """Initialize the database with tables and default data"""
    
    print("🔧 Initializing Unified Legal Platform Database...")
    
    # Create engine and session
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    try:
        # Create all tables
        print("📋 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        
        # Enable pgvector extension
        print("🔍 Enabling pgvector extension...")
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            conn.commit()
        
        # Create session for data insertion
        db = SessionLocal()
        
        try:
            # Create default admin user
            print("👤 Creating default admin user...")
            admin_user = db.query(User).filter(User.username == "admin").first()
            if not admin_user:
                admin_user = User(
                    username="admin",
                    email="admin@legalplatform.com",
                    hashed_password=get_password_hash("admin123"),
                    full_name="System Administrator",
                    role=UserRole.SUPER_ADMIN,
                    status=UserStatus.ACTIVE,
                    is_verified=True,
                    agreed_to_terms=True
                )
                db.add(admin_user)
                print("✅ Created admin user: admin / admin123")
            else:
                print("ℹ️  Admin user already exists")
            
            # Create demo lawyer user
            print("👨‍💼 Creating demo lawyer user...")
            lawyer_user = db.query(User).filter(User.username == "lawyer").first()
            if not lawyer_user:
                lawyer_user = User(
                    username="lawyer",
                    email="lawyer@legalplatform.com",
                    hashed_password=get_password_hash("lawyer123"),
                    full_name="John Smith, Esq.",
                    phone="+1-555-0123",
                    role=UserRole.LAWYER,
                    status=UserStatus.ACTIVE,
                    is_verified=True,
                    agreed_to_terms=True
                )
                db.add(lawyer_user)
                print("✅ Created lawyer user: lawyer / lawyer123")
            else:
                print("ℹ️  Lawyer user already exists")
            
            # Create demo client user
            print("👤 Creating demo client user...")
            client_user = db.query(User).filter(User.username == "client").first()
            if not client_user:
                client_user = User(
                    username="client",
                    email="client@example.com",
                    hashed_password=get_password_hash("client123"),
                    full_name="Jane Doe",
                    phone="+1-555-0456",
                    role=UserRole.CLIENT,
                    status=UserStatus.ACTIVE,
                    is_verified=True,
                    agreed_to_terms=True
                )
                db.add(client_user)
                print("✅ Created client user: client / client123")
            else:
                print("ℹ️  Client user already exists")
            
            # Create default AI agents
            print("🤖 Creating default AI agents...")
            default_agents = [
                {
                    "name": "general_legal_assistant",
                    "alias": "General Legal Assistant",
                    "model": os.getenv("OLLAMA_MODEL", "gemma2:2b-instruct-q8_0"),
                    "system_prompt": "You are a helpful legal assistant. Provide accurate legal information while reminding users that this is not legal advice and they should consult with a qualified attorney for specific legal matters. Be professional, thorough, and cite relevant legal principles when appropriate.",
                    "specialization": AgentSpecialization.GENERAL,
                    "temperature": 0.7
                },
                {
                    "name": "contract_analyzer",
                    "alias": "Contract Analysis Specialist",
                    "model": os.getenv("OLLAMA_MODEL", "gemma2:2b-instruct-q8_0"),
                    "system_prompt": "You are a contract analysis specialist. Help users understand contract terms, identify potential issues, and explain legal language in plain English. Focus on risk assessment, key clauses, and potential red flags. Always remind users to have contracts reviewed by qualified legal counsel.",
                    "specialization": AgentSpecialization.CONTRACT_ANALYSIS,
                    "temperature": 0.5
                },
                {
                    "name": "legal_researcher",
                    "alias": "Legal Research Assistant",
                    "model": os.getenv("OLLAMA_MODEL", "gemma2:2b-instruct-q8_0"),
                    "system_prompt": "You are a legal research specialist. Help users find relevant case law, statutes, and legal precedents. Provide comprehensive research assistance while maintaining accuracy and citing sources when possible. Focus on helping users understand legal principles and their applications.",
                    "specialization": AgentSpecialization.LEGAL_RESEARCH,
                    "temperature": 0.3
                },
                {
                    "name": "litigation_support",
                    "alias": "Litigation Support Assistant",
                    "model": os.getenv("OLLAMA_MODEL", "gemma2:2b-instruct-q8_0"),
                    "system_prompt": "You are a litigation support specialist. Assist with case strategy, document review, and trial preparation. Provide tactical insights while maintaining objectivity. Help organize case materials and identify key legal arguments. Always emphasize the importance of working with qualified litigation attorneys.",
                    "specialization": AgentSpecialization.LITIGATION,
                    "temperature": 0.6
                },
                {
                    "name": "corporate_counsel",
                    "alias": "Corporate Law Assistant",
                    "model": os.getenv("OLLAMA_MODEL", "gemma2:2b-instruct-q8_0"),
                    "system_prompt": "You are a corporate law specialist. Help with business formation, compliance, mergers and acquisitions, and corporate governance matters. Provide guidance on corporate structures, regulatory compliance, and business law issues. Always recommend consultation with corporate attorneys for specific business decisions.",
                    "specialization": AgentSpecialization.CORPORATE,
                    "temperature": 0.4
                }
            ]
            
            for agent_data in default_agents:
                existing_agent = db.query(AIAgent).filter(AIAgent.name == agent_data["name"]).first()
                if not existing_agent:
                    agent = AIAgent(**agent_data)
                    db.add(agent)
                    print(f"✅ Created AI agent: {agent_data['alias']}")
                else:
                    print(f"ℹ️  AI agent already exists: {agent_data['alias']}")
            
            # Commit all changes
            db.commit()
            print("💾 Database initialization completed successfully!")
            
            # Print summary
            print("\n" + "="*60)
            print("🎉 UNIFIED LEGAL PLATFORM INITIALIZED")
            print("="*60)
            print("Default Users Created:")
            print("  👑 Admin:  admin / admin123")
            print("  👨‍💼 Lawyer: lawyer / lawyer123") 
            print("  👤 Client: client / client123")
            print("\nAI Agents Created:")
            for agent_data in default_agents:
                print(f"  🤖 {agent_data['alias']}")
            print("\nNext Steps:")
            print("  1. Start the backend server: python main.py")
            print("  2. Start the frontend server: npm run dev")
            print("  3. Access admin panel: http://localhost:3001/login")
            print("  4. Test chat widget: http://localhost:3001/widget")
            print("="*60)
            
        except Exception as e:
            print(f"❌ Error inserting default data: {e}")
            db.rollback()
            raise
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_database()
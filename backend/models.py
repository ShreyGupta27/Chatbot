# backend/models.py

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from datetime import datetime
import enum

Base = declarative_base()

# Enums
class UserRole(enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    FIRM_OWNER = "firm_owner"
    LAWYER = "lawyer"
    CLIENT = "client"
    SUPPORT = "support"

class UserStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    SUSPENDED = "suspended"

class CaseStatus(enum.Enum):
    INTAKE = "intake"
    DISCOVERY = "discovery"
    TRIAL = "trial"
    CLOSED = "closed"
    ARCHIVED = "archived"

class CasePriority(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class PaymentStatus(enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class AppointmentStatus(enum.Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

class AgentSpecialization(enum.Enum):
    GENERAL = "general"
    LEGAL_RESEARCH = "legal_research"
    CONTRACT_ANALYSIS = "contract_analysis"
    LITIGATION = "litigation"
    CORPORATE = "corporate"
    FAMILY_LAW = "family_law"
    CRIMINAL_LAW = "criminal_law"
    IMMIGRATION = "immigration"
    INTELLECTUAL_PROPERTY = "intellectual_property"
    REAL_ESTATE = "real_estate"

class FilterType(enum.Enum):
    BLOCK = "block"
    FLAG = "flag"
    REDIRECT = "redirect"

# Core User Management
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    phone = Column(String)
    role = Column(SQLEnum(UserRole), default=UserRole.CLIENT)
    status = Column(SQLEnum(UserStatus), default=UserStatus.PENDING)
    is_verified = Column(Boolean, default=False)
    agreed_to_terms = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # OTP fields
    otp = Column(Integer)
    otp_expires_at = Column(DateTime)
    
    # Relationships
    firm = relationship("Firm", back_populates="owner", uselist=False)
    lawyer_profile = relationship("LawyerProfile", back_populates="user", uselist=False)
    client_profile = relationship("ClientProfile", back_populates="user", uselist=False)
    cases_as_lawyer = relationship("Case", foreign_keys="Case.lawyer_id", back_populates="lawyer")
    cases_as_client = relationship("Case", foreign_keys="Case.client_id", back_populates="client")

class Firm(Base):
    __tablename__ = "firms"
    
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), unique=True)
    name = Column(String, nullable=False)
    address = Column(Text)
    city = Column(String)
    state = Column(String)
    zip_code = Column(String)
    country = Column(String)
    phone = Column(String)
    email = Column(String)
    website = Column(String)
    logo_url = Column(String)
    tax_id = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="firm")
    lawyers = relationship("LawyerProfile", back_populates="firm")
    cases = relationship("Case", back_populates="firm")

class LawyerProfile(Base):
    __tablename__ = "lawyer_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    firm_id = Column(Integer, ForeignKey("firms.id"))
    bar_number = Column(String)
    license_state = Column(String)
    years_experience = Column(Integer)
    hourly_rate = Column(Float)
    specializations = Column(Text)  # JSON array of specializations
    bio = Column(Text)
    education = Column(Text)
    certifications = Column(Text)
    languages = Column(Text)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="lawyer_profile")
    firm = relationship("Firm", back_populates="lawyers")

class ClientProfile(Base):
    __tablename__ = "client_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    company_name = Column(String)
    industry = Column(String)
    preferred_language = Column(String, default="en")
    communication_preference = Column(String, default="email")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="client_profile")

# Case Management
class Case(Base):
    __tablename__ = "cases"
    
    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String, unique=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    case_type = Column(String)  # litigation, contract, corporate, etc.
    status = Column(SQLEnum(CaseStatus), default=CaseStatus.INTAKE)
    priority = Column(SQLEnum(CasePriority), default=CasePriority.MEDIUM)
    
    # Parties
    lawyer_id = Column(Integer, ForeignKey("users.id"))
    client_id = Column(Integer, ForeignKey("users.id"))
    firm_id = Column(Integer, ForeignKey("firms.id"))
    
    # Dates
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deadline = Column(DateTime)
    closed_at = Column(DateTime)
    
    # Financial
    estimated_hours = Column(Float)
    hourly_rate = Column(Float)
    total_amount = Column(Float)
    
    # Relationships
    lawyer = relationship("User", foreign_keys=[lawyer_id], back_populates="cases_as_lawyer")
    client = relationship("User", foreign_keys=[client_id], back_populates="cases_as_client")
    firm = relationship("Firm", back_populates="cases")
    documents = relationship("Document", back_populates="case")
    appointments = relationship("Appointment", back_populates="case")

# Document Management
class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer)
    mime_type = Column(String)
    upload_date = Column(DateTime, default=datetime.utcnow)
    
    # Metadata
    source_type = Column(String, default="file")  # file, website, database
    source_config = Column(Text)  # JSON config for source
    is_confidential = Column(Boolean, default=False)
    
    # Relationships
    uploader_id = Column(Integer, ForeignKey("users.id"))
    case_id = Column(Integer, ForeignKey("cases.id"))
    
    uploader = relationship("User")
    case = relationship("Case", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, index=True)
    chunk_text = Column(Text, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    embedding = Column(Vector(768))  # Default embedding dimension
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    document = relationship("Document", back_populates="chunks")

# AI Agents
class AIAgent(Base):
    __tablename__ = "ai_agents"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    alias = Column(String, nullable=False)
    model = Column(String, nullable=False)
    system_prompt = Column(Text, nullable=False)
    temperature = Column(Float, default=0.7)
    specialization = Column(SQLEnum(AgentSpecialization), default=AgentSpecialization.GENERAL)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Message Filtering
class MessageFilter(Base):
    __tablename__ = "message_filters"
    
    id = Column(Integer, primary_key=True, index=True)
    keyword = Column(String, nullable=False)
    filter_type = Column(SQLEnum(FilterType), nullable=False)
    action = Column(String)  # Custom action or agent name for redirect
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Chat Sessions
class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True, nullable=False)
    visitor_id = Column(String, index=True)
    visitor_name = Column(String)
    visitor_email = Column(String)
    visitor_ip = Column(String)
    visitor_location = Column(String)
    visitor_device = Column(String)
    visitor_browser = Column(String)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime)
    message_count = Column(Integer, default=0)
    status = Column(String, default="active")  # active, ended, archived
    
    # Legal context
    case_id = Column(Integer, ForeignKey("cases.id"))
    case = relationship("Case")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("chat_sessions.session_id"), nullable=False)
    role = Column(String, nullable=False)  # user, assistant, system
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    filtered = Column(String)  # Reason if filtered
    agent_name = Column(String)  # Which agent handled this

# Appointments & Consultations
class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    
    # Parties
    lawyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    case_id = Column(Integer, ForeignKey("cases.id"))
    
    # Scheduling
    scheduled_at = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=60)
    status = Column(SQLEnum(AppointmentStatus), default=AppointmentStatus.SCHEDULED)
    
    # Meeting details
    meeting_type = Column(String, default="video")  # video, phone, in_person
    meeting_url = Column(String)
    meeting_notes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    lawyer = relationship("User", foreign_keys=[lawyer_id])
    client = relationship("User", foreign_keys=[client_id])
    case = relationship("Case", back_populates="appointments")

# Payment System
class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(String, unique=True, index=True)  # External payment ID
    
    # Parties
    payer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"))
    case_id = Column(Integer, ForeignKey("cases.id"))
    appointment_id = Column(Integer, ForeignKey("appointments.id"))
    
    # Payment details
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    description = Column(String)
    payment_method = Column(String)  # stripe, razorpay, bank_transfer
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)
    
    # External references
    stripe_payment_intent_id = Column(String)
    razorpay_payment_id = Column(String)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    paid_at = Column(DateTime)
    
    # Relationships
    payer = relationship("User", foreign_keys=[payer_id])
    recipient = relationship("User", foreign_keys=[recipient_id])

# Theme Settings
class ThemeSetting(Base):
    __tablename__ = "theme_settings"
    
    key = Column(String, primary_key=True, index=True)
    value = Column(String)

# Support Tickets
class SupportTicket(Base):
    __tablename__ = "support_tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String, unique=True, index=True)
    session_id = Column(String, ForeignKey("chat_sessions.session_id"))
    
    # Contact info
    visitor_name = Column(String)
    visitor_email = Column(String)
    visitor_mobile = Column(String)
    
    # Ticket details
    subject = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String)
    priority = Column(SQLEnum(CasePriority), default=CasePriority.MEDIUM)
    status = Column(String, default="open")  # open, in_progress, resolved, closed
    
    # Assignment
    assigned_to = Column(Integer, ForeignKey("users.id"))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime)
    
    # Relationships
    assignee = relationship("User")
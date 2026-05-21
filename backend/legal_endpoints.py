# backend/legal_endpoints.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import uuid
import stripe
import razorpay

from main import get_db, get_current_user
from models import *
from main import (
    CaseCreate, AppointmentCreate, PaymentCreate, 
    stripe, razorpay_client, twilio_client
)

router = APIRouter()

# ============ CASE MANAGEMENT ============

@router.post("/cases", response_model=dict)
async def create_case(
    case_data: CaseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify user is a lawyer or admin
    if current_user.role not in [UserRole.LAWYER, UserRole.FIRM_OWNER, UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Only lawyers can create cases")
    
    # Generate case number
    case_number = f"CASE-{datetime.now().year}-{uuid.uuid4().hex[:8].upper()}"
    
    # Get firm ID if user is associated with a firm
    firm_id = None
    if current_user.firm:
        firm_id = current_user.firm.id
    elif current_user.lawyer_profile and current_user.lawyer_profile.firm:
        firm_id = current_user.lawyer_profile.firm.id
    
    case = Case(
        case_number=case_number,
        title=case_data.title,
        description=case_data.description,
        case_type=case_data.case_type,
        lawyer_id=current_user.id,
        client_id=case_data.client_id,
        firm_id=firm_id,
        priority=case_data.priority,
        deadline=case_data.deadline
    )
    
    db.add(case)
    db.commit()
    db.refresh(case)
    
    return {
        "id": case.id,
        "case_number": case.case_number,
        "title": case.title,
        "status": case.status.value,
        "created_at": case.created_at
    }

@router.get("/cases")
async def list_cases(
    status: Optional[str] = None,
    client_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Case)
    
    # Filter based on user role
    if current_user.role == UserRole.CLIENT:
        query = query.filter(Case.client_id == current_user.id)
    elif current_user.role == UserRole.LAWYER:
        query = query.filter(Case.lawyer_id == current_user.id)
    elif current_user.role == UserRole.FIRM_OWNER and current_user.firm:
        query = query.filter(Case.firm_id == current_user.firm.id)
    
    # Apply additional filters
    if status:
        query = query.filter(Case.status == status)
    if client_id and current_user.role in [UserRole.LAWYER, UserRole.FIRM_OWNER, UserRole.ADMIN]:
        query = query.filter(Case.client_id == client_id)
    
    cases = query.all()
    
    return [
        {
            "id": case.id,
            "case_number": case.case_number,
            "title": case.title,
            "case_type": case.case_type,
            "status": case.status.value,
            "priority": case.priority.value,
            "client_name": case.client.full_name if case.client else None,
            "lawyer_name": case.lawyer.full_name if case.lawyer else None,
            "created_at": case.created_at,
            "deadline": case.deadline
        }
        for case in cases
    ]

@router.get("/cases/{case_id}")
async def get_case(
    case_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Check access permissions
    if (current_user.role == UserRole.CLIENT and case.client_id != current_user.id) or \
       (current_user.role == UserRole.LAWYER and case.lawyer_id != current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")
    
    return {
        "id": case.id,
        "case_number": case.case_number,
        "title": case.title,
        "description": case.description,
        "case_type": case.case_type,
        "status": case.status.value,
        "priority": case.priority.value,
        "client": {
            "id": case.client.id,
            "name": case.client.full_name,
            "email": case.client.email
        } if case.client else None,
        "lawyer": {
            "id": case.lawyer.id,
            "name": case.lawyer.full_name,
            "email": case.lawyer.email
        } if case.lawyer else None,
        "created_at": case.created_at,
        "updated_at": case.updated_at,
        "deadline": case.deadline,
        "estimated_hours": case.estimated_hours,
        "hourly_rate": case.hourly_rate,
        "total_amount": case.total_amount,
        "documents_count": len(case.documents),
        "appointments_count": len(case.appointments)
    }

@router.put("/cases/{case_id}")
async def update_case(
    case_id: int,
    updates: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Check permissions
    if current_user.role == UserRole.CLIENT:
        raise HTTPException(status_code=403, detail="Clients cannot update cases")
    if current_user.role == UserRole.LAWYER and case.lawyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update allowed fields
    allowed_fields = ["title", "description", "status", "priority", "deadline", "estimated_hours", "hourly_rate"]
    for field, value in updates.items():
        if field in allowed_fields and hasattr(case, field):
            if field == "status":
                value = CaseStatus(value)
            elif field == "priority":
                value = CasePriority(value)
            setattr(case, field, value)
    
    case.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Case updated successfully"}

# ============ APPOINTMENT MANAGEMENT ============

@router.post("/appointments")
async def create_appointment(
    appointment_data: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify user is a lawyer
    if current_user.role not in [UserRole.LAWYER, UserRole.FIRM_OWNER]:
        raise HTTPException(status_code=403, detail="Only lawyers can create appointments")
    
    appointment = Appointment(
        title=appointment_data.title,
        description=appointment_data.description,
        lawyer_id=current_user.id,
        client_id=appointment_data.client_id,
        case_id=appointment_data.case_id,
        scheduled_at=appointment_data.scheduled_at,
        duration_minutes=appointment_data.duration_minutes,
        meeting_type=appointment_data.meeting_type
    )
    
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    # Send notification to client (if Twilio is configured)
    if twilio_client and appointment.client.phone:
        try:
            message_body = f"Appointment scheduled: {appointment.title} on {appointment.scheduled_at.strftime('%Y-%m-%d %H:%M')}"
            twilio_client.messages.create(
                body=message_body,
                from_=os.getenv("TWILIO_PHONE_NUMBER"),
                to=appointment.client.phone
            )
        except Exception as e:
            print(f"SMS notification failed: {e}")
    
    return {
        "id": appointment.id,
        "title": appointment.title,
        "scheduled_at": appointment.scheduled_at,
        "status": appointment.status.value,
        "meeting_type": appointment.meeting_type
    }

@router.get("/appointments")
async def list_appointments(
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Appointment)
    
    # Filter based on user role
    if current_user.role == UserRole.CLIENT:
        query = query.filter(Appointment.client_id == current_user.id)
    elif current_user.role == UserRole.LAWYER:
        query = query.filter(Appointment.lawyer_id == current_user.id)
    
    # Apply date filters
    if date_from:
        query = query.filter(Appointment.scheduled_at >= date_from)
    if date_to:
        query = query.filter(Appointment.scheduled_at <= date_to)
    
    appointments = query.order_by(Appointment.scheduled_at).all()
    
    return [
        {
            "id": apt.id,
            "title": apt.title,
            "client_name": apt.client.full_name,
            "lawyer_name": apt.lawyer.full_name,
            "scheduled_at": apt.scheduled_at,
            "duration_minutes": apt.duration_minutes,
            "status": apt.status.value,
            "meeting_type": apt.meeting_type,
            "case_id": apt.case_id
        }
        for apt in appointments
    ]

# ============ PAYMENT PROCESSING ============

@router.post("/payments/create-intent")
async def create_payment_intent(
    payment_data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        if payment_data.payment_method == "stripe" and stripe.api_key:
            # Create Stripe payment intent
            intent = stripe.PaymentIntent.create(
                amount=int(payment_data.amount * 100),  # Convert to cents
                currency=payment_data.currency.lower(),
                description=payment_data.description,
                metadata={
                    "user_id": current_user.id,
                    "case_id": payment_data.case_id,
                    "appointment_id": payment_data.appointment_id
                }
            )
            
            # Create payment record
            payment = Payment(
                payment_id=intent.id,
                payer_id=current_user.id,
                amount=payment_data.amount,
                currency=payment_data.currency,
                description=payment_data.description,
                payment_method="stripe",
                case_id=payment_data.case_id,
                appointment_id=payment_data.appointment_id,
                stripe_payment_intent_id=intent.id
            )
            db.add(payment)
            db.commit()
            
            return {
                "client_secret": intent.client_secret,
                "payment_id": payment.id
            }
            
        elif payment_data.payment_method == "razorpay" and razorpay_client:
            # Create Razorpay order
            order_data = {
                "amount": int(payment_data.amount * 100),  # Convert to paise
                "currency": payment_data.currency,
                "notes": {
                    "user_id": current_user.id,
                    "case_id": payment_data.case_id,
                    "appointment_id": payment_data.appointment_id
                }
            }
            order = razorpay_client.order.create(data=order_data)
            
            # Create payment record
            payment = Payment(
                payment_id=order["id"],
                payer_id=current_user.id,
                amount=payment_data.amount,
                currency=payment_data.currency,
                description=payment_data.description,
                payment_method="razorpay",
                case_id=payment_data.case_id,
                appointment_id=payment_data.appointment_id,
                razorpay_payment_id=order["id"]
            )
            db.add(payment)
            db.commit()
            
            return {
                "order_id": order["id"],
                "payment_id": payment.id
            }
        else:
            raise HTTPException(status_code=400, detail="Payment method not configured")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Payment creation failed: {str(e)}")

@router.post("/payments/{payment_id}/confirm")
async def confirm_payment(
    payment_id: int,
    confirmation_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    if payment.payer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        if payment.payment_method == "stripe":
            # Verify payment with Stripe
            intent = stripe.PaymentIntent.retrieve(payment.stripe_payment_intent_id)
            if intent.status == "succeeded":
                payment.status = PaymentStatus.COMPLETED
                payment.paid_at = datetime.utcnow()
            else:
                payment.status = PaymentStatus.FAILED
                
        elif payment.payment_method == "razorpay":
            # Verify payment with Razorpay
            razorpay_payment_id = confirmation_data.get("razorpay_payment_id")
            if razorpay_payment_id:
                payment_details = razorpay_client.payment.fetch(razorpay_payment_id)
                if payment_details["status"] == "captured":
                    payment.status = PaymentStatus.COMPLETED
                    payment.paid_at = datetime.utcnow()
                else:
                    payment.status = PaymentStatus.FAILED
        
        db.commit()
        
        return {
            "status": payment.status.value,
            "paid_at": payment.paid_at
        }
        
    except Exception as e:
        payment.status = PaymentStatus.FAILED
        db.commit()
        raise HTTPException(status_code=400, detail=f"Payment confirmation failed: {str(e)}")

@router.get("/payments")
async def list_payments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Payment)
    
    # Filter based on user role
    if current_user.role == UserRole.CLIENT:
        query = query.filter(Payment.payer_id == current_user.id)
    elif current_user.role == UserRole.LAWYER:
        query = query.filter(Payment.recipient_id == current_user.id)
    
    payments = query.order_by(Payment.created_at.desc()).all()
    
    return [
        {
            "id": payment.id,
            "amount": payment.amount,
            "currency": payment.currency,
            "description": payment.description,
            "status": payment.status.value,
            "payment_method": payment.payment_method,
            "created_at": payment.created_at,
            "paid_at": payment.paid_at,
            "case_id": payment.case_id
        }
        for payment in payments
    ]

# ============ AI AGENTS MANAGEMENT ============

@router.get("/agents")
async def list_agents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    agents = db.query(AIAgent).filter(AIAgent.is_active == True).all()
    return [
        {
            "id": agent.id,
            "name": agent.name,
            "alias": agent.alias,
            "specialization": agent.specialization.value,
            "model": agent.model,
            "temperature": agent.temperature,
            "created_at": agent.created_at
        }
        for agent in agents
    ]

@router.post("/agents")
async def create_agent(
    agent_data: AgentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only admins and firm owners can create agents
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FIRM_OWNER]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Check if agent name already exists
    existing_agent = db.query(AIAgent).filter(AIAgent.name == agent_data.name).first()
    if existing_agent:
        raise HTTPException(status_code=400, detail="Agent name already exists")
    
    agent = AIAgent(
        name=agent_data.name,
        alias=agent_data.alias,
        model=agent_data.model,
        system_prompt=agent_data.system_prompt,
        temperature=agent_data.temperature,
        specialization=agent_data.specialization
    )
    
    db.add(agent)
    db.commit()
    db.refresh(agent)
    
    return {
        "id": agent.id,
        "name": agent.name,
        "alias": agent.alias,
        "specialization": agent.specialization.value
    }

# ============ ANALYTICS ============

@router.get("/analytics/dashboard")
async def get_analytics_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Basic analytics - can be expanded based on user role
    
    # Case statistics
    total_cases = db.query(Case).count()
    active_cases = db.query(Case).filter(Case.status.in_([CaseStatus.INTAKE, CaseStatus.DISCOVERY, CaseStatus.TRIAL])).count()
    
    # Appointment statistics
    total_appointments = db.query(Appointment).count()
    upcoming_appointments = db.query(Appointment).filter(
        Appointment.scheduled_at > datetime.utcnow(),
        Appointment.status == AppointmentStatus.SCHEDULED
    ).count()
    
    # Payment statistics
    total_payments = db.query(Payment).filter(Payment.status == PaymentStatus.COMPLETED).count()
    total_revenue = db.query(func.sum(Payment.amount)).filter(Payment.status == PaymentStatus.COMPLETED).scalar() or 0
    
    # Chat statistics
    total_sessions = db.query(ChatSession).count()
    active_sessions = db.query(ChatSession).filter(ChatSession.status == "active").count()
    
    return {
        "cases": {
            "total": total_cases,
            "active": active_cases
        },
        "appointments": {
            "total": total_appointments,
            "upcoming": upcoming_appointments
        },
        "payments": {
            "total": total_payments,
            "revenue": total_revenue
        },
        "chat": {
            "total_sessions": total_sessions,
            "active_sessions": active_sessions
        }
    }
# 🚀 SaaS Booking System API Documentation

Base URL:
http://localhost:3000/api

Auth Header:
x-auth-token: YOUR_TOKEN

---

# 🧑‍💼 SERVICES

## ➕ Create Service
POST /services

### Body:
{
  "name": "Haircut",
  "duration": 30,
  "price": 50
}

### ✅ Response (201)
{
  "status": true,
  "message": ["Service created successfully"],
  "data": {
    "_id": "SERVICE_ID",
    "name": "Haircut",
    "duration": 30,
    "price": 50
  }
}

### ❌ Error (400)
{
  "status": false,
  "message": ["Service name already exists"]
}

---

## 📥 Get All Services
GET /services

### ✅ Response (200)
{
  "status": true,
  "data": [
    {
      "_id": "SERVICE_ID",
      "name": "Haircut",
      "duration": 30,
      "price": 50
    }
  ]
}

---

## 🔍 Get Service By ID
GET /services/:id

### ✅ Response (200)
{
  "status": true,
  "data": {
    "_id": "SERVICE_ID",
    "name": "Haircut",
    "duration": 30,
    "price": 50
  }
}

### ❌ Error (404)
{
  "status": false,
  "message": ["Service not found"]
}

---

## ✏️ Update Service
PATCH /services/:id

### ✅ Response (200)
{
  "status": true,
  "message": ["Service updated successfully"]
}

---

## ❌ Delete Service
DELETE /services/:id

### ✅ Response (200)
{
  "status": true,
  "message": ["Service deleted successfully"]
}

---

# 👨‍💼 STAFF

## ➕ Create Staff
POST /staff

### Body:
{
  "name": "John",
  "availability": [
    {
      "day": 1,
      "slots": [
        { "start": "09:00", "end": "17:00" }
      ]
    }
  ]
}

### ✅ Response (201)
{
  "status": true,
  "message": "Staff registered successfully",
  "data": {
    "id": "STAFF_ID",
    "name": "John"
  }
}

---

## 📥 Get All Staff
GET /staff

### ✅ Response (200)
{
  "status": true,
  "staffs": [
    {
      "_id": "STAFF_ID",
      "name": "John"
    }
  ]
}

---

## 🔍 Get Staff By ID
GET /staff/:id

### ✅ Response (200)
{
  "status": true,
  "profile": {
    "_id": "STAFF_ID",
    "name": "John"
  }
}

---

## ❌ Delete Staff
DELETE /staff/:id

### ✅ Response (202)
{
  "status": true,
  "message": "Accepted"
}

---

# 📅 BOOKINGS

## ➕ Create Booking
POST /bookings

### Body:
{
  "service_id": "SERVICE_ID",
  "staff_id": "STAFF_ID",
  "startAt": "2026-04-20T10:00:00Z",
  "endAt": "2026-04-20T10:30:00Z",
  "customer": {
    "name": "Ahmed",
    "phone": "+971500000000"
  }
}

### ✅ Response (201)
{
  "status": true,
  "data": {
    "_id": "BOOKING_ID",
    "status": "pending",
    "price": 50
  }
}

### ❌ Error (400)
{
  "status": false,
  "message": ["Staff is already booked for this time slot"]
}

---

## 📥 Get All Bookings
GET /bookings

### ✅ Response (200)
{
  "status": true,
  "data": [
    {
      "_id": "BOOKING_ID",
      "status": "pending",
      "startAt": "2026-04-20T10:00:00Z"
    }
  ]
}

---

## 🔍 Get Booking By ID
GET /bookings/:id

### ✅ Response (200)
{
  "status": true,
  "data": {
    "_id": "BOOKING_ID",
    "status": "pending",
    "customer": {
      "name": "Ahmed"
    }
  }
}

### ❌ Error (404)
{
  "status": false,
  "message": ["Booking not found"]
}

---

## ✏️ Update Booking
PATCH /bookings/:id

### Body:
{
  "status": "confirmed"
}

### ✅ Response (200)
{
  "status": true,
  "message": ["Booking updated successfully"]
}

### ❌ Error (400)
{
  "status": false,
  "message": ["Invalid status transition"]
}

---

## ❌ Delete Booking
DELETE /bookings/:id

### ✅ Response (200)
{
  "status": true,
  "message": ["Booking deleted successfully"]
}

### ❌ Error (400)
{
  "status": false,
  "message": ["Too late to cancel"]
}

---

# ⏱ AVAILABILITY

## 📥 Get Slots
GET /availability

### Query:
?staff_id=...&service_id=...&date=2026-04-20

### ✅ Response (200)
{
  "status": true,
  "slots": [
    "2026-04-20T09:00:00Z",
    "2026-04-20T09:30:00Z"
  ]
}

---

# ⛔ BLOCK TIME

## ➕ Create Block
POST /staff/block-time

### ✅ Response (201)
{
  "status": true,
  "message": "Block created"
}

---

# 👤 CUSTOMERS

## 📥 Get All Customers
GET /customers

### ✅ Response (200)
{
  "status": true,
  "data": [
    {
      "_id": "CUSTOMER_ID",
      "name": "Ahmed",
      "totalBookings": 3
    }
  ]
}

---

# 🌍 PUBLIC

## ➕ Book Public
POST /public/:slug/book

### ✅ Response (201)
{
  "status": true,
  "message": ["Booking created successfully"]
}

---

# 📊 ANALYTICS

## 📥 Overview
GET /analytics

### ✅ Response (200)
{
  "totalBookings": 120,
  "revenue": 5400,
  "cancelled": 12
}

---

# ⭐ RATING

## ➕ Rate Booking
POST /bookings/:id/rate

### ✅ Response (200)
{
  "status": true,
  "message": "Rating submitted"
}

---

# 🔐 NOTES

- All secured routes require token
- All times in UTC
- Multi-tenant enforced
- Soft delete used

---

# 🚀 STATUS FLOW

pending → confirmed → completed  
pending → cancelled  
confirmed → cancelled / no_show

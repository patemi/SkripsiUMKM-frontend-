# Database Relationships - UMKM Platform
# Format untuk Dataedo Import

## Collections Overview
- umkms (UMKM Collection)
- users (User Collection)  
- admins (Admin Collection)

---

## RELATIONSHIPS

### 1. User → UMKM (One-to-Many)
**Type:** One-to-Many
**Description:** Satu User dapat mendaftarkan banyak UMKM

**Parent Table:** users
- Primary Key: _id (ObjectId)

**Child Table:** umkms  
- Foreign Key: user_id (ObjectId)
- References: users._id

**Business Rule:**
- Satu user dapat memiliki 0 atau lebih UMKM
- Setiap UMKM harus terhubung dengan 1 user (pemilik)
- Cascade: Jika user dihapus, UMKM terkait bisa di-cascade delete atau set null

**Example:**
```
User (id: 507f1f77bcf86cd799439011)
  └── UMKM 1 (user_id: 507f1f77bcf86cd799439011)
  └── UMKM 2 (user_id: 507f1f77bcf86cd799439011)
  └── UMKM 3 (user_id: 507f1f77bcf86cd799439011)
```

---

### 2. Admin → UMKM Management (One-to-Many)
**Type:** One-to-Many
**Description:** Satu Admin dapat membuat/mengelola banyak UMKM

**Parent Table:** admins
- Primary Key: _id (ObjectId)

**Child Table:** umkms
- Foreign Key: admin_id (ObjectId, nullable)
- References: admins._id

**Business Rule:**
- Satu admin dapat membuat 0 atau lebih UMKM
- UMKM bisa dibuat oleh user (user_id) atau admin (admin_id)
- Jika UMKM dibuat admin, admin_id terisi, user_id bisa null

**Example:**
```
Admin (id: 507f191e810c19729de860ea)
  └── UMKM 1 (admin_id: 507f191e810c19729de860ea)
  └── UMKM 2 (admin_id: 507f191e810c19729de860ea)
  └── UMKM 4 (admin_id: 507f191e810c19729de860ea)
```

---

### 3. Admin → UMKM Verification (One-to-Many)
**Type:** One-to-Many
**Description:** Satu Admin dapat memverifikasi banyak UMKM

**Parent Table:** admins
- Primary Key: _id (ObjectId)

**Child Table:** umkms
- Foreign Key: verified_by (ObjectId, nullable)
- References: admins._id

**Business Rule:**
- Satu admin dapat memverifikasi 0 atau lebih UMKM
- UMKM dengan status "pending" tidak memiliki verified_by (null)
- UMKM dengan status "approved" atau "rejected" harus memiliki verified_by
- Field terkait: verified_at (timestamp verifikasi)

**Example:**
```
Admin (id: 507f191e810c19729de860ea)
  └── UMKM 1 (verified_by: 507f191e810c19729de860ea, status: approved)
  └── UMKM 2 (verified_by: 507f191e810c19729de860ea, status: rejected)
  └── UMKM 5 (verified_by: 507f191e810c19729de860ea, status: approved)
```

---

## FIELD RELATIONSHIPS DETAILS

### umkms.user_id → users._id
- **Relationship Name:** FK_UMKM_User
- **Cardinality:** Many-to-One (N:1)
- **Parent:** users._id
- **Child:** umkms.user_id
- **Type:** Optional (NULLABLE)
- **On Delete:** CASCADE or SET NULL
- **Description:** Menghubungkan UMKM dengan user yang mendaftarkan
- **Note:** Null jika UMKM dibuat oleh admin

### umkms.admin_id → admins._id
- **Relationship Name:** FK_UMKM_Admin_Creator
- **Cardinality:** Many-to-One (N:1)
- **Parent:** admins._id
- **Child:** umkms.admin_id
- **Type:** Optional (NULLABLE)
- **On Delete:** SET NULL
- **Description:** Menghubungkan UMKM dengan admin yang membuat/mengelola
- **Note:** Null jika UMKM dibuat oleh user

### umkms.verified_by → admins._id  
- **Relationship Name:** FK_UMKM_Admin_Verifier
- **Cardinality:** Many-to-One (N:1)
- **Parent:** admins._id
- **Child:** umkms.verified_by
- **Type:** Optional (NULLABLE)
- **On Delete:** SET NULL
- **Description:** Menghubungkan UMKM dengan admin yang memverifikasi

---

## ADDITIONAL RELATIONSHIPS (Implicit)

### 4. User → UMKM by Status (One-to-Many Filtered)
**Description:** Relationship user dengan UMKM berdasarkan status

**Variants:**
- User → Pending UMKM (status = 'pending')
- User → Approved UMKM (status = 'approved')  
- User → Rejected UMKM (status = 'rejected')

### 5. Admin → Verification Activity (One-to-Many)
**Description:** History aktivitas verifikasi admin

**Fields involved:**
- umkms.verified_by
- umkms.verified_at
- umkms.status
- umkms.rejection_reason

---

## REFERENCE INTEGRITY RULES

1. **User Registration → UMKM Creation**
   - User harus ada sebelum UMKM dibuat oleh user
   - Constraint: umkms.user_id MUST exist in users._id (if not null)

2. **Admin Management → UMKM Creation**
   - Admin dapat membuat UMKM langsung
   - Constraint: umkms.admin_id MUST exist in admins._id (if not null)
   - Business Rule: Setidaknya satu dari user_id atau admin_id harus terisi

3. **Admin Verification → UMKM Status**
   - Admin harus ada untuk melakukan verifikasi
   - Constraint: umkms.verified_by MUST exist in admins._id (if not null)

4. **UMKM Creator Validation**
   - At least one of (user_id OR admin_id) MUST be NOT NULL
   - If admin_id IS NOT NULL THEN UMKM created by admin
   - If user_id IS NOT NULL THEN UMKM created by user

5. **UMKM Status Validation**
   - If status = 'approved' OR 'rejected' THEN verified_by IS NOT NULL
   - If status = 'approved' OR 'rejected' THEN verified_at IS NOT NULL
   - If status = 'rejected' THEN rejection_reason IS NOT NULL

---

## DATABASE INDEXES (untuk optimasi relationships)

### umkms collection:
```javascript
{ "user_id": 1 }              // Index untuk query UMKM by user
{ "admin_id": 1 }             // Index untuk query UMKM by admin creator
{ "verified_by": 1 }          // Index untuk query UMKM by admin verifier
{ "status": 1, "user_id": 1 } // Composite index
{ "status": 1, "admin_id": 1 } // Composite index
{ "status": 1, "verified_by": 1 } // Composite index
```

### users collection:
```javascript
{ "email": 1 }  // Unique index
```

### admins collection:
```javascript
{ "email": 1 }  // Unique index
```

---

## QUERY EXAMPLES

### Get all UMKM by User:
```javascript
db.umkms.find({ user_id: ObjectId("507f1f77bcf86cd799439011") })
```

### Get all UMKM verified by Admin:
```javascript
db.umkms.find({ verified_by: ObjectId("507f191e810c19729de860ea") })
```

### Get User with their UMKM (Join):
```javascript
db.users.aggregate([
  {
    $lookup: {
      from: "umkms",
      localField: "_id",
      foreignField: "user_id",
      as: "umkm_list"
    }
  }
])
```

### Get Admin with verification history:
```javascript
db.admins.aggregate([
  {
    $lookup: {
      from: "umkms",
      localField: "_id",
      foreignField: "verified_by",
      as: "verified_umkm"
    }
  }
])
```

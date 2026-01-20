🚀 Job Portal System (Internship & Job Management Platform)

A full-stack Job & Internship Portal System built using Django REST Framework for backend and React.js for frontend, designed to connect students with recruiters through a seamless hiring workflow.

📌 Project Overview

The Job Portal System provides a complete recruitment ecosystem where:
Students can find internships/jobs and apply
Recruiters can post jobs and manage applicants
Admins can monitor and control platform activity
This project demonstrates real-world SaaS architecture, role-based authentication, and scalable API-driven design.

✨ Key Features
🔐 Authentication & Authorization

JWT-based login & signup
Role-based access control (Student / Recruiter / Admin)
Secure logout with token blacklisting

🎓 Student Features

Profile creation & editing
Browse job listings
Filter jobs by:

Role
Location
Job type
Apply with resume upload (PDF)
Track application status
Bookmark jobs
View application history

🧑‍💼 Recruiter Features

Recruiter registration
Company profile management
Post internships/jobs
Edit or delete job postings
View applicants
Accept / reject applications
Admin approval before posting jobs

🛠 Admin Features

Approve or block recruiters
Manage users and job postings
Remove fake accounts
Monitor platform analytics
View total users, jobs, and applications

📊 Dashboard Features
Student Dashboard

Total jobs applied
Status breakdown (Accepted / Rejected / Pending)
Recruiter Dashboard
Jobs posted
Applications received
Admin Dashboard
Users, jobs, applications overview
Visual analytics charts

⚡ Advanced Features

Resume upload support (PDF)
Email notifications
Bookmark jobs
Pagination
Search suggestions / autocomplete
Analytics with charts

🧠 Tech Stack
Backend

Django 5.2.10
Django REST Framework
JWT Authentication
SQLite / PostgreSQL
Pillow (file upload)
django-filter
django-cors-headers

Frontend

React 18
Material-UI (MUI)
Axios
React Router
Recharts
React Hook Form

🏗 System Architecture
React Frontend → Django REST API → Database

📂 Project Structure
Job-Portal-System/
│
├── backend/
│   ├── accounts/
│   ├── jobs/
│   ├── applications/
│   ├── dashboard/
│   ├── jobportal/
│   └── manage.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── utils/
│   └── public/
│
└── README.md

⚙️ Installation Guide
🔧 Backend Setup
cd backend

Create Virtual Environment
python -m venv venv

Activate Environment
Windows
venv\Scripts\activate

Mac/Linux
source venv/bin/activate

Install Dependencies
pip install -r requirements.txt

Run Migrations
python manage.py makemigrations
python manage.py migrate

Create Admin User
python manage.py createsuperuser

Start Server
python manage.py runserver


Backend URL:

http://localhost:8000

🎨 Frontend Setup
cd frontend
npm install
npm start


Frontend URL:

http://localhost:3000

🔗 API Endpoints
Authentication
POST /api/auth/signup/student/
POST /api/auth/signup/recruiter/
POST /api/auth/login/
POST /api/auth/logout/
POST /api/auth/refresh/
GET  /api/auth/user/

Student APIs
GET  /api/students/profile/
PUT  /api/students/profile/
POST /api/applications/
GET  /api/applications/
POST /api/bookmarks/
GET  /api/bookmarks/
DELETE /api/bookmarks/{id}/

Recruiter APIs
POST /api/jobs/
GET  /api/jobs/
PUT  /api/jobs/{id}/
DELETE /api/jobs/{id}/
GET  /api/jobs/{id}/applications/
PUT  /api/applications/{id}/update_status/

Admin APIs
GET  /api/admin/users/
PUT  /api/admin/recruiters/{id}/approve/
PUT  /api/admin/recruiters/{id}/block/
DELETE /api/admin/users/{id}/delete/

Dashboard APIs
GET /api/dashboard/student/
GET /api/dashboard/recruiter/
GET /api/dashboard/admin/

📧 Email Configuration

Update in settings.py:

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-password'

🗄 Database Support
Default

SQLite (Development)

Production Upgrade
pip install psycopg2


Update DATABASES in settings.py.

🔐 Security Features

JWT authentication
Password hashing
Role-based permissions
Secure API routes
CORS protection
File upload validation

🧪 Running Tests
Backend
python manage.py test

Frontend
npm test

🚀 Production Build
npm run build



👨‍💻 Author
Sania Parveen
<img width="1902" height="912" alt="login" src="https://github.com/user-attachments/assets/8d8c154f-ff8b-4f80-bea3-9d5181813f35" />

<img width="1912" height="851" alt="admin dashboard" src="https://github.com/user-attachments/assets/ce6de8af-e33f-447a-8177-63885fcec83b" />
<img width="1902" height="908" alt="recuiter dashboard" src="https://github.com/user-attachments/assets/c4fd13ab-7501-49ed-8dd4-8196af3a2005" />
<img width="1897" height="957" alt="student dashboard" src="https://github.com/user-attachments/assets/82cf6b94-ee26-41e9-8391-b8ca9b31dc89" />




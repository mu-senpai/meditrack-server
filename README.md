# MediTrack - Medical Camp Management System (MCMS)

MediTrack is a Medical Camp Management System (MCMS) built using the MERN stack. This platform simplifies the management and coordination of medical camps, empowering organizers and participants with seamless and efficient tools.

---

## 🎯 **Features**

### **General Features**
1. Fully responsive design for mobile, tablet, and desktop views, including dashboards.
2. Secure authentication with JWT (JSON Web Token) for protected routes.
3. Environment variables to secure sensitive data (Firebase config keys, MongoDB credentials).
4. Sweet alerts and toasts for CRUD operations and authentication feedback.
5. 404 Page for non-existent routes with a custom design.
6. Global footer with essential links, contact info, and quick access sections.
7. TanStack Query for efficient data fetching (GET methods).

### **Home Page**
1. **Navbar**: Includes logo, Home, Available Camps, and Join Us/Profile dropdown.
2. **Banner Slider**: Showcases impactful success stories from past medical camps.
3. **Popular Camps Section**: Displays top 6 camps by participant count with details and "See All Camps" button.
4. **Camp Details Page**:
   - Comprehensive details of each camp.
   - Modal for participant registration with essential participant information fields.
5. **Feedback and Ratings Section**:
   - Displays user feedback and ratings collected after camp experiences.
6. **Additional Section**: A dedicated project-specific section.

### **Available Camps Page**
1. Display all camps added by organizers with details (Name, Image, Date & Time, Location, etc.).
2. **Features**:
   - Search camps by keywords, dates, or relevant criteria.
   - Sort camps by participant count, fees, or alphabetical order.
   - Toggle layout button for 2-column or 3-column views on larger screens.
3. Direct link to the detailed camp page with registration options.

### **Organizer Dashboard**
1. **Routes**:
   - Organizer Profile (Update name, image, contact details).
   - Add A Camp (Formik/React Hook Form with field validation).
   - Manage Camps (Edit/Delete functionality).
   - Manage Registered Camps (View all registrations with payment and confirmation statuses).
2. **Registration Management**:
   - Cancel buttons with restrictions based on payment/confirmation status.
   - Clear and detailed tables for management.

### **Participant Dashboard**
1. **Routes**:
   - Analytics: Visualize lifetime registered camp data (Recharts or similar library).
   - Profile: Update participant profile details.
   - Registered Camps:
     - See registered camps with payment and confirmation status.
     - Feedback button enabled post-payment and admin approval.
     - Cancel registrations before payment.
   - Payment History: View transaction history with detailed payment records.

---

## 🚀 **Getting Started**

### **Setup Instructions**

1. **Clone the Repositories**
   - Frontend: `git clone <frontend-repo-url>`
   - Backend: `git clone <backend-repo-url>`

2. **Install Dependencies**
   ```bash
   # Navigate to frontend and backend directories
   npm install
   ```

3. **Environment Variables**
   Create `.env` files in both frontend and backend folders with the following keys:
   - **Backend**:
     ```
     DB_USER=your_mongodb_username
     DB_PASS=your_mongodb_password
     ACCESS_TOKEN_SECRET=your_jwt_secret
     PAYMENT_SECRET=your_stripe_secret_key
     ```
   - **Frontend**:
     ```
     VITE_API_URL=your_backend_url
     VITE_IMAGE_HOSTING_KEY=your_imgbb_api_key
     ```

4. **Run the Project**
   - Backend: `npm run start`
   - Frontend: `npm run dev`

5. **Visit the App**
   - Live Site: [MediTrack Live](https://medi-track-ede0d.web.app/)

---

## 📊 **Technologies Used**

- **Frontend**:
  - React, React Router, React Hook Form, Framer Motion, Recharts
  - Tailwind CSS for responsive and elegant design
- **Backend**:
  - Node.js, Express.js, MongoDB, Mongoose
  - Stripe API for payment integration
- **Authentication**:
  - Firebase Authentication
  - JWT for secure route protection

---

## 📋 **Requirements Completed**

- ✅ Fully responsive design for all devices.
- ✅ Secure authentication with JWT and role-based access control.
- ✅ All CRUD operations with sweet alerts and toasts.
- ✅ Integrated payment gateway using Stripe.
- ✅ Search, sort, and pagination for available camps.
- ✅ Feedback and rating collection with display on the homepage.

---

## 🎥 **Live Demo**

- **Frontend**: [Live Site](https://medi-track-ede0d.web.app/)
- **Backend**: [API Server](https://medi-track-server.vercel.app/)

---

## 👥 **Contributors**

- Organizer Email: `muhitabdullah279@gmail.com`
- Organizer Password: `Admin@123`

---

Feel free to expand the README based on future updates or optional tasks!

Connectify 📱
a) Set up instructions
1. Clone project
git clone https://github.com/katekime/WEB-Final_Sons-of-the-Mirage
cd WEB-backendFinal
2. Install packages
npm install
3. Create .env file
Copy .env.example to .env:

   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/connectify
   JWT_SECRET=my-super-secret-key-123456
   PORT=5000

4. Run server

    npm run dev

    Open: http://localhost:5000

b) Project overview

Connectify is a complete social network built like Twitter/X. Here's how it works from start to finish:

A user starts by registering with a username (3-30 characters), email address, and password (minimum 6 characters). After registration, they immediately receive a welcome email and get a JWT token that stays valid for 7 days. This token gets saved in the browser's localStorage and automatically sent with every request to protected endpoints.

Once logged in, users see the main feed with two tabs: "For you" (shows all posts sorted by date) and "Following" (only posts from people they follow). Each feed has pagination with 6 posts per page and Next/Prev buttons. Every post displays the author's avatar and username, post text (max 500 characters), real-time like counters, and comment counters.

Users can create posts by clicking the big blue "Post" button in the left sidebar. This opens a composer with their avatar, a textarea (max 500 chars), and a character counter. Posts save instantly with a toast notification.

To interact with posts, users can like/unlike with a smooth heart animation (burst effect on click). The like counter updates in real-time without page reload. They can also add comments (max 300 chars) by clicking "Comments" — comments load on demand and only the post author, moderators, or admins can edit/delete them.

Every interaction triggers notifications for the post owner: likes show a red heart icon, comments show a pen icon, and follows show a plus icon. Unread notifications have a blue border highlight. Users can mark all notifications as read with one click.

The profile page shows the user's avatar, username, role (user/moderator/admin), join date, and bio. Users can upload avatars (JPG/PNG/GIF/WebP, max 2MB) or edit their bio (max 200 chars). Username and email changes include duplicate checks to prevent conflicts.

Social features include searching users by username in the right sidebar (shows "Follow" buttons), following/unfollowing any user, and seeing "Who to follow" suggestions. The Following feed only shows posts from followed users.

The interface uses a dark theme (black background, blue accents) and works perfectly on desktop, tablet, and mobile. On mobile, sidebars hide automatically. All actions show loading states and toast notifications (bottom-right corner, auto-hide after 2.6 seconds).

Technically, this is a Single Page Application (SPA) using only Vanilla JavaScript — no React/Vue/Angular. The backend has 2 REST API endpoints organized by feature modules (auth, posts, users, follows, notifications, etc.). MongoDB stores 6 collections with proper indexes and relationships (Post.author → User, etc.). Security includes JWT authentication middleware, bcrypt password hashing, Joi input validation, Multer file upload protection, Helmet headers, and CORS.

Real-time features work without WebSockets: like counters update instantly via database queries, notifications appear immediately, and all UI updates happen without page reloads. Admin features let admins change user roles via API.

In total, Connectify delivers a production-ready social network with authentication, content creation, social interactions, notifications, profiles, search, and responsive design — all built with modern best practices and clean, modular code.

c) API documentation
| Method | Endpoint                | Description    | Auth | Body params               |
| ------ | ----------------------- | -------------- | ---- | ------------------------- |
| POST   | /api/auth/register      | Create account | No   | username, email, password |
| POST   | /api/auth/login         | Login          | No   | email, password           |
| GET    | /api/auth/me            | My profile     | Yes  | -                         |
| POST   | /api/posts              | Create post    | Yes  | text, mediaUrls[]         |
| GET    | /api/posts              | All posts      | Yes  | page=1&limit=10           |
| POST   | /api/posts/:id/like     | Like post      | Yes  | -                         |
| DELETE | /api/posts/:id/like     | Unlike post    | Yes  | -                         |
| POST   | /api/posts/:id/comments | Add comment    | Yes  | text                      |
| GET    | /api/feed               | Following feed | Yes  | page=1&limit=10           |
| PUT    | /api/users/profile      | Update profile | Yes  | bio, username?, email?    |
| POST   | /api/users/avatar       | Upload avatar  | Yes  | multipart/form-data       |
| GET    | /api/users/search       | Search users   | No   | q=nurbol                  |
| POST   | /api/follows/:userId    | Follow user    | Yes  | -                         |
| DELETE | /api/follows/:userId    | Unfollow user  | Yes  | -                         |
| GET    | /api/notifications      | Notifications  | Yes  | page=1&limit=20           |


Example login response:

json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "username": "nurbol",
    "email": "test@example.com"
  }
}

d) Screenshots of all features
1. Home Feed
See posts, like, comment, pagination
![photo_5206499102022111362_y](https://github.com/user-attachments/assets/bc97bc24-3f8d-4a23-a2f3-5dc887f7d438)


3. Login/Register screen
Login or create new account
![photo_5206499102022111363_y](https://github.com/user-attachments/assets/3a3adc7a-b8a1-417f-b472-a6ec1ee997b5)
![photo_5206499102022111366_y](https://github.com/user-attachments/assets/a9ee6394-b699-4a4d-a0b3-254e4953668f)


5. Create post
Write post and click Post button
![photo_5206499102022111364_y](https://github.com/user-attachments/assets/393f803b-2a78-450a-bcf9-64965b7a7627)
![photo_5206499102022111365_w](https://github.com/user-attachments/assets/b2dd158e-4f44-48ba-9333-14fe1852c6fe)


7. User Profile
See avatar,  edit profile
![photo_5206499102022111357_y](https://github.com/user-attachments/assets/efa14f4a-0d86-419a-bb57-29d8d0802dfe)



9. Edit profile form
Change bio and save
![photo_5206499102022111360_w](https://github.com/user-attachments/assets/e7595735-5d30-412a-be46-64ca867f988d)


11. Notifications
See who liked/commented your posts
![photo_5206499102022111358_y](https://github.com/user-attachments/assets/d40c5a7a-8abe-4940-93f7-aea18dab5454)
![photo_5206499102022111359_y](https://github.com/user-attachments/assets/b0672169-ca65-49ee-8567-e3001aab2f86)


13. Following feed
Posts from people you follow
![photo_5206499102022111367_w](https://github.com/user-attachments/assets/0f19ff9e-e497-429d-bc1d-c3501825ba43)
![photo_5206499102022111361_y](https://github.com/user-attachments/assets/ae0b0431-8a18-438c-9876-ade6b02e9c06)


15. Search users
Find users and click Follow
![photo_5206499102022111356_y](https://github.com/user-attachments/assets/29bf379a-3d99-4d71-8c43-8296b354eb50)


GitHub repository
https://github.com/katekime/WEB-Final_Sons-of-the-Mirage

Render Link(Deployment): https://web-final-sons-of-the-mirage.onrender.com/

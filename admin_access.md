# Gym It Up With — Admin CMS Access & Credentials

As requested, all visible links to the Admin CMS and Admin Login page have been removed from the public website navigation (Navbar and Footer). 

---

## 🔑 Direct Admin Login Details

* **Direct Admin Login URL:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
* **Admin Dashboard URL:** [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard) *(Requires active session)*

---

## 🛠️ Creating Admin Credentials (via Supabase Auth)

Because authentication is managed securely by **Supabase Auth**, passwords are encrypted and stored inside your own secure Supabase instance. To set up your credentials, follow these quick steps:

1. **Open your Supabase Project Dashboard** at [database.supabase.com](https://database.supabase.com).
2. Navigate to **Authentication** ➔ **Users** in the left sidebar.
3. Click the **Invite User** or **Add User** button.
4. Input your desired Admin Email (e.g., `admin@gymitupwith.co.ke`) and send the invite.
5. Alternatively, you can select **Create User** and define a temporary password.
6. The profile will automatically be created in the `public.profiles` database table with the default role of `'admin'` via our database trigger, granting immediate access to the CMS.

---

## 🌱 Database Seeding (Mock Content + Daily Popups)

We have added a custom script to quickly seed initial fitness quotes, training gallery photos, events, achievements, and daily popups:

```bash
# To populate mock database data, run the seed script:
node seed_supabase.js
```
*(Make sure you have configured your real credentials in your `.env.local` file beforehand).*

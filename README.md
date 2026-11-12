# ☕ Cafe Management System

A front-end web application for managing café operations — built with HTML, CSS, and vanilla JavaScript.  
No frameworks. No back-end. Runs entirely in the browser using `localStorage`.

> **Team project** · 3 members · Course: Intro to Web Development (63180)



##  Overview

The system serves four types of users:

| Role | What they can do |
|---|---|
| **Customer** | Browse the menu, add to cart, place an order, track order status |
| **Cashier** | Take walk-in orders, manage the order list, process payment, print receipt |
| **Barista** | View the kitchen queue, update order status (Preparing → Ready) |
| **Manager** | Manage the menu, users, inventory, dashboard and sales reports |

---

##  Modules

The system is divided into **three modules**, one per team member:

| Module | Pages | Member |
|---|---|---|
| **M1 — Administration** | login, register, users, dashboard, reports | Yasmina |
| **M2 — Back of House** | menu-admin, kitchen, inventory |Shora |
| **M3 — Front of House** | menu, cart, my-orders, orders, bill | Shaima |

---

## 🗂 File Structure

```
cafe-management/
│
├── index.html                  # Home page (everyone)
├── login.html                  # All users
├── register.html               # Customer self-registration
├── README.md
│
├── customer/
│   ├── menu.html               # Browse, filter, search
│   ├── cart.html               # Cart and checkout
│   └── my-orders.html          # Track order status
│
├── cashier/
│   ├── orders.html             # Order list, walk-in orders
│   └── bill.html               # Payment and printable receipt
│
├── barista/
│   └── kitchen.html            # Order queue: Preparing → Ready
│
├── admin/
│   ├── dashboard.html          # Sales overview
│   ├── reports.html            # Sales by day, CSV export
│   ├── users.html              # Manage staff accounts
│   ├── menu-admin.html         # Manage menu items and categories
│   └── inventory.html          # Stock levels and low-stock alerts
│
├── css/
│   └── style.css               # Shared design system
│
├── js/
│   ├── shared/
│   │   ├── storage.js          # localStorage helpers + sample data
│   │   ├── auth.js             # Session, logout, guard()
│   │   └── layout.js           # Navbar and footer
│   ├── customer/               # menu.js  cart.js  my-orders.js
│   ├── cashier/                # orders.js  bill.js
│   ├── barista/                # kitchen.js
│   └── admin/                  # dashboard.js  reports.js  users.js
│                               # menu-admin.js  inventory.js
│
└── images/
    ├── logo.png
    ├── hero.jpg
    ├── menu/                   # Food and drink photos
    └── icons/
```

---

## ⚙️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Page structure |
| CSS3 (Flexbox / Grid) | Responsive layout and design |
| Vanilla JavaScript (ES6) | All logic and interactivity |
| `localStorage` | Data storage (users, menu, orders, stock) |

---

##  How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/cafe-management.git
   ```
2. Open `index.html` in any browser — no server or install needed.
3. Use the sample accounts to log in:

   | Role | Email | Password |
   |---|---|---|
   | Manager | manager@cafe.com | 1234 |
   | Cashier | cashier@cafe.com | 1234 |
   | Barista | barista@cafe.com | 1234 |

> Sample data is loaded automatically on first visit from `js/shared/storage.js`.

---

## 👩 Team

| Member | Module | Responsibilities |
|---|---|---|
| Yasmine| M1 Administration | Auth, users, dashboard, reports, GitHub setup |
| Shora  | M2 Back of House | Menu admin, kitchen queue, inventory, CSS design system |
| Shaima | M3 Front of House | Customer ordering, cart, billing, localStorage helpers |

---

##  References

1. Sidabutar et al., *Analysis and Design of Web-based Information System for Coffeeshop Management*, JISI, 2023. https://doi.org/10.51519/journalisi.v5i1.455  
2. Open-Source-Chandigarh, *Cafe-Management* (GitHub). https://github.com/open-source-chandigarh/cafe-management  
3. Chimera418, *Tabrix — Billing and Restaurant Management System* (GitHub). https://github.com/Chimera418/Tabrix  

---

*Libyan International University · Faculty of Information Technology · 2026*

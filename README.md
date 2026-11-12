# Cafe-Management-System
We will build a front-end Cafe Management System in HTML, CSS  JavaScript, split into three modules and shared equally by three members. It lets customers browse the menu and place orders, lets staff process orders and payments, and lets the manager control the menu, stock and reports.


# File Structure
cafe-management/
│
├── index.html                  # Home page (everyone)
├── login.html                  # Everyone
├── register.html               # Customers sign up
├── README.md
│
├── customer/
│   ├── menu.html               # Browse, filter, search
│   ├── cart.html               # Cart and checkout
│   └── my-orders.html          # Track order status
│
├── cashier/
│   ├── orders.html             # Order list, new walk-in orders
│   └── bill.html               # Payment and receipt
│
├── barista/
│   └── kitchen.html            # Order queue: Preparing → Ready
│
├── admin/
│   ├── dashboard.html          # Sales overview
│   ├── reports.html            # Sales by day, CSV export
│   ├── users.html              # Manage staff accounts
│   ├── menu-admin.html         # Manage menu items
│   └── inventory.html          # Stock and low-stock alerts
│
├── css/
│   └── style.css
│
├── js/
│   ├── shared/                 # storage.js, auth.js, layout.js
│   ├── customer/               # menu.js, cart.js, my-orders.js
│   ├── cashier/                # orders.js, bill.js
│   ├── barista/                # kitchen.js
│   └── admin/                  # dashboard.js, reports.js, users.js, menu-admin.js, inventory.js
│
└── images/                     # logo, menu photos, icons

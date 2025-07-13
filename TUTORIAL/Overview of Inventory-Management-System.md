# Tutorial: Inverntory-Management-System

This project is a simple **Inventory Management System**. It allows users to
track items in an inventory. It includes features for **user authentication**
(login, registration), maintaining a list of _inventory items_, and
restricting certain actions (like adding or deleting items) to users with an
'_admin_' **role**. The system uses a web interface to interact with a
backend server.

## Visual Overview

```mermaid
flowchart TD
    A0["User Authentication & Authorization Flow
"]
    A1["Auth Context (Client State Management)
"]
    A2["Inventory Data Model
"]
    A3["User Data Model
"]
    A4["Server API Structure
"]
    A5["Client-Side Routing
"]
    A6["Admin Inventory Interface
"]
    A0 -- "Reads/Writes User Data" --> A3
    A4 -- "Applies Auth Middleware" --> A0
    A4 -- "Manages Item Data" --> A2
    A1 -- "Receives Token/User" --> A0
    A5 -- "Checks Auth State" --> A1
    A6 -- "Calls Item API" --> A4
    A6 -- "Accesses User/Token" --> A1
```

## Chapters

1. [User Data Model
   ](01_user_data_model.md)
2. [Inventory Data Model
   ](02_inventory_data_model.md)
3. [User Authentication & Authorization Flow
   ](03_user_authentication_authorization_flow.md)
4. [Auth Context (Client State Management)
   ](04_auth_context_client_state_management.md)
5. [Client-Side Routing
   ](05_client_side_routing.md)
6. [Admin Inventory Interface
   ](06_admin_inventory_interface.md)
7. [Server API Structure
   ](07_server_api_structure.md)

# Chapter 5: Client-Side Routing

Welcome back! In our last chapter, [Auth Context (Client State Management)](04_auth_context_client_state_management.md), we set up a clever way for our frontend application to remember if a user is logged in and keep track of their information using the Auth Context and browser `localStorage`.

Now that our application knows _who_ is using it, we need a way to decide _what_ the user sees based on where they want to go within the app. Imagine our Inventory Management System has different sections: a login page, a dashboard, an admin area, maybe an "add item" page. How does the application know which one to show when a user types a URL into the browser or clicks a link?

This is the job of **Client-Side Routing**.

## What Problem Does Client-Side Routing Solve?

Traditionally, when you visited a website, clicking a link meant your browser sent a request to the server for a _new HTML page_. The server would find the page, and your browser would load it entirely, replacing the old one.

Modern web applications, especially those built with React, often behave differently. They are often **Single-Page Applications (SPAs)**. This means the browser loads _one_ main HTML file initially, and then JavaScript takes over to dynamically change the content on the page as the user interacts with it.

In an SPA, when you click a link or type a new path in the URL bar (like `/dashboard` or `/admin`), the browser doesn't request a _new HTML page_ from the server. Instead, the client-side routing library (like `react-router-dom` which we are using) intercepts this navigation. It changes the URL in the browser's address bar (so you can bookmark or share the link) but _without_ causing a full page reload. Then, based on the new URL path, it figures out which **React component** should be displayed, and React efficiently updates only the necessary parts of the page.

Client-Side Routing is like the application's internal navigation system. It watches the URL path and swaps out components (our "pages") accordingly.

## Core Concepts of Client-Side Routing

Let's break down the pieces that make client-side routing work in our React application:

1.  **Router:** This is the main engine that listens to changes in the browser's URL. In our case, this is provided by `<BrowserRouter>` from `react-router-dom`.
2.  **Routes Container:** A component, typically `<Routes>`, that acts as a container for all the possible paths our application understands.
3.  **Routes Definition:** Inside the `<Routes>` container, we define individual `<Route>` components. Each `<Route>` associates a specific URL `path` with a particular **React element or component** that should be rendered when the URL matches that path.
4.  **Navigation:** How users move between routes. This can be by clicking navigation links (using the `<Link>` component from `react-router-dom`) or programmatically changing the URL from within our code (using the `useNavigate` hook).

## Our Core Use Case: Navigating After Login

Let's think about our login flow again.

- A user starts at the base URL of our application.
- We want them to see the Login page.
- After they successfully log in (as handled in [Chapter 3: User Authentication & Authorization Flow](03_user_authentication_authorization_flow.md) and [Chapter 4: Auth Context (Client State Management)](04_auth_context_client_state_management.md)), we want to automatically take them to the Dashboard page.
- If they try to go directly to the Dashboard URL (`/dashboard`) without logging in, we want to send them back to the Login page (`/login`).

Client-Side Routing, combined with our [Auth Context](04_auth_context_client_state_management.md) and the `ProtectedRoute` component we saw in the last chapter, makes this possible.

## How it Looks in Code (`client/src/App.jsx`)

The central place where we define our application's routes is typically the main `App` component (`client/src/App.jsx`).

Let's look at the code that sets this up:

```javascript
// Import necessary components from react-router-dom
import { Routes, Route, Navigate } from "react-router-dom";

// Import the React components that represent our "pages"
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
// Import the ProtectedRoute component from Chapter 4
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    // Routes container wraps all individual Route definitions
    <Routes>
      {/* Route: If path is "/", redirect to "/login" */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Route: If path is "/login", show the Login component */}
      <Route path="/login" element={<Login />} />

      {/* Route: If path is "/register", show the Register component */}
      <Route path="/register" element={<Register />} />

      {/* Route: If path is "/dashboard", show the Dashboard component,
          BUT first wrap it in ProtectedRoute */}
      <Route
        path="/dashboard"
        element={
          // ProtectedRoute checks if user is logged in before rendering Dashboard
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Route: If path is "/admin", show the AdminDashboard component */}
      {/* Note: We might also want to wrap AdminDashboard in a check
               to ensure the user is an 'admin' role.
               This could be inside ProtectedRoute or a separate component. */}
      <Route path="/admin" element={<AdminDashboard />} />

      {/* Add more routes here as needed */}
      {/* Example: <Route path="/inventory/:id" element={<ItemDetail />} /> */}
    </Routes>
  );
}

export default App;
```

**Explanation:**

1.  `import { Routes, Route, Navigate } from "react-router-dom";`: We import the key components from the routing library.
    - `<Routes>`: The parent component that holds all our route definitions. It ensures that only _one_ `<Route>` child will match the current URL and render its `element`.
    - `<Route>`: Defines a single mapping between a `path` (the URL segment) and the `element` (the React component or element) to render.
    - `<Navigate>`: A component that, when rendered, immediately changes the URL to the `to` prop. It's used for redirection.
2.  We import the actual components (`Login`, `Dashboard`, etc.) that will serve as our "pages".
3.  Inside the `App` component, we wrap everything in `<Routes>`.
4.  `<Route path="/" element={<Navigate to="/login" />} />`: This route says: if the user visits the very base path (`/`), immediately render the `<Navigate>` component which will redirect them to `/login`.
5.  `<Route path="/login" element={<Login />} />`: If the URL path is exactly `/login`, render the `Login` component.
6.  `<Route path="/register" element={<Register />} />`: If the URL path is exactly `/register`, render the `Register` component.
7.  `<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />`: This is a crucial one for our login flow. If the path is `/dashboard`, we render the `ProtectedRoute` component, and _inside_ it, we put the `Dashboard` component. As we saw in [Chapter 4](04_auth_context_client_state_management.md), the `ProtectedRoute` checks if the user is logged in (using the [Auth Context](04_auth_context_client_state_management.md) `token`). If they are, it renders its children (`<Dashboard />`). If not, it uses `<Navigate>` internally to redirect the user to `/login`.
8.  `<Route path="/admin" element={<AdminDashboard />} />`: If the path is `/admin`, render the `AdminDashboard` component. (As noted in the code, you'd typically add protection here too, probably checking for the 'admin' role).

## Setting Up the Router (`client/src/main.jsx`)

For `react-router-dom` to work, the part of your application that uses routes (in our case, the entire `<App>` component) needs to be wrapped inside a router component, like `<BrowserRouter>`. This is done in the main entry point of our application:

```javascript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Import BrowserRouter
import { BrowserRouter } from "react-router-dom";
// Import AuthProvider from Chapter 4
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  // BrowserRouter enables client-side routing for the app within it
  <BrowserRouter>
    {/* AuthProvider wraps the main App to provide auth context */}
    <AuthProvider>
      {/* StrictMode helps find potential problems */}
      <StrictMode>
        {/* Our main application component where routes are defined */}
        <App />
      </StrictMode>
    </AuthProvider>
  </BrowserRouter>
);
```

By wrapping `<App />` with `<BrowserRouter>`, we give `react-router-dom` control over the browser's history and URL, enabling it to manage navigation without full page reloads. Notice that `<AuthProvider>` is also wrapping `<App>`, ensuring that our authentication state is available to _all_ components rendered by the router.

## How Routing Works (Conceptual Flow)

Here's a simplified idea of what happens when you use client-side routing:

```mermaid
sequenceDiagram
    participant Browser URL
    participant BrowserRouter
    participant App Component
    participant Routes Container
    participant Specific Route (e.g., /dashboard)
    participant Dashboard Component

    User->>Browser URL: Types /dashboard and presses Enter OR clicks a link
    Browser URL->>BrowserRouter: URL changes (no full server request)
    BrowserRouter->>App Component: Notifies that URL changed
    App Component->>Routes Container: Renders <Routes>
    Routes Container->>Specific Route (e.g., /dashboard): Checks if path="/dashboard" matches current URL
    Specific Route (e.g., /dashboard)->>Dashboard Component: If match found, renders element (e.g., <ProtectedRoute><Dashboard /></ProtectedRoute>)
    Dashboard Component-->>Specific Route (e.g., /dashboard): Returns HTML to render
    Specific Route (e.g., /dashboard)-->>Routes Container: Returns HTML to render
    Routes Container-->>App Component: Returns HTML to render
    App Component->>BrowserRouter: Returns HTML to render
    BrowserRouter->>Browser: Updates the part of the page corresponding to the rendered component
```

This diagram shows that the `BrowserRouter` detects URL changes. It then tells the `App` component to render, and the `Routes` component within `App` finds the matching `<Route>` definition based on the URL path. That matching `<Route>` then renders its specified `element` (which is our "page" component), and React updates the browser's display efficiently.

## Programmatic Navigation (`client/src/pages/Login.jsx`)

Besides clicking links (which you'd use `<Link to="/somepath">` for), we often need to navigate programmatically, like after a successful form submission. This is where the `useNavigate` hook comes in.

Let's revisit the `Login.jsx` code from [Chapter 4](04_auth_context_client_state_management.md) and focus on the navigation part:

```javascript
import { useState } from "react";
// Import the hook for programmatic navigation
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  // Call the hook to get the navigate function
  const navigate = useNavigate();

  // ... state for form data and errors ...

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... fetch login data ...

    try {
      // ... server fetch logic ...

      if (!res.ok) {
        // ... handle server errors ...
      }

      // Call the login function from Auth Context (updates state & localStorage)
      login(data.user, data.token);

      // <-- Use the navigate function to change the URL
      navigate("/dashboard");
    } catch (err) {
      // ... handle other errors ...
    }
  };

  // ... JSX form rendering ...
};

export default Login;
```

**Explanation:**

- `import { useNavigate } from "react-router-dom";`: We import the `useNavigate` hook.
- `const navigate = useNavigate();`: Inside the component, we call the hook to get a `navigate` function.
- `navigate("/dashboard");`: After a successful login (and updating the Auth Context), we call `navigate` with the path `/dashboard`. This tells `react-router-dom` to change the URL to `/dashboard` and render the component associated with that route (`ProtectedRoute` which then renders `Dashboard`).

## Routing and Protection (`client/src/components/ProtectedRoute.jsx`)

As seen in [Chapter 4](04_auth_context_client_state_management.md), the `ProtectedRoute` component is a pattern that combines Client-Side Routing with our authentication state. It's a React component that decides whether to render its children or redirect based on the login status from the [Auth Context](04_auth_context__client_state_management.md).

```javascript
import { Navigate } from "react-router-dom";
// Import the hook to get auth state
import { useAuth } from "../context/AuthContext";

// This component takes other components as its children
const ProtectedRoute = ({ children }) => {
  // Get the token from the Auth Context
  const { token } = useAuth();

  // If there's no token (user is not logged in)...
  if (!token) {
    // ...use the Navigate component to redirect them to "/login"
    // 'replace' prevents them from hitting the back button to get back here
    return <Navigate to={"/login"} replace />;
  }

  // If there IS a token (user is logged in), render the children components
  return children;
};

export default ProtectedRoute;
```

**Explanation:**

- `const { token } = useAuth();`: Gets the `token` from the [Auth Context](04_auth_context_client_state_management.md).
- `if (!token)`: Checks if the token exists.
- `return <Navigate to={"/login"} replace />;`: If no token, renders `<Navigate>`, which causes the router to change the URL to `/login` and render the `Login` component instead.
- `return children;`: If a token exists, it renders whatever components were placed inside the `<ProtectedRoute>` tags in the `<Route>` definition (like `<Dashboard />`).

This effectively puts a "gate" on routes like `/dashboard`, ensuring that the user must pass through authentication (which sets the token in the Auth Context) before the actual content of the protected page is rendered.

## Benefits of Client-Side Routing

Using a client-side routing library like `react-router-dom` provides several advantages for our SPA:

- **SPA Experience:** Provides fast transitions between "pages" without full page reloads.
- **Navigability:** Users can use browser back/forward buttons, bookmark pages, and share URLs just like a traditional website.
- **Organized Code:** Helps structure your application by clearly mapping URLs to specific views (components).
- **Dynamic Content:** Allows rendering different components or data based on parameters in the URL (though we haven't used this yet, routes like `/inventory/:id` are possible).
- **Integration:** Works seamlessly with React components and state management (like our [Auth Context](04_auth_context_client_state_management.md)).

## Conclusion

Client-Side Routing, powered by `react-router-dom` in our application, is the system that determines which "page" (React component) is displayed based on the browser's URL path. We define these mappings using `<Routes>` and `<Route>` components in `App.jsx`, wrapping our application in `BrowserRouter` in `main.jsx`. We learned how to programmatically navigate using `useNavigate` after events like a successful login. Importantly, we saw how our `ProtectedRoute` component leverages the [Auth Context](04_auth_context_client_state_management.md) and the router's `<Navigate>` component to restrict access to certain routes based on the user's authentication status.

With our core data models defined, authentication and authorization flow understood, client-side authentication state managed, and the application's navigation system in place, we are ready to build the user interface for managing our inventory.

[Next Chapter: Admin Inventory Interface](06_admin_inventory_interface.md)

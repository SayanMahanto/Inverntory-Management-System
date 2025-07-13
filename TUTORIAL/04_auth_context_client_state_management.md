# Chapter 4: Auth Context (Client State Management)

Welcome back! In the previous chapter, [User Authentication & Authorization Flow](03_user_authentication_authorization_flow.md), we learned how users log in, how the server verifies their identity, and how it issues a special token (like a temporary ID card) that proves they are authenticated. We also saw how the server uses this token to decide if a user is authorized to access certain things or perform certain actions.

Now, we shift our focus entirely to the **frontend** (the part of the application the user sees in their web browser). The question is: How does our frontend application keep track of this logged-in user's information and their important token? How does it make this information easily available to all the different parts (components) of the application that need it, without passing it down manually through many levels?

This is where the **Auth Context** comes in. It's our solution for **Client State Management** specifically for the user's authentication status.

## What Problem Does Auth Context Solve?

Imagine a large application with many different pages and components: a navigation bar, a dashboard page, an inventory list page, an "Add Item" form, etc.

Several of these components need to know:

- Is there a user currently logged in?
- If yes, who are they (their name, their role)?
- What is their token (so we can send it to the server for authorized actions)?

Without a central system, we'd have to get the user data and token from the login page, and then pass it down as "props" (like arguments to functions) through multiple components just to reach the ones that actually need it. This is called "prop drilling" and it can make your code messy and hard to manage in larger applications.

Furthermore, what happens if the user closes their browser and reopens it? We want them to ideally stay logged in without having to enter their email and password again every single time. The browser needs to _remember_ their state.

The Auth Context solves these problems by providing a centralized "global locker" or "bulletin board" on the frontend where the user's session details (user data and token) are stored, managed, and made easily accessible.

## The Core Concepts

Our Auth Context uses a few key ideas:

1.  **Client State:** We need variables in our React application to hold the currently logged-in `user` object and their `token`.
2.  **Persistence (localStorage):** To remember the user across page reloads or browser closures, we'll store the user data and token securely (or as securely as possible client-side) in the browser's built-in `localStorage`. This allows us to check `localStorage` when the application first loads to see if the user was previously logged in.
3.  **React Context:** React's Context API is the mechanism that allows us to create this "global locker". It lets us share data (our user state and token) and functions (like login/logout) throughout our component tree without manually passing props.
4.  **Provider:** A special component (`AuthProvider`) that wraps the part of our application that needs access to the context. It holds the state and provides it to all its children.
5.  **Hook (`useAuth`):** A simple function (`useAuth`) that any component can call to easily grab the current user state, token, and the login/logout functions from the context.

## How It Looks in Code (`client/src/context/AuthContext.jsx`)

Let's look at the main file where our Auth Context is defined: `client/src/context/AuthContext.jsx`.

```javascript
// We need functions from React
import { createContext, useContext, useEffect, useState } from "react";

// 1. Create the Context
const AuthContext = createContext();

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
  // 3. Define State & Initialize from localStorage
  const [user, setUser] = useState(() => {
    // When the app loads, try to get user data from localStorage
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null; // Parse JSON string back to object
  });

  const [token, setToken] = useState(() => {
    // When the app loads, try to get the token from localStorage
    return localStorage.getItem("token");
  });

  // 4. Define Login and Logout Functions
  const login = (userData, tokenData) => {
    // Set the state variables
    setUser(userData);
    setToken(tokenData);
    // Save to localStorage for persistence
    localStorage.setItem("user", JSON.stringify(userData)); // Store object as JSON string
    localStorage.setItem("token", tokenData);
  };

  const logout = () => {
    // Clear the state variables
    setUser(null);
    setToken(null);
    // Clear everything related to auth in localStorage
    localStorage.clear(); // Or localStorage.removeItem('user'); localStorage.removeItem('token');
  };

  // 5. Provide the state and functions to children components
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 6. Create a Custom Hook to easily use the context
export const useAuth = () => {
  // This hook lets any component access the value provided by AuthContext.Provider
  return useContext(AuthContext);
};
```

**Explanation:**

1.  `createContext()`: This line simply creates a new Context object. We'll put our authentication data into this object.
2.  `AuthProvider = ({ children }) => {...}`: This is a standard React component. It will "provide" the authentication context to any component nested inside it (`{ children }`).
3.  `useState(...)`: These lines create our state variables, `user` and `token`. The interesting part is how they are initialized. Instead of starting with `null`, they first check `localStorage.getItem("user")` and `localStorage.getItem("token")`. If something is found there (meaning the user was logged in during a previous session), it uses that data to set the initial state. `JSON.parse` is needed because `localStorage` only stores strings, so we stored the user object as a JSON string using `JSON.stringify` when logging in.
4.  `login = (userData, tokenData) => {...}`: This function will be called by a component (like our Login page) when a successful login response comes back from the server. It updates the `user` and `token` state _and_ saves them to `localStorage` so they persist.
5.  `logout = () => {...}`: This function is called when the user logs out. It clears the `user` and `token` state (making the app think no one is logged in) and removes the data from `localStorage`.
6.  `<AuthContext.Provider value={{ user, token, login, logout }}>`: This is the core of the Provider. It wraps the `children` (the rest of your application) and makes the object provided in the `value` prop available to any component _within_ those children that uses the `useAuth` hook.
7.  `useAuth = () => useContext(AuthContext);`: This is a common pattern. It creates a simple custom hook `useAuth` that just calls `useContext(AuthContext)`. This makes it much cleaner for components to access the context value. Instead of writing `useContext(AuthContext)` everywhere, you just write `useAuth()`.

## Setting Up the Provider (`client/src/main.jsx`)

For the Auth Context to work throughout our application, the `AuthProvider` component needs to wrap the main part of our app. This is typically done in the entry point file, like `client/src/main.jsx`.

```javascript
// ... other imports ...
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  // BrowserRouter handles routing
  <BrowserRouter>
    {/* AuthProvider wraps the main App */}
    <AuthProvider>
      {/* StrictMode helps find potential problems */}
      <StrictMode>
        {/* Our main application component */}
        <App />
      </StrictMode>
    </AuthProvider>
  </BrowserRouter>
);
```

By wrapping the `<App />` component with `<AuthProvider>`, we ensure that any component rendered within `<App />` (which is most of our application) can access the authentication state and functions using the `useAuth` hook.

## Using the Auth Context in Components

Now let's see how different components use the `useAuth` hook to interact with the context.

### The Login Page (`client/src/pages/Login.jsx`)

The Login page is where the process starts after the server authenticates the user. It receives the `user` object and `token` from the server response and needs to put them into the Auth Context.

```javascript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import the custom hook

const Login = () => {
  // Use the hook to get the login function from the context
  const { login } = useAuth();
  const navigate = useNavigate();

  // ... state for form data and errors ...

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // ... send login request to the server ...
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login Failed");
      }

      // <-- THIS IS KEY! Call the login function from the Auth Context
      login(data.user, data.token);

      // Redirect the user after successful login
      navigate("/dashboard ");
    } catch (err) {
      setError(err.message);
    }
  };

  // ... JSX form rendering ...
};

export default Login;
```

**Explanation:**

- `const { login } = useAuth();`: This line uses the `useAuth` hook to get the `login` function that was provided by the `AuthProvider`.
- `login(data.user, data.token);`: After the server successfully responds with `data.user` and `data.token`, the `login` function from the context is called. As we saw in `AuthContext.jsx`, this call updates the `user` and `token` state _within the context_ and saves them to `localStorage`. This triggers any components that are using the context (via `useAuth`) to re-render with the new logged-in state.

### The Register Page (`client/src/pages/Register.jsx`)

The Register page demonstrates _accessing_ the state from the context, particularly to check if the _current user_ (the one attempting to register a _new_ user) is an 'admin'. It also shows sending the token for authorization.

```javascript
import { useState } from "react";
import { useAuth } from "../context/AuthContext"; // Import the hook
import { useNavigate } from "react-router-dom";

const Register = () => {
  // Use the hook to get the current user and token from the context
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // ... state for form data ...

  // Check if the current user is allowed to register new users
  // This check happens when the component renders
  if (!user || user.role !== "admin") {
    // If no user or not an admin, redirect them
    navigate("/dashboard"); // Or perhaps "/login" if not logged in at all
  }

  const handleChange = (e) => {
    // ... handle form input changes ...
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // <-- Use the token from the context in the Authorization header
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      // ... handle server response ...
    } catch (err) {
      // ... handle errors ...
    }
  };

  // ... JSX form rendering ...
};

export default Register;
```

**Explanation:**

- `const { user, token } = useAuth();`: This line uses the `useAuth` hook to get the current `user` object and `token` from the Auth Context.
- `if (!user || user.role !== "admin")`: This is a client-side check using the `user` data obtained from the context. It ensures that the Register page is only displayed or accessible if the user object exists _and_ their role is 'admin'. This complements the server-side authorization check we discussed in [Chapter 3](03_user_authentication_authorization_flow.md).
- `Authorization: \`Bearer ${token}\``: When submitting the form to register a *new* user, the component retrieves the `token`from the context and includes it in the request header. This is the "temporary ID card" sent back to the server so the server's`verifyToken` middleware ([Chapter 3](03_user_authentication_authorization_flow.md)) can authenticate and authorize this request (checking if the user submitting the request is an admin).

### The Protected Route Component (`client/src/components/ProtectedRoute.jsx`)

This component, also mentioned conceptually in [Chapter 3](03_user_authentication_authorization_flow.md), is a prime example of using the Auth Context to control navigation.

```javascript
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import the hook

const ProtectedRoute = ({ children }) => {
  // Use the hook to get the current token from the context
  const { token } = useAuth();

  // Check if the token exists in the context state
  if (!token) {
    // If no token, redirect the user to the login page
    // 'replace' means the login page replaces the current page in history
    return <Navigate to={"/login"} replace />;
  }

  // If a token exists, render the content inside the ProtectedRoute
  return children;
};

export default ProtectedRoute;
```

**Explanation:**

- `const { token } = useAuth();`: Gets the `token` from the Auth Context.
- `if (!token)`: Checks if the token is missing (meaning the user is not logged in according to our context state).
- `<Navigate to={"/login"} replace />`: If there's no token, it uses the `react-router-dom` component to redirect the user to the `/login` page. This prevents unauthorized access to pages wrapped by `ProtectedRoute`.

## Conceptual Flow with Auth Context (Client Side)

Here's how the client-side authentication state management works, especially during login and accessing protected pages:

```mermaid
sequenceDiagram
    participant User
    participant Login Page
    participant Server (Auth Endpoint)
    participant Auth Context
    participant localStorage
    participant Protected Page (e.g., Dashboard)

    User->>Login Page: Enter Email/Password
    Login Page->>Server (Auth Endpoint): Send Login Request (Email/Password)
    Server (Auth Endpoint)-->>Login Page: Send User Info and Token (Success)
    Login Page->>Auth Context: Call auth.login(userData, tokenData)
    Auth Context->>Auth Context: Update internal user/token state
    Auth Context->>localStorage: Save user/token
    Login Page->>Protected Page (e.g., Dashboard): Navigate
    Protected Page (e.g., Dashboard)->>Auth Context: Component calls useAuth()
    Auth Context-->>Protected Page (e.g., Dashboard): Return current user/token state
    Protected Page (e.g., Dashboard)->>Server (Auth Endpoint): Send API Request (Include Token)
    Server (Auth Endpoint)-->>Protected Page (e.g., Dashboard): Send Data (if Token valid)

    User->>Protected Page (e.g., Dashboard): Refresh browser
    Protected Page (e.g., Dashboard)->>Auth Context: Component loads, calls useAuth()
    Auth Context->>localStorage: Check for saved user/token
    localStorage-->>Auth Context: Return saved user/token (if exists)
    Auth Context->>Auth Context: Initialize internal state from localStorage
    Auth Context-->>Protected Page (e.g., Dashboard): Return initialized user/token state
    Protected Page (e.g., Dashboard)->>Protected Page (e.g., Dashboard): Render based on state (user is logged in)
```

In this diagram:

1.  Login happens (Steps 1-3, like in Chapter 3).
2.  The Login page _calls the `login` function provided by the Auth Context_.
3.  The Auth Context updates its internal state _and_ saves the user/token to `localStorage`.
4.  The user is navigated to a `ProtectedRoute`.
5.  The `ProtectedRoute` (and other components like the Dashboard) use `useAuth()` to _read_ the state from the Auth Context. Since `login` was called, they find the user and token and render correctly.
6.  If the user refreshes the page, when the components load, `useAuth()` is called again. This time, the Auth Context _initializes_ its state by checking `localStorage`. It finds the previously saved user/token, sets its state, and the components correctly identify the user as logged in without needing a fresh login.

## Benefits of Using Auth Context

- **Centralized State:** The user's login status and token are kept in one place, making it easy to manage.
- **Easy Access:** Any component within the `AuthProvider` can get the user, token, and login/logout functions simply by calling `useAuth()`. No more passing props manually down multiple levels.
- **Persistence:** Using `localStorage` allows the user to stay logged in even if they close and reopen the browser, providing a much better user experience.
- **Improved Readability:** Components that need auth info clearly show this requirement by calling `useAuth()`.

## Conclusion

The Auth Context is a powerful client-side state management pattern essential for handling user authentication status in modern web applications. By centralizing the user object and their authentication token, using `localStorage` for persistence, and leveraging React's Context API with a custom hook (`useAuth`), we provide a clean, efficient, and easy way for any component to know who the current user is, check their login status, perform login/logout actions, and include the necessary token for authorized communication with the server.

Now that we have a solid way to manage user authentication state on the client, we can focus on how the application navigates between different views and how the Auth Context plays a role in controlling access to those views.

[Next Chapter: Client-Side Routing](05_client_side_routing.md)

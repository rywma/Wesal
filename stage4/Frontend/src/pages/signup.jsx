import { Link } from 'react-router-dom';
import { useState } from "react";

export default function Signup() {
  const [message, setMessage] = useState("");

  return (
    <main>
      <h1>Wesal</h1>
      <h2>Create Account</h2>
      
      <form>
        <div>
            <label htmlFor="email">Email</label>
            <input
            id="email"
            name="email"
            type="email"
            required
            
            />
            </div>
            
            <div>
                <label htmlFor="password">Password</label>
                <input
                id="password"
                name="password"
                type="password"
                required
                
                />
                </div>
                
                <button type="submit">Sign Up</button>
                
                </form>
                
                <p>{message}</p>
                <p>
                    Already have an account? <Link to="/login">Login</Link>
                    
                </p>
                
                </main>
                
            );
}

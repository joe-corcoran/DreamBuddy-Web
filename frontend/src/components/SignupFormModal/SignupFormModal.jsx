// frontend/src/components/SignupFormModal/SignupFormModal.jsx
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import { thunkSignup } from "../../redux/session";
import "./SignupForm.css";

function SignupFormModal() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const { closeModal } = useModal();

  useEffect(() => {
    const validateForm = () => {
      const newErrors = {};
      
      if (!email) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = "Please enter a valid email address";
      }
      
      if (!username) {
        newErrors.username = "Username is required";
      } else if (username.length < 3) {
        newErrors.username = "Username must be at least 3 characters";
      } else if (username.length > 40) {
        newErrors.username = "Username must be less than 40 characters";
      } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        newErrors.username = "Username can only contain letters, numbers, dashes, and underscores";
      }
      
      if (!password) {
        newErrors.password = "Password is required";
      } else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      
      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords must match";
      }

      setErrors(newErrors);
      setIsFormValid(
        email && 
        username && 
        password && 
        confirmPassword && 
        password === confirmPassword && 
        Object.keys(newErrors).length === 0
      );
    };

    validateForm();
  }, [email, username, password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid) return;

    if (password !== confirmPassword) {
      setErrors({
        confirmPassword: "Confirm Password field must be the same as the Password field"
      });
      return;
    }

    setIsLoading(true);
    try {
      const serverResponse = await dispatch(
        thunkSignup({
          email,
          username,
          password
        })
      );

      if (serverResponse) {
        const formattedErrors = {};
        Object.entries(serverResponse).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            formattedErrors[key] = value[0]; 
          } else {
            formattedErrors[key] = value;
          }
        });
        setErrors(formattedErrors);
      } else {
        closeModal();
      }
    } catch (error) {
      setErrors({ 
        general: 'An unexpected error occurred. Please try again.' 
      });
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-form">
      <h1>Sign Up</h1>
      
      {errors.general && (
        <div className="error-alert">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className={`form-group ${errors.email ? 'has-error' : email ? 'is-valid' : ''}`}>
          <label htmlFor="email">
            Email
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </label>
          {errors.email && (
            <div className="form-error-message">
              {errors.email}
            </div>
          )}
        </div>

        <div className={`form-group ${errors.username ? 'has-error' : username ? 'is-valid' : ''}`}>
          <label htmlFor="username">
            Username
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
              minLength={3}
              maxLength={40}
            />
          </label>
          {errors.username && (
            <div className="form-error-message">
              {errors.username}
            </div>
          )}
        </div>

        <div className={`form-group ${errors.password ? 'has-error' : password ? 'is-valid' : ''}`}>
          <label htmlFor="password">
            Password
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              minLength={6}
            />
          </label>
          {errors.password && (
            <div className="form-error-message">
              {errors.password}
            </div>
          )}
        </div>

        <div className={`form-group ${errors.confirmPassword ? 'has-error' : confirmPassword ? 'is-valid' : ''}`}>
          <label htmlFor="confirmPassword">
            Confirm Password
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </label>
          {errors.confirmPassword && (
            <div className="form-error-message">
              {errors.confirmPassword}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className={`submit-button ${isFormValid ? 'is-valid' : ''}`}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}

export default SignupFormModal;
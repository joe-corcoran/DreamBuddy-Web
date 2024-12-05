// frontend/src/components/LoginFormModal/LoginFormModal.jsx
import { useState, useEffect } from "react";
import { thunkLogin } from "../../redux/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import "./LoginForm.css";

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const { closeModal } = useModal();
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const validateForm = () => {
      const newErrors = {};
      
      if (isSubmitted) {  
        if (!credential) {
          newErrors.credential = "Email or username is required";
        } else if (credential.length < 3) {
          newErrors.credential = "Email or username must be at least 3 characters";
        }
        
        if (!password) {
          newErrors.password = "Password is required";
        } else if (password.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        }
      }
  
      setErrors(newErrors);
      setIsFormValid(credential.length >= 3 && password.length >= 6);
    };
  
    validateForm();
  }, [credential, password, isSubmitted]); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      const response = await dispatch(
        thunkLogin({
          credential,
          password,
        })
      );

      if (response) {
        const formattedErrors = {};
        Object.entries(response).forEach(([key, messages]) => {
          if (Array.isArray(messages)) {
            formattedErrors[key] = messages[0]; 
          } else {
            formattedErrors[key] = messages;
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
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await dispatch(
        thunkLogin({ 
          credential: 'demo@aa.io',  
          password: 'password' 
        })
      );
      if (!response) closeModal();
    } catch (error) {
      setErrors({ general: 'Demo login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form">
    <button onClick={closeModal} className="close-button">×</button>
    <h1>Log In</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className={`form-group ${errors.credential ? 'has-error' : credential ? 'is-valid' : ''}`}>
          <label htmlFor="credential">
            Email or Username
            <input
              id="credential"
              type="text"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              disabled={isLoading}
              required
            />
          </label>
          {errors.credential && (
            <div className="form-error-message">
              {errors.credential}
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
            />
          </label>
          {errors.password && (
            <div className="form-error-message">
              {errors.password}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className={`submit-button ${isFormValid ? 'is-valid' : ''}`}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
        
        <div className="demo-user">
          <button 
            onClick={handleDemoUser} 
            disabled={isLoading}
            type="button"
          >
            {isLoading ? 'Loading...' : 'Demo User'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginFormModal;
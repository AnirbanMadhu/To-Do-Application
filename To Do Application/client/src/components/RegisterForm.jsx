// src/components/RegisterForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import videoBG from './assest/videoBG.mp4';
import swoosh from './assest/Sound effect/Swoosh.mp3';
import { useAuth } from './AuthContext';
import './RegisterForm.css';

export default function RegisterForm({ onSuccess, onSwitch }) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [isClicked, setIsClicked] = useState(true);  // Main_Box open initially
  const [fadeIn, setFadeIn] = useState(false);
  const [isLoginTextVisible, setIsLoginTextVisible] = useState(true);
  const videoRef = useRef(null);
  const swooshAudioRef = useRef(null);

  useEffect(() => {
    // fade in UI & prep video
    setFadeIn(true);
    if (videoRef.current) videoRef.current.playbackRate = 1;
    // prep swoosh audio
    swooshAudioRef.current = new Audio(swoosh);
    swooshAudioRef.current.volume = 0.5;
  }, []);

  const handleCircleClick = () => {
    if (swooshAudioRef.current) {
      swooshAudioRef.current.currentTime = 0;
      swooshAudioRef.current.play();
    }
    setIsClicked(prev => !prev);
    setIsLoginTextVisible(prev => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    try {
      await register(username, email, password);
      setMsg('Registration successful!');
      onSuccess();
    } catch (error) {
      setErr(error.message);
    }
  };

  return (
    <div className={`fade-transition ${fadeIn ? 'fade-in' : ''}`}>
      <video
        ref={videoRef}
        src={videoBG}
        autoPlay
        loop
        muted
        className="background_video"
      />
      <div className="background_Box"></div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className={`Login_Fade ${isLoginTextVisible ? 'fade-out' : 'fade-in'}`}>
          Register Page
        </div>

        <div className={`circle ${isClicked ? 'clicked' : ''}`} onClick={handleCircleClick}>
          <div className="customer_icon"></div>
        </div>

        <div className={`Main_Box ${isClicked ? 'show' : ''}`}>
          <h1 className="Login">Register</h1>

          <div className="adjustRowWise">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="adjustRowWise">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="adjustRowWise">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Register
          </button>

          {msg && <p className="success">{msg}</p>}
          {err && <p className="error">{err}</p>}

          <p>
            Already have an account?{' '}
            <span className="register" onClick={onSwitch}>
              Login
            </span>
          </p>
        </div>
      </form>
    </div>
  );
}

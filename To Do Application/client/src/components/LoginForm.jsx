// src/components/LoginForm.jsx
import React, { useState, useRef, useEffect } from 'react';
import videoBG from './assest/videoBG.mp4';
import swoosh from './assest/Sound effect/Swoosh.mp3';
import { useAuth } from './AuthContext';
import './LoginForm.css';

export default function LoginForm({ onSuccess, onSwitch }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [isClicked, setIsClicked] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [isLoginTextVisible, setIsLoginTextVisible] = useState(true);
  const videoRef = useRef(null);
  const swooshAudioRef = useRef(null);

  const handleCircleClick = () => {
    // play swoosh then toggle UI
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
    try {
      await login(username, password);
      onSuccess();
    } catch (error) {
      setErr(error.message);
    }
  };

  useEffect(() => {
    // initialize video fade
    if (videoRef.current) {
      videoRef.current.playbackRate = 1;
    }
    setFadeIn(true);
    // prepare swoosh audio
    swooshAudioRef.current = new Audio(swoosh);
    swooshAudioRef.current.volume = 0.5;
  }, []);

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
        <div className={`Login_Fade ${isLoginTextVisible ? 'fade-in' : 'fade-out'}`}>
          Login Page
        </div>

        <div className={`circle ${isClicked ? 'clicked' : ''}`} onClick={handleCircleClick}>
          <div className="customer_icon"></div>
        </div>

        <div className={`Main_Box ${isClicked ? 'show' : ''}`}>
          <h1 className="Login">Login</h1>

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
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn">Login</button>
          {err && <p className="error">{err}</p>}

          <p>
            Don’t have an account?{' '}
            <span className="register" onClick={onSwitch}>
              Register
            </span>
          </p>
        </div>
      </form>
    </div>
  );
}

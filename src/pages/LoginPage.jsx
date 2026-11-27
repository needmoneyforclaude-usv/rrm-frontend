import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {login} from '../api/auth.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSending(true);
    try {
      await login(email, password);
      navigate('/');
      window.location.reload();
    } catch (e) {
      setError(e.message);
      setSending(false);
    }
  };

  return (
    <section className="auth">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Autentificare</h1>
        <label>
          Email institutional
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nume@student.usv.ro"
            required
          />
        </label>
        <label>
          Parola
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="message message-error">{error}</p>}
        <button className="btn" type="submit" disabled={sending}>
          {sending ? 'Se trimite...' : 'Intra in cont'}
        </button>
        <p className="muted">
          Nu ai cont? <Link to="/signup">Creeaza unul</Link>
        </p>
      </form>
    </section>
  );
}

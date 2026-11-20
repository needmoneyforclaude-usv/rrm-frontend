import {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {getTeams, login, register} from '../api/auth.js';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  teamId: '',
  affiliationDate: '',
};

/**
 * Pagina de creare cont. Dupa inregistrare userul e logat direct.
 * @return {JSX.Element}
 */
export default function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getTeams().then(setTeams).catch(() => setTeams([]));
  }, []);

  const handleChange = (event) => {
    setForm({...form, [event.target.name]: event.target.value});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSending(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        team_id: form.teamId ? Number(form.teamId) : null,
        affiliation_date: form.affiliationDate || null,
      });
      await login(form.email, form.password);
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
        <span className="logo-box" />
        <h1>Cont nou</h1>
        <label>
          Nume
          <input name="name" value={form.name} onChange={handleChange}
            required />
        </label>
        <label>
          Email institutional
          <input name="email" type="email" value={form.email}
            onChange={handleChange} placeholder="nume@student.usv.ro" required />
        </label>
        <label>
          Parola (minim 6 caractere)
          <input name="password" type="password" minLength={6}
            value={form.password} onChange={handleChange} required />
        </label>
        <label>
          Echipa
          <select name="teamId" value={form.teamId} onChange={handleChange}>
            <option value="">Fara echipa</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </label>
        <label>
          Data afilierii la USV
          <input name="affiliationDate" type="date"
            value={form.affiliationDate} onChange={handleChange} />
        </label>
        {error && <p className="message message-error">{error}</p>}
        <button className="btn" type="submit" disabled={sending}>
          {sending ? 'Se trimite...' : 'Creeaza cont'}
        </button>
        <p className="muted">
          Ai deja cont? <Link to="/login">Intra in cont</Link>
        </p>
      </form>
    </section>
  );
}

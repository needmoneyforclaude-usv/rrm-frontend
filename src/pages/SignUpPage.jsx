import {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {getTeams, login, register} from '../api/auth.js';

const NEW_TEAM = 'new';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  teamId: '',
  newTeamName: '',
};

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
        team_id: form.teamId && form.teamId !== NEW_TEAM ?
          Number(form.teamId) : null,
        new_team_name: form.teamId === NEW_TEAM ?
          form.newTeamName.trim() : null,
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
            <option value={NEW_TEAM}>+ Echipa noua...</option>
          </select>
        </label>
        {form.teamId === NEW_TEAM && (
          <label>
            Numele echipei noi
            <input name="newTeamName" value={form.newTeamName}
              onChange={handleChange} maxLength={100} required />
            <span className="muted small">
              Vei fi Team Lead-ul echipei si vei putea face rezervari.
            </span>
          </label>
        )}
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

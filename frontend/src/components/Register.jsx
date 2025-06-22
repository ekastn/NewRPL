import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';
import '../styles/Auth.css';

function Register() {
    const [nama, setNama] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Validate inputs
            if (!nama || !email || !password) {
                throw new Error('Semua field harus diisi');
            }

            if (password !== confirmPassword) {
                throw new Error('Password dan konfirmasi password tidak sama');
            }

            console.log('Attempting to register with:', { nama, email });
            
            // Call the register API to save user data in the "users" collection
            const result = await register({ nama, email, password });
            console.log('Registration successful, response:', result);
            
            // Redirect to login page with success message
            navigate('/login', { 
                state: { 
                    message: 'Registrasi berhasil, silakan login dengan akun baru Anda',
                    type: 'success'
                } 
            });
        } catch (err) {
            console.error('Registration error in component:', err);
            setError(err.message || 'Registrasi gagal. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    // Rest of the component remains the same

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Register</h2>
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Nama</label>
                        <input
                            type="text"
                            id="name"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            placeholder="Nama Lengkap"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Konfirmasi Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Konfirmasi Password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Mendaftar...' : 'Register'}
                    </button>
                </form>

                <p className="auth-redirect">
                    Sudah punya akun? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;

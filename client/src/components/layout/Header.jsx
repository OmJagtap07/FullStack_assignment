import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

function Header() {
    const { user, logout, isAuthenticated } = useAuth();

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="header-logo">
                    <span className="logo-icon">✍️</span>
                    <span className="logo-text">CreatorHub</span>
                </Link>

                <nav className="header-nav">
                    <NavLink
                        to="/"
                        className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                        end
                    >
                        Home
                    </NavLink>

                    {isAuthenticated() ? (
                        <>
                            <NavLink
                                to="/dashboard"
                                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                            >
                                Dashboard
                            </NavLink>
                            <NavLink
                                to="/sponsorships"
                                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                            >
                                Sponsorships
                            </NavLink>
                            <span className="nav-user-greeting">Hi, {user.name}</span>
                            <button onClick={logout} className="nav-logout-btn">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink
                                to="/login"
                                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                            >
                                Login
                            </NavLink>
                            <NavLink
                                to="/register"
                                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                            >
                                <span className="nav-link-register">Register</span>
                            </NavLink>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Header;

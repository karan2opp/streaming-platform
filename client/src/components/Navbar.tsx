import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Video, Upload, Search, LogIn, LogOut, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenUploadModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenUploadModal,
}) => {
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth0();

  return (
    <header className="glass-card" style={{
      position: 'sticky',
      top: '1rem',
      zIndex: 100,
      margin: '0 auto 2rem auto',
      maxWidth: '1280px',
      padding: '0.85rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1.5rem',
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
        }}>
          <Video style={{ width: '22px', height: '22px', color: '#fff' }} />
        </div>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.4rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Stream<span style={{ color: '#8b5cf6', WebkitTextFillColor: '#8b5cf6' }}>Hub</span>
        </span>
      </div>

      {/* Search Input Bar */}
      <div style={{
        flex: 1,
        maxWidth: '480px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}>
        <Search style={{
          position: 'absolute',
          left: '1rem',
          width: '18px',
          height: '18px',
          color: '#94a3b8',
        }} />
        <input
          type="text"
          placeholder="Search videos, topics, or system design tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.65rem 1rem 0.65rem 2.75rem',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '0.9rem',
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#8b5cf6';
            e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.2)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Actions & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={onOpenUploadModal} className="btn-primary">
          <Upload style={{ width: '18px', height: '18px' }} />
          <span>Upload Video</span>
        </button>

        {isLoading ? (
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Loading...</div>
        ) : isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name || 'User Avatar'}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: '2px solid rgba(139, 92, 246, 0.6)',
                }}
              />
            ) : (
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <UserIcon style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
              </div>
            )}
            <button
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="btn-secondary"
              title="Log Out"
              style={{ padding: '0.65rem' }}
            >
              <LogOut style={{ width: '18px', height: '18px', color: '#f87171' }} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => loginWithRedirect()}
            className="btn-secondary"
          >
            <LogIn style={{ width: '18px', height: '18px' }} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};

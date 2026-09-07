import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faFileText, faComments, faCalendar, faCog, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from 'app/config/store';

const ClientSidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const account = useAppSelector(state => state.authentication.account);

  const menuItems = [
    { icon: faHome, labelKey: 'sidebar.home', path: '/client' },
    { icon: faFileText, labelKey: 'sidebar.myReclamations', path: '/client/reclamations' },
    { icon: faComments, labelKey: 'sidebar.messages', path: '/chat' },
    { icon: faCalendar, labelKey: 'sidebar.history', path: '/client/historique' },
    { icon: faCog, labelKey: 'sidebar.settings', path: '/client/settings' },
  ];

  const handleLogout = () => {
    navigate('/logout');
  };

  const userInitial = account?.firstName?.charAt(0)?.toUpperCase() || account?.login?.charAt(0)?.toUpperCase() || 'U';
  const userName = account?.firstName && account?.lastName ? `${account.firstName} ${account.lastName}` : account?.login || 'User';

  return (
    <aside className="w-[280px] h-screen bg-blue-200 text-slate-900 flex flex-col fixed left-0 top-0 z-50 p-6 shadow-[4px_0_24px_rgba(0,0,0,0.1)]">
      <div className="flex items-center gap-3 pb-8 mb-8 border-b border-slate-900/20">
        <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center font-bold text-xl text-white">{userInitial}</div>
        <span className="text-xl font-semibold tracking-wider text-slate-900">{userName}</span>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <div className="mb-8">
          <ul className="list-none p-0 m-0">
            {menuItems.map(item => (
              <li key={item.path} className="mb-1">
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 text-slate-800 rounded-lg transition-all duration-200 font-medium hover:bg-blue-500 hover:text-white ${
                    location.pathname === item.path ? 'bg-blue-600 text-white' : ''
                  }`}
                >
                  <FontAwesomeIcon icon={item.icon} className="w-5 text-center" />
                  <span>{t(item.labelKey)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="pt-4 border-t border-slate-900/20">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 bg-red-500/20 border border-red-600/30 rounded-lg text-slate-900 cursor-pointer transition-all duration-200 font-medium hover:bg-red-500 hover:text-white"
        >
          <FontAwesomeIcon icon={faRightFromBracket} />
          <span>{t('common.logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default ClientSidebar;

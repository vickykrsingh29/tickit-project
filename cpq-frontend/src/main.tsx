import ReactDOM from 'react-dom'
import './index.css'
import { Auth0Provider } from "@auth0/auth0-react";
import App from './App.tsx'
import Modal from 'react-modal';
import 'react-toastify/dist/ReactToastify.css';

// Set the app element for react-modal accessibility
Modal.setAppElement('#root');

const onRedirectCallback = () => {
  window.location.href = '/dashboard';
};

ReactDOM.render(
  <Auth0Provider
    domain={import.meta.env.VITE_AUTH0_DOMAIN!}
    clientId={import.meta.env.VITE_AUTH0_CLIENT_ID!}
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: import.meta.env.VITE_AUTH0_AUDIENCE!,
      scope: "openid profile email offline_access"
    }}
    cacheLocation="localstorage"
    useRefreshTokens={true}
    onRedirectCallback={onRedirectCallback}
  >
    <App />
  </Auth0Provider>,
  document.getElementById('root')
)
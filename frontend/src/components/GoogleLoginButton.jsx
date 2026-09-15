import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const GoogleLoginButton = () => {
  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/auth/google-login/', {
        token: credentialResponse.credential
      });
      console.log(res.data);
      localStorage.setItem('access', res.data.tokens.access);
      localStorage.setItem('refresh', res.data.tokens.refresh);
      alert('Google Login Successful! 🎉');
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      alert('Google login failed!');
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => alert('Google Login Failed')}
    />
  );
};

export default GoogleLoginButton;
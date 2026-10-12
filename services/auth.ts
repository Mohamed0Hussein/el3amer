import axios from './axios';

// LOGIN
export const login = async (email: string, password: string) => {
    const res = await axios.post('/auth/login', { email, password });
    return res.data;
};

// GOOGLE LOGIN
export const loginWithGoogle = async (accessToken: string) => {
    const res = await axios.post('/auth/google-login', { accessToken });
    return res.data;
};

// REGISTER
export const signup = async (fullName: string, email: string, password: string) => {
    const res = await axios.post('/auth/register', {
        fullName,
        email,
        password
    });
    return res.data;
};

// LOGOUT
export const logout = async (token: string) => {
    const res = await axios.post('/auth/logout', { token });
    return res.data;
};

// GET USER USING TOKEN
export const getUser = async (token: string) => {
    const res = await axios.get('/auth/user', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return res.data;
};

// FORGOT PASSWORD - emails a 6-digit code (in the app's language)
export const forgotPassword = async (email: string, language: string) => {
    const res = await axios.post('/auth/forgot-password', { email, language });
    return res.data;
};

// RESET PASSWORD - with the code from that email
export const resetPassword = async (email: string, code: string, newPassword: string) => {
    const res = await axios.post('/auth/reset-password', { email, code, newPassword });
    return res.data;
};

// CHANGE PASSWORD - Change password for authenticated user
export const changePassword = async (currentPassword: string, newPassword: string, token: string) => {
    const res = await axios.post('/auth/change-password', 
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
};

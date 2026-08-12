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

// FORGOT PASSWORD - Request password reset email
export const forgotPassword = async (email: string) => {
    const res = await axios.post('/auth/forgot-password', { email });
    return res.data;
};

// RESET PASSWORD - Reset password with token from email
export const resetPassword = async (token: string, newPassword: string) => {
    const res = await axios.post('/auth/reset-password', { token, newPassword });
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

// VERIFY EMAIL
export const verifyEmail = async (token: string) => {
    const res = await axios.post('/auth/verify-email', { token });
    return res.data;
};

// RESEND VERIFICATION EMAIL
export const resendVerification = async (email: string) => {
    const res = await axios.post('/auth/resend-verification', { email });
    return res.data;
};


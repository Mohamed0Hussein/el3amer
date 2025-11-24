import axios from './axios';

// LOGIN
export const login = async (email: string, password: string) => {
    const res = await axios.post('/auth/login', { email, password });
    return res.data;
};

// GOOGLE LOGIN
export const loginWithGoogle = async (email: string, fullName: string) => {
    const res = await axios.post('/auth/google-login', { email, fullName });
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

// TEMP: GENERATE TOKEN
export const getToken = async (email: string) => {
    const res = await axios.post('/auth/generate-token', { email });
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

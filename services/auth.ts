import axios from './axios';

export const login = async (email: string, password: string) => {
    const response = await axios.post('/auth/login', { email, password });
    return response.data;
};

export const loginWithGoogle = async (email: string,fullName: string) => {
    const response = await axios.post('/auth/google-login', { email,fullName });
    return response.data;
};
export const signup = async (fullName: string, email: string, password: string) => {
    const response = await axios.post('/auth/register', { fullName, email, password });
    return response.data;
};

export const logout = async (token: string) => {
    const response = await axios.post('/auth/logout', { token }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};  

export const getToken = async (email: string) => {
    const response = await axios.post('/auth/generate-token', { email });
    return response.data;
};

export const getUser = async (token: string) => {
    const response = await axios.get('/auth/user', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};
import axios from './axios';

// Backend applies a partial update — any field omitted here keeps its current value.
export const updateUser = async (id: string, data: { fullName?: string; email?: string; phone?: string; address?: string }) => {
    const res = await axios.put(`/users/${id}`, data);
    return res.data;
}

export const getUserInfo = async (id : string) => {
    const res = await axios.get(`/users/${id}`)
    return res.data;
}
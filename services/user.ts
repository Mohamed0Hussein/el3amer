import axios from './axios';

// Backend applies a partial update — any field omitted here keeps its current value.
export const updateUser = async (
    id: string,
    data: { fullName?: string; email?: string; currentPassword?: string; phone?: string; address?: string; latitude?: number; longitude?: number },
) => {
    const res = await axios.put(`/users/${id}`, data);
    return res.data;
}

export const getUserInfo = async (id : string) => {
    const res = await axios.get(`/users/${id}`)
    return res.data;
}

// Backend archives the account (orders keep their owner) and refuses with 409
// while any order is still in progress.
export const deleteUser = async (id: string) => {
    const res = await axios.delete(`/users/${id}`);
    return res.data;
}

export const saveFavorites = async (id: string, favorites: number[]) => {
    const res = await axios.put(`/users/${id}/favorites`, { favorites });
    return res.data;
}

// token null stops notifications to this phone.
export const savePushToken = async (id: string, token: string | null, language: string) => {
    const res = await axios.put(`/users/${id}/push-token`, { token, language });
    return res.data;
}

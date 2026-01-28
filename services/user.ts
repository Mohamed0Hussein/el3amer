import axios from './axios'

export const EditUserInfo = async () => {

}

export const getUserInfo = async (id : string) => {
    const res = await axios.get(`/users/${id}`)
    return res.data
}
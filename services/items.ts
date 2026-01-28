import axios from './axios'
type ItemType = {
    name: string,
    description: string,
    price: number,
    stock: number,
    image: string,
    category: string,
    isActive: boolean,
}
export const addItem = async ({ name , description, price, stock, image, category, isActive } : ItemType) => {
    axios.post('/items/', {name,description,price,stock,image,category,isActive})
}
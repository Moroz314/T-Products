import React from 'react';
import Head from './ui/Head'
import { useNavigate } from 'react-router-dom';

const categories = [
    { name: "Фрукты", url: "https://img.freepik.com/fotos-kostenlos/farbige-leckere-frische-reife-saftige-fruechte-auf-einem-weissen-schreibtisch_179666-169.jpg" },
    { name: "Овощи", url: "https://www.shutterstock.com/image-vector/collection-vegetables-fruits-including-tomatoes-260nw-2614134207.jpg" },
    { name: "Молочные продукты", url: "https://domf5oio6qrcr.cloudfront.net/medialibrary/9685/iStock-544807136.jpg" },
    { name: "Мясо", url: "https://chmknn.ru/wp-content/uploads/2017/08/150770.jpg" },
    { name: "Рыба", url: "https://moretorg55.ru/d/%D1%81%D0%B0%D0%B7%D0%B0%D0%BD.jpg" },
    { name: "Хлеб и выпечка", url: "https://altariaoil.ru/assets/images/blog/248/max-nazemtsev068.jpg" },
    { name: "Напитки", url: "https://reddragon-spb.ru/wa-data/public/shop/products/50/05/10550/images/25365/25365.970.jpg" },
    { name: "Сладости", url: "https://sweetmouthfulmixes.com/cdn/shop/files/IndividualWrappedSweets7_1200x1200.jpg?v=1696251503" },
    { name: "Бакалея", url: "https://avatars.mds.yandex.net/get-altay/2390040/2a0000017075d202ebdefa0f42877e970371/L_height" },
    { name: "Замороженные продукты", url: "https://td4s.ru/images/art/zamorozhennye_produkty.jpg" }
];

export default function Catalog() {
    const navigate = useNavigate();

    const handleCategoryClick = (categoryName) => {
        // Переходим на главную страницу с параметром категории
        navigate('/', { 
            state: { 
                selectedCategory: categoryName 
            } 
        });
    };

    return (
        <div className='bg-white min-h-screen'>
            <Head />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Категории товаров</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {categories.map((category, index) => (
                        <div
                            key={index}
                            onClick={() => handleCategoryClick(category.name)}
                            className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col items-center text-center cursor-pointer transform transition duration-200 hover:scale-105 hover:shadow-xl border border-gray-100"
                        >
                            <img 
                                src={category.url} 
                                alt={category.name} 
                                className="w-full h-48 object-cover" 
                            />
                            <div className="p-4 w-full">
                                <p className="text-lg font-semibold text-gray-900">{category.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
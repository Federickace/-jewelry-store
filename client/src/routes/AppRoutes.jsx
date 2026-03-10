import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ScannerPage from '../pages/ScannerPage.jsx';
import GetPage from '../pages/GetPage.jsx';
import CreatePage from '../pages/CreatePage.jsx';
import DeletePage from "../pages/DeletePage.jsx";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<ScannerPage />} />
            <Route path="/get" element={<GetPage/>}/>
            <Route path="/create" element={<CreatePage/>}/>
            <Route path="/delete" element={<DeletePage/>}/>
            {/* In futuro potrai aggiungere rotte qui, ad esempio: */}
            {/* <Route path="/inserisci-prodotto" element={<InsertPage />} /> */}
        </Routes>
    );
};

export default AppRoutes;

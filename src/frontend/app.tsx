import { createRoot } from 'react-dom/client';
import { Routes, Route, HashRouter } from 'react-router-dom';

import MainPage from './Pages/MainPage';
import AboutPage from './Pages/AboutPage';

const container = document.getElementById('app');
const root = createRoot(container!);

root.render(
	<HashRouter>
		<Routes>
			<Route path="/" element={ <MainPage /> } />
			<Route path="/about" element={ <AboutPage /> } />
		</Routes>
	</HashRouter>
);
import { createRoot } from 'react-dom/client';
import { Routes, Route, HashRouter } from 'react-router-dom';

import MainPage from './Pages/MainPage';
import AboutPage from './Pages/AboutPage';

const container = document.getElementById('app');
const root = createRoot(container!);

declare global {
	interface Window {
	  api?: any;
	}
}

window.api.onTriggerSave( () => {
	console.log('save triggered');
});

root.render(
	<HashRouter>
		<Routes>
			<Route path="/" element={ <MainPage /> } />
			<Route path="/about" element={ <AboutPage /> } />
		</Routes>
	</HashRouter>
);
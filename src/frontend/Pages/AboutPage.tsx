import { Link } from "react-router-dom";
import Logo from "../Components/Logo";

declare global {
	interface Window {
	  api?: any;
	}
}

export default function AboutPage() {
	return (
		<>
			<div>
			<Logo src="/images/531-200x200.jpg" size={200} />
				<h1>ShopkeeperJS</h1>
				<p>Page 2/2</p>
			</div>
			<hr />
			<Link to='/'>First Page</Link>
			<br /><br />
			<button onClick={() => window.api.setTitle('yello')}>Change Title</button>
		</>
	);
}
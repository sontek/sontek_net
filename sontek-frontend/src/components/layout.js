import Menu from "../components/menu";

export default function Layout({ children }) {
    return (
        <div>
            <Menu />
            <div className="container">{children}</div>
        </div>
    );
}

import Head from "next/head";
import Image from "next/image";
import styles from "./layout.module.css";
import utilStyles from "../../styles/util.module.css";
import Link from "next/link";
import Menu from "../components/menu";

export default function Layout({ children }) {
    return (
        <div>
            <Menu />
            <div className="container">
              {children}
            </div>
        </div>
    );
}

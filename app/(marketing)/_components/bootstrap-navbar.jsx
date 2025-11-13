"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";

function BootstrapNavbar() {
    return (
        <nav className="navbar navbar-expand-lg bg-dark">
            <div className="container-fluid">
                <Link href="/" className="navbar-brand text-light">
                    <Logo />
                </Link>
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarSupportedContent" 
                    aria-controls="navbarSupportedContent" 
                    aria-expanded="false" 
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav mb-2 mb-lg-0 d-flex justify-content-between w-100">
                        <li className="nav-item">
                            <Link href="/" className="nav-link text-light" aria-current="page">
                                Home
                            </Link>
                        </li>
                        <div className="d-flex">
                            <li className="nav-item">
                                <Link href="/login" className="nav-link text-light">
                                    Login
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link href="/register" className="nav-link text-light">
                                    Register
                                </Link>
                            </li>
                        </div>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default BootstrapNavbar;


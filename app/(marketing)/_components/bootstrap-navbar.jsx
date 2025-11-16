"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";

function BootstrapNavbar() {
    return (


        <nav class="bg-neutral-primary w-full border-b border-default">
            <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">

                <Logo />
                <button data-collapse-toggle="navbar-default" type="button" class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-body rounded-base md:hidden hover:bg-neutral-secondary-soft hover:text-heading focus:outline-none focus:ring-2 focus:ring-neutral-tertiary" aria-controls="navbar-default" aria-expanded="false">
                    <span class="sr-only">Open main menu</span>
                    <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M5 7h14M5 12h14M5 17h14" /></svg>
                </button>
                <div class="hidden w-full md:block md:w-auto" id="navbar-default">
                    <ul class="font-medium flex p-2 gap-4 bg-neutral-secondary-soft md:space-x-8 rtl:space-x-reverse ">
                        <Link href="/organization/default-org" className="nav-link text-light" aria-current="page">
                            Home
                        </Link>
                        <Link href="/login" className="">
                            Login
                        </Link>
                        <Link href="/register" className="">
                            Register
                        </Link>
                    </ul>
                </div>
            </div>
        </nav>
    );

}

export default BootstrapNavbar;


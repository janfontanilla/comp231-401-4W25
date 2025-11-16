"use client";

import Image from "next/image";
import Link from "next/link";
import "./_components/HomePage.css";

function HomePage() {
    return (
        <div className="homepage-container">
            <div className="text-center m-10">
                <h1>Welcome to <span className="primary-text">MyTracker</span></h1>
                <p className="mb-4">Simple task management tool, allowing convenient organization of tasks.</p>
                <Link href="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" role="button">Get Organizing</Link>
            </div>
            <div className="">
                <div className="">
                    <Image
                        src="/images/plan-5659443_1280.png"
                        alt="To do task list"
                        width={400}
                        height={200}
                        className=""
                    />
                </div>
                <span className="mt-2 text-center">Image by <a href="https://pixabay.com/users/htchnm-14967706/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=5659443" className="font-medium text-fg-brand hover:underline text-blue-500">Htc Erl</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=5659443" className="font-medium text-fg-brand hover:underline text-blue-500">Pixabay</a></span>
            </div>
        </div>
    );
}

export default HomePage;

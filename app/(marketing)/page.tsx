"use client";

import Image from "next/image";
import Link from "next/link";
import "./_components/HomePage.css";

function HomePage() {
    return (
        <div id="homepage-container">
            <div className="position-absolute top-0 start-0 h-100 w-100 d-flex justify-content-center align-items-center bg-light">
                <div className="w-75 container p-0 m-0">
                    <div className="row">
                        <div className="col d-flex flex-column justify-content-center align-items-center">
                            <h1>Welcome to <span className="text-primary">MyTracker</span></h1>
                            <p className="fs-5 text-center">Simple task management tool, allowing convenient organization of tasks.</p>
                            <Link href="/login" className="btn btn-primary btn-lg width-fit" role="button">Get Organizing</Link>
                        </div>
                        <div className="col d-flex flex-column justify-content-center align-items-center">
                            <div className="image-height width-fit position-relative">
                                <Image 
                                    src="/images/plan-5659443_1280.png" 
                                    alt="To do task list"
                                    width={800}
                                    height={400}
                                    className="img-fluid"
                                />
                            </div>
                            <span className="mt-2 text-center">Image by <a href="https://pixabay.com/users/htchnm-14967706/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=5659443">Htc Erl</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=5659443">Pixabay</a></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;

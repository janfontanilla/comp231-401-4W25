import "./HomePage.css";

function HomePage() {
    return (
        <div id="homepage-container">
            <div class="position-absolute top-0 start-0 h-100 w-100 d-flex flex-column justify-content-center align-items-center bg-light">
                <h1>Welcome to <span class="text-primary">MyTracker</span></h1>
                <p class="fs-5">Simple task management tool, allowing convenient organization of tasks.</p>
                <a class="btn btn-primary btn-lg" href="/login" role="button">Get Organizing</a>
            </div>
        </div>
    );
}

export default HomePage;

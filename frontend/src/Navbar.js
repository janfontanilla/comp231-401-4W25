function Navbar() {
    return (


        <nav class="navbar navbar-expand-lg bg-secondary">
            <div class="container-fluid">
                <a class="navbar-brand text-light" href="/">Logo</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav mb-2 mb-lg-0 d-flex justify-content-between w-100">
                        <li class="nav-item">
                            <a class="nav-link text-light" aria-current="page" href="/">Home</a>
                        </li>
                        <div class="d-flex">
                            <li class="nav-item">
                                <a class="nav-link text-light" href="/login">Login</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link text-light" href="/register">Register</a>
                            </li>
                        </div>
                    </ul>
                </div>
            </div>
        </nav>


    );
}

export default Navbar;
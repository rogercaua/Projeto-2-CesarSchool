document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        const userFake = {
            email: "admin@ecotag.com",
            password: "123456"
        };

        if (email === userFake.email && password === userFake.password) {
            localStorage.setItem("loggedUser", email);
            alert("Login realizado com sucesso!");
            window.location.href = "index.html";
        } else {
            alert("E-mail ou senha inválidos!");
        }
    });
});
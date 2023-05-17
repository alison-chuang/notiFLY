console.log = () => {};

const checktoken = localStorage.getItem("jwtToken");
if (checktoken) {
    window.location.replace("/document.html");
}

$(document).ready(function () {
    $("#signInBtn").on("click", async (e) => {
        const email = $("#signInForm input[name=email]").val();
        const password = $("#signInForm input[name=password]").val();
        e.preventDefault();

        const emailPattern = /^[\w.+-]+@(?:[a-z\d-]+\.)+[a-z]{2,}$/i;
        if (!emailPattern.test(email)) {
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "Please enter valid Email.",
                confirmButtonColor: "#F27475",
                allowOutsideClick: false,
            });
            return;
        }

        if (password.length < 8) {
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "Password should be 8 characters long.",
                confirmButtonColor: "#F27475",
                allowOutsideClick: false,
            });
            return;
        }

        $("#signInBtn").prop("disabled", true);
        const body = {
            email: email,
            password: password,
        };
        try {
            const response = await axios.post("/api/1.0/users/signin", body);
            const newToken = response.data.data.access_token;
            localStorage.setItem("jwtToken", newToken);
            window.location.replace("/document.html");
        } catch (e) {
            console.error("error", e);
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: `${e.response.data.data}`,
                confirmButtonColor: "#F27475",
                allowOutsideClick: false,
            });
            $("#signInBtn").prop("disabled", false);
        }
    });
});

$("#signInForm").on("change", async (e) => {
    const email = $("#signInForm input[name=email]").val();
    const password = $("#signInForm input[name=password]").val();

    const emailPattern = /^[\w.+-]+@(?:[a-z\d-]+\.)+[a-z]{2,}$/i;
    if (!emailPattern.test(email)) {
        $("#email-message").text("Please enter valid Email.");
    } else {
        $("#email-message").empty();
    }

    if (password.length < 8) {
        $("#password-message").text("Password should be 8 characters long.");
    } else {
        $("#password-message").empty();
    }
});

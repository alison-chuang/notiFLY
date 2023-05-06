const checktoken = localStorage.getItem("jwtToken");
if (checktoken) {
    window.location.replace("/document.html");
}

$(document).ready(function () {
    $("#signInBtn").on("click", async (e) => {
        const email = $("#signInForm input[name=email]").val();
        const password = $("#signInForm input[name=password]").val();
        e.preventDefault();

        const body = {
            email: email,
            password: password,
        };
        $("#signInBtn").prop("disabled", true);
        try {
            const response = await axios.post("/api/1.0/users/signin", body);
            const newtoken = response.data.data.access_token;
            localStorage.setItem("jwtToken", newtoken);
            window.location.replace("/document.html");
        } catch (e) {
            console.error("error", e);
            Swal.fire({
                icon: "error",
                title: `Error!`,
                text: ` ${e.response.data.data}`,
                confirmButtonColor: "#F27475",
                allowOutsideClick: false,
            });
            $("#signInBtn").prop("disabled", false);
        }
    });
});

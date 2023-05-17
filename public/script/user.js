console.log = () => {};

const token = localStorage.getItem("jwtToken");

const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: false,
    showClass: {
        popup: "",
        backdrop: "",
    },
    hideClass: {
        popup: "",
        backdrop: "",
    },
});

// post requst to my server to store from data
$(document).ready(function () {
    $("#create-btn").click(function (e) {
        e.preventDefault();

        let name = $("#name").val();
        let email = $("#email").val();
        let password = $("#password").val();
        let confirm_password = $("#password_confirm").val();

        // js injection
        name = $("<div/>").text(name).html();
        email = $("<div/>").text(email).html();
        password = $("<div/>").text(password).html();
        confirm_password = $("<div/>").text(confirm_password).html();

        const emailPattern = /^[\w.+-]+@(?:[a-z\d-]+\.)+[a-z]{2,}$/i;
        if (!emailPattern.test(email)) {
            $("#error-message").text("Please enter valid email.");
            return;
        }

        if (password.length < 8) {
            $("#error-message").text("Passwords should be 8 characters long.");
            return;
        }

        if (password !== confirm_password) {
            $("#error-message").text("Password and confirm password do not match");
        } else {
            $("#create-btn").prop("disabled", true);

            let data = {
                name,
                email,
                password,
            };

            $.post({
                url: "/api/1.0/users",
                data: data,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                success: function (formData) {
                    console.log("SUCCESS : ", formData);

                    Toast.fire({
                        icon: "success",
                        title: "Success!",
                        text: `User ${formData.data.name} created`,
                    });

                    $("#create-btn").prop("disabled", false);
                },
                error: function (e) {
                    console.log("ERROR : ", e);

                    Toast.fire({
                        icon: "error",
                        title: "Error!",
                        text: `User ${e.responseJSON.data}`,
                        showConfirmButton: true,
                        confirmButtonColor: "#F27475",
                        allowOutsideClick: false,
                    });

                    $("#create-btn").prop("disabled", false);
                },
            });
        }
    });
});

// reset password page
$(document).ready(function () {
    $("#reset-btn").on("click", function (e) {
        e.preventDefault();

        let passwordValue = $("#password").val();
        let passwordConfirmValue = $("#password-confirm").val();

        if (passwordValue === "" || passwordConfirmValue === "") {
            Toast.fire({
                icon: "warning",
                title: "Oops",
                text: "Please fill out both fields",
            });
            return;
        }

        if (passwordValue !== passwordConfirmValue) {
            Toast.fire({
                icon: "warning",
                title: "Oops",
                text: "The two passwords are inconsistent.",
            });
            return;
        }

        if (passwordValue.length < 8) {
            Toast.fire({
                icon: "warning",
                title: "Oops",
                text: "Password should be 8 characters long.",
            });
            return;
        }

        const path = window.location.pathname;
        const pathArray = path.split("/");
        const id = pathArray[pathArray.length - 2];
        const token = pathArray[pathArray.length - 1];

        let data = $("#reset-form").serialize();

        $.post({
            url: `/api/1.0/users/password/link/${id}/${token}`,
            data: data,
            success: function (formData) {
                console.log("SUCCESS : ", formData);

                Toast.fire({
                    icon: "success",
                    title: "Success!",
                    text: "Password reset succeed! Please sign in again.",
                });

                $("#reset-btn").prop("disabled", false);

                localStorage.removeItem("jwtToken");
                window.location.href = "/signin.html";
            },
            error: function (e) {
                console.log("ERROR : ", e);

                Toast.fire({
                    icon: "error",
                    title: "Error!",
                    text: `User ${e.responseJSON.data}`,
                    showConfirmButton: true,
                    confirmButtonColor: "#F27475",
                    allowOutsideClick: false,
                });

                $("#reset-btn").prop("disabled", false);
            },
        });
    });
});

// password readable with eye icon
$(document).ready(function () {
    $(".toggle-password").click(function () {
        let passwordInput = $(this).closest(".form-group").find("input[type]");

        if (passwordInput.attr("type") === "password") {
            passwordInput.attr("type", "text");
        } else {
            passwordInput.attr("type", "password");
        }
    });
});

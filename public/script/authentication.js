//no jwt,alert, redirect to signin.html
//with jwt, show name in header
const jwtToken = localStorage.getItem("jwtToken");
if (!jwtToken || jwtToken === "undefined") {
    Swal.fire({
        title: "Please Sign-in First!",
        showConfirmButton: false,
        icon: "warning",
        timer: 1200,
    });
    setTimeout(() => {
        window.location.replace("/signin.html");
    }, 1200);
}

// jwt expire or wrong, get req to server to validate and get user name back
let name;
$.ajax({
    url: "api/1.0/users/pageview",
    type: "GET",
    headers: {
        Authorization: `Bearer ${jwtToken}`,
    },
    success: function (response) {
        name = response.data.name;
        $("#profile-name").text(name);
    },
    error: function (e) {
        console.error(e);
        Swal.fire({
            icon: "error",
            title: `Error!`,
            text: `User Validation Failed`,
            showConfirmButton: true,
            confirmButtonColor: "#F27475",
            allowOutsideClick: false,
            timer: 10000,
        });
        window.localStorage.removeItem("jwtToken");
        window.location.replace("/signin.html");
    },
});

// header dropdown
$(document).ready(function () {
    $("#profileMenuInvoker").on("click", function (e) {
        e.preventDefault();
        $("#profileMenu").toggleClass("unfold-hidden fadeOut").toggleClass("unfold-visible fadeIn");
    });
});

// sign out
$(".sign-out").on("click", function (e) {
    e.preventDefault();
    localStorage.removeItem("jwtToken");
    window.location.href = "/index.html";
});

// reset password
$(".reset-password").on("click", function (e) {
    e.preventDefault();

    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
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

    // call api to send email
    $.post({
        url: "/api/1.0/users/password",
        headers: {
            Authorization: "Bearer " + jwtToken,
        },
        success: function (data) {
            Toast.fire({
                title: "Check account mailbox",
                text: "Reset password link has been sent to your account email.",
                icon: "info",
            });
        },
        error: function (e) {
            console.log(e);
            Toast.fire({
                title: "Error!",
                text: "Failed to send reset password email.",
                icon: "error",
            });
        },
    });
});

// ===============
// const config = {
//     headers: {
//         Authorization: `Bearer ${jwtToken}`,
//     },
// };

// const res = await axios.get("/api/1.0/users/", config);
// console.log(res);
// const { name, email } = res.data.data;

// const showName = document.querySelector(".profile__name");
// showName.textContent = name;
// const showEmail = document.querySelector(".profile__email");
// showEmail.textContent = email;

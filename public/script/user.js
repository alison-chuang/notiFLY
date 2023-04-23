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

        // check password matched
        let password = $("#password").val();
        let confirm_password = $("#password_confirm").val();

        if (password !== confirm_password) {
            $("#error-message").text("Passwords do not match");
        } else {
            $("#create-btn").prop("disabled", true);
            let data = $("#user-form").serialize();
            $.post({
                url: "/api/1.0/users",
                data: data,
                success: function (formData) {
                    console.log("SUCCESS : ", formData);

                    Toast.fire({
                        icon: "success",
                        title: `Success!`,
                        text: `User ${formData.data.name} created`,
                    });

                    $("#create-btn").prop("disabled", false);
                },
                error: function (e) {
                    console.log("ERROR : ", e);

                    Toast.fire({
                        icon: "error",
                        title: `Error!`,
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

$("#reset-btn").on("click", function (e) {
    e.preventDefault();

    const path = window.location.pathname;
    const pathArray = path.split("/");
    const id = pathArray[pathArray.length - 2];
    console.log(id);
    const token = pathArray[pathArray.length - 1];
    console.log(token);

    let data = $("#reset-form").serialize();

    $.post({
        url: `/api/1.0/users/password/link/${id}/${token}`,
        data: data,
        success: function (formData) {
            console.log("SUCCESS : ", formData);

            Toast.fire({
                icon: "success",
                title: `Success!`,
                text: `${formData.data} `,
            });

            $("#create-btn").prop("disabled", false);
            window.location.href = "/index.html";
        },
        error: function (e) {
            console.log("ERROR : ", e);

            Toast.fire({
                icon: "error",
                title: `Error!`,
                text: `User ${e.responseJSON.data}`,
                showConfirmButton: true,
                confirmButtonColor: "#F27475",
                allowOutsideClick: false,
            });

            $("#create-btn").prop("disabled", false);
        },
    });
});

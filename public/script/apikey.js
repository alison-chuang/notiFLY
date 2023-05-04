const token = localStorage.getItem("jwtToken");

// $(document).ready(function () {
//     $.ajax({
//         type: "GET",
//         url: "api/1.0/keys/page",
//         headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//         },
//         success: function (data) {
//             console.log(data);
//         },
//         error: function (e) {
//             console.error(e);
//             Swal.fire({
//                 icon: "warning",
//                 title: `Error!`,
//                 text: `Only system admin has access to this page. Sorry.`,
//                 confirmButtonColor: "#F27475",
//                 allowOutsideClick: true,
//             });
//             setTimeout(function () {
//                 window.location.replace("member.html");
//             }, 2000);
//         },
//     });
// });

$("#key-btn").click(function () {
    $.ajax({
        type: "POST",
        url: "api/1.0/keys",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        success: function (data) {
            console.log(data);

            Swal.fire({
                icon: "info",
                title: "Important!",
                text: `This is your API Key: ${data.data.key}`,
                footer: "<p style=color:red >The key would only be shown ONE TIME here.</p>",
                // showCancelButton: true,
                confirmButtonText: "Copy!",
                cancelButtonText: "Cancel",
            }).then((result) => {
                if (result.isConfirmed) {
                    const textToCopy = data.data.key;
                    navigator.clipboard
                        .writeText(textToCopy)
                        .then(() => {
                            Swal.fire("Copied!", "", "success");
                        })
                        .catch(() => {
                            Swal.fire("Error", "Failed to copy!", "error");
                        });
                }
            });
        },
        error: function (e) {
            console.error(e);
            Swal.fire({
                icon: "error",
                title: `Error!`,
                text: `${e.responseJSON.data}`,
                confirmButtonColor: "#F27475",
                allowOutsideClick: false,
            });
        },
    });
});

$(document).ready(function () {
    $("#key-table").DataTable({
        order: [[2, "desc"]],
        searching: true,
        sPaginationType: "full_numbers",
        lengthMenu: [
            [5, 10, 15, -1],
            [5, 10, 15, "All"],
        ],
        serverSide: false,
        stateSave: true,
        destroy: true,
        info: true,
        autoWidth: false,
        ordering: true,
        scrollX: "500px",
        scrollY: "500px",
        scrollCollapse: true,
        paging: true,

        ajax: {
            url: "/api/1.0/keys",
            type: "GET",
        },
        columns: [
            {
                data: "key",
                render: function (data) {
                    const maskedKey = `${data.slice(0, 5)}******`;
                    return maskedKey;
                },
            },
            {
                data: "created_at",
                render: function (data) {
                    var localTime = moment.utc(data).utcOffset("+08:00");
                    return localTime.format("YYYY-MM-DD HH:mm:ss");
                },
            },
            {
                data: "expired_at",
                render: function (data) {
                    var localTime = moment.utc(data).utcOffset("+08:00");
                    return localTime.format("YYYY-MM-DD HH:mm:ss");
                },
            },
        ],
        processing: true,
    });
});

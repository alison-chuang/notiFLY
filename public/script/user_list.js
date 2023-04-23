// init table
$(document).ready(function () {
    $("#user-table").DataTable({
        searching: true,
        sPaginationType: "full_numbers",
        lengthMenu: [
            [10, 20, 30, -1],
            [10, 20, 30, "All"],
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
            url: "/api/1.0/users",
            type: "GET",
        },
        columns: [
            {
                data: "name",
            },
            {
                data: "email",
                title: "Email",
            },
            {
                data: "role",
                render: function (data, type, row) {
                    if (data == "6440a8fceebac57447ba38a0") {
                        return (data = "user");
                    }
                    if (data == "6440a8c7eebac57447ba389f") {
                        return (data = "admin");
                    }
                },
            },
            {
                data: null,
                title: "Action",
                render: function (data, type, row) {
                    return `<button type="button" value=${row._id} class="delete-btn btn btn-danger btn-sm">Delete</button>`;
                },
            },
        ],
    });
});

$(document).on("click", ".delete-btn", function () {
    const userId = $(this).val();
    const $tr = $(this).closest("tr");

    Swal.fire({
        title: "Are you sure?",
        // text: "",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `/api/1.0/users/?userId=${userId}`,
                type: "DELETE",
                success: function (result) {
                    Swal.fire({
                        title: "Success!",
                        text: "User deleted",
                        showConfirmButton: false,
                        timer: 1000,
                    });
                    $tr.remove();
                },
                error: function (error) {
                    Swal.fire(error, "error");
                },
            });
        }
    });
});

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

// init table
$(document).ready(function () {
    let table = $("#campaign-table").DataTable({
        order: [[3, "desc"]],
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
            url: "/api/1.0/campaigns",
            type: "GET",
        },
        columns: [
            {
                className: "dt-control",
                orderable: false,
                data: null,
                defaultContent: "",
            },
            {
                data: "name",
                title: "Name",
            },
            {
                data: "channel",
                title: "Channel",
            },
            {
                data: "status",
                title: "Status",
            },
            {
                data: "created",
                title: "Created",
                render: function (data, type, row) {
                    var localTime = moment.utc(row.created_at).utcOffset("+08:00");
                    return localTime.format("YYYY-MM-DD HH:mm");
                },
            },
            {
                data: "owner_name",
                title: "Author",
            },
            {
                data: null,
                title: "Action",
                render: function (data, type, row) {
                    return `<a href="/campaign_detail.html?id=${row._id}">
                                <button type="button" class="btn btn-secondary btn-sm">Update</button>
                            </a><button type="button" id=${row._id} class="btn btn-light btn-sm stop">Stop</button>`;
                },
            },
        ],
        processing: true,
    });

    // Add event listener for opening and closing details
    $("#campaign-table tbody").on("click", "td.dt-control", function () {
        var tr = $(this).closest("tr");
        var row = table.row(tr);

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass("shown");
        } else {
            // Open this row
            row.child(format(row.data())).show();
            tr.addClass("shown");
        }
    });

    // stop call api
    $("#campaign-table tbody").on("click", ".stop", function () {
        const id = $(this).attr("id");
        const data = {
            id,
            status: "stopped",
        };

        const row = $(this).closest("tr");
        const rowData = table.row(row).data();
        if (rowData.status === "stopped") {
            Toast.fire({
                icon: "info",
                title: `Notice`,
                text: `This campaign is already stopped.`,
            });
            return;
        }

        Swal.fire({
            title: "Are you sure?",
            text: "Stopped campaign might not be resumed",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, I understand!",
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    method: "put",
                    url: "/api/1.0/campaigns/status",
                    contentType: "application/json",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    data: JSON.stringify(data),
                    processData: false,
                    success: function () {
                        console.log();
                        Toast.fire({
                            icon: "success",
                            title: `Success!`,
                            text: `Campaign stopped`,
                        });

                        $("#update-btn").prop("disabled", false);
                    },
                    error: function (e) {
                        Swal.fire({
                            icon: "error",
                            title: `Error!`,
                            text: `Campaign is not stopped  ${e.responseJSON.data}`,
                            confirmButtonColor: "#F27475",
                            allowOutsideClick: false,
                        });

                        $("#update-btn").prop("disabled", false);
                    },
                });
            }
        });
    });
});

function format(d) {
    // `d` is the original data object for the row
    let nextSendTime = moment.utc(d.next_send_time).utcOffset("+08:00");
    let formattedNextSendTime = nextSendTime.format("YYYY-MM-DD HH:mm");

    const history = d.jobs
        .map((job) => {
            let formattedSendTime = moment.utc(job.send_time).utcOffset("+08:00").format("YYYY-MM-DD HH:mm");
            return `
        <tr>
            <td>${formattedSendTime}</td>
            <td>${((job.succeed_count / job.total_count) * 100).toFixed(2)}%</td>
            <td>${job.succeed_count}</td>
            <td>${job.fail_count}</td>
            <td>${job.total_count}</td>
        </tr>
        `;
        })
        .join("");

    return `<div style="background-color: rgba(212, 224, 252, 0.5); padding: 8px;">
        <div><b>Next Send Time: ${formattedNextSendTime}</b></div>
        <table cellpadding="1" cellspacing="0" border="0" style="padding-left:10%;">
            <tr>
                <th>Send Time</th>
                <th>Achive Rate</th>
                <th>Success Count</th>
                <th>Fail Count</th>
                <th>Total Count</th>
            </tr>
            ${history}
        </table>`;
}

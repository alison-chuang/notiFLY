// init table
$(document).ready(function () {
    let table = $("#campaign-table").DataTable({
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
                render: function (data) {
                    var localTime = moment.utc(data).utcOffset("+08:00");
                    return localTime.format("YYYY-MM-DD HH:mm:ss");
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
                            </a>`;
                },
            },
        ],
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

//  '<div style="background-color: rgba(212, 224, 252, 0.5); padding: 8px;">' +
//         '<table cellpadding="1" cellspacing="0" border="0" style="padding-left:10px;">' +
//         "<tr>" +
//         "<td>Next Send Time</td>" +
//         "<td>" +
//         formattedNextSendTime +
//         "</td>" +
//         "</tr>" +
//         "<tr>" +
//         "<td>Last Send Time</td>" +
//         "<td>" +
//         d.jobs +
//         "</td>" +
//         "</tr>" +
//         "<tr>" +
//         `<td>   ${sendDate} Result ( Sent successfully / Total recipients )</td>` +
//         "<td>" +
//         here +
//         "</td>" +
//         "</tr>" +
//         "</table>"

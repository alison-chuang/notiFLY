// init table

$(document).ready(function () {
    $("#example").DataTable({
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
        ordering: false,
        scrollX: "500px",
        scrollY: "500px",
        scrollCollapse: true,
        paging: true,

        ajax: {
            url: "/api/1.0/segments",
            type: "GET",
        },
        columns: [
            { data: "name" },
            {
                data: "created_at",
                render: function (data) {
                    var localTime = moment.utc(data).utcOffset("+08:00");
                    return localTime.format("YYYY-MM-DD");
                },
            },
            { data: "owner" },
        ],
    });
});
